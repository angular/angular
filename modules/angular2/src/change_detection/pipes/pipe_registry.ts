import {List, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent, BaseException, CONST} from 'angular2/src/facade/lang';
import {Pipe} from './pipe';
import {Injectable} from 'angular2/src/di/decorators';
import {ChangeDetectorRef} from '../change_detector_ref';

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;

@Injectable()
export class PipeRegistry {
  constructor(public config) {}

  get(type: string, obj, cdRef: ChangeDetectorRef): Pipe {
    var listOfConfigs = this.config[type];
    if (isBlank(listOfConfigs)) {
      throw new BaseException(`Cannot find '${type}' pipe supporting object '${obj}'`);
    }

    var matchingConfig = ListWrapper.find(listOfConfigs, (pipeConfig) => pipeConfig.supports(obj));

    if (isBlank(matchingConfig)) {
      throw new BaseException(`Cannot find '${type}' pipe supporting object '${obj}'`);
    }

    return matchingConfig.create(cdRef);
  }
}
