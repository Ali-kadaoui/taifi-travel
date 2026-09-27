import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vibration/vibration.dart';
import '../utils/colors.dart';
import '../utils/mrz_parser.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> with WidgetsBindingObserver {
  CameraController? _cameraController;
  final TextRecognizer _textRecognizer = TextRecognizer(script: TextRecognitionScript.latin);
  
  bool _isProcessingCamera = false;
  bool _isCoolingDown = false;
  bool _isUploading = false;
  bool _isFlashOn = false;
  
  String? _statusMessage;
  bool _statusIsError = false;
  
  String? _lastScannedCin;
  DateTime? _lastScannedTime;
  int _frameCount = 0;
  Timer? _cooldownTimer;
  
  String _workerName = "Scanner CIN";

  @override
  void initState() {
    super.initState();
    _loadWorkerName();
    WidgetsBinding.instance.addObserver(this);
    _initCamera();
  }

  Future<void> _loadWorkerName() async {
    final prefs = await SharedPreferences.getInstance();
    final name = prefs.getString('worker_name');
    if (name != null && name.isNotEmpty && mounted) {
      setState(() {
        _workerName = name.toUpperCase();
      });
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (!mounted) return;
    if (state == AppLifecycleState.resumed) {
      if (_cameraController == null || !_cameraController!.value.isInitialized) {
        _initCamera();
      }
    } else {
      _cameraController?.dispose();
      _cameraController = null;
    }
  }

  Future<void> _initCamera() async {
    try {
      // Delay to ensure any previous camera (e.g. from login) is fully released by OS
      await Future.delayed(const Duration(milliseconds: 500));
      
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        _setStatus('Aucune caméra trouvée', isError: true);
        return;
      }

      await _cameraController?.dispose();

      _cameraController = CameraController(
        cameras[0],
        ResolutionPreset.veryHigh, // veryHigh ensures crystal clear MRZ reading
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.nv21,
      );

      await _cameraController!.initialize();

      if (!mounted) return;
      setState(() {});

      _cameraController!.startImageStream((CameraImage image) {
        _frameCount++;
        // Frame dropper: Process 1 out of every 5 frames (~6 FPS) to prevent lag
        if (_frameCount % 5 != 0) return;
        
        if (!_isProcessingCamera && !_isCoolingDown) {
          _processCameraImage(image);
        }
      });
    } catch (e) {
      debugPrint('Camera init error: $e');
      if (mounted) {
        _setStatus('Erreur caméra. Relancez l\'app.', isError: true);
      }
    }
  }

  Future<void> _processCameraImage(CameraImage image) async {
    _isProcessingCamera = true;
    try {
      final WriteBuffer allBytes = WriteBuffer();
      for (final Plane plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      final bytes = allBytes.done().buffer.asUint8List();

      final inputImage = InputImage.fromBytes(
        bytes: bytes,
        metadata: InputImageMetadata(
          size: Size(image.width.toDouble(), image.height.toDouble()),
          rotation: InputImageRotation.rotation90deg,
          format: InputImageFormat.nv21,
          bytesPerRow: image.planes[0].bytesPerRow,
        ),
      );

      final RecognizedText recognized = await _textRecognizer.processImage(inputImage);
      final Map<String, String> data = MrzParser.parseMoroccanCin(recognized.text);

      if (data['cin_number']!.isNotEmpty && data['date_of_birth']!.isNotEmpty) {
        await _handleSuccessfulScan(data);
      }
    } catch (e) {
      debugPrint('OCR Error: $e');
    } finally {
      _isProcessingCamera = false;
    }
  }

  Future<void> _handleSuccessfulScan(Map<String, String> data) async {
    final cin = data['cin_number']!;

    if (_lastScannedCin == cin && _lastScannedTime != null) {
      if (DateTime.now().difference(_lastScannedTime!).inSeconds < 4) return;
    }

    _lastScannedCin = cin;
    _lastScannedTime = DateTime.now();

    setState(() {
      _isCoolingDown = true;
      _isUploading = true;
      _statusMessage = null;
    });

    HapticFeedback.heavyImpact();
    if (await Vibration.hasVibrator()) {
      Vibration.vibrate(duration: 200);
    }

    try {
      await ApiService().sendDataToBackend(data);
      
      if (mounted) {
        setState(() {
          _isUploading = false;
          _statusMessage = '✓ Envoyé';
          _statusIsError = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isUploading = false;
          _statusMessage = 'Erreur réseau';
          _statusIsError = true;
        });
      }
    }

    _cooldownTimer?.cancel();
    _cooldownTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _isCoolingDown = false;
          _statusMessage = null;
        });
      }
    });
  }

  void _setStatus(String msg, {bool isError = false}) {
    if (mounted) {
      setState(() {
        _statusMessage = msg;
        _statusIsError = isError;
      });
    }
  }

  Future<void> _disconnect() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('worker_id');
    await prefs.remove('worker_name');
    
    if (!mounted) return;
    
    _cooldownTimer?.cancel();
    _isProcessingCamera = true; // Prevent new scans
    
    // Crucial: Remove camera from widget tree before disposing
    setState(() {
      _cameraController = null;
    });
    
    // Allow UI to update before disposal
    await Future.delayed(const Duration(milliseconds: 50));
    
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  Future<void> _toggleFlash() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;
    try {
      final newFlashOn = !_isFlashOn;
      await _cameraController!.setFlashMode(
        newFlashOn ? FlashMode.torch : FlashMode.off,
      );
      setState(() {
        _isFlashOn = newFlashOn;
      });
    } catch (e) {
      debugPrint("Erreur flash: $e");
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cooldownTimer?.cancel();
    _cameraController?.dispose();
    _textRecognizer.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        systemNavigationBarColor: AppColors.slate900,
        systemNavigationBarIconBrightness: Brightness.light,
        statusBarColor: AppColors.slate900,
        statusBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: Colors.black,
        body: Stack(
          fit: StackFit.expand,
          children: [
          // 1. Camera View, Overlay & Frame
          Stack(
            fit: StackFit.expand,
            children: [
              // Camera feed (Full screen)
                  if (_cameraController != null && _cameraController!.value.isInitialized)
                    ClipRect(
                      child: OverflowBox(
                        alignment: Alignment.center,
                        child: FittedBox(
                          fit: BoxFit.cover,
                          child: SizedBox(
                            width: 1,
                            height: _cameraController!.value.aspectRatio,
                            child: CameraPreview(_cameraController!),
                          ),
                        ),
                      ),
                    )
                  else
                    const Center(child: CircularProgressIndicator(color: AppColors.gold)),
                    
                  // Dimmed Overlay with clear cutout for MRZ
                  ColorFiltered(
                    colorFilter: ColorFilter.mode(
                      Colors.black.withOpacity(0.6),
                      BlendMode.srcOut,
                    ),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Container(
                          decoration: const BoxDecoration(
                            color: Colors.black,
                            backgroundBlendMode: BlendMode.dstOut,
                          ),
                        ),
                        Center(
                          child: Container(
                            height: 220, // Full ID card height
                            width: 340,  // Full ID card width
                            decoration: BoxDecoration(
                              color: Colors.black,
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Active MRZ Frame (Aligned perfectly over the cutout)
                  Center(
                    child: Container(
                      height: 220,
                      width: 340,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: Colors.white.withOpacity(0.3),
                          width: 2,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Stack(
                        children: [
                          Positioned(
                            bottom: 0,
                            left: 0,
                            right: 0,
                            child: Container(
                              height: 90,
                              decoration: BoxDecoration(
                                color: _isCoolingDown ? AppColors.success.withOpacity(0.1) : AppColors.gold.withOpacity(0.1),
                                border: Border.all(
                                  color: _isCoolingDown ? AppColors.success : AppColors.gold,
                                  width: _isCoolingDown ? 4 : 2,
                                ),
                                borderRadius: const BorderRadius.only(
                                  bottomLeft: Radius.circular(14),
                                  bottomRight: Radius.circular(14),
                                ),
                              ),
                              child: _isCoolingDown
                                  ? Center(
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                        decoration: BoxDecoration(
                                          color: Colors.black87,
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            if (_isUploading) ...[
                                              const SizedBox(
                                                width: 16, height: 16,
                                                child: CircularProgressIndicator(color: AppColors.gold, strokeWidth: 2),
                                              ),
                                              const SizedBox(width: 8),
                                            ],
                                            if (!_isUploading) ...[
                                              Icon(
                                                _statusIsError ? Icons.error : Icons.check_circle,
                                                color: _statusIsError ? Colors.red : AppColors.success,
                                                size: 20,
                                              ),
                                              const SizedBox(width: 8),
                                            ],
                                            Text(
                                              _statusMessage ?? 'Envoi...',
                                              style: TextStyle(
                                                color: _statusIsError ? Colors.red : Colors.white,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    )
                                  : const Center(
                                      child: Text(
                                        'CADRER LA BANDE MRZ ICI',
                                        style: TextStyle(
                                          color: AppColors.gold,
                                          letterSpacing: 2,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
            ],
          ),
          
          // 2. UI Elements (Rubans en haut et en bas)
          Column(
            children: [
              // Ruban Header
              Container(
                width: double.infinity,
                color: AppColors.slate900, // Premium slate color
                child: SafeArea(
                  bottom: false,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Image.asset('assets/images/logo.png', height: 32),
                            const SizedBox(width: 12),
                            const Text(
                              'TAIFI SCANNER',
                              style: TextStyle(color: AppColors.ivory, fontSize: 16, letterSpacing: 2, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.logout, color: AppColors.gold, size: 24),
                          onPressed: _disconnect,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              
              const Spacer(),
              
              // Ruban Footer
              Container(
                width: double.infinity,
                color: AppColors.slate900, // Premium slate color
                child: SafeArea(
                  top: false,
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.person, color: AppColors.gold, size: 24),
                                const SizedBox(width: 8),
                                Text(
                                  _workerName,
                                  style: const TextStyle(color: AppColors.ivory, fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            IconButton(
                              icon: Icon(
                                _isFlashOn ? Icons.flash_on : Icons.flash_off,
                                color: _isFlashOn ? AppColors.gold : Colors.white54,
                              ),
                              onPressed: _toggleFlash,
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Placez les deux lignes de chiffres au dos de la carte d\'identité dans le cadre central. Le scan est automatique.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            ],
          )
        ],
      ),
    ),
    );
  }
}
