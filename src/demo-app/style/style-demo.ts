import {Component} from '@angular/core';
import {FocusOriginMonitor} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'style-demo',
  templateUrl: 'style-demo.html',
  styleUrls: ['style-demo.css'],
})
export class StyleDemo {
  constructor(public fom: FocusOriginMonitor) {}
}
