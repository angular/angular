import {Type} from 'angular2/src/core/facade/lang';
import {ResolvedFactory, resolveBinding} from 'angular2/src/core/di/binding';
import {Key, ResolvedBinding, Binding} from 'angular2/src/core/di';
import {PipeMetadata} from '../metadata/directives';
import {ResolvedBinding_} from "../di/binding";

export class PipeBinding extends ResolvedBinding_ {
  constructor(public name: string, public pure: boolean, key: Key,
              resolvedFactories: ResolvedFactory[], multiBinding: boolean) {
    super(key, resolvedFactories, multiBinding);
  }

  static createFromType(type: Type, metadata: PipeMetadata): PipeBinding {
    var binding = new Binding(type, {toClass: type});
    var rb = resolveBinding(binding);
    return new PipeBinding(metadata.name, metadata.pure, rb.key, rb.resolvedFactories,
                           rb.multiBinding);
  }
}
