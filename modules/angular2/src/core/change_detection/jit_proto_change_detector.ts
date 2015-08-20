import {ListWrapper} from 'angular2/src/core/facade/collection';
import {isPresent} from 'angular2/src/core/facade/lang';

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
    var propertyBindingTargets = this.definition.bindingRecords.map(b => b.target);

    return new ChangeDetectorJITGenerator(
               definition.id, definition.strategy, propertyBindingRecords, propertyBindingTargets,
               eventBindingRecords, this.definition.directiveRecords, this.definition.genConfig)
        .generate();
  }
}
