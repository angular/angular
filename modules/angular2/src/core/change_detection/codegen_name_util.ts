import {RegExpWrapper, StringWrapper} from 'angular2/src/core/facade/lang';
import {ListWrapper, MapWrapper, Map} from 'angular2/src/core/facade/collection';

import {DirectiveIndex} from './directive_record';

import {ProtoRecord} from './proto_record';
import {EventBinding} from './event_binding';

// The names of these fields must be kept in sync with abstract_change_detector.ts or change
// detection will fail.
const _ALREADY_CHECKED_ACCESSOR = "alreadyChecked";
const _CONTEXT_ACCESSOR = "context";
const _PROP_BINDING_INDEX = "propertyBindingIndex";
const _DIRECTIVES_ACCESSOR = "directiveIndices";
const _DISPATCHER_ACCESSOR = "dispatcher";
const _LOCALS_ACCESSOR = "locals";
const _MODE_ACCESSOR = "mode";
const _PIPES_ACCESSOR = "pipes";
const _PROTOS_ACCESSOR = "protos";

// `context` is always first.
export const CONTEXT_INDEX = 0;
const _FIELD_PREFIX = 'this.';

var _whiteSpaceRegExp = RegExpWrapper.create("\\W", "g");

/**
 * Returns `s` with all non-identifier characters removed.
 */
export function sanitizeName(s: string): string {
  return StringWrapper.replaceAll(s, _whiteSpaceRegExp, '');
}

/**
 * Class responsible for providing field and local variable names for change detector classes.
 * Also provides some convenience functions, for example, declaring variables, destroying pipes,
 * and dehydrating the detector.
 */
export class CodegenNameUtil {
  /**
   * Record names sanitized for use as fields.
   * See [sanitizeName] for details.
   */
  _sanitizedNames: string[];
  _sanitizedEventNames: Map<EventBinding, string[]>;

  constructor(private records: ProtoRecord[], private eventBindings: EventBinding[],
              private directiveRecords: any[], private utilName: string) {
    this._sanitizedNames = ListWrapper.createFixedSize(this.records.length + 1);
    this._sanitizedNames[CONTEXT_INDEX] = _CONTEXT_ACCESSOR;
    for (var i = 0, iLen = this.records.length; i < iLen; ++i) {
      this._sanitizedNames[i + 1] = sanitizeName(`${this.records[i].name}${i}`);
    }

    this._sanitizedEventNames = new Map();
    for (var ebIndex = 0; ebIndex < eventBindings.length; ++ebIndex) {
      var eb = eventBindings[ebIndex];
      var names = [_CONTEXT_ACCESSOR];
      for (var i = 0, iLen = eb.records.length; i < iLen; ++i) {
        names.push(sanitizeName(`${eb.records[i].name}${i}_${ebIndex}`));
      }
      this._sanitizedEventNames.set(eb, names);
    }
  }

  _addFieldPrefix(name: string): string { return `${_FIELD_PREFIX}${name}`; }

  getDispatcherName(): string { return this._addFieldPrefix(_DISPATCHER_ACCESSOR); }

  getPipesAccessorName(): string { return this._addFieldPrefix(_PIPES_ACCESSOR); }

  getProtosName(): string { return this._addFieldPrefix(_PROTOS_ACCESSOR); }

  getDirectivesAccessorName(): string { return this._addFieldPrefix(_DIRECTIVES_ACCESSOR); }

  getLocalsAccessorName(): string { return this._addFieldPrefix(_LOCALS_ACCESSOR); }

  getAlreadyCheckedName(): string { return this._addFieldPrefix(_ALREADY_CHECKED_ACCESSOR); }

  getModeName(): string { return this._addFieldPrefix(_MODE_ACCESSOR); }

  getPropertyBindingIndex(): string { return this._addFieldPrefix(_PROP_BINDING_INDEX); }

  getLocalName(idx: number): string { return `l_${this._sanitizedNames[idx]}`; }

  getEventLocalName(eb: EventBinding, idx: number): string {
    return `l_${MapWrapper.get(this._sanitizedEventNames, eb)[idx]}`;
  }

  getChangeName(idx: number): string { return `c_${this._sanitizedNames[idx]}`; }

  /**
   * Generate a statement initializing local variables used when detecting changes.
   */
  genInitLocals(): string {
    var declarations = [];
    var assignments = [];
    for (var i = 0, iLen = this.getFieldCount(); i < iLen; ++i) {
      if (i == CONTEXT_INDEX) {
        declarations.push(`${this.getLocalName(i)} = ${this.getFieldName(i)}`);
      } else {
        var rec = this.records[i - 1];
        if (rec.argumentToPureFunction) {
          var changeName = this.getChangeName(i);
          declarations.push(`${this.getLocalName(i)},${changeName}`);
          assignments.push(changeName);
        } else {
          declarations.push(`${this.getLocalName(i)}`);
        }
      }
    }
    var assignmentsCode =
        ListWrapper.isEmpty(assignments) ? '' : `${ListWrapper.join(assignments, '=')} = false;`;
    return `var ${ListWrapper.join(declarations, ',')};${assignmentsCode}`;
  }

  /**
   * Generate a statement initializing local variables for event handlers.
   */
  genInitEventLocals(): string {
    var res = [`${this.getLocalName(CONTEXT_INDEX)} = ${this.getFieldName(CONTEXT_INDEX)}`];
    MapWrapper.forEach(this._sanitizedEventNames, (names, eb) => {
      for (var i = 0; i < names.length; ++i) {
        if (i !== CONTEXT_INDEX) {
          res.push(`${this.getEventLocalName(eb, i)}`);
        }
      }
    });
    return res.length > 1 ? `var ${res.join(',')};` : '';
  }

  getPreventDefaultAccesor(): string { return "preventDefault"; }

  getFieldCount(): number { return this._sanitizedNames.length; }

  getFieldName(idx: number): string { return this._addFieldPrefix(this._sanitizedNames[idx]); }

  getAllFieldNames(): string[] {
    var fieldList = [];
    for (var k = 0, kLen = this.getFieldCount(); k < kLen; ++k) {
      if (k === 0 || this.records[k - 1].shouldBeChecked()) {
        fieldList.push(this.getFieldName(k));
      }
    }

    for (var i = 0, iLen = this.records.length; i < iLen; ++i) {
      var rec = this.records[i];
      if (rec.isPipeRecord()) {
        fieldList.push(this.getPipeName(rec.selfIndex));
      }
    }

    for (var j = 0, jLen = this.directiveRecords.length; j < jLen; ++j) {
      var dRec = this.directiveRecords[j];
      fieldList.push(this.getDirectiveName(dRec.directiveIndex));
      if (!dRec.isDefaultChangeDetection()) {
        fieldList.push(this.getDetectorName(dRec.directiveIndex));
      }
    }
    return fieldList;
  }

  /**
   * Generates statements which clear all fields so that the change detector is dehydrated.
   */
  genDehydrateFields(): string {
    var fields = this.getAllFieldNames();
    ListWrapper.removeAt(fields, CONTEXT_INDEX);
    if (ListWrapper.isEmpty(fields)) return '';

    // At least one assignment.
    fields.push(`${this.utilName}.uninitialized;`);
    return ListWrapper.join(fields, ' = ');
  }

  /**
   * Generates statements destroying all pipe variables.
   */
  genPipeOnDestroy(): string {
    return ListWrapper.join(
        ListWrapper.map(
            ListWrapper.filter(this.records, (r) => { return r.isPipeRecord(); }),
            (r) => {
              return `${this.utilName}.callPipeOnDestroy(${this.getPipeName(r.selfIndex)});`;
            }),
        '\n');
  }

  getPipeName(idx: number): string {
    return this._addFieldPrefix(`${this._sanitizedNames[idx]}_pipe`);
  }

  getDirectiveName(d: DirectiveIndex): string {
    return this._addFieldPrefix(`directive_${d.name}`);
  }

  getDetectorName(d: DirectiveIndex): string { return this._addFieldPrefix(`detector_${d.name}`); }
}
