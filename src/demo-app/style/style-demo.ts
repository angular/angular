import {Component, Renderer} from '@angular/core';
import {FocusOriginMonitor} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'style-demo',
  templateUrl: 'style-demo.html',
  styleUrls: ['style-demo.css'],
})
export class StyleDemo {
  constructor(public renderer: Renderer, public fom: FocusOriginMonitor) {}
}
