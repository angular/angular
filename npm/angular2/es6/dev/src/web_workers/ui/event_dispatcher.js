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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9ldmVudF9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQWEsaUJBQWlCLEVBQUMsTUFBTSw0Q0FBNEM7T0FDakYsRUFDTCxtQkFBbUIsRUFDbkIsc0JBQXNCLEVBQ3RCLHFCQUFxQixFQUNyQix3QkFBd0IsRUFDeEIsd0JBQXdCLEVBQ3pCLE1BQU0sOENBQThDO09BQzlDLEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUV2RSxFQUFlLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO0FBRXpFO0lBQ0UsWUFBb0IsS0FBd0IsRUFBVSxXQUF1QjtRQUF6RCxVQUFLLEdBQUwsS0FBSyxDQUFtQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFZO0lBQUcsQ0FBQztJQUVqRixtQkFBbUIsQ0FBQyxPQUFZLEVBQUUsV0FBbUIsRUFBRSxTQUFpQixFQUFFLEtBQVU7UUFDbEYsSUFBSSxlQUFlLENBQUM7UUFDcEIsa0RBQWtEO1FBQ2xELE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ25CLEtBQUssT0FBTyxDQUFDO1lBQ2IsS0FBSyxTQUFTLENBQUM7WUFDZixLQUFLLFdBQVcsQ0FBQztZQUNqQixLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLGFBQWEsQ0FBQztZQUNuQixLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLFdBQVcsQ0FBQztZQUNqQixLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLFdBQVcsQ0FBQztZQUNqQixLQUFLLE1BQU07Z0JBQ1QsZUFBZSxHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3QyxLQUFLLENBQUM7WUFDUixLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssVUFBVSxDQUFDO1lBQ2hCLEtBQUssT0FBTztnQkFDVixlQUFlLEdBQUcsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hELEtBQUssQ0FBQztZQUNSLEtBQUssT0FBTyxDQUFDO1lBQ2IsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLE1BQU07Z0JBQ1QsZUFBZSxHQUFHLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsRCxLQUFLLENBQUM7WUFDUixLQUFLLE9BQU8sQ0FBQztZQUNiLEtBQUssWUFBWSxDQUFDO1lBQ2xCLEtBQUssYUFBYSxDQUFDO1lBQ25CLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxTQUFTLENBQUM7WUFDZixLQUFLLGdCQUFnQixDQUFDO1lBQ3RCLEtBQUssZ0JBQWdCLENBQUM7WUFDdEIsS0FBSyxvQkFBb0IsQ0FBQztZQUMxQixLQUFLLE9BQU8sQ0FBQztZQUNiLEtBQUssdUJBQXVCLENBQUM7WUFDN0IsS0FBSyxrQkFBa0IsQ0FBQztZQUN4QixLQUFLLGFBQWEsQ0FBQztZQUNuQixLQUFLLGdCQUFnQixDQUFDO1lBQ3RCLEtBQUssU0FBUyxDQUFDO1lBQ2YsS0FBSyxPQUFPLENBQUM7WUFDYixLQUFLLE9BQU8sQ0FBQztZQUNiLEtBQUssa0JBQWtCLENBQUM7WUFDeEIsS0FBSyxpQkFBaUIsQ0FBQztZQUN2QixLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssZ0JBQWdCLENBQUM7WUFDdEIsS0FBSyxjQUFjLENBQUM7WUFDcEIsS0FBSyxZQUFZLENBQUM7WUFDbEIsS0FBSyxnQkFBZ0IsQ0FBQztZQUN0QixLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLG1CQUFtQixDQUFDO1lBQ3pCLEtBQUssT0FBTyxDQUFDO1lBQ2IsS0FBSyxtQkFBbUIsQ0FBQztZQUN6QixLQUFLLGtCQUFrQixDQUFDO1lBQ3hCLEtBQUssTUFBTSxDQUFDO1lBQ1osS0FBSyxTQUFTLENBQUM7WUFDZixLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLGtCQUFrQixDQUFDO1lBQ3hCLEtBQUssT0FBTyxDQUFDO1lBQ2IsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLFFBQVEsQ0FBQztZQUNkLEtBQUssU0FBUyxDQUFDO1lBQ2YsS0FBSyxTQUFTLENBQUM7WUFDZixLQUFLLFFBQVEsQ0FBQztZQUNkLEtBQUssU0FBUyxDQUFDO1lBQ2YsS0FBSyxTQUFTLENBQUM7WUFDZixLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLGFBQWEsQ0FBQztZQUNuQixLQUFLLGtCQUFrQixDQUFDO1lBQ3hCLEtBQUssY0FBYyxDQUFDO1lBQ3BCLEtBQUssU0FBUztnQkFDWixlQUFlLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9DLEtBQUssQ0FBQztZQUNSLEtBQUssZUFBZTtnQkFDbEIsZUFBZSxHQUFHLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsRCxLQUFLLENBQUM7WUFDUjtnQkFDRSxNQUFNLElBQUksYUFBYSxDQUFDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFDRCxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNyQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDO1lBQ2pFLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLGFBQWEsRUFBRSxXQUFXO1lBQzFCLE9BQU8sRUFBRSxlQUFlO1NBQ3pCLENBQUMsQ0FBQztRQUVILDhGQUE4RjtRQUM5Rix3RkFBd0Y7UUFDeEYsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NlcmlhbGl6ZXIsIFJlbmRlclN0b3JlT2JqZWN0fSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtcbiAgc2VyaWFsaXplTW91c2VFdmVudCxcbiAgc2VyaWFsaXplS2V5Ym9hcmRFdmVudCxcbiAgc2VyaWFsaXplR2VuZXJpY0V2ZW50LFxuICBzZXJpYWxpemVFdmVudFdpdGhUYXJnZXQsXG4gIHNlcmlhbGl6ZVRyYW5zaXRpb25FdmVudFxufSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvZXZlbnRfc2VyaWFsaXplcic7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5leHBvcnQgY2xhc3MgRXZlbnREaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfc2luazogRXZlbnRFbWl0dGVyPGFueT4sIHByaXZhdGUgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHt9XG5cbiAgZGlzcGF0Y2hSZW5kZXJFdmVudChlbGVtZW50OiBhbnksIGV2ZW50VGFyZ2V0OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudDogYW55KTogYm9vbGVhbiB7XG4gICAgdmFyIHNlcmlhbGl6ZWRFdmVudDtcbiAgICAvLyBUT0RPIChqdGVwbGl0ejYwMik6IHN1cHBvcnQgY3VzdG9tIGV2ZW50cyAjMzM1MFxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgY2FzZSBcImNsaWNrXCI6XG4gICAgICBjYXNlIFwibW91c2V1cFwiOlxuICAgICAgY2FzZSBcIm1vdXNlZG93blwiOlxuICAgICAgY2FzZSBcImRibGNsaWNrXCI6XG4gICAgICBjYXNlIFwiY29udGV4dG1lbnVcIjpcbiAgICAgIGNhc2UgXCJtb3VzZWVudGVyXCI6XG4gICAgICBjYXNlIFwibW91c2VsZWF2ZVwiOlxuICAgICAgY2FzZSBcIm1vdXNlbW92ZVwiOlxuICAgICAgY2FzZSBcIm1vdXNlb3V0XCI6XG4gICAgICBjYXNlIFwibW91c2VvdmVyXCI6XG4gICAgICBjYXNlIFwic2hvd1wiOlxuICAgICAgICBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVNb3VzZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwia2V5ZG93blwiOlxuICAgICAgY2FzZSBcImtleXByZXNzXCI6XG4gICAgICBjYXNlIFwia2V5dXBcIjpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplS2V5Ym9hcmRFdmVudChldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImlucHV0XCI6XG4gICAgICBjYXNlIFwiY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiYmx1clwiOlxuICAgICAgICBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVFdmVudFdpdGhUYXJnZXQoZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJhYm9ydFwiOlxuICAgICAgY2FzZSBcImFmdGVycHJpbnRcIjpcbiAgICAgIGNhc2UgXCJiZWZvcmVwcmludFwiOlxuICAgICAgY2FzZSBcImNhY2hlZFwiOlxuICAgICAgY2FzZSBcImNhbnBsYXlcIjpcbiAgICAgIGNhc2UgXCJjYW5wbGF5dGhyb3VnaFwiOlxuICAgICAgY2FzZSBcImNoYXJnaW5nY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiY2hhcmdpbmd0aW1lY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiY2xvc2VcIjpcbiAgICAgIGNhc2UgXCJkaXNjaGFyZ2luZ3RpbWVjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJET01Db250ZW50TG9hZGVkXCI6XG4gICAgICBjYXNlIFwiZG93bmxvYWRpbmdcIjpcbiAgICAgIGNhc2UgXCJkdXJhdGlvbmNoYW5nZVwiOlxuICAgICAgY2FzZSBcImVtcHRpZWRcIjpcbiAgICAgIGNhc2UgXCJlbmRlZFwiOlxuICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICBjYXNlIFwiZnVsbHNjcmVlbmNoYW5nZVwiOlxuICAgICAgY2FzZSBcImZ1bGxzY3JlZW5lcnJvclwiOlxuICAgICAgY2FzZSBcImludmFsaWRcIjpcbiAgICAgIGNhc2UgXCJsYW5ndWFnZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcImxldmVsZmNoYW5nZVwiOlxuICAgICAgY2FzZSBcImxvYWRlZGRhdGFcIjpcbiAgICAgIGNhc2UgXCJsb2FkZWRtZXRhZGF0YVwiOlxuICAgICAgY2FzZSBcIm9ic29sZXRlXCI6XG4gICAgICBjYXNlIFwib2ZmbGluZVwiOlxuICAgICAgY2FzZSBcIm9ubGluZVwiOlxuICAgICAgY2FzZSBcIm9wZW5cIjpcbiAgICAgIGNhc2UgXCJvcmllbnRhdG9pbmNoYW5nZVwiOlxuICAgICAgY2FzZSBcInBhdXNlXCI6XG4gICAgICBjYXNlIFwicG9pbnRlcmxvY2tjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJwb2ludGVybG9ja2Vycm9yXCI6XG4gICAgICBjYXNlIFwicGxheVwiOlxuICAgICAgY2FzZSBcInBsYXlpbmdcIjpcbiAgICAgIGNhc2UgXCJyYXRlY2hhbmdlXCI6XG4gICAgICBjYXNlIFwicmVhZHlzdGF0ZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcInJlc2V0XCI6XG4gICAgICBjYXNlIFwic2Nyb2xsXCI6XG4gICAgICBjYXNlIFwic2Vla2VkXCI6XG4gICAgICBjYXNlIFwic2Vla2luZ1wiOlxuICAgICAgY2FzZSBcInN0YWxsZWRcIjpcbiAgICAgIGNhc2UgXCJzdWJtaXRcIjpcbiAgICAgIGNhc2UgXCJzdWNjZXNzXCI6XG4gICAgICBjYXNlIFwic3VzcGVuZFwiOlxuICAgICAgY2FzZSBcInRpbWV1cGRhdGVcIjpcbiAgICAgIGNhc2UgXCJ1cGRhdGVyZWFkeVwiOlxuICAgICAgY2FzZSBcInZpc2liaWxpdHljaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJ2b2x1bWVjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJ3YWl0aW5nXCI6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZUdlbmVyaWNFdmVudChldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInRyYW5zaXRpb25lbmRcIjpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplVHJhbnNpdGlvbkV2ZW50KGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihldmVudE5hbWUgKyBcIiBub3Qgc3VwcG9ydGVkIG9uIFdlYldvcmtlcnNcIik7XG4gICAgfVxuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3NpbmssIHtcbiAgICAgIFwiZWxlbWVudFwiOiB0aGlzLl9zZXJpYWxpemVyLnNlcmlhbGl6ZShlbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBcImV2ZW50TmFtZVwiOiBldmVudE5hbWUsXG4gICAgICBcImV2ZW50VGFyZ2V0XCI6IGV2ZW50VGFyZ2V0LFxuICAgICAgXCJldmVudFwiOiBzZXJpYWxpemVkRXZlbnRcbiAgICB9KTtcblxuICAgIC8vIFRPRE8oa2VnbHVuZXEpOiBFdmVudHVhbGx5LCB3ZSB3YW50IHRoZSB1c2VyIHRvIGluZGljYXRlIGZyb20gdGhlIFVJIHNpZGUgd2hldGhlciB0aGUgZXZlbnRcbiAgICAvLyBzaG91bGQgYmUgY2FuY2VsZWQsIGJ1dCBmb3Igbm93IGp1c3QgY2FsbCBgcHJldmVudERlZmF1bHRgIG9uIHRoZSBvcmlnaW5hbCBET00gZXZlbnQuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=