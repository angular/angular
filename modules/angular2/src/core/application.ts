// Public API for Application
import {Provider} from './di';
import {Type, isPresent} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {compilerProviders} from 'angular2/src/compiler/compiler';
import {commonBootstrap} from './application_common';
import {ComponentRef} from './linker/dynamic_component_loader';

export {APP_COMPONENT, APP_ID} from './application_tokens';
export {platform} from './application_common';
export {
  PlatformRef,
  ApplicationRef,
  applicationCommonProviders,
  createNgZone,
  platformCommon,
  platformProviders
} from './application_ref';

/// See [commonBootstrap] for detailed documentation.
export function bootstrap(
    appComponentType: /*Type*/ any,
    appProviders: Array<Type | Provider | any[]> = null): Promise<ComponentRef> {
  var providers = [compilerProviders()];
  if (isPresent(appProviders)) {
    providers.push(appProviders);
  }
  return commonBootstrap(appComponentType, providers);
}
