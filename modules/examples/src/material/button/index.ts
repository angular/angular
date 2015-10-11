import {bootstrap} from 'angular2/bootstrap';
import {bind, provide, Component, NgFor, UrlResolver, View, ViewEncapsulation} from 'angular2/core';
import {MdButton, MdAnchor} from 'angular2_material/src/components/button/button';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';

@Component({
  selector: 'demo-app',
})
@View({
  templateUrl: './demo_app.html',
  directives: [MdButton, MdAnchor, NgFor],
  encapsulation: ViewEncapsulation.None
})
class DemoApp {
  previousClick: string;
  action: string;
  clickCount: number;
  items: number[];

  constructor() {
    this.previousClick = 'Nothing';
    this.action = "ACTIVATE";
    this.clickCount = 0;
    this.items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  }

  click(msg: string) {
    this.previousClick = msg;
  }

  submit(msg: string, event) {
    event.preventDefault();
    this.previousClick = msg;
  }

  increment() {
    this.clickCount++;
  }
}

export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [provide(UrlResolver, {asValue: new DemoUrlResolver()})]);
}
