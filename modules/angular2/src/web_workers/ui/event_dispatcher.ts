import {
  RenderViewRef,
  RenderEventDispatcher,
} from 'angular2/src/core/render/api';
import {Serializer} from 'angular2/src/web_workers/shared/serializer';
import {
  serializeMouseEvent,
  serializeKeyboardEvent,
  serializeGenericEvent,
  serializeEventWithTarget
} from 'angular2/src/web_workers/ui/event_serializer';
import {BaseException} from "angular2/src/core/facade/lang";
import {StringMapWrapper} from 'angular2/src/core/facade/collection';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';

export class EventDispatcher implements RenderEventDispatcher {
  constructor(private _viewRef: RenderViewRef, private _sink: EventEmitter,
              private _serializer: Serializer) {}

  dispatchRenderEvent(elementIndex: number, eventName: string, locals: Map<string, any>): boolean {
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

    ObservableWrapper.callNext(this._sink, {
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
