import {
  PostMessageBus,
  PostMessageBusSink,
  PostMessageBusSource
} from 'angular2/src/web-workers/shared/post_message_bus';
import {ObservableWrapper} from 'angular2/src/facade/async';

var webWorker = new Worker("loader.js");
var sink = new PostMessageBusSink(webWorker);
var source = new PostMessageBusSource(webWorker);
var bus = new PostMessageBus(sink, source);
const VALUE = 5;

document.getElementById("send_echo")
    .addEventListener("click", (e) => {
      var val = (<HTMLInputElement>document.getElementById("echo_input")).value;
      ObservableWrapper.callNext(bus.to("echo"), val);
    });

ObservableWrapper.subscribe(bus.from("echo"), (message) => {
  document.getElementById("echo_result").innerHTML = `<span class='response'>${message}</span>`;
});
ObservableWrapper.subscribe(bus.from("result"), (message) => {
  document.getElementById("ui_result").innerHTML = `<span class='result'>${message}</span>`;
});
ObservableWrapper.subscribe(bus.from("test"), (message: StringMap<string, any>) => {
  ObservableWrapper.callNext(bus.to("test"), {id: message['id'], type: "result", value: VALUE});
});
