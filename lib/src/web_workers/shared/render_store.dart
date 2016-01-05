library angular2.src.web_workers.shared.render_store;

import "package:angular2/src/core/di.dart" show Injectable;

@Injectable()
class RenderStore {
  num _nextIndex = 0;
  Map<num, dynamic> _lookupById;
  Map<dynamic, num> _lookupByObject;
  RenderStore() {
    this._lookupById = new Map<num, dynamic>();
    this._lookupByObject = new Map<dynamic, num>();
  }
  num allocateId() {
    return this._nextIndex++;
  }

  void store(dynamic obj, num id) {
    this._lookupById[id] = obj;
    this._lookupByObject[obj] = id;
  }

  void remove(dynamic obj) {
    var index = this._lookupByObject[obj];
    (this._lookupByObject.containsKey(obj) &&
        (this._lookupByObject.remove(obj) != null || true));
    (this._lookupById.containsKey(index) &&
        (this._lookupById.remove(index) != null || true));
  }

  dynamic deserialize(num id) {
    if (id == null) {
      return null;
    }
    if (!this._lookupById.containsKey(id)) {
      return null;
    }
    return this._lookupById[id];
  }

  num serialize(dynamic obj) {
    if (obj == null) {
      return null;
    }
    return this._lookupByObject[obj];
  }
}
