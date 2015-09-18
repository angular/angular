import {Promise} from 'angular2/src/core/facade/async';
import {Injectable} from 'angular2/src/core/di';
import {Type} from 'angular2/src/core/facade/lang';
import {ProtoViewRef} from './view_ref';


/**
 * Low-level service for compiling {@link Component}s into {@link ProtoViewRef ProtoViews}s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level {@link DynamicComponentLoader} service, which
 * both compiles and instantiates a Component.
 */
@Injectable()
export class Compiler {
  compileInHost(componentType: Type): Promise<ProtoViewRef> { return null; }

  clearCache() {}
}
