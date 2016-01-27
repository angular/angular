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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9ldmVudF9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbIkV2ZW50RGlzcGF0Y2hlciIsIkV2ZW50RGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsIkV2ZW50RGlzcGF0Y2hlci5kaXNwYXRjaFJlbmRlckV2ZW50Il0sIm1hcHBpbmdzIjoiQUFBQSwyQkFBNEMsNENBQTRDLENBQUMsQ0FBQTtBQUN6RixpQ0FLTyw4Q0FBOEMsQ0FBQyxDQUFBO0FBQ3RELDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRS9FLHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBRTFFO0lBQ0VBLHlCQUFvQkEsS0FBd0JBLEVBQVVBLFdBQXVCQTtRQUF6REMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBbUJBO1FBQVVBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFZQTtJQUFHQSxDQUFDQTtJQUVqRkQsNkNBQW1CQSxHQUFuQkEsVUFBb0JBLE9BQVlBLEVBQUVBLFdBQW1CQSxFQUFFQSxTQUFpQkEsRUFBRUEsS0FBVUE7UUFDbEZFLElBQUlBLGVBQWVBLENBQUNBO1FBQ3BCQSxrREFBa0RBO1FBQ2xEQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsS0FBS0EsT0FBT0EsQ0FBQ0E7WUFDYkEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsV0FBV0EsQ0FBQ0E7WUFDakJBLEtBQUtBLFVBQVVBLENBQUNBO1lBQ2hCQSxLQUFLQSxhQUFhQSxDQUFDQTtZQUNuQkEsS0FBS0EsWUFBWUEsQ0FBQ0E7WUFDbEJBLEtBQUtBLFlBQVlBLENBQUNBO1lBQ2xCQSxLQUFLQSxXQUFXQSxDQUFDQTtZQUNqQkEsS0FBS0EsVUFBVUEsQ0FBQ0E7WUFDaEJBLEtBQUtBLFdBQVdBLENBQUNBO1lBQ2pCQSxLQUFLQSxNQUFN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QSxTQUFTQSxDQUFDQSxPQUFPQSxFQUFFQSw4QkFBaUJBLENBQUNBO1lBQ2pFQSxXQUFXQSxFQUFFQSxTQUFTQTtZQUN0QkEsYUFBYUEsRUFBRUEsV0FBV0E7WUFDMUJBLE9BQU9BLEVBQUVBLGVBQWVBO1NBQ3pCQSxDQUFDQSxDQUFDQTtRQUVIQSw4RkFBOEZBO1FBQzlGQSx3RkFBd0ZBO1FBQ3hGQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUNmQSxDQUFDQTtJQUNIRixzQkFBQ0E7QUFBREEsQ0FBQ0EsQUE5RkQsSUE4RkM7QUE5RlksdUJBQWUsa0JBOEYzQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTZXJpYWxpemVyLCBSZW5kZXJTdG9yZU9iamVjdH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyJztcbmltcG9ydCB7XG4gIHNlcmlhbGl6ZU1vdXNlRXZlbnQsXG4gIHNlcmlhbGl6ZUtleWJvYXJkRXZlbnQsXG4gIHNlcmlhbGl6ZUdlbmVyaWNFdmVudCxcbiAgc2VyaWFsaXplRXZlbnRXaXRoVGFyZ2V0XG59IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9ldmVudF9zZXJpYWxpemVyJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmV4cG9ydCBjbGFzcyBFdmVudERpc3BhdGNoZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9zaW5rOiBFdmVudEVtaXR0ZXI8YW55PiwgcHJpdmF0ZSBfc2VyaWFsaXplcjogU2VyaWFsaXplcikge31cblxuICBkaXNwYXRjaFJlbmRlckV2ZW50KGVsZW1lbnQ6IGFueSwgZXZlbnRUYXJnZXQ6IHN0cmluZywgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBib29sZWFuIHtcbiAgICB2YXIgc2VyaWFsaXplZEV2ZW50O1xuICAgIC8vIFRPRE8gKGp0ZXBsaXR6NjAyKTogc3VwcG9ydCBjdXN0b20gZXZlbnRzICMzMzUwXG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgICBjYXNlIFwiY2xpY2tcIjpcbiAgICAgIGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgICBjYXNlIFwibW91c2Vkb3duXCI6XG4gICAgICBjYXNlIFwiZGJsY2xpY2tcIjpcbiAgICAgIGNhc2UgXCJjb250ZXh0bWVudVwiOlxuICAgICAgY2FzZSBcIm1vdXNlZW50ZXJcIjpcbiAgICAgIGNhc2UgXCJtb3VzZWxlYXZlXCI6XG4gICAgICBjYXNlIFwibW91c2Vtb3ZlXCI6XG4gICAgICBjYXNlIFwibW91c2VvdXRcIjpcbiAgICAgIGNhc2UgXCJtb3VzZW92ZXJcIjpcbiAgICAgIGNhc2UgXCJzaG93XCI6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZU1vdXNlRXZlbnQoZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJrZXlkb3duXCI6XG4gICAgICBjYXNlIFwia2V5cHJlc3NcIjpcbiAgICAgIGNhc2UgXCJrZXl1cFwiOlxuICAgICAgICBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVLZXlib2FyZEV2ZW50KGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiaW5wdXRcIjpcbiAgICAgIGNhc2UgXCJjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJibHVyXCI6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZUV2ZW50V2l0aFRhcmdldChldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImFib3J0XCI6XG4gICAgICBjYXNlIFwiYWZ0ZXJwcmludFwiOlxuICAgICAgY2FzZSBcImJlZm9yZXByaW50XCI6XG4gICAgICBjYXNlIFwiY2FjaGVkXCI6XG4gICAgICBjYXNlIFwiY2FucGxheVwiOlxuICAgICAgY2FzZSBcImNhbnBsYXl0aHJvdWdoXCI6XG4gICAgICBjYXNlIFwiY2hhcmdpbmdjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJjaGFyZ2luZ3RpbWVjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJjbG9zZVwiOlxuICAgICAgY2FzZSBcImRpc2NoYXJnaW5ndGltZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcIkRPTUNvbnRlbnRMb2FkZWRcIjpcbiAgICAgIGNhc2UgXCJkb3dubG9hZGluZ1wiOlxuICAgICAgY2FzZSBcImR1cmF0aW9uY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiZW1wdGllZFwiOlxuICAgICAgY2FzZSBcImVuZGVkXCI6XG4gICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgIGNhc2UgXCJmdWxsc2NyZWVuY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiZnVsbHNjcmVlbmVycm9yXCI6XG4gICAgICBjYXNlIFwiaW52YWxpZFwiOlxuICAgICAgY2FzZSBcImxhbmd1YWdlY2hhbmdlXCI6XG4gICAgICBjYXNlIFwibGV2ZWxmY2hhbmdlXCI6XG4gICAgICBjYXNlIFwibG9hZGVkZGF0YVwiOlxuICAgICAgY2FzZSBcImxvYWRlZG1ldGFkYXRhXCI6XG4gICAgICBjYXNlIFwib2Jzb2xldGVcIjpcbiAgICAgIGNhc2UgXCJvZmZsaW5lXCI6XG4gICAgICBjYXNlIFwib25saW5lXCI6XG4gICAgICBjYXNlIFwib3BlblwiOlxuICAgICAgY2FzZSBcIm9yaWVudGF0b2luY2hhbmdlXCI6XG4gICAgICBjYXNlIFwicGF1c2VcIjpcbiAgICAgIGNhc2UgXCJwb2ludGVybG9ja2NoYW5nZVwiOlxuICAgICAgY2FzZSBcInBvaW50ZXJsb2NrZXJyb3JcIjpcbiAgICAgIGNhc2UgXCJwbGF5XCI6XG4gICAgICBjYXNlIFwicGxheWluZ1wiOlxuICAgICAgY2FzZSBcInJhdGVjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJyZWFkeXN0YXRlY2hhbmdlXCI6XG4gICAgICBjYXNlIFwicmVzZXRcIjpcbiAgICAgIGNhc2UgXCJzY3JvbGxcIjpcbiAgICAgIGNhc2UgXCJzZWVrZWRcIjpcbiAgICAgIGNhc2UgXCJzZWVraW5nXCI6XG4gICAgICBjYXNlIFwic3RhbGxlZFwiOlxuICAgICAgY2FzZSBcInN1Ym1pdFwiOlxuICAgICAgY2FzZSBcInN1Y2Nlc3NcIjpcbiAgICAgIGNhc2UgXCJzdXNwZW5kXCI6XG4gICAgICBjYXNlIFwidGltZXVwZGF0ZVwiOlxuICAgICAgY2FzZSBcInVwZGF0ZXJlYWR5XCI6XG4gICAgICBjYXNlIFwidmlzaWJpbGl0eWNoYW5nZVwiOlxuICAgICAgY2FzZSBcInZvbHVtZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcIndhaXRpbmdcIjpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplR2VuZXJpY0V2ZW50KGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihldmVudE5hbWUgKyBcIiBub3Qgc3VwcG9ydGVkIG9uIFdlYldvcmtlcnNcIik7XG4gICAgfVxuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3NpbmssIHtcbiAgICAgIFwiZWxlbWVudFwiOiB0aGlzLl9zZXJpYWxpemVyLnNlcmlhbGl6ZShlbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBcImV2ZW50TmFtZVwiOiBldmVudE5hbWUsXG4gICAgICBcImV2ZW50VGFyZ2V0XCI6IGV2ZW50VGFyZ2V0LFxuICAgICAgXCJldmVudFwiOiBzZXJpYWxpemVkRXZlbnRcbiAgICB9KTtcblxuICAgIC8vIFRPRE8oa2VnbHVuZXEpOiBFdmVudHVhbGx5LCB3ZSB3YW50IHRoZSB1c2VyIHRvIGluZGljYXRlIGZyb20gdGhlIFVJIHNpZGUgd2hldGhlciB0aGUgZXZlbnRcbiAgICAvLyBzaG91bGQgYmUgY2FuY2VsZWQsIGJ1dCBmb3Igbm93IGp1c3QgY2FsbCBgcHJldmVudERlZmF1bHRgIG9uIHRoZSBvcmlnaW5hbCBET00gZXZlbnQuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=