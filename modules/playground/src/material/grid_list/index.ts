import {bootstrap} from 'angular2/bootstrap';
import {bind, provide, Component, View, ViewEncapsulation} from 'angular2/core';
import {MdGridList, MdGridTile} from 'angular2_material/src/components/grid_list/grid_list';
import {UrlResolver} from 'angular2/compiler';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';


@Component({
  selector: 'demo-app',
})
@View({
  templateUrl: './demo_app.html',
  directives: [MdGridList, MdGridTile],
  encapsulation: ViewEncapsulation.None,
})
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
  bootstrap(DemoApp, [provide(UrlResolver, {useValue: new DemoUrlResolver()})]);
}
