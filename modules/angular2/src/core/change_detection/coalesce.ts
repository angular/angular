import {isPresent, isBlank, looseIdentical} from 'angular2/src/core/facade/lang';
import {ListWrapper, Map} from 'angular2/src/core/facade/collection';
import {RecordType, ProtoRecord} from './proto_record';

/**
 * Removes "duplicate" records. It assuming that record evaluation does not
 * have side-effects.
 *
 * Records that are not last in bindings are removed and all the indices
 * of the records that depend on them are updated.
 *
 * Records that are last in bindings CANNOT be removed, and instead are
 * replaced with very cheap SELF records.
 */
export function coalesce(records: ProtoRecord[]): ProtoRecord[] {
  var res: ProtoRecord[] = [];
  var indexMap: Map<number, number> = new Map<number, number>();

  for (var i = 0; i < records.length; ++i) {
    var r = records[i];
    var record = _replaceIndices(r, res.length + 1, indexMap);
    var matchingRecord = _findMatching(record, res);

    if (isPresent(matchingRecord) && record.lastInBinding) {
      res.push(_selfRecord(record, matchingRecord.selfIndex, res.length + 1));
      indexMap.set(r.selfIndex, matchingRecord.selfIndex);
      matchingRecord.referencedBySelf = true;

    } else if (isPresent(matchingRecord) && !record.lastInBinding) {
      if (record.argumentToPureFunction) {
        matchingRecord.argumentToPureFunction = true;
      }

      indexMap.set(r.selfIndex, matchingRecord.selfIndex);

    } else {
      res.push(record);
      indexMap.set(r.selfIndex, record.selfIndex);
    }
  }

  return res;
}

function _selfRecord(r: ProtoRecord, contextIndex: number, selfIndex: number): ProtoRecord {
  return new ProtoRecord(RecordType.Self, "self", null, [], r.fixedArgs, contextIndex,
                         r.directiveIndex, selfIndex, r.bindingRecord, r.lastInBinding,
                         r.lastInDirective, false, false, r.propertyBindingIndex);
}

function _findMatching(r: ProtoRecord, rs: ProtoRecord[]) {
  return ListWrapper.find(
      rs, (rr) => rr.mode !== RecordType.DirectiveLifecycle && _sameDirIndex(rr, r) &&
                  rr.mode === r.mode && looseIdentical(rr.funcOrValue, r.funcOrValue) &&
                  rr.contextIndex === r.contextIndex && looseIdentical(rr.name, r.name) &&
                  ListWrapper.equals(rr.args, r.args));
}

function _sameDirIndex(a: ProtoRecord, b: ProtoRecord): boolean {
  var di1 = isBlank(a.directiveIndex) ? null : a.directiveIndex.directiveIndex;
  var ei1 = isBlank(a.directiveIndex) ? null : a.directiveIndex.elementIndex;

  var di2 = isBlank(b.directiveIndex) ? null : b.directiveIndex.directiveIndex;
  var ei2 = isBlank(b.directiveIndex) ? null : b.directiveIndex.elementIndex;

  return di1 === di2 && ei1 === ei2;
}

function _replaceIndices(r: ProtoRecord, selfIndex: number, indexMap: Map<any, any>) {
  var args = r.args.map(a => _map(indexMap, a));
  var contextIndex = _map(indexMap, r.contextIndex);
  return new ProtoRecord(r.mode, r.name, r.funcOrValue, args, r.fixedArgs, contextIndex,
                         r.directiveIndex, selfIndex, r.bindingRecord, r.lastInBinding,
                         r.lastInDirective, r.argumentToPureFunction, r.referencedBySelf,
                         r.propertyBindingIndex);
}

function _map(indexMap: Map<any, any>, value: number) {
  var r = indexMap.get(value);
  return isPresent(r) ? r : value;
}
