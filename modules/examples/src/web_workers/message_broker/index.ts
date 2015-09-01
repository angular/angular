import {bootstrap, UiArguments, FnArg, PRIMITIVE} from "angular2/web_worker/ui";

const ECHO_CHANNEL = "ECHO";

var instance = bootstrap("loader.js");
var broker = instance.app.createClientMessageBroker(ECHO_CHANNEL);

document.getElementById("send_echo")
    .addEventListener("click", (e) => {
      var val = (<HTMLInputElement>document.getElementById("echo_input")).value;
      // TODO(jteplitz602): Replace default constructors with real constructors
      // once they're in the .d.ts file (#3926)
      var args = new UiArguments();
      args.method = "echo";
      var fnArg = new FnArg();
      fnArg.value = val;
      fnArg.type = PRIMITIVE;
      args.args = [fnArg];

      broker.runOnService(args, PRIMITIVE)
          .then((echo_result: string) => {
            document.getElementById("echo_result").innerHTML =
                `<span class='response'>${echo_result}</span>`;
          });
    });
