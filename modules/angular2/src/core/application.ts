// Public API for Application
import {Provider} from './di';
import {Type, isPresent} from 'angular2/src/core/facade/lang';
import {Promise} from 'angular2/src/core/facade/async';
import {compilerProviders} from 'angular2/src/core/compiler/compiler';
import {commonBootstrap} from './application_common';
import {ComponentRef} from './linker/dynamic_component_loader';

export {APP_COMPONENT, APP_ID} from './application_tokens';
export {platform} from './application_common';
export {
  PlatformRef,
  ApplicationRef,
  applicationCommonBindings,
  createNgZone,
  platformCommon,
  platformBindings
} from './application_ref';

/// See [commonBootstrap] for detailed documentation.
export function bootstrap(appComponentType: /*Type*/ any,
                          appBindings: Array<Type | Provider | any[]> = null):
    Promise<ComponentRef> {
  var bindings = [compilerProviders()];
  if (isPresent(appBindings)) {
    bindings.push(appBindings);
  }
  return commonBootstrap(appComponentType, bindings);
}
