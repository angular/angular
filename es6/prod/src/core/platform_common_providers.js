import { CONST_EXPR } from 'angular2/src/facade/lang';
import { Provider } from 'angular2/src/core/di';
import { Console } from 'angular2/src/core/console';
import { Reflector, reflector } from './reflection/reflection';
import { TestabilityRegistry } from 'angular2/src/core/testability/testability';
function _reflector() {
    return reflector;
}
/**
 * A default set of providers which should be included in any Angular platform.
 */
export const PLATFORM_COMMON_PROVIDERS = CONST_EXPR([new Provider(Reflector, { useFactory: _reflector, deps: [] }), TestabilityRegistry, Console]);
