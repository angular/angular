import {
  WorkerMessageBus,
  WorkerMessageBusSource,
  WorkerMessageBusSink
} from "angular2/src/web-workers/worker/application";
import {MessageBroker, UiArguments} from "angular2/src/web-workers/worker/broker";

export function main() {
  var bus = new WorkerMessageBus(new WorkerMessageBusSink(), new WorkerMessageBusSource());
  bus.source.listen((message) => {
    if (message.data.type === "echo") {
      bus.sink.send({type: "echo_response", 'value': message.data.value});
    }
  });

  var broker = new MessageBroker(bus);
  var args = new UiArguments("test", "tester");
  broker.runOnUiThread(args)
      .then((data) => { bus.sink.send({type: "result", value: data.value}); });
}
