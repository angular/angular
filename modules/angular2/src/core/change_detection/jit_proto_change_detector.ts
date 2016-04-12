import {ListWrapper} from 'angular2/src/facade/collection';
import {isPresent} from 'angular2/src/facade/lang';

import {ProtoChangeDetector, ChangeDetector, ChangeDetectorDefinition} from './interfaces';
import {ChangeDetectorJITGenerator} from './change_detection_jit_generator';

export class JitProtoChangeDetector implements ProtoChangeDetector {
  /** @internal */
  _factory: Function;

  constructor(private definition: ChangeDetectorDefinition) {
    this._factory = this._createFactory(definition);
  }

  static isSupported(): boolean { return true; }

  instantiate(): ChangeDetector { return this._factory(); }

  /** @internal */
  _createFactory(definition: ChangeDetectorDefinition) {
    return new ChangeDetectorJITGenerator(definition, 'util', 'AbstractChangeDetector',
                                          'ChangeDetectorStatus')
        .generate();
  }
}
