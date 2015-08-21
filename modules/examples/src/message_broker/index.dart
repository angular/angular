library angular2.examples.message_broker.index;

import "package:angular2/src/web_workers/ui/application.dart"
    show spawnWebWorker;
import "package:angular2/src/facade/async.dart";
import "dart:html";

main() {
  var VALUE = 5;
  spawnWebWorker(Uri.parse("background_index.dart")).then((bus) {
    querySelector("#send_echo").addEventListener("click", (e) {
      var val = (querySelector("#echo_input") as InputElement).value;
      ObservableWrapper.callNext(bus.to("echo"), val);
    });

    ObservableWrapper.subscribe(bus.from("echo"), (message) {
      querySelector("#echo_result")
          .appendHtml("<span class='response'>${message}</span>");
    });
    ObservableWrapper.subscribe(bus.from("result"), (message) {
      querySelector("#ui_result")
          .appendHtml("<span class='result'>${message}</span>");
    });
    ObservableWrapper.subscribe(bus.from("test"),
        (Map<String, dynamic> message) {
      ObservableWrapper.callNext(bus.to("test"),
          {'id': message['id'], 'type': "result", 'value': VALUE});
    });
  });
}
