import {bootstrap, Component, View, NgFor} from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
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
  directives: [Zippy, NgFor]
})
class ZippyApp {
  logs: Array<string> = [];

  pushLog(log: string) { this.logs.push(log); }
}

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(ZippyApp);
}
