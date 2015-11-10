library angular2.src.core.change_detection.coalesce;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, looseIdentical;
import "package:angular2/src/facade/collection.dart" show ListWrapper, Map;
import "proto_record.dart" show RecordType, ProtoRecord;

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
List<ProtoRecord> coalesce(List<ProtoRecord> srcRecords) {
  var dstRecords = [];
  var excludedIdxs = [];
  Map<num, num> indexMap = new Map<num, num>();
  var skipDepth = 0;
  List<ProtoRecord> skipSources =
      ListWrapper.createFixedSize(srcRecords.length);
  for (var protoIndex = 0; protoIndex < srcRecords.length; protoIndex++) {
    var skipRecord = skipSources[protoIndex];
    if (isPresent(skipRecord)) {
      skipDepth--;
      skipRecord.fixedArgs[0] = dstRecords.length;
    }
    var src = srcRecords[protoIndex];
    var dst = _cloneAndUpdateIndexes(src, dstRecords, indexMap);
    if (dst.isSkipRecord()) {
      dstRecords.add(dst);
      skipDepth++;
      skipSources[dst.fixedArgs[0]] = dst;
    } else {
      var record =
          _mayBeAddRecord(dst, dstRecords, excludedIdxs, skipDepth > 0);
      indexMap[src.selfIndex] = record.selfIndex;
    }
  }
  return _optimizeSkips(dstRecords);
}

/**
 * - Conditional skip of 1 record followed by an unconditional skip of N are replaced by  a
 *   conditional skip of N with the negated condition,
 * - Skips of 0 records are removed
 */
List<ProtoRecord> _optimizeSkips(List<ProtoRecord> srcRecords) {
  var dstRecords = [];
  var skipSources = ListWrapper.createFixedSize(srcRecords.length);
  Map<num, num> indexMap = new Map<num, num>();
  for (var protoIndex = 0; protoIndex < srcRecords.length; protoIndex++) {
    var skipRecord = skipSources[protoIndex];
    if (isPresent(skipRecord)) {
      skipRecord.fixedArgs[0] = dstRecords.length;
    }
    var src = srcRecords[protoIndex];
    if (src.isSkipRecord()) {
      if (src.isConditionalSkipRecord() &&
          identical(src.fixedArgs[0], protoIndex + 2) &&
          protoIndex < srcRecords.length - 1 &&
          identical(srcRecords[protoIndex + 1].mode, RecordType.SkipRecords)) {
        src.mode = identical(src.mode, RecordType.SkipRecordsIf)
            ? RecordType.SkipRecordsIfNot
            : RecordType.SkipRecordsIf;
        src.fixedArgs[0] = srcRecords[protoIndex + 1].fixedArgs[0];
        protoIndex++;
      }
      if (src.fixedArgs[0] > protoIndex + 1) {
        var dst = _cloneAndUpdateIndexes(src, dstRecords, indexMap);
        dstRecords.add(dst);
        skipSources[dst.fixedArgs[0]] = dst;
      }
    } else {
      var dst = _cloneAndUpdateIndexes(src, dstRecords, indexMap);
      dstRecords.add(dst);
      indexMap[src.selfIndex] = dst.selfIndex;
    }
  }
  return dstRecords;
}

/**
 * Add a new record or re-use one of the existing records.
 */
ProtoRecord _mayBeAddRecord(ProtoRecord record, List<ProtoRecord> dstRecords,
    List<num> excludedIdxs, bool excluded) {
  var match = _findFirstMatch(record, dstRecords, excludedIdxs);
  if (isPresent(match)) {
    if (record.lastInBinding) {
      dstRecords.add(
          _createSelfRecord(record, match.selfIndex, dstRecords.length + 1));
      match.referencedBySelf = true;
    } else {
      if (record.argumentToPureFunction) {
        match.argumentToPureFunction = true;
      }
    }
    return match;
  }
  if (excluded) {
    excludedIdxs.add(record.selfIndex);
  }
  dstRecords.add(record);
  return record;
}

/**
 * Returns the first `ProtoRecord` that matches the record.
 */
ProtoRecord _findFirstMatch(
    ProtoRecord record, List<ProtoRecord> dstRecords, List<num> excludedIdxs) {
  return dstRecords.firstWhere(
      // TODO(vicb): optimize excludedIdxs.indexOf (sorted array)
      (rr) => excludedIdxs.indexOf(rr.selfIndex) == -1 &&
          !identical(rr.mode, RecordType.DirectiveLifecycle) &&
          _haveSameDirIndex(rr, record) &&
          identical(rr.mode, record.mode) &&
          looseIdentical(rr.funcOrValue, record.funcOrValue) &&
          identical(rr.contextIndex, record.contextIndex) &&
          looseIdentical(rr.name, record.name) &&
          ListWrapper.equals(rr.args, record.args),
      orElse: () => null);
}

/**
 * Clone the `ProtoRecord` and changes the indexes for the ones in the destination array for:
 * - the arguments,
 * - the context,
 * - self
 */
ProtoRecord _cloneAndUpdateIndexes(
    ProtoRecord record, List<ProtoRecord> dstRecords, Map<num, num> indexMap) {
  var args =
      record.args.map((src) => _srcToDstSelfIndex(indexMap, src)).toList();
  var contextIndex = _srcToDstSelfIndex(indexMap, record.contextIndex);
  var selfIndex = dstRecords.length + 1;
  return new ProtoRecord(
      record.mode,
      record.name,
      record.funcOrValue,
      args,
      record.fixedArgs,
      contextIndex,
      record.directiveIndex,
      selfIndex,
      record.bindingRecord,
      record.lastInBinding,
      record.lastInDirective,
      record.argumentToPureFunction,
      record.referencedBySelf,
      record.propertyBindingIndex);
}

/**
 * Returns the index in the destination array corresponding to the index in the src array.
 * When the element is not present in the destination array, return the source index.
 */
num _srcToDstSelfIndex(Map<num, num> indexMap, num srcIdx) {
  var dstIdx = indexMap[srcIdx];
  return isPresent(dstIdx) ? dstIdx : srcIdx;
}

ProtoRecord _createSelfRecord(ProtoRecord r, num contextIndex, num selfIndex) {
  return new ProtoRecord(
      RecordType.Self,
      "self",
      null,
      [],
      r.fixedArgs,
      contextIndex,
      r.directiveIndex,
      selfIndex,
      r.bindingRecord,
      r.lastInBinding,
      r.lastInDirective,
      false,
      false,
      r.propertyBindingIndex);
}

bool _haveSameDirIndex(ProtoRecord a, ProtoRecord b) {
  var di1 = isBlank(a.directiveIndex) ? null : a.directiveIndex.directiveIndex;
  var ei1 = isBlank(a.directiveIndex) ? null : a.directiveIndex.elementIndex;
  var di2 = isBlank(b.directiveIndex) ? null : b.directiveIndex.directiveIndex;
  var ei2 = isBlank(b.directiveIndex) ? null : b.directiveIndex.elementIndex;
  return identical(di1, di2) && identical(ei1, ei2);
}
