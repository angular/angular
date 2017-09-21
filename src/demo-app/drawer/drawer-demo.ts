import {Component, ViewEncapsulation} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'drawer-demo',
  templateUrl: 'drawer-demo.html',
  styleUrls: ['drawer-demo.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class DrawerDemo {
  invert = false;
}
