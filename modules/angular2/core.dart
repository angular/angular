library angular2.core;

export 'package:angular2/src/core/application_tokens.dart' show APP_COMPONENT;
export 'package:angular2/src/core/application_ref.dart' show ApplicationRef;

// Compiler Related Dependencies.
export 'package:angular2/src/core/services/app_root_url.dart' show AppRootUrl;
export 'package:angular2/src/core/services/url_resolver.dart' show UrlResolver;
export 'package:angular2/src/core/compiler/component_url_mapper.dart'
    show ComponentUrlMapper;
export 'package:angular2/src/core/compiler/directive_resolver.dart'
    show DirectiveResolver;
export 'package:angular2/src/core/compiler/compiler.dart' show Compiler;

export 'package:angular2/src/core/compiler/view_manager.dart' show AppViewManager;
export 'package:angular2/src/core/compiler/query_list.dart' show QueryList;
export 'package:angular2/src/core/compiler/dynamic_component_loader.dart'
    show DynamicComponentLoader;
export 'package:angular2/src/core/life_cycle/life_cycle.dart' show LifeCycle;

export 'package:angular2/src/core/compiler/element_ref.dart' show ElementRef;
export 'package:angular2/src/core/compiler/template_ref.dart' show TemplateRef;
export 'package:angular2/src/core/compiler/view_ref.dart'
    show ViewRef, HostViewRef, ProtoViewRef;
export 'package:angular2/src/core/compiler/view_container_ref.dart'
    show ViewContainerRef;
export 'package:angular2/src/core/compiler/dynamic_component_loader.dart'
    show ComponentRef;

export 'package:angular2/src/core/zone/ng_zone.dart' show NgZone;
export 'package:angular2/src/core/facade/async.dart' show Stream, EventEmitter;
