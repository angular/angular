import {Type} from 'angular2/src/core/facade/lang';
import {Key, Dependency, ResolvedBinding, Binding} from 'angular2/di';
import {PipeMetadata} from '../metadata/directives';

export class PipeBinding extends ResolvedBinding {
  constructor(public name: string, key: Key, factory: Function, dependencies: Dependency[]) {
    super(key, factory, dependencies);
  }

  static createFromType(type: Type, metadata: PipeMetadata): PipeBinding {
    var binding = new Binding(type, {toClass: type});
    var rb = binding.resolve();
    return new PipeBinding(metadata.name, rb.key, rb.factory, rb.dependencies);
  }
}
