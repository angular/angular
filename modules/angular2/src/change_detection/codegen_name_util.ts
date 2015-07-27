import {RegExpWrapper, StringWrapper} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';

import {DirectiveIndex} from './directive_record';

import {ProtoRecord} from './proto_record';

// `context` is always the first field.
var _CONTEXT_IDX = 0;

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
  _sanitizedNames: List<string>;

  constructor(public records: List<ProtoRecord>, public directiveRecords: List<any>,
              public fieldPrefix: string, public utilName: string) {
    this._sanitizedNames = ListWrapper.createFixedSize(this.records.length + 1);
    this._sanitizedNames[_CONTEXT_IDX] = 'context';
    for (var i = 0, iLen = this.records.length; i < iLen; ++i) {
      this._sanitizedNames[i + 1] = sanitizeName(`${this.records[i].name}${i}`);
    }
  }

  getContextName(): string { return this.getFieldName(_CONTEXT_IDX); }

  getLocalName(idx: int): string { return this._sanitizedNames[idx]; }

  getChangeName(idx: int): string { return `c_${this._sanitizedNames[idx]}`; }

  /**
   * Generate a statement initializing local variables used when detecting changes.
   */
  genInitLocals(): string {
    var declarations = [];
    var assignments = [];
    for (var i = 0, iLen = this.getFieldCount(); i < iLen; ++i) {
      var changeName = this.getChangeName(i);
      declarations.push(`${this.getLocalName(i)},${changeName}`);
      assignments.push(changeName);
    }
    return `var ${ListWrapper.join(declarations, ',')};` +
           `${ListWrapper.join(assignments, '=')} = false;`;
  }

  getFieldCount(): int { return this._sanitizedNames.length; }

  getFieldName(idx: int): string { return `${this.fieldPrefix}${this._sanitizedNames[idx]}`; }

  getAllFieldNames(): List<string> {
    var fieldList = [];
    for (var k = 0, kLen = this.getFieldCount(); k < kLen; ++k) {
      fieldList.push(this.getFieldName(k));
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
      if (dRec.isOnPushChangeDetection()) {
        fieldList.push(this.getDetectorName(dRec.directiveIndex));
      }
    }
    return fieldList;
  }

  /**
   * Generates a statement which declares all fields.
   * This is only necessary for Dart change detectors.
   */
  genDeclareFields(): string {
    var fields = this.getAllFieldNames();
    ListWrapper.removeAt(fields, _CONTEXT_IDX);
    return ListWrapper.isEmpty(fields) ? '' : `var ${ListWrapper.join(fields, ', ')};`;
  }

  /**
   * Generates statements which clear all fields so that the change detector is dehydrated.
   */
  genDehydrateFields(): string {
    var fields = this.getAllFieldNames();
    ListWrapper.removeAt(fields, _CONTEXT_IDX);
    if (!ListWrapper.isEmpty(fields)) {
      // At least one assignment.
      fields.push(`${this.utilName}.uninitialized;`);
    }
    return `${this.getContextName()} = null; ${ListWrapper.join(fields, ' = ')}`;
  }

  /**
   * Generates statements destroying all pipe variables.
   */
  genPipeOnDestroy(): string {
    return ListWrapper.join(ListWrapper.map(ListWrapper.filter(this.records, (r) => {
      return r.isPipeRecord();
    }), (r) => { return `${this.getPipeName(r.selfIndex)}.onDestroy();`; }), '\n');
  }

  getPipeName(idx: int): string { return `${this.fieldPrefix}${this._sanitizedNames[idx]}_pipe`; }

  getAllDirectiveNames(): List<string> {
    return ListWrapper.map(this.directiveRecords, d => this.getDirectiveName(d.directiveIndex));
  }

  getDirectiveName(d: DirectiveIndex): string { return `${this.fieldPrefix}directive_${d.name}`; }

  getAllDetectorNames(): List<string> {
    return ListWrapper.map(
        ListWrapper.filter(this.directiveRecords, r => r.isOnPushChangeDetection()),
        (d) => this.getDetectorName(d.directiveIndex));
  }

  getDetectorName(d: DirectiveIndex): string { return `${this.fieldPrefix}detector_${d.name}`; }
}
