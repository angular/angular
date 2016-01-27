import { PlatformLocation, UrlChangeListener } from 'angular2/src/router/platform_location';
import { ClientMessageBrokerFactory } from 'angular2/src/web_workers/shared/client_message_broker';
import { Serializer } from 'angular2/src/web_workers/shared/serializer';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
export declare class WebWorkerPlatformLocation extends PlatformLocation {
    private _serializer;
    private _broker;
    private _popStateListeners;
    private _hashChangeListeners;
    private _location;
    private _channelSource;
    constructor(brokerFactory: ClientMessageBrokerFactory, bus: MessageBus, _serializer: Serializer);
    getBaseHrefFromDOM(): string;
    onPopState(fn: UrlChangeListener): void;
    onHashChange(fn: UrlChangeListener): void;
    pathname: string;
    search: string;
    hash: string;
    pushState(state: any, title: string, url: string): void;
    replaceState(state: any, title: string, url: string): void;
    forward(): void;
    back(): void;
}
