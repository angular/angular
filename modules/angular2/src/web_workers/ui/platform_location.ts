import {BrowserPlatformLocation} from 'angular2/src/router/location/browser_platform_location';
import {Injectable} from 'angular2/src/core/di';
import {ROUTER_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {
  ServiceMessageBrokerFactory,
  ServiceMessageBroker
} from 'angular2/src/web_workers/shared/service_message_broker';
import {PRIMITIVE, Serializer} from 'angular2/src/web_workers/shared/serializer';
import {bind} from './bind';
import {LocationType} from 'angular2/src/web_workers/shared/serialized_types';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {EventEmitter, ObservableWrapper, PromiseWrapper} from 'angular2/src/facade/async';
import {UrlChangeListener} from 'angular2/src/router/location/platform_location';

@Injectable()
export class MessageBasedPlatformLocation {
  private _channelSink: EventEmitter<Object>;
  private _broker: ServiceMessageBroker;

  constructor(private _brokerFactory: ServiceMessageBrokerFactory,
              private _platformLocation: BrowserPlatformLocation, bus: MessageBus,
              private _serializer: Serializer) {
    this._platformLocation.onPopState(<UrlChangeListener>bind(this._sendUrlChangeEvent, this));
    this._platformLocation.onHashChange(<UrlChangeListener>bind(this._sendUrlChangeEvent, this));
    this._broker = this._brokerFactory.createMessageBroker(ROUTER_CHANNEL);
    this._channelSink = bus.to(ROUTER_CHANNEL);
  }

  start(): void {
    this._broker.registerMethod("getLocation", null, bind(this._getLocation, this), LocationType);
    this._broker.registerMethod("setPathname", [PRIMITIVE], bind(this._setPathname, this));
    this._broker.registerMethod("pushState", [PRIMITIVE, PRIMITIVE, PRIMITIVE],
                                bind(this._platformLocation.pushState, this._platformLocation));
    this._broker.registerMethod("replaceState", [PRIMITIVE, PRIMITIVE, PRIMITIVE],
                                bind(this._platformLocation.replaceState, this._platformLocation));
    this._broker.registerMethod("forward", null,
                                bind(this._platformLocation.forward, this._platformLocation));
    this._broker.registerMethod("back", null,
                                bind(this._platformLocation.back, this._platformLocation));
  }

  private _getLocation(): Promise<Location> {
    return PromiseWrapper.resolve(this._platformLocation.location);
  }


  private _sendUrlChangeEvent(e: Event): void {
    let loc = this._serializer.serialize(this._platformLocation.location, LocationType);
    let serializedEvent = {'type': e.type};
    ObservableWrapper.callEmit(this._channelSink, {'event': serializedEvent, 'location': loc});
  }

  private _setPathname(pathname: string): void { this._platformLocation.pathname = pathname; }
}
