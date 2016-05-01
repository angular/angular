'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xhr_1 = require('angular2/src/compiler/xhr');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
var promise_1 = require('angular2/src/facade/promise');
/**
 * An implementation of XHR that uses a template cache to avoid doing an actual
 * XHR.
 *
 * The template cache needs to be built and loaded into window.$templateCache
 * via a separate mechanism.
 */
var CachedXHR = (function (_super) {
    __extends(CachedXHR, _super);
    function CachedXHR() {
        _super.call(this);
        this._cache = lang_1.global.$templateCache;
        if (this._cache == null) {
            throw new exceptions_1.BaseException('CachedXHR: Template cache was not found in $templateCache.');
        }
    }
    CachedXHR.prototype.get = function (url) {
        if (this._cache.hasOwnProperty(url)) {
            return promise_1.PromiseWrapper.resolve(this._cache[url]);
        }
        else {
            return promise_1.PromiseWrapper.reject('CachedXHR: Did not find cached template for ' + url, null);
        }
    };
    return CachedXHR;
}(xhr_1.XHR));
exports.CachedXHR = CachedXHR;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2NhY2hlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2Jyb3dzZXIveGhyX2NhY2hlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9CQUFrQiwyQkFBMkIsQ0FBQyxDQUFBO0FBQzlDLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELHFCQUFxQiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ2hELHdCQUE2Qiw2QkFBNkIsQ0FBQyxDQUFBO0FBRTNEOzs7Ozs7R0FNRztBQUNIO0lBQStCLDZCQUFHO0lBR2hDO1FBQ0UsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxNQUFNLEdBQVMsYUFBTyxDQUFDLGNBQWMsQ0FBQztRQUMzQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxJQUFJLDBCQUFhLENBQUMsNERBQTRELENBQUMsQ0FBQztRQUN4RixDQUFDO0lBQ0gsQ0FBQztJQUVELHVCQUFHLEdBQUgsVUFBSSxHQUFXO1FBQ2IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyx3QkFBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLHdCQUFjLENBQUMsTUFBTSxDQUFDLDhDQUE4QyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRixDQUFDO0lBQ0gsQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0FBQyxBQWxCRCxDQUErQixTQUFHLEdBa0JqQztBQWxCWSxpQkFBUyxZQWtCckIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Z2xvYmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9wcm9taXNlJztcblxuLyoqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiBYSFIgdGhhdCB1c2VzIGEgdGVtcGxhdGUgY2FjaGUgdG8gYXZvaWQgZG9pbmcgYW4gYWN0dWFsXG4gKiBYSFIuXG4gKlxuICogVGhlIHRlbXBsYXRlIGNhY2hlIG5lZWRzIHRvIGJlIGJ1aWx0IGFuZCBsb2FkZWQgaW50byB3aW5kb3cuJHRlbXBsYXRlQ2FjaGVcbiAqIHZpYSBhIHNlcGFyYXRlIG1lY2hhbmlzbS5cbiAqL1xuZXhwb3J0IGNsYXNzIENhY2hlZFhIUiBleHRlbmRzIFhIUiB7XG4gIHByaXZhdGUgX2NhY2hlOiB7W3VybDogc3RyaW5nXTogc3RyaW5nfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2NhY2hlID0gKDxhbnk+Z2xvYmFsKS4kdGVtcGxhdGVDYWNoZTtcbiAgICBpZiAodGhpcy5fY2FjaGUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ0NhY2hlZFhIUjogVGVtcGxhdGUgY2FjaGUgd2FzIG5vdCBmb3VuZCBpbiAkdGVtcGxhdGVDYWNoZS4nKTtcbiAgICB9XG4gIH1cblxuICBnZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmICh0aGlzLl9jYWNoZS5oYXNPd25Qcm9wZXJ0eSh1cmwpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLl9jYWNoZVt1cmxdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlamVjdCgnQ2FjaGVkWEhSOiBEaWQgbm90IGZpbmQgY2FjaGVkIHRlbXBsYXRlIGZvciAnICsgdXJsLCBudWxsKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==