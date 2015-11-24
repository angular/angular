import { isPresent, isBlank, looseIdentical } from 'angular2/src/facade/lang';
import { ListWrapper, Map } from 'angular2/src/facade/collection';
import { RecordType, ProtoRecord } from './proto_record';
/**
 * Removes "duplicate" records. It assumes that record evaluation does not have side-effects.
 *
 * Records that are not last in bindings are removed and all the indices of the records that depend
 * on them are updated.
 *
 * Records that are last in bindings CANNOT be removed, and instead are replaced with very cheap
 * SELF records.
 *
 * @internal
 */
export function coalesce(srcRecords) {
    let dstRecords = [];
    let excludedIdxs = [];
    let indexMap = new Map();
    let skipDepth = 0;
    let skipSources = ListWrapper.createFixedSize(srcRecords.length);
    for (let protoIndex = 0; protoIndex < srcRecords.length; protoIndex++) {
        let skipRecord = skipSources[protoIndex];
        if (isPresent(skipRecord)) {
            skipDepth--;
            skipRecord.fixedArgs[0] = dstRecords.length;
        }
        let src = srcRecords[protoIndex];
        let dst = _cloneAndUpdateIndexes(src, dstRecords, indexMap);
        if (dst.isSkipRecord()) {
            dstRecords.push(dst);
            skipDepth++;
            skipSources[dst.fixedArgs[0]] = dst;
        }
        else {
            let record = _mayBeAddRecord(dst, dstRecords, excludedIdxs, skipDepth > 0);
            indexMap.set(src.selfIndex, record.selfIndex);
        }
    }
    return _optimizeSkips(dstRecords);
}
/**
 * - Conditional skip of 1 record followed by an unconditional skip of N are replaced by  a
 *   conditional skip of N with the negated condition,
 * - Skips of 0 records are removed
 */
function _optimizeSkips(srcRecords) {
    let dstRecords = [];
    let skipSources = ListWrapper.createFixedSize(srcRecords.length);
    let indexMap = new Map();
    for (let protoIndex = 0; protoIndex < srcRecords.length; protoIndex++) {
        let skipRecord = skipSources[protoIndex];
        if (isPresent(skipRecord)) {
            skipRecord.fixedArgs[0] = dstRecords.length;
        }
        let src = srcRecords[protoIndex];
        if (src.isSkipRecord()) {
            if (src.isConditionalSkipRecord() && src.fixedArgs[0] === protoIndex + 2 &&
                protoIndex < srcRecords.length - 1 &&
                srcRecords[protoIndex + 1].mode === RecordType.SkipRecords) {
                src.mode = src.mode === RecordType.SkipRecordsIf ? RecordType.SkipRecordsIfNot :
                    RecordType.SkipRecordsIf;
                src.fixedArgs[0] = srcRecords[protoIndex + 1].fixedArgs[0];
                protoIndex++;
            }
            if (src.fixedArgs[0] > protoIndex + 1) {
                let dst = _cloneAndUpdateIndexes(src, dstRecords, indexMap);
                dstRecords.push(dst);
                skipSources[dst.fixedArgs[0]] = dst;
            }
        }
        else {
            let dst = _cloneAndUpdateIndexes(src, dstRecords, indexMap);
            dstRecords.push(dst);
            indexMap.set(src.selfIndex, dst.selfIndex);
        }
    }
    return dstRecords;
}
/**
 * Add a new record or re-use one of the existing records.
 */
function _mayBeAddRecord(record, dstRecords, excludedIdxs, excluded) {
    let match = _findFirstMatch(record, dstRecords, excludedIdxs);
    if (isPresent(match)) {
        if (record.lastInBinding) {
            dstRecords.push(_createSelfRecord(record, match.selfIndex, dstRecords.length + 1));
            match.referencedBySelf = true;
        }
        else {
            if (record.argumentToPureFunction) {
                match.argumentToPureFunction = true;
            }
        }
        return match;
    }
    if (excluded) {
        excludedIdxs.push(record.selfIndex);
    }
    dstRecords.push(record);
    return record;
}
/**
 * Returns the first `ProtoRecord` that matches the record.
 */
function _findFirstMatch(record, dstRecords, excludedIdxs) {
    return dstRecords.find(
    // TODO(vicb): optimize excludedIdxs.indexOf (sorted array)
    rr => excludedIdxs.indexOf(rr.selfIndex) == -1 && rr.mode !== RecordType.DirectiveLifecycle &&
        _haveSameDirIndex(rr, record) && rr.mode === record.mode &&
        looseIdentical(rr.funcOrValue, record.funcOrValue) &&
        rr.contextIndex === record.contextIndex && looseIdentical(rr.name, record.name) &&
        ListWrapper.equals(rr.args, record.args));
}
/**
 * Clone the `ProtoRecord` and changes the indexes for the ones in the destination array for:
 * - the arguments,
 * - the context,
 * - self
 */
function _cloneAndUpdateIndexes(record, dstRecords, indexMap) {
    let args = record.args.map(src => _srcToDstSelfIndex(indexMap, src));
    let contextIndex = _srcToDstSelfIndex(indexMap, record.contextIndex);
    let selfIndex = dstRecords.length + 1;
    return new ProtoRecord(record.mode, record.name, record.funcOrValue, args, record.fixedArgs, contextIndex, record.directiveIndex, selfIndex, record.bindingRecord, record.lastInBinding, record.lastInDirective, record.argumentToPureFunction, record.referencedBySelf, record.propertyBindingIndex);
}
/**
 * Returns the index in the destination array corresponding to the index in the src array.
 * When the element is not present in the destination array, return the source index.
 */
function _srcToDstSelfIndex(indexMap, srcIdx) {
    var dstIdx = indexMap.get(srcIdx);
    return isPresent(dstIdx) ? dstIdx : srcIdx;
}
function _createSelfRecord(r, contextIndex, selfIndex) {
    return new ProtoRecord(RecordType.Self, "self", null, [], r.fixedArgs, contextIndex, r.directiveIndex, selfIndex, r.bindingRecord, r.lastInBinding, r.lastInDirective, false, false, r.propertyBindingIndex);
}
function _haveSameDirIndex(a, b) {
    var di1 = isBlank(a.directiveIndex) ? null : a.directiveIndex.directiveIndex;
    var ei1 = isBlank(a.directiveIndex) ? null : a.directiveIndex.elementIndex;
    var di2 = isBlank(b.directiveIndex) ? null : b.directiveIndex.directiveIndex;
    var ei2 = isBlank(b.directiveIndex) ? null : b.directiveIndex.elementIndex;
    return di1 === di2 && ei1 === ei2;
}
//# sourceMappingURL=coalesce.js.map