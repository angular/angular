import {Provider, ApplicationRef} from 'angular2/core';
import {
  bootstrapRender,
  UiArguments,
  FnArg,
  PRIMITIVE,
  ClientMessageBrokerFactory
} from 'angular2/platform/worker_render';

const ECHO_CHANNEL = "ECHO";

bootstrapRender("loader.js").then((ref) => afterBootstrap(ref));

function afterBootstrap(ref: ApplicationRef) {
  let brokerFactory: ClientMessageBrokerFactory = ref.injector.get(ClientMessageBrokerFactory);
  var broker = brokerFactory.createMessageBroker(ECHO_CHANNEL, false);

  document.getElementById("send_echo")
      .addEventListener("click", (e) => {
        var val = (<HTMLInputElement>document.getElementById("echo_input")).value;
        // TODO(jteplitz602): Replace default constructors with real constructors
        // once they're in the .d.ts file (#3926)
        var args = new UiArguments("echo");
        args.method = "echo";
        var fnArg = new FnArg(val, PRIMITIVE);
        fnArg.value = val;
        fnArg.type = PRIMITIVE;
        args.args = [fnArg];

        broker.runOnService(args, PRIMITIVE)
            .then((echo_result: string) => {
              document.getElementById("echo_result").innerHTML =
                  `<span class='response'>${echo_result}</span>`;
            });
      });
}