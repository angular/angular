import {BaseException} from 'angular2/src/core/facade/exceptions';

import {ProtoChangeDetector, ChangeDetector} from './interfaces';
import {coalesce} from './coalesce';

export {Function as PregenProtoChangeDetectorFactory};

export class PregenProtoChangeDetector implements ProtoChangeDetector {
  static isSupported(): boolean { return false; }

  instantiate(dispatcher: any): ChangeDetector {
    throw new BaseException('Pregen change detection not supported in Js');
  }
}
