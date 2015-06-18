import {List, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent, BaseException, CONST} from 'angular2/src/facade/lang';
import {Pipe, PipeFactory} from './pipe';
import {Injectable} from 'angular2/src/di/decorators';
import {ChangeDetectorRef} from '../change_detector_ref';

@Injectable()
export class PipeRegistry {
  constructor(public config) {}

  get(type: string, obj, cdRef?: ChangeDetectorRef, existingPipe?: Pipe): Pipe {
    if (isPresent(existingPipe) && existingPipe.supports(obj)) return existingPipe;

    if (isPresent(existingPipe)) existingPipe.onDestroy();

    var factories = this._getListOfFactories(type, obj);
    var factory = this._getMatchingFactory(factories, type, obj);

    return factory.create(cdRef);
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
