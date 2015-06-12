import {isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';
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
export function coalesce(records: List<ProtoRecord>): List<ProtoRecord> {
  var res = ListWrapper.create();
  var indexMap = MapWrapper.create();

  for (var i = 0; i < records.length; ++i) {
    var r = records[i];
    var record = _replaceIndices(r, res.length + 1, indexMap);
    var matchingRecord = _findMatching(record, res);

    if (isPresent(matchingRecord) && record.lastInBinding) {
      ListWrapper.push(res, _selfRecord(record, matchingRecord.selfIndex, res.length + 1));
      MapWrapper.set(indexMap, r.selfIndex, matchingRecord.selfIndex);

    } else if (isPresent(matchingRecord) && !record.lastInBinding) {
      MapWrapper.set(indexMap, r.selfIndex, matchingRecord.selfIndex);

    } else {
      ListWrapper.push(res, record);
      MapWrapper.set(indexMap, r.selfIndex, record.selfIndex);
    }
  }

  return res;
}

function _selfRecord(r: ProtoRecord, contextIndex: number, selfIndex: number): ProtoRecord {
  return new ProtoRecord(RecordType.SELF, "self", null, [], r.fixedArgs, contextIndex,
                         r.directiveIndex, selfIndex, r.bindingRecord, r.expressionAsString,
                         r.lastInBinding, r.lastInDirective);
}

function _findMatching(r: ProtoRecord, rs: List<ProtoRecord>) {
  return ListWrapper.find(rs, (rr) => rr.mode !== RecordType.DIRECTIVE_LIFECYCLE &&
                                      rr.mode === r.mode && rr.funcOrValue === r.funcOrValue &&
                                      rr.contextIndex === r.contextIndex &&
                                      ListWrapper.equals(rr.args, r.args));
}

function _replaceIndices(r: ProtoRecord, selfIndex: number, indexMap: Map<any, any>) {
  var args = ListWrapper.map(r.args, (a) => _map(indexMap, a));
  var contextIndex = _map(indexMap, r.contextIndex);
  return new ProtoRecord(r.mode, r.name, r.funcOrValue, args, r.fixedArgs, contextIndex,
                         r.directiveIndex, selfIndex, r.bindingRecord, r.expressionAsString,
                         r.lastInBinding, r.lastInDirective);
}

function _map(indexMap: Map<any, any>, value: number) {
  var r = MapWrapper.get(indexMap, value);
  return isPresent(r) ? r : value;
}
