import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { AnchorBasedAppRootUrl } from 'angular2/src/compiler/anchor_based_app_root_url';
export declare class WebWorkerSetup {
    private _bus;
    rootUrl: string;
    constructor(_bus: MessageBus, anchorBasedAppRootUrl: AnchorBasedAppRootUrl);
    start(): void;
}
