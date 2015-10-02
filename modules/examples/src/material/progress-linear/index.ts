import {bootstrap} from 'angular2/bootstrap';
import {bind, Component, View, ViewEncapsulation} from 'angular2/core';
import {MdProgressLinear} from 'angular2_material/src/components/progress-linear/progress_linear';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';

@Component({
  selector: 'demo-app',
})
@View({
  templateUrl: './demo_app.html',
  directives: [MdProgressLinear],
  encapsulation: ViewEncapsulation.None,
})
class DemoApp {
  progress: number;

  constructor() {
    this.progress = 40;
  }

  step(s: number) {
    this.progress += s;
  }
}

export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [bind(UrlResolver).toValue(new DemoUrlResolver())]);
}
