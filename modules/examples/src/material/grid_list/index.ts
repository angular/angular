import {bootstrap, Component, View} from 'angular2/angular2';
import {MdGridList, MdGridTile} from 'angular2_material/src/components/grid_list/grid_list';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';
import {bind} from 'angular2/di';

@Component({selector: 'demo-app'})
@View({templateUrl: './demo_app.html', directives: [MdGridList, MdGridTile]})
class DemoApp {
  tile3RowSpan: number;
  tile3ColSpan: number;

  constructor() {
    this.tile3RowSpan = 3;
    this.tile3ColSpan = 3;
  }
}

export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [bind(UrlResolver).toValue(new DemoUrlResolver())]);
}
