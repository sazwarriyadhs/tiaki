import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:tiaki_mobile/app/app.dart';

void main() {
  testWidgets('TIAKI Mobile splash screen loads and transitions', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: TiakiSplashScreen(),
      ),
    );

    await tester.pump();

    expect(find.text('FIELD AUDITOR'), findsOneWidget);
    expect(
      find.text('Halal Assurance Intelligence'),
      findsOneWidget,
    );

    // Advance fake time beyond the production splash delay.
    await tester.pump(const Duration(milliseconds: 2400));

    // Allow the navigation transition to complete.
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.text('Welcome back'), findsOneWidget);
    expect(
      find.text('Sign in to your TIAKI Field Auditor workspace.'),
      findsOneWidget,
    );
    expect(find.text('SIGN IN'), findsOneWidget);
  });

  testWidgets('TIAKI Mobile login screen loads', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: TiakiLoginScreen(),
      ),
    );

    await tester.pump();

    expect(find.text('Welcome back'), findsOneWidget);
    expect(
      find.text('Sign in to your TIAKI Field Auditor workspace.'),
      findsOneWidget,
    );
    expect(find.text('SIGN IN'), findsOneWidget);

    expect(find.byType(TextField), findsNWidgets(2));
  });
}
