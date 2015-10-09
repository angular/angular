import {PromiseWrapper} from "angular2/src/core/facade/async";
import {Component, View, ServiceMessageBrokerFactory, PRIMITIVE} from "angular2/web_worker/worker";

const ECHO_CHANNEL = "ECHO";

@Component({selector: 'app'})
@View({template: "<h1>WebWorker MessageBroker Test</h1>"})
export class App {
  constructor(private _serviceBrokerFactory: ServiceMessageBrokerFactory) {
    var broker = _serviceBrokerFactory.createMessageBroker(ECHO_CHANNEL, false);
    broker.registerMethod("echo", [PRIMITIVE], this._echo, PRIMITIVE);
  }

  private _echo(val: string) {
    return PromiseWrapper.wrap(() => { return val; });
  }
}
