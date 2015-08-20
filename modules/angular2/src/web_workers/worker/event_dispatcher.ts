import {Injectable} from 'angular2/di';
import {Map, MapWrapper} from 'angular2/src/core/facade/collection';
import {RenderViewRef, RenderEventDispatcher} from 'angular2/src/core/render/api';
import {Serializer} from 'angular2/src/web_workers/shared/serializer';
import {EVENT_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {deserializeGenericEvent} from './event_deserializer';
import {NgZone} from 'angular2/src/core/zone/ng_zone';

@Injectable()
export class WebWorkerEventDispatcher {
  private _eventDispatchRegistry: Map<RenderViewRef, RenderEventDispatcher> =
      new Map<RenderViewRef, RenderEventDispatcher>();

  constructor(bus: MessageBus, private _serializer: Serializer, private _zone: NgZone) {
    var source = bus.from(EVENT_CHANNEL);
    ObservableWrapper.subscribe(
        source, (message) => this._dispatchEvent(new RenderEventData(message, _serializer)));
  }


  private _dispatchEvent(eventData: RenderEventData): void {
    var dispatcher = this._eventDispatchRegistry.get(eventData.viewRef);
    this._zone.run(() => {
      eventData.locals['$event'] = deserializeGenericEvent(eventData.locals['$event']);
      dispatcher.dispatchRenderEvent(eventData.elementIndex, eventData.eventName, eventData.locals);
    });
  }

  registerEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher): void {
    this._eventDispatchRegistry.set(viewRef, dispatcher);
  }
}


class RenderEventData {
  viewRef: RenderViewRef;
  elementIndex: number;
  eventName: string;
  locals: Map<string, any>;

  constructor(message: StringMap<string, any>, serializer: Serializer) {
    this.viewRef = serializer.deserialize(message['viewRef'], RenderViewRef);
    this.elementIndex = message['elementIndex'];
    this.eventName = message['eventName'];
    this.locals = MapWrapper.createFromStringMap(message['locals']);
  }
}
