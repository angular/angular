import {
  UIMessageBus,
  UIMessageBusSink,
  UIMessageBusSource
} from "angular2/src/web-workers/ui/application";

var worker = new Worker("loader.js");
var bus = new UIMessageBus(new UIMessageBusSink(worker), new UIMessageBusSource(worker));
var VALUE = 5;

document.getElementById("send_echo")
    .addEventListener("click", (e) => {
      var val = (<HTMLInputElement>document.getElementById("echo_input")).value;
      bus.sink.send({type: "echo", value: val});
    });

bus.source.addListener((message) => {
  if (message.data.type === "echo_response") {
    document.getElementById("echo_result").innerHTML =
        `<span class='response'>${message.data.value}</span>`;
  } else if (message.data.type === "test") {
    bus.sink.send({type: "result", id: message.data.id, value: VALUE});
  } else if (message.data.type == "result") {
    document.getElementById("ui_result").innerHTML =
        `<span class='result'>${message.data.value}</span>`;
  } else if (message.data.type == "ready") {
    bus.sink.send({type: "init"});
  }
});
