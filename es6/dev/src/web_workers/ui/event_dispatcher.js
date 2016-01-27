import { RenderStoreObject } from 'angular2/src/web_workers/shared/serializer';
import { serializeMouseEvent, serializeKeyboardEvent, serializeGenericEvent, serializeEventWithTarget, serializeTransitionEvent } from 'angular2/src/web_workers/ui/event_serializer';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ObservableWrapper } from 'angular2/src/facade/async';
export class EventDispatcher {
    constructor(_sink, _serializer) {
        this._sink = _sink;
        this._serializer = _serializer;
    }
    dispatchRenderEvent(element, eventTarget, eventName, event) {
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
                serializedEvent = serializeMouseEvent(event);
                break;
            case "keydown":
            case "keypress":
            case "keyup":
                serializedEvent = serializeKeyboardEvent(event);
                break;
            case "input":
            case "change":
            case "blur":
                serializedEvent = serializeEventWithTarget(event);
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
                serializedEvent = serializeGenericEvent(event);
                break;
            case "transitionend":
                serializedEvent = serializeTransitionEvent(event);
                break;
            default:
                throw new BaseException(eventName + " not supported on WebWorkers");
        }
        ObservableWrapper.callEmit(this._sink, {
            "element": this._serializer.serialize(element, RenderStoreObject),
            "eventName": eventName,
            "eventTarget": eventTarget,
            "event": serializedEvent
        });
        // TODO(kegluneq): Eventually, we want the user to indicate from the UI side whether the event
        // should be canceled, but for now just call `preventDefault` on the original DOM event.
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9ldmVudF9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbIkV2ZW50RGlzcGF0Y2hlciIsIkV2ZW50RGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsIkV2ZW50RGlzcGF0Y2hlci5kaXNwYXRjaFJlbmRlckV2ZW50Il0sIm1hcHBpbmdzIjoiT0FBTyxFQUFhLGlCQUFpQixFQUFDLE1BQU0sNENBQTRDO09BQ2pGLEVBQ0wsbUJBQW1CLEVBQ25CLHNCQUFzQixFQUN0QixxQkFBcUIsRUFDckIsd0JBQXdCLEVBQ3hCLHdCQUF3QixFQUN6QixNQUFNLDhDQUE4QztPQUM5QyxFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FFdkUsRUFBZSxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQjtBQUV6RTtJQUNFQSxZQUFvQkEsS0FBd0JBLEVBQVVBLFdBQXVCQTtRQUF6REMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBbUJBO1FBQVVBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFZQTtJQUFHQSxDQUFDQTtJQUVqRkQsbUJBQW1CQSxDQUFDQSxPQUFZQSxFQUFFQSxXQUFtQkEsRUFBRUEsU0FBaUJBLEVBQUVBLEtBQVVBO1FBQ2xGRSxJQUFJQSxlQUFlQSxDQUFDQTtRQUNwQkEsa0RBQWtEQTtRQUNsREEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLEtBQUtBLE9BQU9BLENBQUNBO1lBQ2JBLEtBQUtBLFNBQVNBLENBQUNBO1lBQ2ZBLEtBQUtBLFdBQVdBLENBQUNBO1lBQ2pCQSxLQUFLQSxVQUFVQSxDQUFDQTtZQUNoQkEsS0FBS0EsYUFBYUEsQ0FBQ0E7WUFDbkJBLEtBQUtBLFlBQVlBLENBQUNBO1lBQ2xCQSxLQUFLQSxZQUFZQSxDQUFDQTtZQUNsQkEsS0FBS0EsV0FBV0EsQ0FBQ0E7WUFD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QUFhQSxDQUFDQSxTQUFTQSxHQUFHQSw4QkFBOEJBLENBQUNBLENBQUNBO1FBQ3hFQSxDQUFDQTtRQUNEQSxpQkFBaUJBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBO1lBQ3JDQSxTQUFTQSxFQUFFQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxFQUFFQSxpQkFBaUJBLENBQUNBO1lBQ2pFQSxXQUFXQSxFQUFFQSxTQUFTQTtZQUN0QkEsYUFBYUEsRUFBRUEsV0FBV0E7WUFDMUJBLE9BQU9BLEVBQUVBLGVBQWVBO1NBQ3pCQSxDQUFDQSxDQUFDQTtRQUVIQSw4RkFBOEZBO1FBQzlGQSx3RkFBd0ZBO1FBQ3hGQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUNmQSxDQUFDQTtBQUNIRixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTZXJpYWxpemVyLCBSZW5kZXJTdG9yZU9iamVjdH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyJztcbmltcG9ydCB7XG4gIHNlcmlhbGl6ZU1vdXNlRXZlbnQsXG4gIHNlcmlhbGl6ZUtleWJvYXJkRXZlbnQsXG4gIHNlcmlhbGl6ZUdlbmVyaWNFdmVudCxcbiAgc2VyaWFsaXplRXZlbnRXaXRoVGFyZ2V0LFxuICBzZXJpYWxpemVUcmFuc2l0aW9uRXZlbnRcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL2V2ZW50X3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZXhwb3J0IGNsYXNzIEV2ZW50RGlzcGF0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Npbms6IEV2ZW50RW1pdHRlcjxhbnk+LCBwcml2YXRlIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyKSB7fVxuXG4gIGRpc3BhdGNoUmVuZGVyRXZlbnQoZWxlbWVudDogYW55LCBldmVudFRhcmdldDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIHZhciBzZXJpYWxpemVkRXZlbnQ7XG4gICAgLy8gVE9ETyAoanRlcGxpdHo2MDIpOiBzdXBwb3J0IGN1c3RvbSBldmVudHMgIzMzNTBcbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgXCJjbGlja1wiOlxuICAgICAgY2FzZSBcIm1vdXNldXBcIjpcbiAgICAgIGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICAgIGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgY2FzZSBcImNvbnRleHRtZW51XCI6XG4gICAgICBjYXNlIFwibW91c2VlbnRlclwiOlxuICAgICAgY2FzZSBcIm1vdXNlbGVhdmVcIjpcbiAgICAgIGNhc2UgXCJtb3VzZW1vdmVcIjpcbiAgICAgIGNhc2UgXCJtb3VzZW91dFwiOlxuICAgICAgY2FzZSBcIm1vdXNlb3ZlclwiOlxuICAgICAgY2FzZSBcInNob3dcIjpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplTW91c2VFdmVudChldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImtleWRvd25cIjpcbiAgICAgIGNhc2UgXCJrZXlwcmVzc1wiOlxuICAgICAgY2FzZSBcImtleXVwXCI6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZUtleWJvYXJkRXZlbnQoZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJpbnB1dFwiOlxuICAgICAgY2FzZSBcImNoYW5nZVwiOlxuICAgICAgY2FzZSBcImJsdXJcIjpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplRXZlbnRXaXRoVGFyZ2V0KGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiYWJvcnRcIjpcbiAgICAgIGNhc2UgXCJhZnRlcnByaW50XCI6XG4gICAgICBjYXNlIFwiYmVmb3JlcHJpbnRcIjpcbiAgICAgIGNhc2UgXCJjYWNoZWRcIjpcbiAgICAgIGNhc2UgXCJjYW5wbGF5XCI6XG4gICAgICBjYXNlIFwiY2FucGxheXRocm91Z2hcIjpcbiAgICAgIGNhc2UgXCJjaGFyZ2luZ2NoYW5nZVwiOlxuICAgICAgY2FzZSBcImNoYXJnaW5ndGltZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcImNsb3NlXCI6XG4gICAgICBjYXNlIFwiZGlzY2hhcmdpbmd0aW1lY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiRE9NQ29udGVudExvYWRlZFwiOlxuICAgICAgY2FzZSBcImRvd25sb2FkaW5nXCI6XG4gICAgICBjYXNlIFwiZHVyYXRpb25jaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJlbXB0aWVkXCI6XG4gICAgICBjYXNlIFwiZW5kZWRcIjpcbiAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgY2FzZSBcImZ1bGxzY3JlZW5jaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJmdWxsc2NyZWVuZXJyb3JcIjpcbiAgICAgIGNhc2UgXCJpbnZhbGlkXCI6XG4gICAgICBjYXNlIFwibGFuZ3VhZ2VjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJsZXZlbGZjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJsb2FkZWRkYXRhXCI6XG4gICAgICBjYXNlIFwibG9hZGVkbWV0YWRhdGFcIjpcbiAgICAgIGNhc2UgXCJvYnNvbGV0ZVwiOlxuICAgICAgY2FzZSBcIm9mZmxpbmVcIjpcbiAgICAgIGNhc2UgXCJvbmxpbmVcIjpcbiAgICAgIGNhc2UgXCJvcGVuXCI6XG4gICAgICBjYXNlIFwib3JpZW50YXRvaW5jaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJwYXVzZVwiOlxuICAgICAgY2FzZSBcInBvaW50ZXJsb2NrY2hhbmdlXCI6XG4gICAgICBjYXNlIFwicG9pbnRlcmxvY2tlcnJvclwiOlxuICAgICAgY2FzZSBcInBsYXlcIjpcbiAgICAgIGNhc2UgXCJwbGF5aW5nXCI6XG4gICAgICBjYXNlIFwicmF0ZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcInJlYWR5c3RhdGVjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJyZXNldFwiOlxuICAgICAgY2FzZSBcInNjcm9sbFwiOlxuICAgICAgY2FzZSBcInNlZWtlZFwiOlxuICAgICAgY2FzZSBcInNlZWtpbmdcIjpcbiAgICAgIGNhc2UgXCJzdGFsbGVkXCI6XG4gICAgICBjYXNlIFwic3VibWl0XCI6XG4gICAgICBjYXNlIFwic3VjY2Vzc1wiOlxuICAgICAgY2FzZSBcInN1c3BlbmRcIjpcbiAgICAgIGNhc2UgXCJ0aW1ldXBkYXRlXCI6XG4gICAgICBjYXNlIFwidXBkYXRlcmVhZHlcIjpcbiAgICAgIGNhc2UgXCJ2aXNpYmlsaXR5Y2hhbmdlXCI6XG4gICAgICBjYXNlIFwidm9sdW1lY2hhbmdlXCI6XG4gICAgICBjYXNlIFwid2FpdGluZ1wiOlxuICAgICAgICBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVHZW5lcmljRXZlbnQoZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJ0cmFuc2l0aW9uZW5kXCI6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZVRyYW5zaXRpb25FdmVudChldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oZXZlbnROYW1lICsgXCIgbm90IHN1cHBvcnRlZCBvbiBXZWJXb3JrZXJzXCIpO1xuICAgIH1cbiAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLl9zaW5rLCB7XG4gICAgICBcImVsZW1lbnRcIjogdGhpcy5fc2VyaWFsaXplci5zZXJpYWxpemUoZWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgXCJldmVudE5hbWVcIjogZXZlbnROYW1lLFxuICAgICAgXCJldmVudFRhcmdldFwiOiBldmVudFRhcmdldCxcbiAgICAgIFwiZXZlbnRcIjogc2VyaWFsaXplZEV2ZW50XG4gICAgfSk7XG5cbiAgICAvLyBUT0RPKGtlZ2x1bmVxKTogRXZlbnR1YWxseSwgd2Ugd2FudCB0aGUgdXNlciB0byBpbmRpY2F0ZSBmcm9tIHRoZSBVSSBzaWRlIHdoZXRoZXIgdGhlIGV2ZW50XG4gICAgLy8gc2hvdWxkIGJlIGNhbmNlbGVkLCBidXQgZm9yIG5vdyBqdXN0IGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiB0aGUgb3JpZ2luYWwgRE9NIGV2ZW50LlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19