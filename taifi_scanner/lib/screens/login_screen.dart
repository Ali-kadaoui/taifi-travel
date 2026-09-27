import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/colors.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final MobileScannerController _cameraController = MobileScannerController();
  bool _isProcessing = false;

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    
    for (final barcode in capture.barcodes) {
      if (barcode.rawValue != null) {
        try {
          final data = jsonDecode(barcode.rawValue!);
          final String? parsedServerUrl = data['server_url'] ?? data['endpoint'];
          final String? parsedSessionToken = data['session_token'] ?? data['sessionId'];
          
          if (parsedServerUrl != null && parsedSessionToken != null) {
            _isProcessing = true; // Block further processing
            
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString('server_url', parsedServerUrl);
            await prefs.setString('session_token', parsedSessionToken);
            await prefs.setString('worker_name', data['worker'] ?? data['worker_name'] ?? 'Unknown Agent');
            
            final parsedWorkerId = data['worker_id'];
            if (parsedWorkerId != null) {
              await prefs.setString('worker_id', parsedWorkerId.toString());
            }
            
            if (!mounted) return;
            
            // Critical: completely dispose mobile_scanner BEFORE navigating
            // This frees up the hardware camera for the Dashboard
            await _cameraController.stop();
            _cameraController.dispose();
            
            if (!mounted) return;
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const DashboardScreen()),
            );
            return;
          }
        } catch (e) {
          // Ignore non-JSON barcodes
        }
      }
    }
  }

  @override
  void dispose() {
    _cameraController.dispose();
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
              MobileScanner(
                controller: _cameraController,
                onDetect: _onDetect,
              ),
                  
                  // Dimmed Overlay with cutout
                  ColorFiltered(
                    colorFilter: ColorFilter.mode(
                      Colors.black.withOpacity(0.7),
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
                            height: 250,
                            width: 250,
                            decoration: BoxDecoration(
                              color: Colors.black,
                              borderRadius: BorderRadius.circular(24),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Active Frame Marker (Aligned perfectly over the cutout)
                  Center(
                    child: Container(
                      height: 250,
                      width: 250,
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.gold, width: 2),
                        borderRadius: BorderRadius.circular(24),
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
                    padding: const EdgeInsets.all(20.0),
                    child: Row(
                      children: [
                        Image.asset('assets/images/logo.png', height: 32),
                        const SizedBox(width: 12),
                        const Text(
                          'TAIFI SCANNER',
                          style: TextStyle(color: AppColors.ivory, fontSize: 16, letterSpacing: 2, fontWeight: FontWeight.bold),
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
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.qr_code_scanner, color: AppColors.gold, size: 24),
                            SizedBox(width: 12),
                            Text(
                              'Non Connecté',
                              style: TextStyle(color: AppColors.ivory, fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Scannez le QR Code sur votre tableau de bord web pour lier cet appareil.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: AppColors.ivory.withOpacity(0.7), fontSize: 14),
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
