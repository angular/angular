import {
  WorkerMessageBus,
  WorkerMessageBusSource,
  WorkerMessageBusSink
} from "angular2/src/web-workers/worker/application";
import {MessageBroker, UiArguments} from "angular2/src/web-workers/worker/broker";
import {Serializer} from "angular2/src/web-workers/shared/serializer";

export function main() {
  var bus = new WorkerMessageBus(new WorkerMessageBusSink(), new WorkerMessageBusSource());
  bus.source.addListener((message) => {
    if (message.data.type === "echo") {
      bus.sink.send({type: "echo_response", 'value': message.data.value});
    }
  });

  var broker = new MessageBroker(bus, new Serializer(null, null, null), null);
  var args = new UiArguments("test", "tester");
  broker.runOnUiThread(args, String)
      .then((data: string) => { bus.sink.send({type: "result", value: data}); });
}
