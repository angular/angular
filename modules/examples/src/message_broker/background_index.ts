import {
  PostMessageBus,
  PostMessageBusSink,
  PostMessageBusSource
} from 'angular2/src/web_workers/shared/post_message_bus';
import {ObservableWrapper} from 'angular2/src/facade/async';
import {
  ClientMessageBroker,
  UiArguments
} from "angular2/src/web_workers/shared/client_message_broker";
import {Serializer} from "angular2/src/web_workers/shared/serializer";

interface PostMessageInterface {
  (message: any, transferrables?:[ArrayBuffer]): void;
}
var _postMessage: PostMessageInterface = <any>postMessage;

export function main() {
  var sink = new PostMessageBusSink({
    postMessage:
        (message: any, transferrables?:[ArrayBuffer]) => { _postMessage(message, transferrables); }
  });
  var source = new PostMessageBusSource();
  var bus = new PostMessageBus(sink, source);

  ObservableWrapper.subscribe(bus.from("echo"),
                              (value) => { ObservableWrapper.callNext(bus.to("echo"), value); });

  var broker = new ClientMessageBroker(bus, new Serializer(null, null, null), "test");
  var args = new UiArguments("tester");
  broker.runOnUiThread(args, String)
      .then((data: string) => { ObservableWrapper.callNext(bus.to("result"), data); });
}
