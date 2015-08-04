library angular2.examples.message_broker.index;

import "package:angular2/src/web-workers/ui/application.dart"
    show spawnWorker, UIMessageBus, UIMessageBusSink, UIMessageBusSource;

import "dart:html";

main() {
  var VALUE = 5;
  spawnWorker(Uri.parse("background_index.dart")).then((bus) {
    querySelector("#send_echo").addEventListener("click", (e) {
      var val = (querySelector("#echo_input") as InputElement).value;
      bus.sink.send({'type': 'echo', 'value': val});
    });
    bus.source.addListener((message) {
      var data = message['data'];
      if (identical(data['type'], "echo_response")) {
        querySelector("#echo_result")
            .appendHtml("<span class='response'>${data['value']}</span>");
      } else if (identical(data['type'], "test")) {
        bus.sink.send({'type': "result", 'id': data['id'], 'value': VALUE});
      } else if (identical(data['type'], "result")) {
        querySelector("#ui_result")
            .appendHtml("<span class='result'>${data['value']}</span>");
      } else if (identical(data['type'], "ready")) {
        bus.sink.send({'type': "init"});
      }
    });
  });
}
