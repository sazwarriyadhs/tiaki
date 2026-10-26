class AuthLoginResult {
  final String accessToken;
  final String refreshToken;
  final String tokenType;
  final int expiresIn;

  const AuthLoginResult({
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
    required this.expiresIn,
  });

  factory AuthLoginResult.fromJson(Map<String, dynamic> json) {
    return AuthLoginResult(
      accessToken: json['access_token'] as String? ?? '',
      refreshToken: json['refresh_token'] as String? ?? '',
      tokenType: json['token_type'] as String? ?? 'Bearer',
      expiresIn: (json['expires_in'] as num?)?.toInt() ?? 0,
    );
  }
}

class AuthMe {
  final String userId;
  final String organisationId;
  final List<String> roles;

  const AuthMe({
    required this.userId,
    required this.organisationId,
    required this.roles,
  });

  factory AuthMe.fromJson(Map<String, dynamic> json) {
    final rawRoles = json['roles'];

    return AuthMe(
      userId: json['user_id'] as String? ?? '',
      organisationId: json['organisation_id'] as String? ?? '',
      roles: rawRoles is List
          ? rawRoles.map((value) => value.toString()).toList()
          : const [],
    );
  }

  bool get isAuditor => roles.any((role) => role.toLowerCase() == 'auditor');
}
