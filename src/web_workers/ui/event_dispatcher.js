'use strict';var api_1 = require('angular2/src/core/render/api');
var event_serializer_1 = require('angular2/src/web_workers/ui/event_serializer');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var EventDispatcher = (function () {
    function EventDispatcher(_viewRef, _sink, _serializer) {
        this._viewRef = _viewRef;
        this._sink = _sink;
        this._serializer = _serializer;
    }
    EventDispatcher.prototype.dispatchRenderEvent = function (elementIndex, eventName, locals) {
        var e = locals.get('$event');
        var serializedEvent;
        // TODO (jteplitz602): support custom events #3350
        switch (e.type) {
            case "click":
            case "mouseup":
            case "mousedown":
            case "dblclick":
            case "contextmenu":
            case "mouseenter":
            case "mouseleave":
            case "mousemove":
            case "mouseout":
            case "mouseover":
            case "show":
                serializedEvent = event_serializer_1.serializeMouseEvent(e);
                break;
            case "keydown":
            case "keypress":
            case "keyup":
                serializedEvent = event_serializer_1.serializeKeyboardEvent(e);
                break;
            case "input":
            case "change":
            case "blur":
                serializedEvent = event_serializer_1.serializeEventWithTarget(e);
                break;
            case "abort":
            case "afterprint":
            case "beforeprint":
            case "cached":
            case "canplay":
            case "canplaythrough":
            case "chargingchange":
            case "chargingtimechange":
            case "close":
            case "dischargingtimechange":
            case "DOMContentLoaded":
            case "downloading":
            case "durationchange":
            case "emptied":
            case "ended":
            case "error":
            case "fullscreenchange":
            case "fullscreenerror":
            case "invalid":
            case "languagechange":
            case "levelfchange":
            case "loadeddata":
            case "loadedmetadata":
            case "obsolete":
            case "offline":
            case "online":
            case "open":
            case "orientatoinchange":
            case "pause":
            case "pointerlockchange":
            case "pointerlockerror":
            case "play":
            case "playing":
            case "ratechange":
            case "readystatechange":
            case "reset":
            case "scroll":
            case "seeked":
            case "seeking":
            case "stalled":
            case "submit":
            case "success":
            case "suspend":
            case "timeupdate":
            case "updateready":
            case "visibilitychange":
            case "volumechange":
            case "waiting":
                serializedEvent = event_serializer_1.serializeGenericEvent(e);
                break;
            default:
                throw new exceptions_1.BaseException(eventName + " not supported on WebWorkers");
        }
        var serializedLocals = collection_1.StringMapWrapper.create();
        collection_1.StringMapWrapper.set(serializedLocals, '$event', serializedEvent);
        async_1.ObservableWrapper.callEmit(this._sink, {
            "viewRef": this._serializer.serialize(this._viewRef, api_1.RenderViewRef),
            "elementIndex": elementIndex,
            "eventName": eventName,
            "locals": serializedLocals
        });
        // TODO(kegluneq): Eventually, we want the user to indicate from the UI side whether the event
        // should be canceled, but for now just call `preventDefault` on the original DOM event.
        return false;
    };
    return EventDispatcher;
})();
exports.EventDispatcher = EventDispatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9ldmVudF9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbIkV2ZW50RGlzcGF0Y2hlciIsIkV2ZW50RGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsIkV2ZW50RGlzcGF0Y2hlci5kaXNwYXRjaFJlbmRlckV2ZW50Il0sIm1hcHBpbmdzIjoiQUFBQSxvQkFHTyw4QkFBOEIsQ0FBQyxDQUFBO0FBRXRDLGlDQUtPLDhDQUE4QyxDQUFDLENBQUE7QUFDdEQsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBQStCLGdDQUFnQyxDQUFDLENBQUE7QUFDaEUsc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFFMUU7SUFDRUEseUJBQW9CQSxRQUF1QkEsRUFBVUEsS0FBd0JBLEVBQ3pEQSxXQUF1QkE7UUFEdkJDLGFBQVFBLEdBQVJBLFFBQVFBLENBQWVBO1FBQVVBLFVBQUtBLEdBQUxBLEtBQUtBLENBQW1CQTtRQUN6REEsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO0lBQUdBLENBQUNBO0lBRS9DRCw2Q0FBbUJBLEdBQW5CQSxVQUFvQkEsWUFBb0JBLEVBQUVBLFNBQWlCQSxFQUFFQSxNQUF3QkE7UUFDbkZFLElBQUlBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQzdCQSxJQUFJQSxlQUFlQSxDQUFDQTtRQUNwQkEsa0RBQWtEQTtRQUNsREEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsS0FBS0EsT0FBT0EsQ0FBQ0E7WUFDYkEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsV0FBV0EsQ0FBQ0E7WUFDakJBLEtBQUtBLFVBQVVBLENBQUNBO1lBQ2hCQSxLQUFLQSxhQUFhQSxDQUFDQTtZQUNuQkEsS0FBS0EsWUFBWUEsQ0FBQ0E7WUFDbEJBLEtBQUtBLFlBQVlBLENBQUNBO1lBQ2xCQSxLQUFLQSxXQUFXQSxDQUFDQTtZQUNqQkEsS0FBS0EsVUFBVUEsQ0FBQ0E7WUFDaEJBLEtBQUtBLFdBQVdBLENBQUNBO1lBQ2pCQSxLQUFLQSxNQUFNQTtnQkFDVEEsZUFBZUEsR0FBR0Esc0NBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekNBLEtBQUtBLENBQUNBO1lBQ1JBLEtBQUtBLFNBQVNBLENBQUNBO1lBQ2ZBLEtBQUtBLFVBQVVBLENBQUNBO1lBQ2hCQSxLQUFLQSxPQUFPQTtnQkFDVkEsZUFBZUEsR0FBR0EseUNBQXNCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUNBLEtBQUtBLENBQUNBO1lBQ1JBLEtBQUtBLE9BQU9BLENBQUNBO1lBQ2JBLEtBQUtBLFFBQVFBLENBQUNBO1lBQ2RBLEtBQUtBLE1BQU1BO2dCQUNUQSxlQUFlQSxHQUFHQSwyQ0FBd0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM5Q0EsS0FBS0EsQ0FBQ0E7WUFDUkEsS0FBS0EsT0FBT0EsQ0FBQ0E7WUFDYkEsS0FBS0EsWUFBWUEsQ0FBQ0E7WUFDbEJBLEtBQUtBLGFBQWFBLENBQUNBO1lBQ25CQSxLQUFLQSxRQUFRQSxDQUFDQTtZQUNkQSxLQUFLQSxTQUFTQSxDQUFDQTtZQUNmQSxLQUFLQSxnQkFBZ0JBLENBQUNBO1lBQ3RCQSxLQUFLQSxnQkFBZ0JBLENBQUNBO1lBQ3RCQSxLQUFLQSxvQkFBb0JBLENBQUNBO1lBQzFCQSxLQUFLQSxPQUFPQSxDQUFDQTtZQUNiQSxLQUFLQSx1QkFBdUJBLENBQUNBO1lBQzdCQSxLQUFLQSxrQkFBa0JBLENBQUNBO1lBQ3hCQSxLQUFLQSxhQUFhQSxDQUFDQTtZQUNuQkEsS0FBS0EsZ0JBQWdCQSxDQUFDQTtZQUN0QkEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsT0FBT0EsQ0FBQ0E7WUFDYkEsS0FBS0EsT0FBT0EsQ0FBQ0E7WUFDYkEsS0FBS0Esa0JBQWtCQSxDQUFDQTtZQUN4QkEsS0FBS0EsaUJBQWlCQSxDQUFDQTtZQUN2QkEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsZ0JBQWdCQSxDQUFDQTtZQUN0QkEsS0FBS0EsY0FBY0EsQ0FBQ0E7WUFDcEJBLEtBQUtBLFlBQVlBLENBQUNBO1lBQ2xCQSxLQUFLQSxnQkFBZ0JBLENBQUNBO1lBQ3RCQSxLQUFLQSxVQUFVQSxDQUFDQTtZQUNoQkEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsUUFBUUEsQ0FBQ0E7WUFDZEEsS0FBS0EsTUFBTUEsQ0FBQ0E7WUFDWkEsS0FBS0EsbUJBQW1CQSxDQUFDQTtZQUN6QkEsS0FBS0EsT0FBT0EsQ0FBQ0E7WUFDYkEsS0FBS0EsbUJBQW1CQSxDQUFDQTtZQUN6QkEsS0FBS0Esa0JBQWtCQSxDQUFDQTtZQUN4QkEsS0FBS0EsTUFBTUEsQ0FBQ0E7WUFDWkEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsWUFBWUEsQ0FBQ0E7WUFDbEJBLEtBQUtBLGtCQUFrQkEsQ0FBQ0E7WUFDeEJBLEtBQUtBLE9BQU9BLENBQUNBO1lBQ2JBLEtBQUtBLFFBQVFBLENBQUNBO1lBQ2RBLEtBQUtBLFFBQVFBLENBQUNBO1lBQ2RBLEtBQUtBLFNBQVNBLENBQUNBO1lBQ2ZBLEtBQUtBLFNBQVNBLENBQUNBO1lBQ2ZBLEtBQUtBLFFBQVFBLENBQUNBO1lBQ2RBLEtBQUtBLFNBQVNBLENBQUNBO1lBQ2ZBLEtBQUtBLFNBQVNBLENBQUNBO1lBQ2ZBLEtBQUtBLFlBQVlBLENBQUNBO1lBQ2xCQSxLQUFLQSxhQUFhQSxDQUFDQTtZQUNuQkEsS0FBS0Esa0JBQWtCQSxDQUFDQTtZQUN4QkEsS0FBS0EsY0FBY0EsQ0FBQ0E7WUFDcEJBLEtBQUtBLFNBQVNBO2dCQUNaQSxlQUFlQSxHQUFHQSx3Q0FBcUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMzQ0EsS0FBS0EsQ0FBQ0E7WUFDUkE7Z0JBQ0VBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSxTQUFTQSxHQUFHQSw4QkFBOEJBLENBQUNBLENBQUNBO1FBQ3hFQSxDQUFDQTtRQUNEQSxJQUFJQSxnQkFBZ0JBLEdBQUdBLDZCQUFnQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDakRBLDZCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxRQUFRQSxFQUFFQSxlQUFlQSxDQUFDQSxDQUFDQTtRQUVsRUEseUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQTtZQUNyQ0EsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsbUJBQWFBLENBQUNBO1lBQ25FQSxjQUFjQSxFQUFFQSxZQUFZQTtZQUM1QkEsV0FBV0EsRUFBRUEsU0FBU0E7WUFDdEJBLFFBQVFBLEVBQUVBLGdCQUFnQkE7U0FDM0JBLENBQUNBLENBQUNBO1FBRUhBLDhGQUE4RkE7UUFDOUZBLHdGQUF3RkE7UUFDeEZBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2ZBLENBQUNBO0lBQ0hGLHNCQUFDQTtBQUFEQSxDQUFDQSxBQW5HRCxJQW1HQztBQW5HWSx1QkFBZSxrQkFtRzNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZW5kZXJWaWV3UmVmLFxuICBSZW5kZXJFdmVudERpc3BhdGNoZXIsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtTZXJpYWxpemVyfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtcbiAgc2VyaWFsaXplTW91c2VFdmVudCxcbiAgc2VyaWFsaXplS2V5Ym9hcmRFdmVudCxcbiAgc2VyaWFsaXplR2VuZXJpY0V2ZW50LFxuICBzZXJpYWxpemVFdmVudFdpdGhUYXJnZXRcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL2V2ZW50X3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZXhwb3J0IGNsYXNzIEV2ZW50RGlzcGF0Y2hlciBpbXBsZW1lbnRzIFJlbmRlckV2ZW50RGlzcGF0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdSZWY6IFJlbmRlclZpZXdSZWYsIHByaXZhdGUgX3Npbms6IEV2ZW50RW1pdHRlcjxhbnk+LFxuICAgICAgICAgICAgICBwcml2YXRlIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyKSB7fVxuXG4gIGRpc3BhdGNoUmVuZGVyRXZlbnQoZWxlbWVudEluZGV4OiBudW1iZXIsIGV2ZW50TmFtZTogc3RyaW5nLCBsb2NhbHM6IE1hcDxzdHJpbmcsIGFueT4pOiBib29sZWFuIHtcbiAgICB2YXIgZSA9IGxvY2Fscy5nZXQoJyRldmVudCcpO1xuICAgIHZhciBzZXJpYWxpemVkRXZlbnQ7XG4gICAgLy8gVE9ETyAoanRlcGxpdHo2MDIpOiBzdXBwb3J0IGN1c3RvbSBldmVudHMgIzMzNTBcbiAgICBzd2l0Y2ggKGUudHlwZSkge1xuICAgICAgY2FzZSBcImNsaWNrXCI6XG4gICAgICBjYXNlIFwibW91c2V1cFwiOlxuICAgICAgY2FzZSBcIm1vdXNlZG93blwiOlxuICAgICAgY2FzZSBcImRibGNsaWNrXCI6XG4gICAgICBjYXNlIFwiY29udGV4dG1lbnVcIjpcbiAgICAgIGNhc2UgXCJtb3VzZWVudGVyXCI6XG4gICAgICBjYXNlIFwibW91c2VsZWF2ZVwiOlxuICAgICAgY2FzZSBcIm1vdXNlbW92ZVwiOlxuICAgICAgY2FzZSBcIm1vdXNlb3V0XCI6XG4gICAgICBjYXNlIFwibW91c2VvdmVyXCI6XG4gICAgICBjYXNlIFwic2hvd1wiOlxuICAgICAgICBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVNb3VzZUV2ZW50KGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJrZXlkb3duXCI6XG4gICAgICBjYXNlIFwia2V5cHJlc3NcIjpcbiAgICAgIGNhc2UgXCJrZXl1cFwiOlxuICAgICAgICBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVLZXlib2FyZEV2ZW50KGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJpbnB1dFwiOlxuICAgICAgY2FzZSBcImNoYW5nZVwiOlxuICAgICAgY2FzZSBcImJsdXJcIjpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplRXZlbnRXaXRoVGFyZ2V0KGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJhYm9ydFwiOlxuICAgICAgY2FzZSBcImFmdGVycHJpbnRcIjpcbiAgICAgIGNhc2UgXCJiZWZvcmVwcmludFwiOlxuICAgICAgY2FzZSBcImNhY2hlZFwiOlxuICAgICAgY2FzZSBcImNhbnBsYXlcIjpcbiAgICAgIGNhc2UgXCJjYW5wbGF5dGhyb3VnaFwiOlxuICAgICAgY2FzZSBcImNoYXJnaW5nY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiY2hhcmdpbmd0aW1lY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiY2xvc2VcIjpcbiAgICAgIGNhc2UgXCJkaXNjaGFyZ2luZ3RpbWVjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJET01Db250ZW50TG9hZGVkXCI6XG4gICAgICBjYXNlIFwiZG93bmxvYWRpbmdcIjpcbiAgICAgIGNhc2UgXCJkdXJhdGlvbmNoYW5nZVwiOlxuICAgICAgY2FzZSBcImVtcHRpZWRcIjpcbiAgICAgIGNhc2UgXCJlbmRlZFwiOlxuICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICBjYXNlIFwiZnVsbHNjcmVlbmNoYW5nZVwiOlxuICAgICAgY2FzZSBcImZ1bGxzY3JlZW5lcnJvclwiOlxuICAgICAgY2FzZSBcImludmFsaWRcIjpcbiAgICAgIGNhc2UgXCJsYW5ndWFnZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcImxldmVsZmNoYW5nZVwiOlxuICAgICAgY2FzZSBcImxvYWRlZGRhdGFcIjpcbiAgICAgIGNhc2UgXCJsb2FkZWRtZXRhZGF0YVwiOlxuICAgICAgY2FzZSBcIm9ic29sZXRlXCI6XG4gICAgICBjYXNlIFwib2ZmbGluZVwiOlxuICAgICAgY2FzZSBcIm9ubGluZVwiOlxuICAgICAgY2FzZSBcIm9wZW5cIjpcbiAgICAgIGNhc2UgXCJvcmllbnRhdG9pbmNoYW5nZVwiOlxuICAgICAgY2FzZSBcInBhdXNlXCI6XG4gICAgICBjYXNlIFwicG9pbnRlcmxvY2tjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJwb2ludGVybG9ja2Vycm9yXCI6XG4gICAgICBjYXNlIFwicGxheVwiOlxuICAgICAgY2FzZSBcInBsYXlpbmdcIjpcbiAgICAgIGNhc2UgXCJyYXRlY2hhbmdlXCI6XG4gICAgICBjYXNlIFwicmVhZHlzdGF0ZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcInJlc2V0XCI6XG4gICAgICBjYXNlIFwic2Nyb2xsXCI6XG4gICAgICBjYXNlIFwic2Vla2VkXCI6XG4gICAgICBjYXNlIFwic2Vla2luZ1wiOlxuICAgICAgY2FzZSBcInN0YWxsZWRcIjpcbiAgICAgIGNhc2UgXCJzdWJtaXRcIjpcbiAgICAgIGNhc2UgXCJzdWNjZXNzXCI6XG4gICAgICBjYXNlIFwic3VzcGVuZFwiOlxuICAgICAgY2FzZSBcInRpbWV1cGRhdGVcIjpcbiAgICAgIGNhc2UgXCJ1cGRhdGVyZWFkeVwiOlxuICAgICAgY2FzZSBcInZpc2liaWxpdHljaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJ2b2x1bWVjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJ3YWl0aW5nXCI6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZUdlbmVyaWNFdmVudChlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihldmVudE5hbWUgKyBcIiBub3Qgc3VwcG9ydGVkIG9uIFdlYldvcmtlcnNcIik7XG4gICAgfVxuICAgIHZhciBzZXJpYWxpemVkTG9jYWxzID0gU3RyaW5nTWFwV3JhcHBlci5jcmVhdGUoKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChzZXJpYWxpemVkTG9jYWxzLCAnJGV2ZW50Jywgc2VyaWFsaXplZEV2ZW50KTtcblxuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3NpbmssIHtcbiAgICAgIFwidmlld1JlZlwiOiB0aGlzLl9zZXJpYWxpemVyLnNlcmlhbGl6ZSh0aGlzLl92aWV3UmVmLCBSZW5kZXJWaWV3UmVmKSxcbiAgICAgIFwiZWxlbWVudEluZGV4XCI6IGVsZW1lbnRJbmRleCxcbiAgICAgIFwiZXZlbnROYW1lXCI6IGV2ZW50TmFtZSxcbiAgICAgIFwibG9jYWxzXCI6IHNlcmlhbGl6ZWRMb2NhbHNcbiAgICB9KTtcblxuICAgIC8vIFRPRE8oa2VnbHVuZXEpOiBFdmVudHVhbGx5LCB3ZSB3YW50IHRoZSB1c2VyIHRvIGluZGljYXRlIGZyb20gdGhlIFVJIHNpZGUgd2hldGhlciB0aGUgZXZlbnRcbiAgICAvLyBzaG91bGQgYmUgY2FuY2VsZWQsIGJ1dCBmb3Igbm93IGp1c3QgY2FsbCBgcHJldmVudERlZmF1bHRgIG9uIHRoZSBvcmlnaW5hbCBET00gZXZlbnQuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=