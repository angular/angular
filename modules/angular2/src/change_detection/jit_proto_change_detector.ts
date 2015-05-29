import {ListWrapper} from 'angular2/src/facade/collection';

import {ProtoChangeDetector, ChangeDetector, ChangeDetectorDefinition} from './interfaces';
import {ChangeDetectorJITGenerator} from './change_detection_jit_generator';

import {coalesce} from './coalesce';
import {ProtoRecordBuilder} from './proto_change_detector';

var _jitProtoChangeDetectorClassCounter: number = 0;
export class JitProtoChangeDetector extends ProtoChangeDetector {
  _factory: Function;

  constructor(private _pipeRegistry, private definition: ChangeDetectorDefinition) {
    super();
    this._factory = this._createFactory(definition);
  }

  static isSupported(): boolean { return true; }

  instantiate(dispatcher: any): ChangeDetector {
    return this._factory(dispatcher, this._pipeRegistry);
  }

  _createFactory(definition: ChangeDetectorDefinition) {
    var recordBuilder = new ProtoRecordBuilder();
    ListWrapper.forEach(definition.bindingRecords,
                        (b) => { recordBuilder.add(b, definition.variableNames); });
    var c = _jitProtoChangeDetectorClassCounter++;
    var records = coalesce(recordBuilder.records);
    var typeName = `ChangeDetector${c}`;
    return new ChangeDetectorJITGenerator(typeName, definition.strategy, records,
                                          this.definition.directiveRecords)
        .generate();
  }
}
