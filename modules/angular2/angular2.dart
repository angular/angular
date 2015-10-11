library angular2;

/**
 * An all-in-one place to import Angular 2 stuff.
 *
 * This library does not include `bootstrap`. Import `bootstrap.dart` instead.
 */
export 'package:angular2/core.dart' hide forwardRef, resolveForwardRef, ForwardRefFn;
export 'package:angular2/profile.dart';
export 'package:angular2/lifecycle_hooks.dart';
export 'package:angular2/src/core/application_tokens.dart' hide APP_COMPONENT_REF_PROMISE, APP_ID_RANDOM_PROVIDER;
export 'package:angular2/src/core/render/dom/dom_tokens.dart';
