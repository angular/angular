library angular2;

/**
 * An all-in-one place to import Angular 2 stuff.
 *
 * This library does not include `bootstrap`. Import `bootstrap.dart` instead.
 */
export 'package:angular2/core.dart';
export 'package:angular2/common.dart';
export 'package:angular2/instrumentation.dart';
export 'package:angular2/src/core/angular_entrypoint.dart' show AngularEntrypoint;
export 'package:angular2/src/core/application_tokens.dart'
    hide APP_COMPONENT_REF_PROMISE, APP_ID_RANDOM_PROVIDER;
export 'package:angular2/src/platform/dom/dom_tokens.dart';
export 'package:angular2/src/platform/dom/dom_adapter.dart';
export 'package:angular2/src/platform/dom/events/event_manager.dart';
export 'package:angular2/src/compiler/compiler.dart' show UrlResolver, DirectiveResolver, ViewResolver;

