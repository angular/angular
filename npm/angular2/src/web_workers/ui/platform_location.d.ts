import { BrowserPlatformLocation } from 'angular2/src/platform/browser/location/browser_platform_location';
import { ServiceMessageBrokerFactory } from 'angular2/src/web_workers/shared/service_message_broker';
import { Serializer } from 'angular2/src/web_workers/shared/serializer';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
export declare class MessageBasedPlatformLocation {
    private _brokerFactory;
    private _platformLocation;
    private _serializer;
    private _channelSink;
    private _broker;
    constructor(_brokerFactory: ServiceMessageBrokerFactory, _platformLocation: BrowserPlatformLocation, bus: MessageBus, _serializer: Serializer);
    start(): void;
    private _getLocation();
    private _sendUrlChangeEvent(e);
    private _setPathname(pathname);
}
