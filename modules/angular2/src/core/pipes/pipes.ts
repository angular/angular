import {isBlank, isPresent, CONST, Type} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {StringMapWrapper} from 'angular2/src/core/facade/collection';
import {
  Injectable,
  OptionalMetadata,
  SkipSelfMetadata,
  Binding,
  Injector,
  bind
} from 'angular2/src/core/di';
import {PipeBinding} from './pipe_binding';
import * as cd from 'angular2/src/core/change_detection/pipes';

export class ProtoPipes {
  static fromBindings(bindings: PipeBinding[]): ProtoPipes {
    var config = {};
    bindings.forEach(b => config[b.name] = b);
    return new ProtoPipes(config);
  }

  constructor(
      /**
      * Map of {@link PipeMetadata} names to {@link PipeMetadata} implementations.
      */
      public config: StringMap<string, PipeBinding>) {
    this.config = config;
  }

  get(name: string): PipeBinding {
    var binding = this.config[name];
    if (isBlank(binding)) throw new BaseException(`Cannot find pipe '${name}'.`);
    return binding;
  }
}



export class Pipes implements cd.Pipes {
  _config: StringMap<string, cd.SelectedPipe> = {};

  constructor(public proto: ProtoPipes, public injector: Injector) {}

  get(name: string): cd.SelectedPipe {
    var cached = StringMapWrapper.get(this._config, name);
    if (isPresent(cached)) return cached;

    var p = this.proto.get(name);
    var transform = this.injector.instantiateResolved(p);
    var res = new cd.SelectedPipe(transform, p.pure);

    if (p.pure) {
      StringMapWrapper.set(this._config, name, res);
    }

    return res;
  }
}
