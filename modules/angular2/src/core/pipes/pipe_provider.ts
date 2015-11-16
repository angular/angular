import {Type} from 'angular2/src/facade/lang';
import {ResolvedFactory, resolveProvider, ResolvedProvider_} from 'angular2/src/core/di/provider';
import {Key, ResolvedProvider, Provider} from 'angular2/src/core/di';
import {PipeMetadata} from '../metadata/directives';

export class PipeProvider extends ResolvedProvider_ {
  constructor(public name: string, public pure: boolean, key: Key,
              resolvedFactories: ResolvedFactory[], multiBinding: boolean) {
    super(key, resolvedFactories, multiBinding);
  }

  static createFromType(type: Type, metadata: PipeMetadata): PipeProvider {
    var provider = new Provider(type, {useClass: type});
    var rb = resolveProvider(provider);
    return new PipeProvider(metadata.name, metadata.pure, rb.key, rb.resolvedFactories,
                            rb.multiProvider);
  }
}
