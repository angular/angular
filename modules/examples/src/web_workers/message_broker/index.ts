import {bootstrap, UiArguments, FnArg, PRIMITIVE} from "angular2/web_worker/ui";

const ECHO_CHANNEL = "ECHO";

var instance = bootstrap("loader.js");
var broker = instance.app.createClientMessageBroker(ECHO_CHANNEL, false);

document.getElementById("send_echo")
    .addEventListener("click", (e) => {
      var val = (<HTMLInputElement>document.getElementById("echo_input")).value;
      var fnArg = new FnArg(val, PRIMITIVE);
      var args = new UiArguments("echo", [fnArg]);

      broker.runOnService(args, PRIMITIVE)
          .then((echo_result: string) => {
            document.getElementById("echo_result").innerHTML =
                `<span class='response'>${echo_result}</span>`;
          });
    });
