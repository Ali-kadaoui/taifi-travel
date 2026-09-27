import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  final Dio _dio = Dio();

  Future<void> sendDataToBackend(Map<String, String> data) async {
    final prefs = await SharedPreferences.getInstance();
    final serverUrl = prefs.getString('server_url');
    final sessionToken = prefs.getString('session_token');
    final workerId = prefs.getString('worker_id');

    if (serverUrl == null) {
      throw Exception("Device is not paired to a server.");
    }
    
    final parsedWorkerId = workerId != null ? int.tryParse(workerId) ?? 0 : 0;
    
    if (parsedWorkerId <= 0) {
      throw Exception("Invalid Worker ID in QR code. Please log out and scan a new QR code.");
    }
    
    final payload = {
      "workerId": parsedWorkerId,
      "firstName": data['first_name']!.isNotEmpty ? data['first_name'] : null,
      "lastName": data['last_name']!.isNotEmpty ? data['last_name'] : null,
      "cinNumber": data['cin_number']!.isNotEmpty ? data['cin_number'] : null,
      "dateOfBirth": data['date_of_birth']!.isNotEmpty ? "${data['date_of_birth']}T00:00:00Z" : null,
      "sex": data['sex']!.isNotEmpty ? data['sex'] : null
    };
    
    try {
      await _dio.post(
        "$serverUrl/api/sync-data",
        options: Options(
          headers: {
            "Content-Type": "application/json",
            if (sessionToken != null) "Authorization": "Bearer $sessionToken"
          }
        ),
        data: payload,
      );
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception("Server Error ${e.response?.statusCode}: ${e.response?.data}");
      } else {
        throw Exception("Network Error: ${e.message}");
      }
    }
  }
}
