import { CONST_EXPR } from 'angular2/src/facade/lang';
import { Provider } from 'angular2/src/core/di';
import { APP_ID_RANDOM_PROVIDER } from './application_tokens';
import { IterableDiffers, defaultIterableDiffers, KeyValueDiffers, defaultKeyValueDiffers } from './change_detection/change_detection';
import { AppViewPool, APP_VIEW_POOL_CAPACITY } from './linker/view_pool';
import { AppViewManager } from './linker/view_manager';
import { AppViewManager_ } from "./linker/view_manager";
import { AppViewManagerUtils } from './linker/view_manager_utils';
import { ViewResolver } from './linker/view_resolver';
import { AppViewListener } from './linker/view_listener';
import { ProtoViewFactory } from './linker/proto_view_factory';
import { DirectiveResolver } from './linker/directive_resolver';
import { PipeResolver } from './linker/pipe_resolver';
import { Compiler } from './linker/compiler';
import { Compiler_ } from "./linker/compiler";
import { DynamicComponentLoader } from './linker/dynamic_component_loader';
import { DynamicComponentLoader_ } from "./linker/dynamic_component_loader";
/**
 * A default set of providers which should be included in any Angular
 * application, regardless of the platform it runs onto.
 */
export const APPLICATION_COMMON_PROVIDERS = CONST_EXPR([
    new Provider(Compiler, { useClass: Compiler_ }),
    APP_ID_RANDOM_PROVIDER,
    AppViewPool,
    new Provider(APP_VIEW_POOL_CAPACITY, { useValue: 10000 }),
    new Provider(AppViewManager, { useClass: AppViewManager_ }),
    AppViewManagerUtils,
    AppViewListener,
    ProtoViewFactory,
    ViewResolver,
    new Provider(IterableDiffers, { useValue: defaultIterableDiffers }),
    new Provider(KeyValueDiffers, { useValue: defaultKeyValueDiffers }),
    DirectiveResolver,
    PipeResolver,
    new Provider(DynamicComponentLoader, { useClass: DynamicComponentLoader_ })
]);
