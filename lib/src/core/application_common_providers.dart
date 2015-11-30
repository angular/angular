library angular2.src.core.application_common_providers;

import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/core/di.dart"
    show provide, Provider, Injector, OpaqueToken;
import "application_tokens.dart"
    show APP_COMPONENT_REF_PROMISE, APP_COMPONENT, APP_ID_RANDOM_PROVIDER;
import "change_detection/change_detection.dart"
    show
        IterableDiffers,
        defaultIterableDiffers,
        KeyValueDiffers,
        defaultKeyValueDiffers;
import "linker/view_pool.dart" show AppViewPool, APP_VIEW_POOL_CAPACITY;
import "linker/view_manager.dart" show AppViewManager;
import "linker/view_manager.dart" show AppViewManager_;
import "linker/view_manager_utils.dart" show AppViewManagerUtils;
import "linker/view_resolver.dart" show ViewResolver;
import "linker/view_listener.dart" show AppViewListener;
import "linker/proto_view_factory.dart" show ProtoViewFactory;
import "linker/directive_resolver.dart" show DirectiveResolver;
import "linker/pipe_resolver.dart" show PipeResolver;
import "linker/compiler.dart" show Compiler;
import "linker/compiler.dart" show Compiler_;
import "linker/dynamic_component_loader.dart" show DynamicComponentLoader;
import "linker/dynamic_component_loader.dart" show DynamicComponentLoader_;
import "render.dart" show EventManager;

/**
 * A default set of providers which should be included in any Angular
 * application, regardless of the platform it runs onto.
 */
const List<
        dynamic /* Type | Provider | List < dynamic > */ > APPLICATION_COMMON_PROVIDERS =
    const [
  const Provider(Compiler, useClass: Compiler_),
  APP_ID_RANDOM_PROVIDER,
  AppViewPool,
  const Provider(APP_VIEW_POOL_CAPACITY, useValue: 10000),
  const Provider(AppViewManager, useClass: AppViewManager_),
  AppViewManagerUtils,
  AppViewListener,
  ProtoViewFactory,
  ViewResolver,
  const Provider(IterableDiffers, useValue: defaultIterableDiffers),
  const Provider(KeyValueDiffers, useValue: defaultKeyValueDiffers),
  DirectiveResolver,
  PipeResolver,
  const Provider(DynamicComponentLoader, useClass: DynamicComponentLoader_),
  EventManager
];
