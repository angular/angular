import { Injector } from "angular2/src/core/di";
import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
export declare function createInjector(zone: NgZone, bus: MessageBus): Injector;
