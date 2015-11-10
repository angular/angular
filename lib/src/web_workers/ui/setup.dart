library angular2.src.web_workers.ui.setup;

import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show SETUP_CHANNEL;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/compiler/anchor_based_app_root_url.dart"
    show AnchorBasedAppRootUrl;
import "package:angular2/src/facade/lang.dart" show StringWrapper;
import "package:angular2/src/core/di.dart" show Injectable;

@Injectable()
class WebWorkerSetup {
  MessageBus _bus;
  String rootUrl;
  WebWorkerSetup(this._bus, AnchorBasedAppRootUrl anchorBasedAppRootUrl) {
    this.rootUrl = anchorBasedAppRootUrl.value;
  }
  void start() {
    this._bus.initChannel(SETUP_CHANNEL, false);
    var sink = this._bus.to(SETUP_CHANNEL);
    var source = this._bus.from(SETUP_CHANNEL);
    ObservableWrapper.subscribe(source, (String message) {
      if (StringWrapper.equals(message, "ready")) {
        ObservableWrapper.callNext(sink, {"rootUrl": this.rootUrl});
      }
    });
  }
}
