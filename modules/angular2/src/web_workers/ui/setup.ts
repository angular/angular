import {SETUP_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {AnchorBasedAppRootUrl} from 'angular2/src/core/services/anchor_based_app_root_url';
import {Injectable} from 'angular2/di';
import {StringWrapper} from 'angular2/src/core/facade/lang';

@Injectable()
export class WebWorkerSetup {
  rootUrl: string;

  constructor(private _bus: MessageBus, anchorBasedAppRootUrl: AnchorBasedAppRootUrl) {
    this.rootUrl = anchorBasedAppRootUrl.value;
  }

  start(): void {
    var sink = this._bus.to(SETUP_CHANNEL);
    var source = this._bus.from(SETUP_CHANNEL);

    ObservableWrapper.subscribe(source, (message: string) => {
      if (StringWrapper.equals(message, "ready")) {
        ObservableWrapper.callNext(sink, {"rootUrl": this.rootUrl});
      }
    });
  }
}
