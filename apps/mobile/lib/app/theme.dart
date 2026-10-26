import 'package:flutter/material.dart';

abstract final class TiakiColors {
  static const green950 = Color(0xFF123524);
  static const green900 = Color(0xFF14532D);
  static const green800 = Color(0xFF166534);
  static const green700 = Color(0xFF15803D);
  static const green600 = Color(0xFF16A34A);
  static const green100 = Color(0xFFDCFCE7);
  static const green50 = Color(0xFFF0FDF4);

  static const background = Color(0xFFF7FAF8);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSoft = Color(0xFFF8FBF9);

  static const border = Color(0xFFE1E9E4);
  static const text = Color(0xFF183028);
  static const textSoft = Color(0xFF60736A);
  static const muted = Color(0xFF8A9A92);

  static const warning = Color(0xFFD97706);
  static const danger = Color(0xFFDC2626);
}

ThemeData buildTiakiTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: TiakiColors.green700,
    brightness: Brightness.light,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme.copyWith(
      primary: TiakiColors.green700,
      onPrimary: Colors.white,
      surface: TiakiColors.surface,
      onSurface: TiakiColors.text,
    ),
    scaffoldBackgroundColor: TiakiColors.background,
    fontFamily: 'Arial',
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: TiakiColors.text,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      centerTitle: false,
    ),
    cardTheme: CardThemeData(
      color: TiakiColors.surface,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(13),
        side: const BorderSide(color: TiakiColors.border),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: TiakiColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: TiakiColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: TiakiColors.green600, width: 1.4),
      ),
    ),
  );
}
