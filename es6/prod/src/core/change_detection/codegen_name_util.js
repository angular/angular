import { StringWrapper } from 'angular2/src/facade/lang';
import { ListWrapper, Map } from 'angular2/src/facade/collection';
// The names of these fields must be kept in sync with abstract_change_detector.ts or change
// detection will fail.
const _STATE_ACCESSOR = "state";
const _CONTEXT_ACCESSOR = "context";
const _PROP_BINDING_INDEX = "propertyBindingIndex";
const _DIRECTIVES_ACCESSOR = "directiveIndices";
const _DISPATCHER_ACCESSOR = "dispatcher";
const _LOCALS_ACCESSOR = "locals";
const _MODE_ACCESSOR = "mode";
const _PIPES_ACCESSOR = "pipes";
const _PROTOS_ACCESSOR = "protos";
export const CONTEXT_ACCESSOR = "context";
// `context` is always first.
export const CONTEXT_INDEX = 0;
const _FIELD_PREFIX = 'this.';
var _whiteSpaceRegExp = /\W/g;
/**
 * Returns `s` with all non-identifier characters removed.
 */
export function sanitizeName(s) {
    return StringWrapper.replaceAll(s, _whiteSpaceRegExp, '');
}
/**
 * Class responsible for providing field and local variable names for change detector classes.
 * Also provides some convenience functions, for example, declaring variables, destroying pipes,
 * and dehydrating the detector.
 */
export class CodegenNameUtil {
    constructor(_records, _eventBindings, _directiveRecords, _utilName) {
        this._records = _records;
        this._eventBindings = _eventBindings;
        this._directiveRecords = _directiveRecords;
        this._utilName = _utilName;
        /** @internal */
        this._sanitizedEventNames = new Map();
        this._sanitizedNames = ListWrapper.createFixedSize(this._records.length + 1);
        this._sanitizedNames[CONTEXT_INDEX] = CONTEXT_ACCESSOR;
        for (var i = 0, iLen = this._records.length; i < iLen; ++i) {
            this._sanitizedNames[i + 1] = sanitizeName(`${this._records[i].name}${i}`);
        }
        for (var ebIndex = 0; ebIndex < _eventBindings.length; ++ebIndex) {
            var eb = _eventBindings[ebIndex];
            var names = [CONTEXT_ACCESSOR];
            for (var i = 0, iLen = eb.records.length; i < iLen; ++i) {
                names.push(sanitizeName(`${eb.records[i].name}${i}_${ebIndex}`));
            }
            this._sanitizedEventNames.set(eb, names);
        }
    }
    /** @internal */
    _addFieldPrefix(name) { return `${_FIELD_PREFIX}${name}`; }
    getDispatcherName() { return this._addFieldPrefix(_DISPATCHER_ACCESSOR); }
    getPipesAccessorName() { return this._addFieldPrefix(_PIPES_ACCESSOR); }
    getProtosName() { return this._addFieldPrefix(_PROTOS_ACCESSOR); }
    getDirectivesAccessorName() { return this._addFieldPrefix(_DIRECTIVES_ACCESSOR); }
    getLocalsAccessorName() { return this._addFieldPrefix(_LOCALS_ACCESSOR); }
    getStateName() { return this._addFieldPrefix(_STATE_ACCESSOR); }
    getModeName() { return this._addFieldPrefix(_MODE_ACCESSOR); }
    getPropertyBindingIndex() { return this._addFieldPrefix(_PROP_BINDING_INDEX); }
    getLocalName(idx) { return `l_${this._sanitizedNames[idx]}`; }
    getEventLocalName(eb, idx) {
        return `l_${this._sanitizedEventNames.get(eb)[idx]}`;
    }
    getChangeName(idx) { return `c_${this._sanitizedNames[idx]}`; }
    /**
     * Generate a statement initializing local variables used when detecting changes.
     */
    genInitLocals() {
        var declarations = [];
        var assignments = [];
        for (var i = 0, iLen = this.getFieldCount(); i < iLen; ++i) {
            if (i == CONTEXT_INDEX) {
                declarations.push(`${this.getLocalName(i)} = ${this.getFieldName(i)}`);
            }
            else {
                var rec = this._records[i - 1];
                if (rec.argumentToPureFunction) {
                    var changeName = this.getChangeName(i);
                    declarations.push(`${this.getLocalName(i)},${changeName}`);
                    assignments.push(changeName);
                }
                else {
                    declarations.push(`${this.getLocalName(i)}`);
                }
            }
        }
        var assignmentsCode = ListWrapper.isEmpty(assignments) ? '' : `${assignments.join('=')} = false;`;
        return `var ${declarations.join(',')};${assignmentsCode}`;
    }
    /**
     * Generate a statement initializing local variables for event handlers.
     */
    genInitEventLocals() {
        var res = [`${this.getLocalName(CONTEXT_INDEX)} = ${this.getFieldName(CONTEXT_INDEX)}`];
        this._sanitizedEventNames.forEach((names, eb) => {
            for (var i = 0; i < names.length; ++i) {
                if (i !== CONTEXT_INDEX) {
                    res.push(`${this.getEventLocalName(eb, i)}`);
                }
            }
        });
        return res.length > 1 ? `var ${res.join(',')};` : '';
    }
    getPreventDefaultAccesor() { return "preventDefault"; }
    getFieldCount() { return this._sanitizedNames.length; }
    getFieldName(idx) { return this._addFieldPrefix(this._sanitizedNames[idx]); }
    getAllFieldNames() {
        var fieldList = [];
        for (var k = 0, kLen = this.getFieldCount(); k < kLen; ++k) {
            if (k === 0 || this._records[k - 1].shouldBeChecked()) {
                fieldList.push(this.getFieldName(k));
            }
        }
        for (var i = 0, iLen = this._records.length; i < iLen; ++i) {
            var rec = this._records[i];
            if (rec.isPipeRecord()) {
                fieldList.push(this.getPipeName(rec.selfIndex));
            }
        }
        for (var j = 0, jLen = this._directiveRecords.length; j < jLen; ++j) {
            var dRec = this._directiveRecords[j];
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
    genDehydrateFields() {
        var fields = this.getAllFieldNames();
        ListWrapper.removeAt(fields, CONTEXT_INDEX);
        if (ListWrapper.isEmpty(fields))
            return '';
        // At least one assignment.
        fields.push(`${this._utilName}.uninitialized;`);
        return fields.join(' = ');
    }
    /**
     * Generates statements destroying all pipe variables.
     */
    genPipeOnDestroy() {
        return this._records.filter(r => r.isPipeRecord())
            .map(r => `${this._utilName}.callPipeOnDestroy(${this.getPipeName(r.selfIndex)});`)
            .join('\n');
    }
    getPipeName(idx) {
        return this._addFieldPrefix(`${this._sanitizedNames[idx]}_pipe`);
    }
    getDirectiveName(d) {
        return this._addFieldPrefix(`directive_${d.name}`);
    }
    getDetectorName(d) { return this._addFieldPrefix(`detector_${d.name}`); }
}
//# sourceMappingURL=codegen_name_util.js.map