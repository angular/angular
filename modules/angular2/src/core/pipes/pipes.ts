import {isBlank, isPresent, BaseException, CONST, Type} from 'angular2/src/core/facade/lang';
import {Injectable, OptionalMetadata, SkipSelfMetadata, Binding, Injector, bind} from 'angular2/di';
import {PipeBinding} from './pipe_binding';
import * as cd from 'angular2/src/core/change_detection/pipes';

export class ProtoPipes {
  /**
   * Map of {@link PipeMetadata} names to {@link PipeMetadata} implementations.
   */
  config: StringMap<string, PipeBinding> = {};

  constructor(bindings: PipeBinding[]) { bindings.forEach(b => this.config[b.name] = b); }

  get(name: string): PipeBinding {
    var binding = this.config[name];
    if (isBlank(binding)) throw new BaseException(`Cannot find pipe '${name}'.`);
    return binding;
  }
}

export class Pipes implements cd.Pipes {
  constructor(public proto: ProtoPipes, public injector: Injector) {}

  get(name: string): any {
    var b = this.proto.get(name);
    return this.injector.instantiateResolved(b);
  }
}
