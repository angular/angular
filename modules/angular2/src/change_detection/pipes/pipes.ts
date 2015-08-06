import {ListWrapper, isListLikeIterable, StringMapWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent, BaseException, CONST, Type} from 'angular2/src/facade/lang';
import {Pipe} from './pipe';
import {Injectable, OptionalMetadata, SkipSelfMetadata, Binding, Injector, bind} from 'angular2/di';
import {ChangeDetectorRef} from '../change_detector_ref';

@Injectable()
@CONST()
export class Pipes {
  /**
   * Map of {@link Pipe} names to {@link Pipe} implementations.
   *
   * #Example
   *
   * ```
   * var pipesConfig = {
   *   'json': JsonPipe
   * }
   * @Component({
   *   viewBindings: [
   *     bind(Pipes).toFactory(inj => new Pipes(pipesConfig, in), [Injector])
   *   ]
   * })
   * ```
   */
  config: StringMap<string, Type | Binding>;

  constructor(config: StringMap<string, Type | Binding>, public injector: Injector) {
    this.config = config;
  }

  get(type: string, cdRef: ChangeDetectorRef): Pipe {
    var typeOrBinding = this.config[type];
    if (isBlank(typeOrBinding)) {
      throw new BaseException(`Cannot find pipe '${type}'.`);
    }
    // this is a temporary workaround and will be removed
    return this.injector.resolveAndCreateChild([bind(ChangeDetectorRef).toValue(cdRef)])
        .resolveAndInstantiate(typeOrBinding);
  }

  /**
   * Takes a {@link Pipes} config object and returns a binding used to extend the
   * inherited {@link Pipes} instance with the provided config and return a new
   * {@link Pipes} instance.
   *
   * The provided config is merged with the {@link Pipes} instance.
   *
   * # Example
   *
   * ```
   * @Component({
   *   viewBindings: [
   *     Pipes.extend({
   *       'bithdayFormat': BirthdayFormat
   *     })
   *   ]
   * })
   * ```
   */
  static extend(config: StringMap<string, Type | Binding>): Binding {
    return new Binding(Pipes, {
      toFactory: (pipes: Pipes, injector: Injector) => {
        if (isBlank(pipes)) {
          // Typically would occur when calling Pipe.extend inside of dependencies passed to
          // bootstrap(), which would override default pipes instead of extending them.
          throw new BaseException('Cannot extend Pipes without a parent injector');
        }
        return Pipes.create(config, injector, pipes);
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[Pipes, new SkipSelfMetadata(), new OptionalMetadata()], Injector]
    });
  }

  static create(config: StringMap<string, Type | Binding>, injector: Injector,
                pipes: Pipes = null): Pipes {
    if (isPresent(pipes)) {
      return new Pipes(StringMapWrapper.merge(pipes.config, config), injector);
    } else {
      return new Pipes(config, injector);
    }
  }
}
