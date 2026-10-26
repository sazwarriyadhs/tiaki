import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TiakiSessionStorage {
  TiakiSessionStorage() : _storage = const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const _accessTokenKey = 'tiaki_access_token';
  static const _refreshTokenKey = 'tiaki_refresh_token';
  static const _tokenTypeKey = 'tiaki_token_type';
  static const _expiresInKey = 'tiaki_expires_in';

  Future<void> saveSession({
    required String accessToken,
    required String refreshToken,
    required String tokenType,
    required int expiresIn,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);

    await _storage.write(key: _refreshTokenKey, value: refreshToken);

    await _storage.write(key: _tokenTypeKey, value: tokenType);

    await _storage.write(key: _expiresInKey, value: expiresIn.toString());
  }

  Future<String?> readAccessToken() {
    return _storage.read(key: _accessTokenKey);
  }

  Future<String?> readRefreshToken() {
    return _storage.read(key: _refreshTokenKey);
  }

  Future<void> clear() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _tokenTypeKey);
    await _storage.delete(key: _expiresInKey);
  }
}
