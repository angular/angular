import { PromiseWrapper } from 'angular2/src/facade/promise';
import { isPresent } from 'angular2/src/facade/lang';
import { XHR } from 'angular2/src/compiler/xhr';
export class XHRImpl extends XHR {
    get(url) {
        var completer = PromiseWrapper.completer();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'text';
        xhr.onload = function () {
            // responseText is the old-school way of retrieving response (supported by IE8 & 9)
            // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
            var response = isPresent(xhr.response) ? xhr.response : xhr.responseText;
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
                completer.reject(`Failed to load ${url}`, null);
            }
        };
        xhr.onerror = function () { completer.reject(`Failed to load ${url}`, null); };
        xhr.send();
        return completer.promise;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci94aHJfaW1wbC50cyJdLCJuYW1lcyI6WyJYSFJJbXBsIiwiWEhSSW1wbC5nZXQiXSwibWFwcGluZ3MiOiJPQUFPLEVBQVUsY0FBYyxFQUFtQixNQUFNLDZCQUE2QjtPQUM5RSxFQUFDLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUMzQyxFQUFDLEdBQUcsRUFBQyxNQUFNLDJCQUEyQjtBQUU3Qyw2QkFBNkIsR0FBRztJQUM5QkEsR0FBR0EsQ0FBQ0EsR0FBV0E7UUFDYkMsSUFBSUEsU0FBU0EsR0FBK0JBLGNBQWNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3ZFQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxjQUFjQSxFQUFFQSxDQUFDQTtRQUMvQkEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDM0JBLEdBQUdBLENBQUNBLFlBQVlBLEdBQUdBLE1BQU1BLENBQUNBO1FBRTFCQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFHQTtZQUNYLG1GQUFtRjtZQUNuRiwwRkFBMEY7WUFDMUYsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFFekUseURBQXlEO1lBQ3pELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEtBQUssSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBRXBELDJEQUEyRDtZQUMzRCx1RUFBdUU7WUFDdkUsaURBQWlEO1lBQ2pELEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixNQUFNLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xELENBQUM7UUFDSCxDQUFDLENBQUNBO1FBRUZBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLGNBQWEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUNBO1FBRTlFQSxHQUFHQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUNYQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQTtJQUMzQkEsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXIsIFByb21pc2VDb21wbGV0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvcHJvbWlzZSc7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcblxuZXhwb3J0IGNsYXNzIFhIUkltcGwgZXh0ZW5kcyBYSFIge1xuICBnZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHZhciBjb21wbGV0ZXI6IFByb21pc2VDb21wbGV0ZXIgPCBzdHJpbmcgPj0gUHJvbWlzZVdyYXBwZXIuY29tcGxldGVyKCk7XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG5cbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyByZXNwb25zZVRleHQgaXMgdGhlIG9sZC1zY2hvb2wgd2F5IG9mIHJldHJpZXZpbmcgcmVzcG9uc2UgKHN1cHBvcnRlZCBieSBJRTggJiA5KVxuICAgICAgLy8gcmVzcG9uc2UvcmVzcG9uc2VUeXBlIHByb3BlcnRpZXMgd2VyZSBpbnRyb2R1Y2VkIGluIFhIUiBMZXZlbDIgc3BlYyAoc3VwcG9ydGVkIGJ5IElFMTApXG4gICAgICB2YXIgcmVzcG9uc2UgPSBpc1ByZXNlbnQoeGhyLnJlc3BvbnNlKSA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHQ7XG5cbiAgICAgIC8vIG5vcm1hbGl6ZSBJRTkgYnVnIChodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC8xNDUwKVxuICAgICAgdmFyIHN0YXR1cyA9IHhoci5zdGF0dXMgPT09IDEyMjMgPyAyMDQgOiB4aHIuc3RhdHVzO1xuXG4gICAgICAvLyBmaXggc3RhdHVzIGNvZGUgd2hlbiBpdCBpcyAwICgwIHN0YXR1cyBpcyB1bmRvY3VtZW50ZWQpLlxuICAgICAgLy8gT2NjdXJzIHdoZW4gYWNjZXNzaW5nIGZpbGUgcmVzb3VyY2VzIG9yIG9uIEFuZHJvaWQgNC4xIHN0b2NrIGJyb3dzZXJcbiAgICAgIC8vIHdoaWxlIHJldHJpZXZpbmcgZmlsZXMgZnJvbSBhcHBsaWNhdGlvbiBjYWNoZS5cbiAgICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgICAgc3RhdHVzID0gcmVzcG9uc2UgPyAyMDAgOiAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoMjAwIDw9IHN0YXR1cyAmJiBzdGF0dXMgPD0gMzAwKSB7XG4gICAgICAgIGNvbXBsZXRlci5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbXBsZXRlci5yZWplY3QoYEZhaWxlZCB0byBsb2FkICR7dXJsfWAsIG51bGwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkgeyBjb21wbGV0ZXIucmVqZWN0KGBGYWlsZWQgdG8gbG9hZCAke3VybH1gLCBudWxsKTsgfTtcblxuICAgIHhoci5zZW5kKCk7XG4gICAgcmV0dXJuIGNvbXBsZXRlci5wcm9taXNlO1xuICB9XG59XG4iXX0=