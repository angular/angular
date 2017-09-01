import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'expansion-demo',
  styleUrls: ['expansion-demo.css'],
  templateUrl: 'expansion-demo.html',
  encapsulation: ViewEncapsulation.None,
})
export class ExpansionDemo {
  displayMode: string = 'default';
  multi = false;
  hideToggle = false;
  disabled = false;
  showPanel3 = true;
  expandedHeight: string;
  collapsedHeight: string;
}
