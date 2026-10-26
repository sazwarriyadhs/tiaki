class TiakiApiConfig {
  TiakiApiConfig._();

  static const String baseUrl = String.fromEnvironment(
    'TIAKI_API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8093',
  );

  static String endpoint(String path) {
    final normalizedBase = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;

    final normalizedPath = path.startsWith('/') ? path : '/$path';

    return '$normalizedBase$normalizedPath';
  }
}
