'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
/* @ts2dart_const */
var DefaultKeyValueDifferFactory = (function () {
    function DefaultKeyValueDifferFactory() {
    }
    DefaultKeyValueDifferFactory.prototype.supports = function (obj) { return obj instanceof Map || lang_1.isJsObject(obj); };
    DefaultKeyValueDifferFactory.prototype.create = function (cdRef) { return new DefaultKeyValueDiffer(); };
    return DefaultKeyValueDifferFactory;
}());
exports.DefaultKeyValueDifferFactory = DefaultKeyValueDifferFactory;
var DefaultKeyValueDiffer = (function () {
    function DefaultKeyValueDiffer() {
        this._records = new Map();
        this._mapHead = null;
        this._previousMapHead = null;
        this._changesHead = null;
        this._changesTail = null;
        this._additionsHead = null;
        this._additionsTail = null;
        this._removalsHead = null;
        this._removalsTail = null;
    }
    Object.defineProperty(DefaultKeyValueDiffer.prototype, "isDirty", {
        get: function () {
            return this._additionsHead !== null || this._changesHead !== null ||
                this._removalsHead !== null;
        },
        enumerable: true,
        configurable: true
    });
    DefaultKeyValueDiffer.prototype.forEachItem = function (fn) {
        var record;
        for (record = this._mapHead; record !== null; record = record._next) {
            fn(record);
        }
    };
    DefaultKeyValueDiffer.prototype.forEachPreviousItem = function (fn) {
        var record;
        for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
            fn(record);
        }
    };
    DefaultKeyValueDiffer.prototype.forEachChangedItem = function (fn) {
        var record;
        for (record = this._changesHead; record !== null; record = record._nextChanged) {
            fn(record);
        }
    };
    DefaultKeyValueDiffer.prototype.forEachAddedItem = function (fn) {
        var record;
        for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            fn(record);
        }
    };
    DefaultKeyValueDiffer.prototype.forEachRemovedItem = function (fn) {
        var record;
        for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            fn(record);
        }
    };
    DefaultKeyValueDiffer.prototype.diff = function (map) {
        if (lang_1.isBlank(map))
            map = collection_1.MapWrapper.createFromPairs([]);
        if (!(map instanceof Map || lang_1.isJsObject(map))) {
            throw new exceptions_1.BaseException("Error trying to diff '" + map + "'");
        }
        if (this.check(map)) {
            return this;
        }
        else {
            return null;
        }
    };
    DefaultKeyValueDiffer.prototype.onDestroy = function () { };
    DefaultKeyValueDiffer.prototype.check = function (map) {
        var _this = this;
        this._reset();
        var records = this._records;
        var oldSeqRecord = this._mapHead;
        var lastOldSeqRecord = null;
        var lastNewSeqRecord = null;
        var seqChanged = false;
        this._forEach(map, function (value, key) {
            var newSeqRecord;
            if (oldSeqRecord !== null && key === oldSeqRecord.key) {
                newSeqRecord = oldSeqRecord;
                if (!lang_1.looseIdentical(value, oldSeqRecord.currentValue)) {
                    oldSeqRecord.previousValue = oldSeqRecord.currentValue;
                    oldSeqRecord.currentValue = value;
                    _this._addToChanges(oldSeqRecord);
                }
            }
            else {
                seqChanged = true;
                if (oldSeqRecord !== null) {
                    oldSeqRecord._next = null;
                    _this._removeFromSeq(lastOldSeqRecord, oldSeqRecord);
                    _this._addToRemovals(oldSeqRecord);
                }
                if (records.has(key)) {
                    newSeqRecord = records.get(key);
                }
                else {
                    newSeqRecord = new KeyValueChangeRecord(key);
                    records.set(key, newSeqRecord);
                    newSeqRecord.currentValue = value;
                    _this._addToAdditions(newSeqRecord);
                }
            }
            if (seqChanged) {
                if (_this._isInRemovals(newSeqRecord)) {
                    _this._removeFromRemovals(newSeqRecord);
                }
                if (lastNewSeqRecord == null) {
                    _this._mapHead = newSeqRecord;
                }
                else {
                    lastNewSeqRecord._next = newSeqRecord;
                }
            }
            lastOldSeqRecord = oldSeqRecord;
            lastNewSeqRecord = newSeqRecord;
            oldSeqRecord = oldSeqRecord === null ? null : oldSeqRecord._next;
        });
        this._truncate(lastOldSeqRecord, oldSeqRecord);
        return this.isDirty;
    };
    /** @internal */
    DefaultKeyValueDiffer.prototype._reset = function () {
        if (this.isDirty) {
            var record;
            // Record the state of the mapping
            for (record = this._previousMapHead = this._mapHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
            }
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
                record.previousValue = record.currentValue;
            }
            for (record = this._additionsHead; record != null; record = record._nextAdded) {
                record.previousValue = record.currentValue;
            }
            // todo(vicb) once assert is supported
            // assert(() {
            //  var r = _changesHead;
            //  while (r != null) {
            //    var nextRecord = r._nextChanged;
            //    r._nextChanged = null;
            //    r = nextRecord;
            //  }
            //
            //  r = _additionsHead;
            //  while (r != null) {
            //    var nextRecord = r._nextAdded;
            //    r._nextAdded = null;
            //    r = nextRecord;
            //  }
            //
            //  r = _removalsHead;
            //  while (r != null) {
            //    var nextRecord = r._nextRemoved;
            //    r._nextRemoved = null;
            //    r = nextRecord;
            //  }
            //
            //  return true;
            //});
            this._changesHead = this._changesTail = null;
            this._additionsHead = this._additionsTail = null;
            this._removalsHead = this._removalsTail = null;
        }
    };
    /** @internal */
    DefaultKeyValueDiffer.prototype._truncate = function (lastRecord, record) {
        while (record !== null) {
            if (lastRecord === null) {
                this._mapHead = null;
            }
            else {
                lastRecord._next = null;
            }
            var nextRecord = record._next;
            // todo(vicb) assert
            // assert((() {
            //  record._next = null;
            //  return true;
            //}));
            this._addToRemovals(record);
            lastRecord = record;
            record = nextRecord;
        }
        for (var rec = this._removalsHead; rec !== null; rec = rec._nextRemoved) {
            rec.previousValue = rec.currentValue;
            rec.currentValue = null;
            this._records.delete(rec.key);
        }
    };
    /** @internal */
    DefaultKeyValueDiffer.prototype._isInRemovals = function (record) {
        return record === this._removalsHead || record._nextRemoved !== null ||
            record._prevRemoved !== null;
    };
    /** @internal */
    DefaultKeyValueDiffer.prototype._addToRemovals = function (record) {
        // todo(vicb) assert
        // assert(record._next == null);
        // assert(record._nextAdded == null);
        // assert(record._nextChanged == null);
        // assert(record._nextRemoved == null);
        // assert(record._prevRemoved == null);
        if (this._removalsHead === null) {
            this._removalsHead = this._removalsTail = record;
        }
        else {
            this._removalsTail._nextRemoved = record;
            record._prevRemoved = this._removalsTail;
            this._removalsTail = record;
        }
    };
    /** @internal */
    DefaultKeyValueDiffer.prototype._removeFromSeq = function (prev, record) {
        var next = record._next;
        if (prev === null) {
            this._mapHead = next;
        }
        else {
            prev._next = next;
        }
        // todo(vicb) assert
        // assert((() {
        //  record._next = null;
        //  return true;
        //})());
    };
    /** @internal */
    DefaultKeyValueDiffer.prototype._removeFromRemovals = function (record) {
        // todo(vicb) assert
        // assert(record._next == null);
        // assert(record._nextAdded == null);
        // assert(record._nextChanged == null);
        var prev = record._prevRemoved;
        var next = record._nextRemoved;
        if (prev === null) {
            this._removalsHead = next;
        }
        else {
            prev._nextRemoved = next;
        }
        if (next === null) {
            this._removalsTail = prev;
        }
        else {
            next._prevRemoved = prev;
        }
        record._prevRemoved = record._nextRemoved = null;
    };
    /** @internal */
    DefaultKeyValueDiffer.prototype._addToAdditions = function (record) {
        // todo(vicb): assert
        // assert(record._next == null);
        // assert(record._nextAdded == null);
        // assert(record._nextChanged == null);
        // assert(record._nextRemoved == null);
        // assert(record._prevRemoved == null);
        if (this._additionsHead === null) {
            this._additionsHead = this._additionsTail = record;
        }
        else {
            this._additionsTail._nextAdded = record;
            this._additionsTail = record;
        }
    };
    /** @internal */
    DefaultKeyValueDiffer.prototype._addToChanges = function (record) {
        // todo(vicb) assert
        // assert(record._nextAdded == null);
        // assert(record._nextChanged == null);
        // assert(record._nextRemoved == null);
        // assert(record._prevRemoved == null);
        if (this._changesHead === null) {
            this._changesHead = this._changesTail = record;
        }
        else {
            this._changesTail._nextChanged = record;
            this._changesTail = record;
        }
    };
    DefaultKeyValueDiffer.prototype.toString = function () {
        var items = [];
        var previous = [];
        var changes = [];
        var additions = [];
        var removals = [];
        var record;
        for (record = this._mapHead; record !== null; record = record._next) {
            items.push(lang_1.stringify(record));
        }
        for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
            previous.push(lang_1.stringify(record));
        }
        for (record = this._changesHead; record !== null; record = record._nextChanged) {
            changes.push(lang_1.stringify(record));
        }
        for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            additions.push(lang_1.stringify(record));
        }
        for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            removals.push(lang_1.stringify(record));
        }
        return "map: " + items.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
            "additions: " + additions.join(', ') + "\n" + "changes: " + changes.join(', ') + "\n" +
            "removals: " + removals.join(', ') + "\n";
    };
    /** @internal */
    DefaultKeyValueDiffer.prototype._forEach = function (obj, fn) {
        if (obj instanceof Map) {
            obj.forEach(fn);
        }
        else {
            collection_1.StringMapWrapper.forEach(obj, fn);
        }
    };
    return DefaultKeyValueDiffer;
}());
exports.DefaultKeyValueDiffer = DefaultKeyValueDiffer;
var KeyValueChangeRecord = (function () {
    function KeyValueChangeRecord(key) {
        this.key = key;
        this.previousValue = null;
        this.currentValue = null;
        /** @internal */
        this._nextPrevious = null;
        /** @internal */
        this._next = null;
        /** @internal */
        this._nextAdded = null;
        /** @internal */
        this._nextRemoved = null;
        /** @internal */
        this._prevRemoved = null;
        /** @internal */
        this._nextChanged = null;
    }
    KeyValueChangeRecord.prototype.toString = function () {
        return lang_1.looseIdentical(this.previousValue, this.currentValue) ?
            lang_1.stringify(this.key) :
            (lang_1.stringify(this.key) + '[' + lang_1.stringify(this.previousValue) + '->' +
                lang_1.stringify(this.currentValue) + ']');
    };
    return KeyValueChangeRecord;
}());
exports.KeyValueChangeRecord = KeyValueChangeRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdF9rZXl2YWx1ZV9kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2RpZmZlcnMvZGVmYXVsdF9rZXl2YWx1ZV9kaWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDJCQUEyQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzVFLHFCQUE2RCwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3hGLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBSTdELG9CQUFvQjtBQUNwQjtJQUNFO0lBQWUsQ0FBQztJQUNoQiwrQ0FBUSxHQUFSLFVBQVMsR0FBUSxJQUFhLE1BQU0sQ0FBQyxHQUFHLFlBQVksR0FBRyxJQUFJLGlCQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdFLDZDQUFNLEdBQU4sVUFBTyxLQUF3QixJQUFvQixNQUFNLENBQUMsSUFBSSxxQkFBcUIsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxRixtQ0FBQztBQUFELENBQUMsQUFMRCxJQUtDO0FBTFksb0NBQTRCLCtCQUt4QyxDQUFBO0FBRUQ7SUFBQTtRQUNVLGFBQVEsR0FBa0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNwQyxhQUFRLEdBQXlCLElBQUksQ0FBQztRQUN0QyxxQkFBZ0IsR0FBeUIsSUFBSSxDQUFDO1FBQzlDLGlCQUFZLEdBQXlCLElBQUksQ0FBQztRQUMxQyxpQkFBWSxHQUF5QixJQUFJLENBQUM7UUFDMUMsbUJBQWMsR0FBeUIsSUFBSSxDQUFDO1FBQzVDLG1CQUFjLEdBQXlCLElBQUksQ0FBQztRQUM1QyxrQkFBYSxHQUF5QixJQUFJLENBQUM7UUFDM0Msa0JBQWEsR0FBeUIsSUFBSSxDQUFDO0lBdVRyRCxDQUFDO0lBclRDLHNCQUFJLDBDQUFPO2FBQVg7WUFDRSxNQUFNLENBQUMsSUFBSSxD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cFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge3N0cmluZ2lmeSwgbG9vc2VJZGVudGljYWwsIGlzSnNPYmplY3QsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7S2V5VmFsdWVEaWZmZXIsIEtleVZhbHVlRGlmZmVyRmFjdG9yeX0gZnJvbSAnLi4vZGlmZmVycy9rZXl2YWx1ZV9kaWZmZXJzJztcblxuLyogQHRzMmRhcnRfY29uc3QgKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0S2V5VmFsdWVEaWZmZXJGYWN0b3J5IGltcGxlbWVudHMgS2V5VmFsdWVEaWZmZXJGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoKSB7fVxuICBzdXBwb3J0cyhvYmo6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gb2JqIGluc3RhbmNlb2YgTWFwIHx8IGlzSnNPYmplY3Qob2JqKTsgfVxuXG4gIGNyZWF0ZShjZFJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpOiBLZXlWYWx1ZURpZmZlciB7IHJldHVybiBuZXcgRGVmYXVsdEtleVZhbHVlRGlmZmVyKCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRLZXlWYWx1ZURpZmZlciBpbXBsZW1lbnRzIEtleVZhbHVlRGlmZmVyIHtcbiAgcHJpdmF0ZSBfcmVjb3JkczogTWFwPGFueSwgYW55PiA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBfbWFwSGVhZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9wcmV2aW91c01hcEhlYWQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfY2hhbmdlc0hlYWQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfY2hhbmdlc1RhaWw6IEtleVZhbHVlQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfYWRkaXRpb25zSGVhZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9hZGRpdGlvbnNUYWlsOiBLZXlWYWx1ZUNoYW5nZVJlY29yZCA9IG51bGw7XG4gIHByaXZhdGUgX3JlbW92YWxzSGVhZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9yZW1vdmFsc1RhaWw6IEtleVZhbHVlQ2hhbmdlUmVjb3JkID0gbnVsbDtcblxuICBnZXQgaXNEaXJ0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYWRkaXRpb25zSGVhZCAhPT0gbnVsbCB8fCB0aGlzLl9jaGFuZ2VzSGVhZCAhPT0gbnVsbCB8fFxuICAgICAgICAgICB0aGlzLl9yZW1vdmFsc0hlYWQgIT09IG51bGw7XG4gIH1cblxuICBmb3JFYWNoSXRlbShmbjogRnVuY3Rpb24pIHtcbiAgICB2YXIgcmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX21hcEhlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0KSB7XG4gICAgICBmbihyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIGZvckVhY2hQcmV2aW91c0l0ZW0oZm46IEZ1bmN0aW9uKSB7XG4gICAgdmFyIHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQ7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9wcmV2aW91c01hcEhlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0UHJldmlvdXMpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaENoYW5nZWRJdGVtKGZuOiBGdW5jdGlvbikge1xuICAgIHZhciByZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fY2hhbmdlc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0Q2hhbmdlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoQWRkZWRJdGVtKGZuOiBGdW5jdGlvbikge1xuICAgIHZhciByZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fYWRkaXRpb25zSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRBZGRlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoUmVtb3ZlZEl0ZW0oZm46IEZ1bmN0aW9uKSB7XG4gICAgdmFyIHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQ7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9yZW1vdmFsc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0UmVtb3ZlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBkaWZmKG1hcDogTWFwPGFueSwgYW55Pik6IGFueSB7XG4gICAgaWYgKGlzQmxhbmsobWFwKSkgbWFwID0gTWFwV3JhcHBlci5jcmVhdGVGcm9tUGFpcnMoW10pO1xuICAgIGlmICghKG1hcCBpbnN0YW5jZW9mIE1hcCB8fCBpc0pzT2JqZWN0KG1hcCkpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgRXJyb3IgdHJ5aW5nIHRvIGRpZmYgJyR7bWFwfSdgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGVjayhtYXApKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgb25EZXN0cm95KCkge31cblxuICBjaGVjayhtYXA6IE1hcDxhbnksIGFueT4pOiBib29sZWFuIHtcbiAgICB0aGlzLl9yZXNldCgpO1xuICAgIHZhciByZWNvcmRzID0gdGhpcy5fcmVjb3JkcztcbiAgICB2YXIgb2xkU2VxUmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZCA9IHRoaXMuX21hcEhlYWQ7XG4gICAgdmFyIGxhc3RPbGRTZXFSZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgICB2YXIgbGFzdE5ld1NlcVJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAgIHZhciBzZXFDaGFuZ2VkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICB0aGlzLl9mb3JFYWNoKG1hcCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIHZhciBuZXdTZXFSZWNvcmQ7XG4gICAgICBpZiAob2xkU2VxUmVjb3JkICE9PSBudWxsICYmIGtleSA9PT0gb2xkU2VxUmVjb3JkLmtleSkge1xuICAgICAgICBuZXdTZXFSZWNvcmQgPSBvbGRTZXFSZWNvcmQ7XG4gICAgICAgIGlmICghbG9vc2VJZGVudGljYWwodmFsdWUsIG9sZFNlcVJlY29yZC5jdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgb2xkU2VxUmVjb3JkLnByZXZpb3VzVmFsdWUgPSBvbGRTZXFSZWNvcmQuY3VycmVudFZhbHVlO1xuICAgICAgICAgIG9sZFNlcVJlY29yZC5jdXJyZW50VmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICB0aGlzLl9hZGRUb0NoYW5nZXMob2xkU2VxUmVjb3JkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VxQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIGlmIChvbGRTZXFSZWNvcmQgIT09IG51bGwpIHtcbiAgICAgICAgICBvbGRTZXFSZWNvcmQuX25leHQgPSBudWxsO1xuICAgICAgICAgIHRoaXMuX3JlbW92ZUZyb21TZXEobGFzdE9sZFNlcVJlY29yZCwgb2xkU2VxUmVjb3JkKTtcbiAgICAgICAgICB0aGlzLl9hZGRUb1JlbW92YWxzKG9sZFNlcVJlY29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlY29yZHMuaGFzKGtleSkpIHtcbiAgICAgICAgICBuZXdTZXFSZWNvcmQgPSByZWNvcmRzLmdldChrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld1NlcVJlY29yZCA9IG5ldyBLZXlWYWx1ZUNoYW5nZVJlY29yZChrZXkpO1xuICAgICAgICAgIHJlY29yZHMuc2V0KGtleSwgbmV3U2VxUmVjb3JkKTtcbiAgICAgICAgICBuZXdTZXFSZWNvcmQuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgdGhpcy5fYWRkVG9BZGRpdGlvbnMobmV3U2VxUmVjb3JkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc2VxQ2hhbmdlZCkge1xuICAgICAgICBpZiAodGhpcy5faXNJblJlbW92YWxzKG5ld1NlcVJlY29yZCkpIHtcbiAgICAgICAgICB0aGlzLl9yZW1vdmVGcm9tUmVtb3ZhbHMobmV3U2VxUmVjb3JkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGFzdE5ld1NlcVJlY29yZCA9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fbWFwSGVhZCA9IG5ld1NlcVJlY29yZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsYXN0TmV3U2VxUmVjb3JkLl9uZXh0ID0gbmV3U2VxUmVjb3JkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsYXN0T2xkU2VxUmVjb3JkID0gb2xkU2VxUmVjb3JkO1xuICAgICAgbGFzdE5ld1NlcVJlY29yZCA9IG5ld1NlcVJlY29yZDtcbiAgICAgIG9sZFNlcVJlY29yZCA9IG9sZFNlcVJlY29yZCA9PT0gbnVsbCA/IG51bGwgOiBvbGRTZXFSZWNvcmQuX25leHQ7XG4gICAgfSk7XG4gICAgdGhpcy5fdHJ1bmNhdGUobGFzdE9sZFNlcVJlY29yZCwgb2xkU2VxUmVjb3JkKTtcbiAgICByZXR1cm4gdGhpcy5pc0RpcnR5O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVzZXQoKSB7XG4gICAgaWYgKHRoaXMuaXNEaXJ0eSkge1xuICAgICAgdmFyIHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQ7XG4gICAgICAvLyBSZWNvcmQgdGhlIHN0YXRlIG9mIHRoZSBtYXBwaW5nXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX3ByZXZpb3VzTWFwSGVhZCA9IHRoaXMuX21hcEhlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0KSB7XG4gICAgICAgIHJlY29yZC5fbmV4dFByZXZpb3VzID0gcmVjb3JkLl9uZXh0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2NoYW5nZXNIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dENoYW5nZWQpIHtcbiAgICAgICAgcmVjb3JkLnByZXZpb3VzVmFsdWUgPSByZWNvcmQuY3VycmVudFZhbHVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQ7IHJlY29yZCAhPSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRBZGRlZCkge1xuICAgICAgICByZWNvcmQucHJldmlvdXNWYWx1ZSA9IHJlY29yZC5jdXJyZW50VmFsdWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRvZG8odmljYikgb25jZSBhc3NlcnQgaXMgc3VwcG9ydGVkXG4gICAgICAvLyBhc3NlcnQoKCkge1xuICAgICAgLy8gIHZhciByID0gX2NoYW5nZXNIZWFkO1xuICAgICAgLy8gIHdoaWxlIChyICE9IG51bGwpIHtcbiAgICAgIC8vICAgIHZhciBuZXh0UmVjb3JkID0gci5fbmV4dENoYW5nZWQ7XG4gICAgICAvLyAgICByLl9uZXh0Q2hhbmdlZCA9IG51bGw7XG4gICAgICAvLyAgICByID0gbmV4dFJlY29yZDtcbiAgICAgIC8vICB9XG4gICAgICAvL1xuICAgICAgLy8gIHIgPSBfYWRkaXRpb25zSGVhZDtcbiAgICAgIC8vICB3aGlsZSAociAhPSBudWxsKSB7XG4gICAgICAvLyAgICB2YXIgbmV4dFJlY29yZCA9IHIuX25leHRBZGRlZDtcbiAgICAgIC8vICAgIHIuX25leHRBZGRlZCA9IG51bGw7XG4gICAgICAvLyAgICByID0gbmV4dFJlY29yZDtcbiAgICAgIC8vICB9XG4gICAgICAvL1xuICAgICAgLy8gIHIgPSBfcmVtb3ZhbHNIZWFkO1xuICAgICAgLy8gIHdoaWxlIChyICE9IG51bGwpIHtcbiAgICAgIC8vICAgIHZhciBuZXh0UmVjb3JkID0gci5fbmV4dFJlbW92ZWQ7XG4gICAgICAvLyAgICByLl9uZXh0UmVtb3ZlZCA9IG51bGw7XG4gICAgICAvLyAgICByID0gbmV4dFJlY29yZDtcbiAgICAgIC8vICB9XG4gICAgICAvL1xuICAgICAgLy8gIHJldHVybiB0cnVlO1xuICAgICAgLy99KTtcbiAgICAgIHRoaXMuX2NoYW5nZXNIZWFkID0gdGhpcy5fY2hhbmdlc1RhaWwgPSBudWxsO1xuICAgICAgdGhpcy5fYWRkaXRpb25zSGVhZCA9IHRoaXMuX2FkZGl0aW9uc1RhaWwgPSBudWxsO1xuICAgICAgdGhpcy5fcmVtb3ZhbHNIZWFkID0gdGhpcy5fcmVtb3ZhbHNUYWlsID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF90cnVuY2F0ZShsYXN0UmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZCwgcmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZCkge1xuICAgIHdoaWxlIChyZWNvcmQgIT09IG51bGwpIHtcbiAgICAgIGlmIChsYXN0UmVjb3JkID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX21hcEhlYWQgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFzdFJlY29yZC5fbmV4dCA9IG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgbmV4dFJlY29yZCA9IHJlY29yZC5fbmV4dDtcbiAgICAgIC8vIHRvZG8odmljYikgYXNzZXJ0XG4gICAgICAvLyBhc3NlcnQoKCgpIHtcbiAgICAgIC8vICByZWNvcmQuX25leHQgPSBudWxsO1xuICAgICAgLy8gIHJldHVybiB0cnVlO1xuICAgICAgLy99KSk7XG4gICAgICB0aGlzLl9hZGRUb1JlbW92YWxzKHJlY29yZCk7XG4gICAgICBsYXN0UmVjb3JkID0gcmVjb3JkO1xuICAgICAgcmVjb3JkID0gbmV4dFJlY29yZDtcbiAgICB9XG5cbiAgICBmb3IgKHZhciByZWM6IEtleVZhbHVlQ2hhbmdlUmVjb3JkID0gdGhpcy5fcmVtb3ZhbHNIZWFkOyByZWMgIT09IG51bGw7IHJlYyA9IHJlYy5fbmV4dFJlbW92ZWQpIHtcbiAgICAgIHJlYy5wcmV2aW91c1ZhbHVlID0gcmVjLmN1cnJlbnRWYWx1ZTtcbiAgICAgIHJlYy5jdXJyZW50VmFsdWUgPSBudWxsO1xuICAgICAgdGhpcy5fcmVjb3Jkcy5kZWxldGUocmVjLmtleSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaXNJblJlbW92YWxzKHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQpIHtcbiAgICByZXR1cm4gcmVjb3JkID09PSB0aGlzLl9yZW1vdmFsc0hlYWQgfHwgcmVjb3JkLl9uZXh0UmVtb3ZlZCAhPT0gbnVsbCB8fFxuICAgICAgICAgICByZWNvcmQuX3ByZXZSZW1vdmVkICE9PSBudWxsO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkVG9SZW1vdmFscyhyZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkKSB7XG4gICAgLy8gdG9kbyh2aWNiKSBhc3NlcnRcbiAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0ID09IG51bGwpO1xuICAgIC8vIGFzc2VydChyZWNvcmQuX25leHRBZGRlZCA9PSBudWxsKTtcbiAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0Q2hhbmdlZCA9PSBudWxsKTtcbiAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0UmVtb3ZlZCA9PSBudWxsKTtcbiAgICAvLyBhc3NlcnQocmVjb3JkLl9wcmV2UmVtb3ZlZCA9PSBudWxsKTtcbiAgICBpZiAodGhpcy5fcmVtb3ZhbHNIZWFkID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW1vdmFsc0hlYWQgPSB0aGlzLl9yZW1vdmFsc1RhaWwgPSByZWNvcmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3JlbW92YWxzVGFpbC5fbmV4dFJlbW92ZWQgPSByZWNvcmQ7XG4gICAgICByZWNvcmQuX3ByZXZSZW1vdmVkID0gdGhpcy5fcmVtb3ZhbHNUYWlsO1xuICAgICAgdGhpcy5fcmVtb3ZhbHNUYWlsID0gcmVjb3JkO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlbW92ZUZyb21TZXEocHJldjogS2V5VmFsdWVDaGFuZ2VSZWNvcmQsIHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQpIHtcbiAgICB2YXIgbmV4dCA9IHJlY29yZC5fbmV4dDtcbiAgICBpZiAocHJldiA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fbWFwSGVhZCA9IG5leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXYuX25leHQgPSBuZXh0O1xuICAgIH1cbiAgICAvLyB0b2RvKHZpY2IpIGFzc2VydFxuICAgIC8vIGFzc2VydCgoKCkge1xuICAgIC8vICByZWNvcmQuX25leHQgPSBudWxsO1xuICAgIC8vICByZXR1cm4gdHJ1ZTtcbiAgICAvL30pKCkpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVtb3ZlRnJvbVJlbW92YWxzKHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQpIHtcbiAgICAvLyB0b2RvKHZpY2IpIGFzc2VydFxuICAgIC8vIGFzc2VydChyZWNvcmQuX25leHQgPT0gbnVsbCk7XG4gICAgLy8gYXNzZXJ0KHJlY29yZC5fbmV4dEFkZGVkID09IG51bGwpO1xuICAgIC8vIGFzc2VydChyZWNvcmQuX25leHRDaGFuZ2VkID09IG51bGwpO1xuXG4gICAgdmFyIHByZXYgPSByZWNvcmQuX3ByZXZSZW1vdmVkO1xuICAgIHZhciBuZXh0ID0gcmVjb3JkLl9uZXh0UmVtb3ZlZDtcbiAgICBpZiAocHJldiA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVtb3ZhbHNIZWFkID0gbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldi5fbmV4dFJlbW92ZWQgPSBuZXh0O1xuICAgIH1cbiAgICBpZiAobmV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVtb3ZhbHNUYWlsID0gcHJldjtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dC5fcHJldlJlbW92ZWQgPSBwcmV2O1xuICAgIH1cbiAgICByZWNvcmQuX3ByZXZSZW1vdmVkID0gcmVjb3JkLl9uZXh0UmVtb3ZlZCA9IG51bGw7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRUb0FkZGl0aW9ucyhyZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkKSB7XG4gICAgLy8gdG9kbyh2aWNiKTogYXNzZXJ0XG4gICAgLy8gYXNzZXJ0KHJlY29yZC5fbmV4dCA9PSBudWxsKTtcbiAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0QWRkZWQgPT0gbnVsbCk7XG4gICAgLy8gYXNzZXJ0KHJlY29yZC5fbmV4dENoYW5nZWQgPT0gbnVsbCk7XG4gICAgLy8gYXNzZXJ0KHJlY29yZC5fbmV4dFJlbW92ZWQgPT0gbnVsbCk7XG4gICAgLy8gYXNzZXJ0KHJlY29yZC5fcHJldlJlbW92ZWQgPT0gbnVsbCk7XG4gICAgaWYgKHRoaXMuX2FkZGl0aW9uc0hlYWQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2FkZGl0aW9uc0hlYWQgPSB0aGlzLl9hZGRpdGlvbnNUYWlsID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hZGRpdGlvbnNUYWlsLl9uZXh0QWRkZWQgPSByZWNvcmQ7XG4gICAgICB0aGlzLl9hZGRpdGlvbnNUYWlsID0gcmVjb3JkO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZFRvQ2hhbmdlcyhyZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkKSB7XG4gICAgLy8gdG9kbyh2aWNiKSBhc3NlcnRcbiAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0QWRkZWQgPT0gbnVsbCk7XG4gICAgLy8gYXNzZXJ0KHJlY29yZC5fbmV4dENoYW5nZWQgPT0gbnVsbCk7XG4gICAgLy8gYXNzZXJ0KHJlY29yZC5fbmV4dFJlbW92ZWQgPT0gbnVsbCk7XG4gICAgLy8gYXNzZXJ0KHJlY29yZC5fcHJldlJlbW92ZWQgPT0gbnVsbCk7XG4gICAgaWYgKHRoaXMuX2NoYW5nZXNIZWFkID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9jaGFuZ2VzSGVhZCA9IHRoaXMuX2NoYW5nZXNUYWlsID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jaGFuZ2VzVGFpbC5fbmV4dENoYW5nZWQgPSByZWNvcmQ7XG4gICAgICB0aGlzLl9jaGFuZ2VzVGFpbCA9IHJlY29yZDtcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHZhciBpdGVtcyA9IFtdO1xuICAgIHZhciBwcmV2aW91cyA9IFtdO1xuICAgIHZhciBjaGFuZ2VzID0gW107XG4gICAgdmFyIGFkZGl0aW9ucyA9IFtdO1xuICAgIHZhciByZW1vdmFscyA9IFtdO1xuICAgIHZhciByZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkO1xuXG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9tYXBIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dCkge1xuICAgICAgaXRlbXMucHVzaChzdHJpbmdpZnkocmVjb3JkKSk7XG4gICAgfVxuICAgIGZvciAocmVjb3JkID0gdGhpcy5fcHJldmlvdXNNYXBIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dFByZXZpb3VzKSB7XG4gICAgICBwcmV2aW91cy5wdXNoKHN0cmluZ2lmeShyZWNvcmQpKTtcbiAgICB9XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9jaGFuZ2VzSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRDaGFuZ2VkKSB7XG4gICAgICBjaGFuZ2VzLnB1c2goc3RyaW5naWZ5KHJlY29yZCkpO1xuICAgIH1cbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0QWRkZWQpIHtcbiAgICAgIGFkZGl0aW9ucy5wdXNoKHN0cmluZ2lmeShyZWNvcmQpKTtcbiAgICB9XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9yZW1vdmFsc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0UmVtb3ZlZCkge1xuICAgICAgcmVtb3ZhbHMucHVzaChzdHJpbmdpZnkocmVjb3JkKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFwibWFwOiBcIiArIGl0ZW1zLmpvaW4oJywgJykgKyBcIlxcblwiICsgXCJwcmV2aW91czogXCIgKyBwcmV2aW91cy5qb2luKCcsICcpICsgXCJcXG5cIiArXG4gICAgICAgICAgIFwiYWRkaXRpb25zOiBcIiArIGFkZGl0aW9ucy5qb2luKCcsICcpICsgXCJcXG5cIiArIFwiY2hhbmdlczogXCIgKyBjaGFuZ2VzLmpvaW4oJywgJykgKyBcIlxcblwiICtcbiAgICAgICAgICAgXCJyZW1vdmFsczogXCIgKyByZW1vdmFscy5qb2luKCcsICcpICsgXCJcXG5cIjtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZvckVhY2gob2JqLCBmbjogRnVuY3Rpb24pIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAoPE1hcDxhbnksIGFueT4+b2JqKS5mb3JFYWNoKDxhbnk+Zm4pO1xuICAgIH0gZWxzZSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gob2JqLCBmbik7XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEtleVZhbHVlQ2hhbmdlUmVjb3JkIHtcbiAgcHJldmlvdXNWYWx1ZTogYW55ID0gbnVsbDtcbiAgY3VycmVudFZhbHVlOiBhbnkgPSBudWxsO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRQcmV2aW91czogS2V5VmFsdWVDaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0OiBLZXlWYWx1ZUNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRBZGRlZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0UmVtb3ZlZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9wcmV2UmVtb3ZlZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0Q2hhbmdlZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBrZXk6IGFueSkge31cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBsb29zZUlkZW50aWNhbCh0aGlzLnByZXZpb3VzVmFsdWUsIHRoaXMuY3VycmVudFZhbHVlKSA/XG4gICAgICAgICAgICAgICBzdHJpbmdpZnkodGhpcy5rZXkpIDpcbiAgICAgICAgICAgICAgIChzdHJpbmdpZnkodGhpcy5rZXkpICsgJ1snICsgc3RyaW5naWZ5KHRoaXMucHJldmlvdXNWYWx1ZSkgKyAnLT4nICtcbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkodGhpcy5jdXJyZW50VmFsdWUpICsgJ10nKTtcbiAgfVxufVxuIl19