library angular2.src.web_workers.worker.event_dispatcher;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/collection.dart" show Map, MapWrapper;
import "package:angular2/src/core/render/api.dart"
    show RenderViewRef, RenderEventDispatcher;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show EVENT_CHANNEL;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper;
import "event_deserializer.dart" show deserializeGenericEvent;

@Injectable()
class WebWorkerEventDispatcher {
  Serializer _serializer;
  Map<RenderViewRef, RenderEventDispatcher> _eventDispatchRegistry =
      new Map<RenderViewRef, RenderEventDispatcher>();
  WebWorkerEventDispatcher(MessageBus bus, this._serializer) {
    bus.initChannel(EVENT_CHANNEL);
    var source = bus.from(EVENT_CHANNEL);
    ObservableWrapper.subscribe(
        source,
        (message) =>
            this._dispatchEvent(new RenderEventData(message, _serializer)));
  }
  void _dispatchEvent(RenderEventData eventData) {
    var dispatcher = this._eventDispatchRegistry[eventData.viewRef];
    eventData.locals["\$event"] =
        deserializeGenericEvent(eventData.locals["\$event"]);
    dispatcher.dispatchRenderEvent(
        eventData.elementIndex, eventData.eventName, eventData.locals);
  }

  void registerEventDispatcher(
      RenderViewRef viewRef, RenderEventDispatcher dispatcher) {
    this._eventDispatchRegistry[viewRef] = dispatcher;
  }
}

class RenderEventData {
  RenderViewRef viewRef;
  num elementIndex;
  String eventName;
  Map<String, dynamic> locals;
  RenderEventData(Map<String, dynamic> message, Serializer serializer) {
    this.viewRef = serializer.deserialize(message["viewRef"], RenderViewRef);
    this.elementIndex = message["elementIndex"];
    this.eventName = message["eventName"];
    this.locals = MapWrapper.createFromStringMap(message["locals"]);
  }
}
