import {bootstrap} from 'angular2/bootstrap';
import {Component, View} from 'angular2/core';
import {Zippy} from './zippy';

@Component({selector: 'zippy-app'})
@View({
  template: `
    <zippy (open)="pushLog('open')" (close)="pushLog('close')" title="Details">
      This is some content.
    </zippy>
    <ul>
      <li *ng-for="var log of logs">{{log}}</li>
    </ul>
  `,
  directives: [Zippy]
})
class ZippyApp {
  logs: string[] = [];

  pushLog(log: string) { this.logs.push(log); }
}

export function main() {
  bootstrap(ZippyApp);
}
