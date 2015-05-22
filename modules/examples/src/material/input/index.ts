import {bootstrap, Component, View} from 'angular2/angular2';
import {MdInputContainer, MdInput} from 'angular2_material/src/components/input/input';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';
import {bind} from 'angular2/di';

@Component({selector: 'demo-app'})
@View({templateUrl: './demo_app.html', directives: [MdInputContainer, MdInput]})
class DemoApp {
  constructor() {}
}

export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [bind(UrlResolver).toValue(new DemoUrlResolver())]);
}
