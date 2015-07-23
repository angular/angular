import {ListWrapper, isListLikeIterable, StringMapWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent, BaseException, CONST} from 'angular2/src/facade/lang';
import {Pipe, PipeFactory} from './pipe';
import {Injectable, UnboundedMetadata, OptionalMetadata} from 'angular2/di';
import {ChangeDetectorRef} from '../change_detector_ref';
import {Binding} from 'angular2/di';

@Injectable()
@CONST()
export class Pipes {
  /**
   * Map of {@link Pipe} names to {@link PipeFactory} lists used to configure the
   * {@link Pipes} registry.
   *
   * #Example
   *
   * ```
   * var pipesConfig = {
   *   'json': [jsonPipeFactory]
   * }
   * @Component({
   *   viewInjector: [
   *     bind(Pipes).toValue(new Pipes(pipesConfig))
   *   ]
   * })
   * ```
   */
  config: StringMap<string, PipeFactory[]>;
  constructor(config: StringMap<string, PipeFactory[]>) { this.config = config; }

  get(type: string, obj: any, cdRef?: ChangeDetectorRef, existingPipe?: Pipe): Pipe {
    if (isPresent(existingPipe) && existingPipe.supports(obj)) return existingPipe;

    if (isPresent(existingPipe)) existingPipe.onDestroy();

    var factories = this._getListOfFactories(type, obj);
    var factory = this._getMatchingFactory(factories, type, obj);

    return factory.create(cdRef);
  }

  /**
   * Takes a {@link Pipes} config object and returns a binding used to extend the
   * inherited {@link Pipes} instance with the provided config and return a new
   * {@link Pipes} instance.
   *
   * If the provided config contains a key that is not yet present in the
   * inherited {@link Pipes}' config, a new {@link PipeFactory} list will be created
   * for that key. Otherwise, the provided config will be merged with the inherited
   * {@link Pipes} instance by prepending pipes to their respective keys, without mutating
   * the inherited {@link Pipes}.
   *
   * The following example shows how to extend an existing list of `async` factories
   * with a new {@link PipeFactory}, which will only be applied to the injector
   * for this component and its children. This step is all that's required to make a new
   * pipe available to this component's template.
   *
   * # Example
   *
   * ```
   * @Component({
   *   viewInjector: [
   *     Pipes.extend({
   *       async: [newAsyncPipe]
   *     })
   *   ]
   * })
   * ```
   */
  static extend(config: StringMap<string, PipeFactory[]>): Binding {
    return new Binding(Pipes, {
      toFactory: (pipes: Pipes) => {
        if (isBlank(pipes)) {
          // Typically would occur when calling Pipe.extend inside of dependencies passed to
          // bootstrap(), which would override default pipes instead of extending them.
          throw new BaseException('Cannot extend Pipes without a parent injector');
        }
        return Pipes.create(config, pipes);
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[Pipes, new UnboundedMetadata(), new OptionalMetadata()]]
    });
  }

  static create(config: StringMap<string, PipeFactory[]>, pipes: Pipes = null): Pipes {
    if (isPresent(pipes)) {
      StringMapWrapper.forEach(pipes.config, (v: PipeFactory[], k: string) => {
        if (StringMapWrapper.contains(config, k)) {
          var configFactories: PipeFactory[] = config[k];
          config[k] = configFactories.concat(v);
        } else {
          config[k] = ListWrapper.clone(v);
        }
      });
    }
    return new Pipes(config);
  }

  private _getListOfFactories(type: string, obj: any): PipeFactory[] {
    var listOfFactories = this.config[type];
    if (isBlank(listOfFactories)) {
      throw new BaseException(`Cannot find '${type}' pipe supporting object '${obj}'`);
    }
    return listOfFactories;
  }

  private _getMatchingFactory(listOfFactories: PipeFactory[], type: string, obj: any): PipeFactory {
    var matchingFactory =
        ListWrapper.find(listOfFactories, pipeFactory => pipeFactory.supports(obj));
    if (isBlank(matchingFactory)) {
      throw new BaseException(`Cannot find '${type}' pipe supporting object '${obj}'`);
    }
    return matchingFactory;
  }
}
