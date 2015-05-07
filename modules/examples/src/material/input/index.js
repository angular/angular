import {bootstrap} from 'angular2/angular2';
import {MdInputContainer, MdInput, MdTextarea} from 'angular2_material/src/components/input/input'
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';
import {bind} from 'angular2/di';

// TODO(radokirov): Once the application is transpiled by TS instead of Traceur,
// add those imports back into 'angular2/angular2';
import {Component, Directive} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';

@Component({
  selector: 'demo-app'
})
@View({
  templateUrl: './demo_app.html',
  directives: [MdInputContainer, MdInput, MdTextarea]
})
class DemoApp {
  constructor() {

  }
}

export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [
    bind(UrlResolver).toValue(new DemoUrlResolver())
  ]);
}
