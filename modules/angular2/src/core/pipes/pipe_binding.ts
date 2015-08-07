import {Type} from 'angular2/src/facade/lang';
import {Key, Dependency, ResolvedBinding, Binding} from 'angular2/di';
import {Pipe} from 'angular2/src/core/annotations_impl/annotations';

export class PipeBinding extends ResolvedBinding {
  constructor(public name: string, key: Key, factory: Function, dependencies: Dependency[]) {
    super(key, factory, dependencies);
  }

  static createFromType(type: Type, metadata: Pipe): PipeBinding {
    var binding = new Binding(type, {toClass: type});
    var rb = binding.resolve();
    return new PipeBinding(metadata.name, rb.key, rb.factory, rb.dependencies);
  }
}