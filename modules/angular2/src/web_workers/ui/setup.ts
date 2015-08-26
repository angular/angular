import {SETUP_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {AnchorBasedAppRootUrl} from 'angular2/src/core/services/anchor_based_app_root_url';
import {StringWrapper} from 'angular2/src/core/facade/lang';
import {Injectable} from 'angular2/core';

@Injectable()
export class WebWorkerSetup {
  constructor(bus: MessageBus, anchorBasedAppRootUrl: AnchorBasedAppRootUrl) {
    var rootUrl = anchorBasedAppRootUrl.value;
    var sink = bus.to(SETUP_CHANNEL);
    var source = bus.from(SETUP_CHANNEL);

    ObservableWrapper.subscribe(source, (message: string) => {
      if (StringWrapper.equals(message, "ready")) {
        ObservableWrapper.callNext(sink, {"rootUrl": rootUrl});
      }
    });
  }
}
