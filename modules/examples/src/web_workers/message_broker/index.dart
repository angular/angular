library angular2.examples.message_broker.index;

import "package:angular2/web_worker/ui.dart";
import "package:angular2/src/core/reflection/reflection_capabilities.dart";
import "package:angular2/src/core/reflection/reflection.dart";
import "dart:html";

main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  const ECHO_CHANNEL = "ECHO";
  bootstrap("background_index.dart").then((instance) {
    var broker = instance.app.createClientMessageBroker(ECHO_CHANNEL);
    querySelector("#send_echo").addEventListener("click", (e) {
      var val = (querySelector("#echo_input") as InputElement).value;
      var args = new UiArguments("echo", [new FnArg(val, PRIMITIVE)]);
      broker.runOnService(args, PRIMITIVE).then((echo_result) {
        querySelector("#echo_result")
            .appendHtml("<span class='response'>${echo_result}</span>");
      });
    });
  });
}
