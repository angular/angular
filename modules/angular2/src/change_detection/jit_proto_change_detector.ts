import {ListWrapper} from 'angular2/src/facade/collection';

import {ProtoChangeDetector, ChangeDetector, ChangeDetectorDefinition} from './interfaces';
import {ChangeDetectorJITGenerator} from './change_detection_jit_generator';

import {coalesce} from './coalesce';
import {createPropertyRecords, createEventRecords} from './proto_change_detector';

export class JitProtoChangeDetector implements ProtoChangeDetector {
  _factory: Function;

  constructor(private definition: ChangeDetectorDefinition) {
    this._factory = this._createFactory(definition);
  }

  static isSupported(): boolean { return true; }

  instantiate(dispatcher: any): ChangeDetector { return this._factory(dispatcher); }

  _createFactory(definition: ChangeDetectorDefinition) {
    var propertyBindingRecords = createPropertyRecords(definition);
    var eventBindingRecords = createEventRecords(definition);
    return new ChangeDetectorJITGenerator(
               definition.id, definition.strategy, this.definition.bindingRecords, propertyBindingRecords, eventBindingRecords,
               this.definition.directiveRecords, this.definition.generateCheckNoChanges)
        .generate();
  }
}
