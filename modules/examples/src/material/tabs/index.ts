import {bootstrap, Component, View} from 'angular2/angular2';
import {bind} from 'angular2/di';

import {MdTabs, MdTab, MdTabLabel, MdTabContent} from 'angular2_material/src/components/tabs/tabs';

import {UrlResolver} from 'angular2/src/services/url_resolver';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';


@Component({selector: 'demo-app'})
@View({templateUrl: './demo_app.html', directives: [MdTabs, MdTab, MdTabLabel, MdTabContent]})
class DemoApp {
  vegetablesLabel: string;
  fruitsLabel: string;
  vegetables: string;
  fruits: string;
  nope: boolean;

  constructor() {
    this.fruitsLabel = 'Fruits';
    this.vegetablesLabel = 'Vegetables';
    this.vegetables = 'Carrots, beets';
    this.fruits = 'Apples, cherries';
    this.nope = false;
  }
}

export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [bind(UrlResolver).toValue(new DemoUrlResolver())]);
}
