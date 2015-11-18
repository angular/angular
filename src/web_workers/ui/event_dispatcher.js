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
        async_1.ObservableWrapper.callNext(this._sink, {
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
//# sourceMappingURL=event_dispatcher.js.map