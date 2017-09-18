import {Component} from '@angular/core';
import {FocusMonitor} from '@angular/cdk/a11y';


@Component({
  moduleId: module.id,
  selector: 'focus-origin-demo',
  templateUrl: 'focus-origin-demo.html',
  styleUrls: ['focus-origin-demo.css'],
})
export class FocusOriginDemo {
  constructor(public fom: FocusMonitor) {}
}
