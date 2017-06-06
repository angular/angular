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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci94aHJfaW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLGNBQWMsRUFBbUIsTUFBTSw2QkFBNkI7T0FDckUsRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDM0MsRUFBQyxHQUFHLEVBQUMsTUFBTSwyQkFBMkI7QUFFN0MsNkJBQTZCLEdBQUc7SUFDOUIsR0FBRyxDQUFDLEdBQVc7UUFDYixJQUFJLFNBQVMsR0FBK0IsY0FBYyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZFLElBQUksR0FBRyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNCLEdBQUcsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1FBRTFCLEdBQUcsQ0FBQyxNQUFNLEdBQUc7WUFDWCxtRkFBbUY7WUFDbkYsMEZBQTBGO1lBQzFGLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDO1lBRXpFLHlEQUF5RDtZQUN6RCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxLQUFLLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUVwRCwyREFBMkQ7WUFDM0QsdUVBQXVFO1lBQ3ZFLGlEQUFpRDtZQUNqRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakIsTUFBTSxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixTQUFTLENBQUMsTUFBTSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBRUYsR0FBRyxDQUFDLE9BQU8sR0FBRyxjQUFhLFNBQVMsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTlFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0lBQzNCLENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Byb21pc2VXcmFwcGVyLCBQcm9taXNlQ29tcGxldGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL3Byb21pc2UnO1xuaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1hIUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3hocic7XG5cbmV4cG9ydCBjbGFzcyBYSFJJbXBsIGV4dGVuZHMgWEhSIHtcbiAgZ2V0KHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB2YXIgY29tcGxldGVyOiBQcm9taXNlQ29tcGxldGVyIDwgc3RyaW5nID49IFByb21pc2VXcmFwcGVyLmNvbXBsZXRlcigpO1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gcmVzcG9uc2VUZXh0IGlzIHRoZSBvbGQtc2Nob29sIHdheSBvZiByZXRyaWV2aW5nIHJlc3BvbnNlIChzdXBwb3J0ZWQgYnkgSUU4ICYgOSlcbiAgICAgIC8vIHJlc3BvbnNlL3Jlc3BvbnNlVHlwZSBwcm9wZXJ0aWVzIHdlcmUgaW50cm9kdWNlZCBpbiBYSFIgTGV2ZWwyIHNwZWMgKHN1cHBvcnRlZCBieSBJRTEwKVxuICAgICAgdmFyIHJlc3BvbnNlID0gaXNQcmVzZW50KHhoci5yZXNwb25zZSkgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0O1xuXG4gICAgICAvLyBub3JtYWxpemUgSUU5IGJ1ZyAoaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTQ1MClcbiAgICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzID09PSAxMjIzID8gMjA0IDogeGhyLnN0YXR1cztcblxuICAgICAgLy8gZml4IHN0YXR1cyBjb2RlIHdoZW4gaXQgaXMgMCAoMCBzdGF0dXMgaXMgdW5kb2N1bWVudGVkKS5cbiAgICAgIC8vIE9jY3VycyB3aGVuIGFjY2Vzc2luZyBmaWxlIHJlc291cmNlcyBvciBvbiBBbmRyb2lkIDQuMSBzdG9jayBicm93c2VyXG4gICAgICAvLyB3aGlsZSByZXRyaWV2aW5nIGZpbGVzIGZyb20gYXBwbGljYXRpb24gY2FjaGUuXG4gICAgICBpZiAoc3RhdHVzID09PSAwKSB7XG4gICAgICAgIHN0YXR1cyA9IHJlc3BvbnNlID8gMjAwIDogMDtcbiAgICAgIH1cblxuICAgICAgaWYgKDIwMCA8PSBzdGF0dXMgJiYgc3RhdHVzIDw9IDMwMCkge1xuICAgICAgICBjb21wbGV0ZXIucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21wbGV0ZXIucmVqZWN0KGBGYWlsZWQgdG8gbG9hZCAke3VybH1gLCBudWxsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHsgY29tcGxldGVyLnJlamVjdChgRmFpbGVkIHRvIGxvYWQgJHt1cmx9YCwgbnVsbCk7IH07XG5cbiAgICB4aHIuc2VuZCgpO1xuICAgIHJldHVybiBjb21wbGV0ZXIucHJvbWlzZTtcbiAgfVxufVxuIl19