import {bootstrap, Component, Directive, View} from 'angular2/angular2';
import {MdCheckbox} from 'angular2_material/src/components/checkbox/checkbox';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';
import {bind} from 'angular2/di';

@Component({selector: 'demo-app'})
@View({templateUrl: './demo_app.html', directives: [MdCheckbox]})
class DemoApp {
  toggleCount: number;

  constructor() {
    this.toggleCount = 0;
  }

  increment() {
    this.toggleCount++;
  }
}

export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [bind(UrlResolver).toValue(new DemoUrlResolver())]);
}
