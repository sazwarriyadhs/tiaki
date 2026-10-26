import 'dart:convert';

import 'package:http/http.dart' as http;

import '../api/tiaki_api_config.dart';
import '../storage/tiaki_session_storage.dart';
import 'auth_models.dart';

class TiakiAuthException implements Exception {
  final String message;

  const TiakiAuthException(this.message);

  @override
  String toString() => message;
}

class TiakiAuthRepository {
  TiakiAuthRepository({TiakiSessionStorage? storage, http.Client? client})
    : _storage = storage ?? TiakiSessionStorage(),
      _client = client ?? http.Client();

  final TiakiSessionStorage _storage;
  final http.Client _client;

  Future<AuthMe> login({
    required String login,
    required String password,
  }) async {
    final response = await _client.post(
      Uri.parse(TiakiApiConfig.endpoint('/api/v1/auth/login')),
      headers: const {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({'login': login.trim(), 'password': password}),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw TiakiAuthException(
        _extractError(response, 'Authentication failed.'),
      );
    }

    final body = jsonDecode(response.body);

    if (body is! Map<String, dynamic>) {
      throw const TiakiAuthException('Authentication response is invalid.');
    }

    final session = AuthLoginResult.fromJson(body);

    if (session.accessToken.isEmpty || session.refreshToken.isEmpty) {
      throw const TiakiAuthException(
        'Authentication response did not contain a valid session.',
      );
    }

    await _storage.saveSession(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      tokenType: session.tokenType,
      expiresIn: session.expiresIn,
    );

    try {
      final currentUser = await me();

      if (!currentUser.isAuditor) {
        await _storage.clear();

        throw const TiakiAuthException(
          'This account is not authorised as a TIAKI auditor.',
        );
      }

      if (currentUser.organisationId.isEmpty) {
        await _storage.clear();

        throw const TiakiAuthException(
          'Auditor organisation scope is missing.',
        );
      }

      return currentUser;
    } catch (_) {
      rethrow;
    }
  }

  Future<AuthMe> me() async {
    final accessToken = await _storage.readAccessToken();

    if (accessToken == null || accessToken.isEmpty) {
      throw const TiakiAuthException('No active TIAKI session.');
    }

    final response = await _client.get(
      Uri.parse(TiakiApiConfig.endpoint('/api/v1/auth/me')),
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw TiakiAuthException(
        _extractError(response, 'Unable to verify TIAKI session.'),
      );
    }

    final body = jsonDecode(response.body);

    if (body is! Map<String, dynamic>) {
      throw const TiakiAuthException(
        'Session verification response is invalid.',
      );
    }

    return AuthMe.fromJson(body);
  }

  Future<void> logout() async {
    final accessToken = await _storage.readAccessToken();

    if (accessToken != null && accessToken.isNotEmpty) {
      try {
        await _client.post(
          Uri.parse(TiakiApiConfig.endpoint('/api/v1/auth/logout')),
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer $accessToken',
          },
        );
      } finally {
        await _storage.clear();
      }
    } else {
      await _storage.clear();
    }
  }

  String _extractError(http.Response response, String fallback) {
    try {
      final decoded = jsonDecode(response.body);

      if (decoded is Map<String, dynamic>) {
        final message = decoded['message'] ?? decoded['error'];

        if (message is String && message.trim().isNotEmpty) {
          return message;
        }
      }
    } catch (_) {
      // Keep generic fallback for non-JSON responses.
    }

    return '$fallback (HTTP ${response.statusCode})';
  }
}
