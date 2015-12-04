'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var promise_1 = require('angular2/src/facade/promise');
var lang_1 = require('angular2/src/facade/lang');
var xhr_1 = require('angular2/src/compiler/xhr');
var XHRImpl = (function (_super) {
    __extends(XHRImpl, _super);
    function XHRImpl() {
        _super.apply(this, arguments);
    }
    XHRImpl.prototype.get = function (url) {
        var completer = promise_1.PromiseWrapper.completer();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'text';
        xhr.onload = function () {
            // responseText is the old-school way of retrieving response (supported by IE8 & 9)
            // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
            var response = lang_1.isPresent(xhr.response) ? xhr.response : xhr.responseText;
            // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
            var status = xhr.status === 1223 ? 204 : xhr.status;
            // fix status code when it is 0 (0 status is undocumented).
            // Occurs when accessing file resources or on Android 4.1 stock browser
            // while retrieving files from application cache.
            if (status === 0) {
                status = response ? 200 : 0;
            }
            if (200 <= status && status <= 300) {
                completer.resolve(response);
            }
            else {
                completer.reject("Failed to load " + url, null);
            }
        };
        xhr.onerror = function () { completer.reject("Failed to load " + url, null); };
        xhr.send();
        return completer.promise;
    };
    return XHRImpl;
})(xhr_1.XHR);
exports.XHRImpl = XHRImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci94aHJfaW1wbC50cyJdLCJuYW1lcyI6WyJYSFJJbXBsIiwiWEhSSW1wbC5jb25zdHJ1Y3RvciIsIlhIUkltcGwuZ2V0Il0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHdCQUF3RCw2QkFBNkIsQ0FBQyxDQUFBO0FBQ3RGLHFCQUF3QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ25ELG9CQUFrQiwyQkFBMkIsQ0FBQyxDQUFBO0FBRTlDO0lBQTZCQSwyQkFBR0E7SUFBaENBO1FBQTZCQyw4QkFBR0E7SUFrQ2hDQSxDQUFDQTtJQWpDQ0QscUJBQUdBLEdBQUhBLFVBQUlBLEdBQVdBO1FBQ2JFLElBQUlBLFNBQVNBLEdBQStCQSx3QkFBY0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7UUFDdkVBLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLGNBQWNBLEVBQUVBLENBQUNBO1FBQy9CQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMzQkEsR0FBR0EsQ0FBQ0EsWUFBWUEsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFFMUJBLEdBQUdBLENBQUNBLE1BQU1BLEdBQUdBO1lBQ1gsbUZBQW1GO1lBQ25GLDBGQUEwRjtZQUMxRixJQUFJLFFBQVEsR0FBRyxnQkFBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFFekUseURBQXlEO1lBQ3pELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEtBQUssSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBRXBELDJEQUEyRDtZQUMzRCx1RUFBdUU7WUFDdkUsaURBQWlEO1lBQ2pELEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixNQUFNLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsb0JBQWtCLEdBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDQTtRQUVGQSxHQUFHQSxDQUFDQSxPQUFPQSxHQUFHQSxjQUFhLFNBQVMsQ0FBQyxNQUFNLENBQUMsb0JBQWtCLEdBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ0E7UUFFOUVBLEdBQUdBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQ1hBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBO0lBQzNCQSxDQUFDQTtJQUNIRixjQUFDQTtBQUFEQSxDQUFDQSxBQWxDRCxFQUE2QixTQUFHLEVBa0MvQjtBQWxDWSxlQUFPLFVBa0NuQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlciwgUHJvbWlzZUNvbXBsZXRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9wcm9taXNlJztcbmltcG9ydCB7aXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuXG5leHBvcnQgY2xhc3MgWEhSSW1wbCBleHRlbmRzIFhIUiB7XG4gIGdldCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdmFyIGNvbXBsZXRlcjogUHJvbWlzZUNvbXBsZXRlciA8IHN0cmluZyA+PSBQcm9taXNlV3JhcHBlci5jb21wbGV0ZXIoKTtcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcblxuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIHJlc3BvbnNlVGV4dCBpcyB0aGUgb2xkLXNjaG9vbCB3YXkgb2YgcmV0cmlldmluZyByZXNwb25zZSAoc3VwcG9ydGVkIGJ5IElFOCAmIDkpXG4gICAgICAvLyByZXNwb25zZS9yZXNwb25zZVR5cGUgcHJvcGVydGllcyB3ZXJlIGludHJvZHVjZWQgaW4gWEhSIExldmVsMiBzcGVjIChzdXBwb3J0ZWQgYnkgSUUxMClcbiAgICAgIHZhciByZXNwb25zZSA9IGlzUHJlc2VudCh4aHIucmVzcG9uc2UpID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dDtcblxuICAgICAgLy8gbm9ybWFsaXplIElFOSBidWcgKGh0dHA6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0LzE0NTApXG4gICAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cyA9PT0gMTIyMyA/IDIwNCA6IHhoci5zdGF0dXM7XG5cbiAgICAgIC8vIGZpeCBzdGF0dXMgY29kZSB3aGVuIGl0IGlzIDAgKDAgc3RhdHVzIGlzIHVuZG9jdW1lbnRlZCkuXG4gICAgICAvLyBPY2N1cnMgd2hlbiBhY2Nlc3NpbmcgZmlsZSByZXNvdXJjZXMgb3Igb24gQW5kcm9pZCA0LjEgc3RvY2sgYnJvd3NlclxuICAgICAgLy8gd2hpbGUgcmV0cmlldmluZyBmaWxlcyBmcm9tIGFwcGxpY2F0aW9uIGNhY2hlLlxuICAgICAgaWYgKHN0YXR1cyA9PT0gMCkge1xuICAgICAgICBzdGF0dXMgPSByZXNwb25zZSA/IDIwMCA6IDA7XG4gICAgICB9XG5cbiAgICAgIGlmICgyMDAgPD0gc3RhdHVzICYmIHN0YXR1cyA8PSAzMDApIHtcbiAgICAgICAgY29tcGxldGVyLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tcGxldGVyLnJlamVjdChgRmFpbGVkIHRvIGxvYWQgJHt1cmx9YCwgbnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7IGNvbXBsZXRlci5yZWplY3QoYEZhaWxlZCB0byBsb2FkICR7dXJsfWAsIG51bGwpOyB9O1xuXG4gICAgeGhyLnNlbmQoKTtcbiAgICByZXR1cm4gY29tcGxldGVyLnByb21pc2U7XG4gIH1cbn1cbiJdfQ==