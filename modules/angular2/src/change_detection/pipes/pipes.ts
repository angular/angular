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

  get(type: string, obj, cdRef?: ChangeDetectorRef, existingPipe?: Pipe): Pipe {
    if (isPresent(existingPipe) && existingPipe.supports(obj)) return existingPipe;

    if (isPresent(existingPipe)) existingPipe.onDestroy();

    var factories = this._getListOfFactories(type, obj);
    var factory = this._getMatchingFactory(factories, type, obj);

    return factory.create(cdRef);
  }

  /**
   * Takes a {@link Pipes} config object and returns a binding used to append the
   * provided config to an inherited {@link Pipes} instance and return a new
   * {@link Pipes} instance.
   *
   * If the provided config contains a key that is not yet present in the
   * inherited {@link Pipes}' config, a new {@link PipeFactory} list will be created
   * for that key. Otherwise, the provided config will be merged with the inherited
   * {@link Pipes} instance by appending pipes to their respective keys, without mutating
   * the inherited {@link Pipes}.
   *
   * The following example shows how to append a new {@link PipeFactory} to the
   * existing list of `async` factories, which will only be applied to the injector
   * for this component and its children. This step is all that's required to make a new
   * pipe available to this component's template.
   *
   * # Example
   *
   * ```
   * @Component({
   *   viewInjector: [
   *     Pipes.append({
   *       async: [newAsyncPipe]
   *     })
   *   ]
   * })
   * ```
   */
  static append(config): Binding {
    return new Binding(Pipes, {
      toFactory: (pipes: Pipes) => {
        if (!isPresent(pipes)) {
          // Typically would occur when calling Pipe.append inside of dependencies passed to
          // bootstrap(), which would override default pipes instead of append.
          throw new BaseException('Cannot append to Pipes without a parent injector');
        }
        var mergedConfig: StringMap<string, PipeFactory[]> = <StringMap<string, PipeFactory[]>>{};

        // Manual deep copy of existing Pipes config,
        // so that lists of PipeFactories don't get mutated.
        StringMapWrapper.forEach(pipes.config, (v: PipeFactory[], k: string) => {
          var localPipeList: PipeFactory[] = mergedConfig[k] = [];
          v.forEach((p: PipeFactory) => { localPipeList.push(p); });
        });

        StringMapWrapper.forEach(config, (v: PipeFactory[], k: string) => {
          if (isListLikeIterable(mergedConfig[k])) {
            mergedConfig[k] = ListWrapper.concat(mergedConfig[k], config[k]);
          } else {
            mergedConfig[k] = config[k];
          }
        });
        return new Pipes(mergedConfig);
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[Pipes, new UnboundedMetadata(), new OptionalMetadata()]]
    });
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
