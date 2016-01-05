import { RenderViewRef } from 'angular2/src/core/render/api';
import { serializeMouseEvent, serializeKeyboardEvent, serializeGenericEvent, serializeEventWithTarget } from 'angular2/src/web_workers/ui/event_serializer';
import { BaseException } from 'angular2/src/facade/exceptions';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { ObservableWrapper } from 'angular2/src/facade/async';
export class EventDispatcher {
    constructor(_viewRef, _sink, _serializer) {
        this._viewRef = _viewRef;
        this._sink = _sink;
        this._serializer = _serializer;
    }
    dispatchRenderEvent(elementIndex, eventName, locals) {
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
                serializedEvent = serializeMouseEvent(e);
                break;
            case "keydown":
            case "keypress":
            case "keyup":
                serializedEvent = serializeKeyboardEvent(e);
                break;
            case "input":
            case "change":
            case "blur":
                serializedEvent = serializeEventWithTarget(e);
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
                serializedEvent = serializeGenericEvent(e);
                break;
            default:
                throw new BaseException(eventName + " not supported on WebWorkers");
        }
        var serializedLocals = StringMapWrapper.create();
        StringMapWrapper.set(serializedLocals, '$event', serializedEvent);
        ObservableWrapper.callEmit(this._sink, {
            "viewRef": this._serializer.serialize(this._viewRef, RenderViewRef),
            "elementIndex": elementIndex,
            "eventName": eventName,
            "locals": serializedLocals
        });
        // TODO(kegluneq): Eventually, we want the user to indicate from the UI side whether the event
        // should be canceled, but for now just call `preventDefault` on the original DOM event.
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9ldmVudF9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbIkV2ZW50RGlzcGF0Y2hlciIsIkV2ZW50RGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsIkV2ZW50RGlzcGF0Y2hlci5kaXNwYXRjaFJlbmRlckV2ZW50Il0sIm1hcHBpbmdzIjoiT0FBTyxFQUNMLGFBQWEsRUFFZCxNQUFNLDhCQUE4QjtPQUU5QixFQUNMLG1CQUFtQixFQUNuQixzQkFBc0IsRUFDdEIscUJBQXFCLEVBQ3JCLHdCQUF3QixFQUN6QixNQUFNLDhDQUE4QztPQUM5QyxFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUN4RCxFQUFlLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO0FBRXpFO0lBQ0VBLFlBQW9CQSxRQUF1QkEsRUFBVUEsS0FBd0JBLEVBQ3pEQSxXQUF1QkE7UUFEdkJDLGFBQVFBLEdBQVJBLFFBQVFBLENBQWVBO1FBQVVBLFVBQUtBLEdBQUxBLEtBQUtBLENBQW1CQTtRQUN6REEsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO0lBQUdBLENBQUNBO0lBRS9DRCxtQkFBbUJBLENBQUNBLFlBQW9CQSxFQUFFQSxTQUFpQkEsRUFBRUEsTUFBd0JBO1FBQ25GRSxJQUFJQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUM3QkEsSUFBSUEsZUFBZUEsQ0FBQ0E7UUFDcEJBLGtEQUFrREE7UUFDbERBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2ZBLEtBQUtBLE9BQU9BLENBQUNBO1lBQ2JBLEtBQUtBLFNBQVNBLENBQUNBO1lBQ2ZBLEtBQUtBLFdBQVdBLENBQUNBO1lBQ2pCQSxL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QUNBO1lBQ1JBO2dCQUNFQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSxTQUFTQSxHQUFHQSw4QkFBOEJBLENBQUNBLENBQUNBO1FBQ3hFQSxDQUFDQTtRQUNEQSxJQUFJQSxnQkFBZ0JBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDakRBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxRQUFRQSxFQUFFQSxlQUFlQSxDQUFDQSxDQUFDQTtRQUVsRUEsaUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQTtZQUNyQ0EsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsYUFBYUEsQ0FBQ0E7WUFDbkVBLGNBQWNBLEVBQUVBLFlBQVlBO1lBQzVCQSxXQUFXQSxFQUFFQSxTQUFTQTtZQUN0QkEsUUFBUUEsRUFBRUEsZ0JBQWdCQTtTQUMzQkEsQ0FBQ0EsQ0FBQ0E7UUFFSEEsOEZBQThGQTtRQUM5RkEsd0ZBQXdGQTtRQUN4RkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7QUFDSEYsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFJlbmRlclZpZXdSZWYsXG4gIFJlbmRlckV2ZW50RGlzcGF0Y2hlcixcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5pbXBvcnQge1NlcmlhbGl6ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplcic7XG5pbXBvcnQge1xuICBzZXJpYWxpemVNb3VzZUV2ZW50LFxuICBzZXJpYWxpemVLZXlib2FyZEV2ZW50LFxuICBzZXJpYWxpemVHZW5lcmljRXZlbnQsXG4gIHNlcmlhbGl6ZUV2ZW50V2l0aFRhcmdldFxufSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvZXZlbnRfc2VyaWFsaXplcic7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5leHBvcnQgY2xhc3MgRXZlbnREaXNwYXRjaGVyIGltcGxlbWVudHMgUmVuZGVyRXZlbnREaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld1JlZjogUmVuZGVyVmlld1JlZiwgcHJpdmF0ZSBfc2luazogRXZlbnRFbWl0dGVyPGFueT4sXG4gICAgICAgICAgICAgIHByaXZhdGUgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHt9XG5cbiAgZGlzcGF0Y2hSZW5kZXJFdmVudChlbGVtZW50SW5kZXg6IG51bWJlciwgZXZlbnROYW1lOiBzdHJpbmcsIGxvY2FsczogTWFwPHN0cmluZywgYW55Pik6IGJvb2xlYW4ge1xuICAgIHZhciBlID0gbG9jYWxzLmdldCgnJGV2ZW50Jyk7XG4gICAgdmFyIHNlcmlhbGl6ZWRFdmVudDtcbiAgICAvLyBUT0RPIChqdGVwbGl0ejYwMik6IHN1cHBvcnQgY3VzdG9tIGV2ZW50cyAjMzM1MFxuICAgIHN3aXRjaCAoZS50eXBlKSB7XG4gICAgICBjYXNlIFwiY2xpY2tcIjpcbiAgICAgIGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgICBjYXNlIFwibW91c2Vkb3duXCI6XG4gICAgICBjYXNlIFwiZGJsY2xpY2tcIjpcbiAgICAgIGNhc2UgXCJjb250ZXh0bWVudVwiOlxuICAgICAgY2FzZSBcIm1vdXNlZW50ZXJcIjpcbiAgICAgIGNhc2UgXCJtb3VzZWxlYXZlXCI6XG4gICAgICBjYXNlIFwibW91c2Vtb3ZlXCI6XG4gICAgICBjYXNlIFwibW91c2VvdXRcIjpcbiAgICAgIGNhc2UgXCJtb3VzZW92ZXJcIjpcbiAgICAgIGNhc2UgXCJzaG93XCI6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZU1vdXNlRXZlbnQoZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImtleWRvd25cIjpcbiAgICAgIGNhc2UgXCJrZXlwcmVzc1wiOlxuICAgICAgY2FzZSBcImtleXVwXCI6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZUtleWJvYXJkRXZlbnQoZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImlucHV0XCI6XG4gICAgICBjYXNlIFwiY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiYmx1clwiOlxuICAgICAgICBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVFdmVudFdpdGhUYXJnZXQoZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImFib3J0XCI6XG4gICAgICBjYXNlIFwiYWZ0ZXJwcmludFwiOlxuICAgICAgY2FzZSBcImJlZm9yZXByaW50XCI6XG4gICAgICBjYXNlIFwiY2FjaGVkXCI6XG4gICAgICBjYXNlIFwiY2FucGxheVwiOlxuICAgICAgY2FzZSBcImNhbnBsYXl0aHJvdWdoXCI6XG4gICAgICBjYXNlIFwiY2hhcmdpbmdjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJjaGFyZ2luZ3RpbWVjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJjbG9zZVwiOlxuICAgICAgY2FzZSBcImRpc2NoYXJnaW5ndGltZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcIkRPTUNvbnRlbnRMb2FkZWRcIjpcbiAgICAgIGNhc2UgXCJkb3dubG9hZGluZ1wiOlxuICAgICAgY2FzZSBcImR1cmF0aW9uY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiZW1wdGllZFwiOlxuICAgICAgY2FzZSBcImVuZGVkXCI6XG4gICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgIGNhc2UgXCJmdWxsc2NyZWVuY2hhbmdlXCI6XG4gICAgICBjYXNlIFwiZnVsbHNjcmVlbmVycm9yXCI6XG4gICAgICBjYXNlIFwiaW52YWxpZFwiOlxuICAgICAgY2FzZSBcImxhbmd1YWdlY2hhbmdlXCI6XG4gICAgICBjYXNlIFwibGV2ZWxmY2hhbmdlXCI6XG4gICAgICBjYXNlIFwibG9hZGVkZGF0YVwiOlxuICAgICAgY2FzZSBcImxvYWRlZG1ldGFkYXRhXCI6XG4gICAgICBjYXNlIFwib2Jzb2xldGVcIjpcbiAgICAgIGNhc2UgXCJvZmZsaW5lXCI6XG4gICAgICBjYXNlIFwib25saW5lXCI6XG4gICAgICBjYXNlIFwib3BlblwiOlxuICAgICAgY2FzZSBcIm9yaWVudGF0b2luY2hhbmdlXCI6XG4gICAgICBjYXNlIFwicGF1c2VcIjpcbiAgICAgIGNhc2UgXCJwb2ludGVybG9ja2NoYW5nZVwiOlxuICAgICAgY2FzZSBcInBvaW50ZXJsb2NrZXJyb3JcIjpcbiAgICAgIGNhc2UgXCJwbGF5XCI6XG4gICAgICBjYXNlIFwicGxheWluZ1wiOlxuICAgICAgY2FzZSBcInJhdGVjaGFuZ2VcIjpcbiAgICAgIGNhc2UgXCJyZWFkeXN0YXRlY2hhbmdlXCI6XG4gICAgICBjYXNlIFwicmVzZXRcIjpcbiAgICAgIGNhc2UgXCJzY3JvbGxcIjpcbiAgICAgIGNhc2UgXCJzZWVrZWRcIjpcbiAgICAgIGNhc2UgXCJzZWVraW5nXCI6XG4gICAgICBjYXNlIFwic3RhbGxlZFwiOlxuICAgICAgY2FzZSBcInN1Ym1pdFwiOlxuICAgICAgY2FzZSBcInN1Y2Nlc3NcIjpcbiAgICAgIGNhc2UgXCJzdXNwZW5kXCI6XG4gICAgICBjYXNlIFwidGltZXVwZGF0ZVwiOlxuICAgICAgY2FzZSBcInVwZGF0ZXJlYWR5XCI6XG4gICAgICBjYXNlIFwidmlzaWJpbGl0eWNoYW5nZVwiOlxuICAgICAgY2FzZSBcInZvbHVtZWNoYW5nZVwiOlxuICAgICAgY2FzZSBcIndhaXRpbmdcIjpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplR2VuZXJpY0V2ZW50KGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGV2ZW50TmFtZSArIFwiIG5vdCBzdXBwb3J0ZWQgb24gV2ViV29ya2Vyc1wiKTtcbiAgICB9XG4gICAgdmFyIHNlcmlhbGl6ZWRMb2NhbHMgPSBTdHJpbmdNYXBXcmFwcGVyLmNyZWF0ZSgpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHNlcmlhbGl6ZWRMb2NhbHMsICckZXZlbnQnLCBzZXJpYWxpemVkRXZlbnQpO1xuXG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc2luaywge1xuICAgICAgXCJ2aWV3UmVmXCI6IHRoaXMuX3NlcmlhbGl6ZXIuc2VyaWFsaXplKHRoaXMuX3ZpZXdSZWYsIFJlbmRlclZpZXdSZWYpLFxuICAgICAgXCJlbGVtZW50SW5kZXhcIjogZWxlbWVudEluZGV4LFxuICAgICAgXCJldmVudE5hbWVcIjogZXZlbnROYW1lLFxuICAgICAgXCJsb2NhbHNcIjogc2VyaWFsaXplZExvY2Fsc1xuICAgIH0pO1xuXG4gICAgLy8gVE9ETyhrZWdsdW5lcSk6IEV2ZW50dWFsbHksIHdlIHdhbnQgdGhlIHVzZXIgdG8gaW5kaWNhdGUgZnJvbSB0aGUgVUkgc2lkZSB3aGV0aGVyIHRoZSBldmVudFxuICAgIC8vIHNob3VsZCBiZSBjYW5jZWxlZCwgYnV0IGZvciBub3cganVzdCBjYWxsIGBwcmV2ZW50RGVmYXVsdGAgb24gdGhlIG9yaWdpbmFsIERPTSBldmVudC5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==