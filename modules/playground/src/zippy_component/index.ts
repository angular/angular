import {bootstrap} from 'angular2/platform/browser';
import {Component} from 'angular2/core';
import {Zippy} from './zippy';

@Component({
  selector: 'zippy-app',
  template: `
    <zippy (open)="pushLog('open')" (close)="pushLog('close')" title="Details">
      This is some content.
    </zippy>
    <ul>
      <li *ngFor="var log of logs">{{log}}</li>
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
