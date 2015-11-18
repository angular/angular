'use strict';var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var proto_record_1 = require('./proto_record');
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
function coalesce(srcRecords) {
    var dstRecords = [];
    var excludedIdxs = [];
    var indexMap = new collection_1.Map();
    var skipDepth = 0;
    var skipSources = collection_1.ListWrapper.createFixedSize(srcRecords.length);
    for (var protoIndex = 0; protoIndex < srcRecords.length; protoIndex++) {
        var skipRecord = skipSources[protoIndex];
        if (lang_1.isPresent(skipRecord)) {
            skipDepth--;
            skipRecord.fixedArgs[0] = dstRecords.length;
        }
        var src = srcRecords[protoIndex];
        var dst = _cloneAndUpdateIndexes(src, dstRecords, indexMap);
        if (dst.isSkipRecord()) {
            dstRecords.push(dst);
            skipDepth++;
            skipSources[dst.fixedArgs[0]] = dst;
        }
        else {
            var record = _mayBeAddRecord(dst, dstRecords, excludedIdxs, skipDepth > 0);
            indexMap.set(src.selfIndex, record.selfIndex);
        }
    }
    return _optimizeSkips(dstRecords);
}
exports.coalesce = coalesce;
/**
 * - Conditional skip of 1 record followed by an unconditional skip of N are replaced by  a
 *   conditional skip of N with the negated condition,
 * - Skips of 0 records are removed
 */
function _optimizeSkips(srcRecords) {
    var dstRecords = [];
    var skipSources = collection_1.ListWrapper.createFixedSize(srcRecords.length);
    var indexMap = new collection_1.Map();
    for (var protoIndex = 0; protoIndex < srcRecords.length; protoIndex++) {
        var skipRecord = skipSources[protoIndex];
        if (lang_1.isPresent(skipRecord)) {
            skipRecord.fixedArgs[0] = dstRecords.length;
        }
        var src = srcRecords[protoIndex];
        if (src.isSkipRecord()) {
            if (src.isConditionalSkipRecord() && src.fixedArgs[0] === protoIndex + 2 &&
                protoIndex < srcRecords.length - 1 &&
                srcRecords[protoIndex + 1].mode === proto_record_1.RecordType.SkipRecords) {
                src.mode = src.mode === proto_record_1.RecordType.SkipRecordsIf ? proto_record_1.RecordType.SkipRecordsIfNot :
                    proto_record_1.RecordType.SkipRecordsIf;
                src.fixedArgs[0] = srcRecords[protoIndex + 1].fixedArgs[0];
                protoIndex++;
            }
            if (src.fixedArgs[0] > protoIndex + 1) {
                var dst = _cloneAndUpdateIndexes(src, dstRecords, indexMap);
                dstRecords.push(dst);
                skipSources[dst.fixedArgs[0]] = dst;
            }
        }
        else {
            var dst = _cloneAndUpdateIndexes(src, dstRecords, indexMap);
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
    var match = _findFirstMatch(record, dstRecords, excludedIdxs);
    if (lang_1.isPresent(match)) {
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
    function (rr) { return excludedIdxs.indexOf(rr.selfIndex) == -1 && rr.mode !== proto_record_1.RecordType.DirectiveLifecycle &&
        _haveSameDirIndex(rr, record) && rr.mode === record.mode &&
        lang_1.looseIdentical(rr.funcOrValue, record.funcOrValue) &&
        rr.contextIndex === record.contextIndex && lang_1.looseIdentical(rr.name, record.name) &&
        collection_1.ListWrapper.equals(rr.args, record.args); });
}
/**
 * Clone the `ProtoRecord` and changes the indexes for the ones in the destination array for:
 * - the arguments,
 * - the context,
 * - self
 */
function _cloneAndUpdateIndexes(record, dstRecords, indexMap) {
    var args = record.args.map(function (src) { return _srcToDstSelfIndex(indexMap, src); });
    var contextIndex = _srcToDstSelfIndex(indexMap, record.contextIndex);
    var selfIndex = dstRecords.length + 1;
    return new proto_record_1.ProtoRecord(record.mode, record.name, record.funcOrValue, args, record.fixedArgs, contextIndex, record.directiveIndex, selfIndex, record.bindingRecord, record.lastInBinding, record.lastInDirective, record.argumentToPureFunction, record.referencedBySelf, record.propertyBindingIndex);
}
/**
 * Returns the index in the destination array corresponding to the index in the src array.
 * When the element is not present in the destination array, return the source index.
 */
function _srcToDstSelfIndex(indexMap, srcIdx) {
    var dstIdx = indexMap.get(srcIdx);
    return lang_1.isPresent(dstIdx) ? dstIdx : srcIdx;
}
function _createSelfRecord(r, contextIndex, selfIndex) {
    return new proto_record_1.ProtoRecord(proto_record_1.RecordType.Self, "self", null, [], r.fixedArgs, contextIndex, r.directiveIndex, selfIndex, r.bindingRecord, r.lastInBinding, r.lastInDirective, false, false, r.propertyBindingIndex);
}
function _haveSameDirIndex(a, b) {
    var di1 = lang_1.isBlank(a.directiveIndex) ? null : a.directiveIndex.directiveIndex;
    var ei1 = lang_1.isBlank(a.directiveIndex) ? null : a.directiveIndex.elementIndex;
    var di2 = lang_1.isBlank(b.directiveIndex) ? null : b.directiveIndex.directiveIndex;
    var ei2 = lang_1.isBlank(b.directiveIndex) ? null : b.directiveIndex.elementIndex;
    return di1 === di2 && ei1 === ei2;
}
//# sourceMappingURL=coalesce.js.map