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
