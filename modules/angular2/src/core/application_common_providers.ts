import {Type, CONST_EXPR} from 'angular2/src/facade/lang';
import {provide, Provider, Injector, OpaqueToken} from 'angular2/src/core/di';
import {
  APP_COMPONENT_REF_PROMISE,
  APP_COMPONENT,
  APP_ID_RANDOM_PROVIDER
} from './application_tokens';
import {
  IterableDiffers,
  defaultIterableDiffers,
  KeyValueDiffers,
  defaultKeyValueDiffers
} from './change_detection/change_detection';
import {AppViewManager} from './linker/view_manager';
import {AppViewManager_} from "./linker/view_manager";
import {Compiler} from './linker/compiler';
import {Compiler_} from "./linker/compiler";
import {DynamicComponentLoader} from './linker/dynamic_component_loader';
import {DynamicComponentLoader_} from "./linker/dynamic_component_loader";

var __unused: Type;  // avoid unused import when Type union types are erased

/**
 * A default set of providers which should be included in any Angular
 * application, regardless of the platform it runs onto.
 */
export const APPLICATION_COMMON_PROVIDERS: Array<Type | Provider | any[]> = CONST_EXPR([
  new Provider(Compiler, {useClass: Compiler_}),
  APP_ID_RANDOM_PROVIDER,
  new Provider(AppViewManager, {useClass: AppViewManager_}),
  new Provider(IterableDiffers, {useValue: defaultIterableDiffers}),
  new Provider(KeyValueDiffers, {useValue: defaultKeyValueDiffers}),
  new Provider(DynamicComponentLoader, {useClass: DynamicComponentLoader_})
]);