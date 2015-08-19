import {bootstrap, Component, BaseView, ViewEncapsulation} from 'angular2/bootstrap';
import {MdProgressLinear} from 'angular2_material/src/components/progress-linear/progress_linear';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';
import {bind} from 'angular2/di';

@Component({
  selector: 'demo-app',
})
@BaseView({
  templateUrl: './demo_app.html',
  directives: [MdProgressLinear],
  encapsulation: ViewEncapsulation.NONE,
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
