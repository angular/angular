import {SETUP_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {AnchorBasedAppRootUrl} from 'angular2/src/services/anchor_based_app_root_url';
import {Injectable} from 'angular2/di';

@Injectable()
export class WebWorkerSetup {
  constructor(bus: MessageBus, anchorBasedAppRootUrl: AnchorBasedAppRootUrl) {
    var rootUrl = anchorBasedAppRootUrl.value;
    var sink = bus.to(SETUP_CHANNEL);
    var source = bus.from(SETUP_CHANNEL);

    ObservableWrapper.subscribe(source, (message: string) => {
      if (message === "ready") {
        ObservableWrapper.callNext(sink, {"rootUrl": rootUrl});
      }
    });
  }
}
