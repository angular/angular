import {isBlank, isPresent, CONST, Type} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {
  Injectable,
  OptionalMetadata,
  SkipSelfMetadata,
  Provider,
  Injector,
  bind
} from 'angular2/src/core/di';
import {PipeProvider} from './pipe_provider';
import * as cd from 'angular2/src/core/change_detection/pipes';

export class ProtoPipes {
  static fromProviders(providers: PipeProvider[]): ProtoPipes {
    var config: {[key: string]: PipeProvider} = {};
    providers.forEach(b => config[b.name] = b);
    return new ProtoPipes(config);
  }

  constructor(
      /**
      * Map of {@link PipeMetadata} names to {@link PipeMetadata} implementations.
      */
      public config: {[key: string]: PipeProvider}) {
    this.config = config;
  }

  get(name: string): PipeProvider {
    var provider = this.config[name];
    if (isBlank(provider)) throw new BaseException(`Cannot find pipe '${name}'.`);
    return provider;
  }
}



export class Pipes implements cd.Pipes {
  /** @internal */
  _config: {[key: string]: cd.SelectedPipe} = {};

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
