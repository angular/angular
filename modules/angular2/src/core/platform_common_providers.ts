import {Type, isBlank, isPresent, assertionsEnabled, CONST_EXPR} from 'angular2/src/facade/lang';
import {provide, Provider, Injector, OpaqueToken} from 'angular2/src/core/di';
import {Console} from 'angular2/src/core/console';
import {Reflector, reflector} from './reflection/reflection';
import {ReflectorReader} from './reflection/reflector_reader';
import {TestabilityRegistry} from 'angular2/src/core/testability/testability';

function _reflector(): Reflector {
  return reflector;
}

/**
 * A default set of providers which should be included in any Angular platform.
 */
export const PLATFORM_COMMON_PROVIDERS: Array<Type | Provider | any[]> = CONST_EXPR([
  new Provider(Reflector, {useFactory: _reflector, deps: []}),
  new Provider(ReflectorReader, {useExisting: Reflector}),
  TestabilityRegistry,
  Console
]);