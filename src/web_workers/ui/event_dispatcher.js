'use strict';var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var event_serializer_1 = require('angular2/src/web_workers/ui/event_serializer');
var exceptions_1 = require('angular2/src/facade/exceptions');
var async_1 = require('angular2/src/facade/async');
var EventDispatcher = (function () {
    function EventDispatcher(_sink, _serializer) {
        this._sink = _sink;
        this._serializer = _serializer;
    }
    EventDispatcher.prototype.dispatchRenderEvent = function (element, eventTarget, eventName, event) {
        var serializedEvent;
        // TODO (jteplitz602): support custom events #3350
        switch (event.type) {
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
                serializedEvent = event_serializer_1.serializeMouseEvent(event);
                break;
            case "keydown":
            case "keypress":
            case "keyup":
                serializedEvent = event_serializer_1.serializeKeyboardEvent(event);
                break;
            case "input":
            case "change":
            case "blur":
                serializedEvent = event_serializer_1.serializeEventWithTarget(event);
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
                serializedEvent = event_serializer_1.serializeGenericEvent(event);
                break;
            case "transitionend":
                serializedEvent = event_serializer_1.serializeTransitionEvent(event);
                break;
            default:
                throw new exceptions_1.BaseException(eventName + " not supported on WebWorkers");
        }
        async_1.ObservableWrapper.callEmit(this._sink, {
            "element": this._serializer.serialize(element, serializer_1.RenderStoreObject),
            "eventName": eventName,
            "eventTarget": eventTarget,
            "event": serializedEvent
        });
        // TODO(kegluneq): Eventually, we want the user to indicate from the UI side whether the event
        // should be canceled, but for now just call `preventDefault` on the original DOM event.
        return false;
    };
    return EventDispatcher;
})();
exports.EventDispatcher = EventDispatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9ldmVudF9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbIkV2ZW50RGlzcGF0Y2hlciIsIkV2ZW50RGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsIkV2ZW50RGlzcGF0Y2hlci5kaXNwYXRjaFJlbmRlckV2ZW50Il0sIm1hcHBpbmdzIjoiQUFBQSwyQkFBNEMsNENBQTRDLENBQUMsQ0FBQTtBQUN6RixpQ0FNTyw4Q0FBOEMsQ0FBQyxDQUFBO0FBQ3RELDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRS9FLHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBRTFFO0lBQ0VBLHlCQUFvQkEsS0FBd0JBLEVBQVVBLFdBQXVCQTtRQUF6REMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBbUJBO1FBQVVBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFZQTtJQUFHQSxDQUFDQTtJQUVqRkQsNkNBQW1CQSxHQUFuQkEsVUFBb0JBLE9BQVlBLEVBQUVBLFdBQW1CQSxFQUFFQSxTQUFpQkEsRUFBRUEsS0FBVUE7UUFDbEZFLElBQUlBLGVBQWVBLENBQUNBO1FBQ3BCQSxrREFBa0RBO1FBQ2xEQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsS0FBS0EsT0FBT0EsQ0FBQ0E7WUFDYkEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsV0FBV0EsQ0FBQ0E7WUFDakJBLEtBQUtBLFVBQVVBLENBQUNBO1lBQ2hCQSxLQUFLQSxhQUFhQSxDQUFDQTtZQUNuQkEsS0FBS0EsWUFBWUEsQ0FBQ0E7WUFDbEJBLEtBQUtBLFlBQVlBLENBQUNBO1lBQ2xCQSxLQUFLQSxXQUFXQSxDQUFDQTtZQUNqQkEsS0FBS0EsVUFBVUEsQ0FBQ0E7WUFDaEJBLEtBQUtBLFdBQVdBLENBQUNBO1lBQ2pCQSxLQUFLQSxNQUFN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QkFBaUJBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBO1lBQ3JDQSxTQUFTQSxFQUFFQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxFQUFFQSw4QkFBaUJBLENBQUNBO1lBQ2pFQSxXQUFXQSxFQUFFQSxTQUFTQTtZQUN0QkEsYUFBYUEsRUFBRUEsV0FBV0E7WUFDMUJBLE9BQU9BLEVBQUVBLGVBQWVBO1NBQ3pCQSxDQUFDQSxDQUFDQTtRQUVIQSw4RkFBOEZBO1FBQzlGQSx3RkFBd0ZBO1FBQ3hGQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUNmQSxDQUFDQTtJQUNIRixzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFqR0QsSUFpR0M7QUFqR1ksdUJBQWUsa0JBaUczQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTZXJpYWxpemVyLCBSZW5kZXJTdG9yZU9iamVjdH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyJztcbmltcG9ydCB7XG4gIHNlcmlhbGl6ZU1vdXNlRXZlbnQsXG4gIHNlcmlhbGl6ZUtleWJvYXJkRXZlbnQsXG4gIHNlcmlhbGl6ZUdlbmVyaWNFdmVudCxcbiAgc2VyaWFsaXplRXZlbnRXaXRoVGFyZ2V0LFxuICBzZXJpYWxpemVUcmFuc2l0aW9uRXZlbnRcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL2V2ZW50X3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZXhwb3J0IGNsYXNzIEV2ZW50RGlzcGF0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Npbms6IEV2ZW50RW1pdHRlcjxhbnk+LCBwcml2YXRlIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyKSB7fVxuXG4gIGRpc3BhdGNoUmVuZGVyRXZlbnQoZWxlbWVudDogYW55LCBldmVudFRhcmdldDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIHZhciBzZXJpYWxpemVkRXZlbnQ7XG4gICAgLy8gVE9ETyAoanRlcGxpdHo2MDIpOiBzdXBwb3J0IGN1c3RvbSBldmVudHMgIzMzNTBcbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgXCJjbGlja1wiOlxuICAgICAgY2FzZSBcIm1vdXNldXBcIjpcbiAgICAgIGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICAgIGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgY2FzZSBcImNvbnRleHRtZW51XCI6XG4gICAgICBjYXNlIFwibW91c2VlbnRlclwiOlxuICAgICAgY2FzZSBcIm1vdXNlbGVhdmVcIjpcbiAgICAgIGNhc2UgXCJtb3VzZW1vdmVcIjpcbiAgICAgIGNhc2UgXCJtb3VzZW91dFwiOlxuICAgICAgY2FzZSBcIm1vdXNlb3ZlclwiOlxuICAgICAgY2FzZSBcInNob3dcIjpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplTW91c2VFdmVudChldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImtleWRvd25cIjpcbiAgICAgIGNhc2UgXCJrZXlwcmVzc1wiOlxuICAgICAgY2FzZSBcImtleXVwXCI6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZUtleWJvYXJkRXZlbnQoZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJpbnB1dFwiOlxuICAgICAgY2FzZSBcImNoYW5nZVwiOlxuICAgICAgY2FzZSBcImJsdXJcIjpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplRXZlbnRXaXRoVGFyZ2V0KGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiYWJvcnRcIjpcbiAgICAgIGNhc2UgXCJhZnRlcnByaW50XCI6XG4gICAgICBjYXNlIFwiYmVmb3JlcHJpbnRcIjpcbiAgICAgIGNhc2UgXCJjYWNoZWRcIjpcbiAgICAgIGNhc2UgXCJjYW5wbGF5XCI6XG4gICAgICBjYXNlIFwiY2FucGxheXRocm91Z2hcIjpcbiAgICAgIGNhc2UgXCJjaGFyZ2luZ2NoYW5nZVwiOlxuICAgICAgY2FzZSBcImNoYXJnaW5ndGltZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcImNsb3NlXCI6XG4gICAgICBjYXNlIFwiZGlzY2hhcmdpbmd0aW1lY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiRE9NQ29udGVudExvYWRlZFwiOlxuICAgICAgY2FzZSBcImRvd25sb2FkaW5nXCI6XG4gICAgICBjYXNlIFwiZHVyYXRpb25jaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJlbXB0aWVkXCI6XG4gICAgICBjYXNlIFwiZW5kZWRcIjpcbiAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgY2FzZSBcImZ1bGxzY3JlZW5jaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJmdWxsc2NyZWVuZXJyb3JcIjpcbiAgICAgIGNhc2UgXCJpbnZhbGlkXCI6XG4gICAgICBjYXNlIFwibGFuZ3VhZ2VjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJsZXZlbGZjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJsb2FkZWRkYXRhXCI6XG4gICAgICBjYXNlIFwibG9hZGVkbWV0YWRhdGFcIjpcbiAgICAgIGNhc2UgXCJvYnNvbGV0ZVwiOlxuICAgICAgY2FzZSBcIm9mZmxpbmVcIjpcbiAgICAgIGNhc2UgXCJvbmxpbmVcIjpcbiAgICAgIGNhc2UgXCJvcGVuXCI6XG4gICAgICBjYXNlIFwib3JpZW50YXRvaW5jaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJwYXVzZVwiOlxuICAgICAgY2FzZSBcInBvaW50ZXJsb2NrY2hhbmdlXCI6XG4gICAgICBjYXNlIFwicG9pbnRlcmxvY2tlcnJvclwiOlxuICAgICAgY2FzZSBcInBsYXlcIjpcbiAgICAgIGNhc2UgXCJwbGF5aW5nXCI6XG4gICAgICBjYXNlIFwicmF0ZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcInJlYWR5c3RhdGVjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJyZXNldFwiOlxuICAgICAgY2FzZSBcInNjcm9sbFwiOlxuICAgICAgY2FzZSBcInNlZWtlZFwiOlxuICAgICAgY2FzZSBcInNlZWtpbmdcIjpcbiAgICAgIGNhc2UgXCJzdGFsbGVkXCI6XG4gICAgICBjYXNlIFwic3VibWl0XCI6XG4gICAgICBjYXNlIFwic3VjY2Vzc1wiOlxuICAgICAgY2FzZSBcInN1c3BlbmRcIjpcbiAgICAgIGNhc2UgXCJ0aW1ldXBkYXRlXCI6XG4gICAgICBjYXNlIFwidXBkYXRlcmVhZHlcIjpcbiAgICAgIGNhc2UgXCJ2aXNpYmlsaXR5Y2hhbmdlXCI6XG4gICAgICBjYXNlIFwidm9sdW1lY2hhbmdlXCI6XG4gICAgICBjYXNlIFwid2FpdGluZ1wiOlxuICAgICAgICBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVHZW5lcmljRXZlbnQoZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJ0cmFuc2l0aW9uZW5kXCI6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZVRyYW5zaXRpb25FdmVudChldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oZXZlbnROYW1lICsgXCIgbm90IHN1cHBvcnRlZCBvbiBXZWJXb3JrZXJzXCIpO1xuICAgIH1cbiAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLl9zaW5rLCB7XG4gICAgICBcImVsZW1lbnRcIjogdGhpcy5fc2VyaWFsaXplci5zZXJpYWxpemUoZWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgXCJldmVudE5hbWVcIjogZXZlbnROYW1lLFxuICAgICAgXCJldmVudFRhcmdldFwiOiBldmVudFRhcmdldCxcbiAgICAgIFwiZXZlbnRcIjogc2VyaWFsaXplZEV2ZW50XG4gICAgfSk7XG5cbiAgICAvLyBUT0RPKGtlZ2x1bmVxKTogRXZlbnR1YWxseSwgd2Ugd2FudCB0aGUgdXNlciB0byBpbmRpY2F0ZSBmcm9tIHRoZSBVSSBzaWRlIHdoZXRoZXIgdGhlIGV2ZW50XG4gICAgLy8gc2hvdWxkIGJlIGNhbmNlbGVkLCBidXQgZm9yIG5vdyBqdXN0IGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiB0aGUgb3JpZ2luYWwgRE9NIGV2ZW50LlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19