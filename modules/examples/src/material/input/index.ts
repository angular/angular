import {bootstrap, Component, View, ViewEncapsulation} from 'angular2/bootstrap';
import {MdInputContainer, MdInput} from 'angular2_material/src/components/input/input';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';
import {bind} from 'angular2/core';

@Component({selector: 'demo-app'})
@View({
  templateUrl: './demo_app.html',
  directives: [MdInputContainer, MdInput],
  encapsulation: ViewEncapsulation.None
})
class DemoApp {
  constructor() {}
}

export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [bind(UrlResolver).toValue(new DemoUrlResolver())]);
}
