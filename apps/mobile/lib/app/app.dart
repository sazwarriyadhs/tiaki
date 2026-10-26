import 'package:flutter/material.dart';
import 'package:tiaki_mobile/core/auth/auth_repository.dart';

import 'theme.dart';

class TiakiMobileApp extends StatelessWidget {
  const TiakiMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TIAKI Mobile',
      debugShowCheckedModeBanner: false,
      theme: buildTiakiTheme(),
      home: const TiakiSplashScreen(),
    );
  }
}

class TiakiSplashScreen extends StatefulWidget {
  const TiakiSplashScreen({super.key});

  @override
  State<TiakiSplashScreen> createState() => _TiakiSplashScreenState();
}

class _TiakiSplashScreenState extends State<TiakiSplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _logoScale;
  late final Animation<double> _logoOpacity;
  late final Animation<double> _contentOpacity;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );

    _logoScale = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.65, curve: Curves.easeOutBack),
    );

    _logoOpacity = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.42, curve: Curves.easeOut),
    );

    _contentOpacity = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.38, 0.82, curve: Curves.easeOut),
    );

    _controller.forward();

    Future<void>.delayed(const Duration(milliseconds: 2300), () {
      if (!mounted) {
        return;
      }

      Navigator.of(context).pushReplacement(
        PageRouteBuilder<void>(
          pageBuilder: (context, animation, secondaryAnimation) =>
              const TiakiLoginScreen(),
          transitionDuration: const Duration(milliseconds: 450),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        ),
      );
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TiakiColors.background,
      body: Stack(
        children: [
          Positioned(
            top: -180,
            right: -150,
            child: Container(
              width: 420,
              height: 420,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [Color(0xFFDDF5E4), Color(0x00DDF5E4)],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -200,
            left: -160,
            child: Container(
              width: 440,
              height: 440,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [Color(0xFFEAF8EE), Color(0x00EAF8EE)],
                ),
              ),
            ),
          ),
          Center(
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Opacity(
                      opacity: _logoOpacity.value,
                      child: Transform.scale(
                        scale: 0.78 + (_logoScale.value * 0.22),
                        child: Image.asset(
                          'assets/logo/mobile_auditor_logo.png',
                          width: 220,
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Opacity(
                      opacity: _contentOpacity.value,
                      child: const Column(
                        children: [
                          Text(
                            'FIELD AUDITOR',
                            style: TextStyle(
                              color: TiakiColors.green700,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 2.2,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Halal Assurance Intelligence',
                            style: TextStyle(
                              color: TiakiColors.textSoft,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 34,
            child: Opacity(
              opacity: _contentOpacity.value,
              child: const Text(
                'TIAKI',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: TiakiColors.muted,
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class TiakiLoginScreen extends StatefulWidget {
  const TiakiLoginScreen({super.key});

  @override
  State<TiakiLoginScreen> createState() => _TiakiLoginScreenState();
}

class _TiakiLoginScreenState extends State<TiakiLoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final TiakiAuthRepository _authRepository = TiakiAuthRepository();

  bool _obscurePassword = true;
  bool _isSigningIn = false;
  String? _loginError;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();

    final login = _emailController.text.trim();
    final password = _passwordController.text;

    if (login.isEmpty || password.isEmpty) {
      setState(() {
        _loginError = 'Email and password are required.';
      });
      return;
    }

    if (_isSigningIn) {
      return;
    }

    setState(() {
      _isSigningIn = true;
      _loginError = null;
    });

    try {
      await _authRepository.login(login: login, password: password);

      if (!mounted) {
        return;
      }

      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(builder: (_) => const AuditorHomePage()),
      );
    } on TiakiAuthException catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _loginError = error.message;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }

      setState(() {
        _loginError =
            'Unable to connect to TIAKI. Please check the API connection.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSigningIn = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TiakiColors.background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final desktop = constraints.maxWidth >= 900;

            if (desktop) {
              return Row(
                children: [
                  Expanded(flex: 11, child: _buildBrandPanel()),
                  Expanded(flex: 9, child: _buildLoginPanel()),
                ],
              );
            }

            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(22, 30, 22, 30),
              child: _buildLoginContent(compact: true),
            );
          },
        ),
      ),
    );
  }

  Widget _buildBrandPanel() {
    return Container(
      color: TiakiColors.surfaceSoft,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 470),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Image.asset(
                  'assets/logo/mobile_auditor_logo.png',
                  width: 230,
                  fit: BoxFit.contain,
                  alignment: Alignment.centerLeft,
                ),
                const SizedBox(height: 34),
                Container(
                  width: 54,
                  height: 4,
                  decoration: BoxDecoration(
                    color: TiakiColors.green600,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 22),
                const Text(
                  'FIELD ASSURANCE',
                  style: TextStyle(
                    color: TiakiColors.green700,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.4,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Evidence-driven halal assurance.',
                  style: TextStyle(
                    color: TiakiColors.green950,
                    fontSize: 32,
                    height: 1.1,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.8,
                  ),
                ),
                const SizedBox(height: 14),
                const Text(
                  'Plan, execute and document field audits with TIAKI.',
                  style: TextStyle(
                    color: TiakiColors.textSoft,
                    fontSize: 13,
                    height: 1.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginPanel() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(42),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: _buildLoginContent(compact: false),
        ),
      ),
    );
  }

  Widget _buildLoginContent({required bool compact}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (compact)
          Center(
            child: Image.asset(
              'assets/logo/mobile_auditor_logo.png',
              width: 190,
              fit: BoxFit.contain,
            ),
          ),

        if (compact) const SizedBox(height: 34),

        const Text(
          'Welcome back',
          style: TextStyle(
            color: TiakiColors.text,
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
          ),
        ),

        const SizedBox(height: 7),

        const Text(
          'Sign in to your TIAKI Field Auditor workspace.',
          style: TextStyle(
            color: TiakiColors.textSoft,
            fontSize: 12,
            height: 1.45,
            fontWeight: FontWeight.w500,
          ),
        ),

        const SizedBox(height: 28),

        const Text(
          'EMAIL',
          style: TextStyle(
            color: TiakiColors.muted,
            fontSize: 9,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.0,
          ),
        ),

        const SizedBox(height: 7),

        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          decoration: const InputDecoration(
            hintText: 'auditor@example.com',
            prefixIcon: Icon(Icons.mail_outline, size: 19),
          ),
        ),

        const SizedBox(height: 18),

        const Text(
          'PASSWORD',
          style: TextStyle(
            color: TiakiColors.muted,
            fontSize: 9,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.0,
          ),
        ),

        const SizedBox(height: 7),

        TextField(
          controller: _passwordController,
          obscureText: _obscurePassword,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _submit(),
          decoration: InputDecoration(
            hintText: 'Enter your password',
            prefixIcon: const Icon(Icons.lock_outline, size: 19),
            suffixIcon: IconButton(
              tooltip: _obscurePassword ? 'Show password' : 'Hide password',
              icon: Icon(
                _obscurePassword
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                size: 19,
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            ),
          ),
        ),

        if (_loginError != null) ...[
          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: TiakiColors.surfaceSoft,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: TiakiColors.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.error_outline_rounded,
                  size: 18,
                  color: TiakiColors.danger,
                ),
                const SizedBox(width: 9),
                Expanded(
                  child: Text(
                    _loginError!,
                    style: const TextStyle(
                      color: TiakiColors.danger,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],

        const SizedBox(height: 24),

        SizedBox(
          width: double.infinity,
          height: 46,
          child: FilledButton(
            onPressed: _submit,
            child: const Text(
              'SIGN IN',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: .8,
              ),
            ),
          ),
        ),

        const SizedBox(height: 20),

        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: TiakiColors.surfaceSoft,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: TiakiColors.border),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.verified_user_outlined,
                size: 17,
                color: TiakiColors.green600,
              ),
              SizedBox(width: 9),
              Expanded(
                child: Text(
                  'TIAKI protects auditor identity, organisation scope '
                  'and field assurance records.',
                  style: TextStyle(
                    color: TiakiColors.textSoft,
                    fontSize: 10,
                    height: 1.4,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 30),

        Center(
          child: Text(
            'TIAKI Mobile • FIANZ Field Auditor',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: TiakiColors.muted,
              fontSize: 9,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class AuditorHomePage extends StatefulWidget {
  const AuditorHomePage({super.key});

  @override
  State<AuditorHomePage> createState() => _AuditorHomePageState();
}

class _AuditorHomePageState extends State<AuditorHomePage> {
  int selectedIndex = 0;

  static const navigation = <_NavigationItem>[
    _NavigationItem(Icons.dashboard_outlined, 'Dashboard'),
    _NavigationItem(Icons.assignment_outlined, 'Audits'),
    _NavigationItem(Icons.fact_check_outlined, 'Checklist'),
    _NavigationItem(Icons.photo_camera_outlined, 'Evidence'),
    _NavigationItem(Icons.warning_amber_outlined, 'Findings'),
    _NavigationItem(Icons.sync_alt_outlined, 'Verification'),
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final desktop = constraints.maxWidth >= 900;

        return Scaffold(
          drawer: desktop ? null : _buildDrawer(context),
          appBar: desktop
              ? null
              : AppBar(
                  leading: Builder(
                    builder: (context) => IconButton(
                      icon: const Icon(Icons.menu),
                      onPressed: () => Scaffold.of(context).openDrawer(),
                    ),
                  ),
                  title: const Text(
                    'Auditor Workspace',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                ),
          body: Row(
            children: [
              if (desktop) _buildSidebar(context),
              Expanded(child: _buildMainContent(context, desktop)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSidebar(BuildContext context) {
    return Container(
      width: 246,
      decoration: const BoxDecoration(
        color: TiakiColors.surfaceSoft,
        border: Border(right: BorderSide(color: TiakiColors.border)),
      ),
      child: SafeArea(
        child: Column(
          children: [
            _buildBrand(),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
                children: [
                  _sectionTitle('AUDITOR'),
                  ...List.generate(
                    navigation.length,
                    (index) => _navItem(index),
                  ),
                  const SizedBox(height: 18),
                  _sectionTitle('SYSTEM'),
                  _systemItem(Icons.notifications_none, 'Notifications'),
                  _systemItem(Icons.settings_outlined, 'Settings'),
                ],
              ),
            ),
            _buildUserCard(),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: TiakiColors.surfaceSoft,
      child: SafeArea(
        child: Column(
          children: [
            _buildBrand(),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
                children: [
                  _sectionTitle('AUDITOR'),
                  ...List.generate(
                    navigation.length,
                    (index) => _navItem(index),
                  ),
                  const SizedBox(height: 18),
                  _sectionTitle('SYSTEM'),
                  _systemItem(Icons.notifications_none, 'Notifications'),
                  _systemItem(Icons.settings_outlined, 'Settings'),
                ],
              ),
            ),
            _buildUserCard(),
          ],
        ),
      ),
    );
  }

  Widget _buildBrand() {
    return Container(
      constraints: const BoxConstraints(minHeight: 102),
      padding: const EdgeInsets.fromLTRB(20, 10, 18, 8),
      alignment: Alignment.centerLeft,
      child: Image.asset(
        'assets/logo/mobile_auditor_logo.png',
        width: 180,
        fit: BoxFit.contain,
        alignment: Alignment.centerLeft,
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      child: Text(
        title,
        style: const TextStyle(
          color: TiakiColors.muted,
          fontSize: 9,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.0,
        ),
      ),
    );
  }

  Widget _navItem(int index) {
    final item = navigation[index];
    final active = selectedIndex == index;

    return Padding(
      padding: const EdgeInsets.only(bottom: 3),
      child: Material(
        color: active ? TiakiColors.green100 : Colors.transparent,
        borderRadius: BorderRadius.circular(9),
        child: InkWell(
          borderRadius: BorderRadius.circular(9),
          onTap: () {
            setState(() => selectedIndex = index);
          },
          child: SizedBox(
            height: 42,
            child: Row(
              children: [
                const SizedBox(width: 12),
                Icon(
                  item.icon,
                  size: 19,
                  color: active ? TiakiColors.green700 : TiakiColors.textSoft,
                ),
                const SizedBox(width: 11),
                Expanded(
                  child: Text(
                    item.label,
                    style: TextStyle(
                      color: active ? TiakiColors.green800 : TiakiColors.text,
                      fontSize: 12,
                      fontWeight: active ? FontWeight.w700 : FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _systemItem(IconData icon, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 3),
      child: SizedBox(
        height: 42,
        child: Row(
          children: [
            const SizedBox(width: 12),
            Icon(icon, size: 19, color: TiakiColors.textSoft),
            const SizedBox(width: 11),
            Text(
              label,
              style: const TextStyle(
                color: TiakiColors.text,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUserCard() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 14),
      padding: const EdgeInsets.all(11),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FAF8),
        borderRadius: BorderRadius.circular(10),
      ),
      child: const Row(
        children: [
          CircleAvatar(
            radius: 17,
            backgroundColor: TiakiColors.green100,
            child: Text(
              'AU',
              style: TextStyle(
                color: TiakiColors.green800,
                fontSize: 10,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Auditor',
                  style: TextStyle(
                    color: TiakiColors.text,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: 1),
                Text(
                  'TIAKI Assurance',
                  style: TextStyle(color: TiakiColors.muted, fontSize: 10),
                ),
              ],
            ),
          ),
          Icon(Icons.keyboard_arrow_down, size: 20, color: TiakiColors.muted),
        ],
      ),
    );
  }

  Widget _buildMainContent(BuildContext context, bool desktop) {
    return Container(
      color: TiakiColors.background,
      child: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(
            desktop ? 28 : 18,
            desktop ? 25 : 18,
            desktop ? 28 : 18,
            34,
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1440),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildTopbar(desktop),
                const SizedBox(height: 18),
                _buildHero(),
                const SizedBox(height: 14),
                _buildMetrics(),
                const SizedBox(height: 14),
                _buildAuditPanel(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTopbar(bool desktop) {
    return Row(
      children: [
        if (desktop)
          const Expanded(
            child: Text(
              'AUDITOR WORKSPACE',
              style: TextStyle(
                color: TiakiColors.muted,
                fontSize: 10,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.0,
              ),
            ),
          )
        else
          const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: TiakiColors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Row(
            children: [
              Icon(Icons.circle, size: 8, color: TiakiColors.green600),
              SizedBox(width: 7),
              Text(
                'TIAKI API',
                style: TextStyle(
                  color: TiakiColors.textSoft,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHero() {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 176),
      padding: const EdgeInsets.all(26),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(15),
        gradient: const RadialGradient(
          center: Alignment.topLeft,
          radius: 1.4,
          colors: [Color(0xFFE7F8EC), Color(0xFFD9F2E1), Color(0xFFCDECD7)],
        ),
        border: Border.all(color: TiakiColors.border),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'FIELD ASSURANCE',
            style: TextStyle(
              color: TiakiColors.green700,
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
            ),
          ),
          SizedBox(height: 9),
          Text(
            'Evidence-driven halal assurance.',
            style: TextStyle(
              color: TiakiColors.green950,
              fontSize: 27,
              height: 1.08,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.7,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Plan, execute and document field audits with TIAKI.',
            style: TextStyle(
              color: TiakiColors.textSoft,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetrics() {
    const metrics = [
      ('Assigned Audits', '0', Icons.assignment_outlined),
      ('Open Findings', '0', Icons.warning_amber_outlined),
      ('Evidence', '0', Icons.photo_library_outlined),
      ('CAPA', '0', Icons.fact_check_outlined),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 300,
        mainAxisExtent: 122,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
      ),
      itemCount: metrics.length,
      itemBuilder: (context, index) {
        final metric = metrics[index];

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(metric.$3, size: 18, color: TiakiColors.green600),
                const SizedBox(height: 9),
                Text(
                  metric.$1,
                  style: const TextStyle(
                    color: TiakiColors.muted,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: .4,
                  ),
                ),
                const Spacer(),
                Text(
                  metric.$2,
                  style: const TextStyle(
                    color: TiakiColors.text,
                    fontSize: 25,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildAuditPanel() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(17, 15, 17, 17),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(
                  Icons.assignment_turned_in_outlined,
                  size: 19,
                  color: TiakiColors.green600,
                ),
                SizedBox(width: 9),
                Text(
                  'Assigned Audits',
                  style: TextStyle(
                    color: TiakiColors.text,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
            const Divider(height: 28),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 22),
              decoration: BoxDecoration(
                color: TiakiColors.surfaceSoft,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Column(
                children: [
                  Icon(
                    Icons.assignment_outlined,
                    size: 28,
                    color: TiakiColors.muted,
                  ),
                  SizedBox(height: 9),
                  Text(
                    'No audit assignments loaded.',
                    style: TextStyle(
                      color: TiakiColors.textSoft,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Real audit data will appear after TIAKI authentication.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: TiakiColors.muted, fontSize: 10),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavigationItem {
  const _NavigationItem(this.icon, this.label);

  final IconData icon;
  final String label;
}
