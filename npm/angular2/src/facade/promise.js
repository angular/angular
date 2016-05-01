'use strict';"use strict";
var PromiseCompleter = (function () {
    function PromiseCompleter() {
        var _this = this;
        this.promise = new Promise(function (res, rej) {
            _this.resolve = res;
            _this.reject = rej;
        });
    }
    return PromiseCompleter;
}());
exports.PromiseCompleter = PromiseCompleter;
var PromiseWrapper = (function () {
    function PromiseWrapper() {
    }
    PromiseWrapper.resolve = function (obj) { return Promise.resolve(obj); };
    PromiseWrapper.reject = function (obj, _) { return Promise.reject(obj); };
    // Note: We can't rename this method into `catch`, as this is not a valid
    // method name in Dart.
    PromiseWrapper.catchError = function (promise, onError) {
        return promise.catch(onError);
    };
    PromiseWrapper.all = function (promises) {
        if (promises.length == 0)
            return Promise.resolve([]);
        return Promise.all(promises);
    };
    PromiseWrapper.then = function (promise, success, rejection) {
        return promise.then(success, rejection);
    };
    PromiseWrapper.wrap = function (computation) {
        return new Promise(function (res, rej) {
            try {
                res(computation());
            }
            catch (e) {
                rej(e);
            }
        });
    };
    PromiseWrapper.scheduleMicrotask = function (computation) {
        PromiseWrapper.then(PromiseWrapper.resolve(null), computation, function (_) { });
    };
    PromiseWrapper.isPromise = function (obj) { return obj instanceof Promise; };
    PromiseWrapper.completer = function () { return new PromiseCompleter(); };
    return PromiseWrapper;
}());
exports.PromiseWrapper = PromiseWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbWlzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9mYWNhZGUvcHJvbWlzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7SUFLRTtRQUxGLGlCQVdDO1FBTEcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBRSxHQUFHO1lBQ2xDLEtBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ25CLEtBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNILHVCQUFDO0FBQUQsQ0FBQyxBQVhELElBV0M7QUFYWSx3QkFBZ0IsbUJBVzVCLENBQUE7QUFFRDtJQUFBO0lBdUNBLENBQUM7SUF0Q1Esc0JBQU8sR0FBZCxVQUFrQixHQUFNLElBQWdCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUvRCxxQkFBTSxHQUFiLFVBQWMsR0FBUSxFQUFFLENBQUMsSUFBa0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXhFLHlFQUF5RTtJQUN6RSx1QkFBdUI7SUFDaEIseUJBQVUsR0FBakIsVUFBcUIsT0FBbUIsRUFDbkIsT0FBMkM7UUFDOUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVNLGtCQUFHLEdBQVYsVUFBYyxRQUE0QjtRQUN4QyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSxtQkFBSSxHQUFYLFVBQWtCLE9BQW1CLEVBQUUsT0FBeUMsRUFDOUQsU0FBMkQ7UUFDM0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTSxtQkFBSSxHQUFYLFVBQWUsV0FBb0I7UUFDakMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUc7WUFDMUIsSUFBSSxDQUFDO2dCQUNILEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ3JCLENBQUU7WUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxnQ0FBaUIsR0FBeEIsVUFBeUIsV0FBc0I7UUFDN0MsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFDLENBQUMsSUFBTSxDQUFDLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRU0sd0JBQVMsR0FBaEIsVUFBaUIsR0FBUSxJQUFhLE1BQU0sQ0FBQyxHQUFHLFlBQVksT0FBTyxDQUFDLENBQUMsQ0FBQztJQUUvRCx3QkFBUyxHQUFoQixjQUE2QyxNQUFNLENBQUMsSUFBSSxnQkFBZ0IsRUFBSyxDQUFDLENBQUMsQ0FBQztJQUNsRixxQkFBQztBQUFELENBQUMsQUF2Q0QsSUF1Q0M7QUF2Q1ksc0JBQWMsaUJBdUMxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgY2xhc3MgUHJvbWlzZUNvbXBsZXRlcjxSPiB7XG4gIHByb21pc2U6IFByb21pc2U8Uj47XG4gIHJlc29sdmU6ICh2YWx1ZT86IFIgfCBQcm9taXNlTGlrZTxSPikgPT4gdm9pZDtcbiAgcmVqZWN0OiAoZXJyb3I/OiBhbnksIHN0YWNrVHJhY2U/OiBzdHJpbmcpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICB0aGlzLnJlc29sdmUgPSByZXM7XG4gICAgICB0aGlzLnJlamVjdCA9IHJlajtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvbWlzZVdyYXBwZXIge1xuICBzdGF0aWMgcmVzb2x2ZTxUPihvYmo6IFQpOiBQcm9taXNlPFQ+IHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZShvYmopOyB9XG5cbiAgc3RhdGljIHJlamVjdChvYmo6IGFueSwgXyk6IFByb21pc2U8YW55PiB7IHJldHVybiBQcm9taXNlLnJlamVjdChvYmopOyB9XG5cbiAgLy8gTm90ZTogV2UgY2FuJ3QgcmVuYW1lIHRoaXMgbWV0aG9kIGludG8gYGNhdGNoYCwgYXMgdGhpcyBpcyBub3QgYSB2YWxpZFxuICAvLyBtZXRob2QgbmFtZSBpbiBEYXJ0LlxuICBzdGF0aWMgY2F0Y2hFcnJvcjxUPihwcm9taXNlOiBQcm9taXNlPFQ+LFxuICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yOiAoZXJyb3I6IGFueSkgPT4gVCB8IFByb21pc2VMaWtlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIHByb21pc2UuY2F0Y2gob25FcnJvcik7XG4gIH1cblxuICBzdGF0aWMgYWxsPFQ+KHByb21pc2VzOiAoVCB8IFByb21pc2U8VD4pW10pOiBQcm9taXNlPFRbXT4ge1xuICAgIGlmIChwcm9taXNlcy5sZW5ndGggPT0gMCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgfVxuXG4gIHN0YXRpYyB0aGVuPFQsIFU+KHByb21pc2U6IFByb21pc2U8VD4sIHN1Y2Nlc3M6ICh2YWx1ZTogVCkgPT4gVSB8IFByb21pc2VMaWtlPFU+LFxuICAgICAgICAgICAgICAgICAgICByZWplY3Rpb24/OiAoZXJyb3I6IGFueSwgc3RhY2s/OiBhbnkpID0+IFUgfCBQcm9taXNlTGlrZTxVPik6IFByb21pc2U8VT4ge1xuICAgIHJldHVybiBwcm9taXNlLnRoZW4oc3VjY2VzcywgcmVqZWN0aW9uKTtcbiAgfVxuXG4gIHN0YXRpYyB3cmFwPFQ+KGNvbXB1dGF0aW9uOiAoKSA9PiBUKTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzKGNvbXB1dGF0aW9uKCkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZWooZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgc2NoZWR1bGVNaWNyb3Rhc2soY29tcHV0YXRpb246ICgpID0+IGFueSk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnRoZW4oUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShudWxsKSwgY29tcHV0YXRpb24sIChfKSA9PiB7fSk7XG4gIH1cblxuICBzdGF0aWMgaXNQcm9taXNlKG9iajogYW55KTogYm9vbGVhbiB7IHJldHVybiBvYmogaW5zdGFuY2VvZiBQcm9taXNlOyB9XG5cbiAgc3RhdGljIGNvbXBsZXRlcjxUPigpOiBQcm9taXNlQ29tcGxldGVyPFQ+IHsgcmV0dXJuIG5ldyBQcm9taXNlQ29tcGxldGVyPFQ+KCk7IH1cbn1cbiJdfQ==