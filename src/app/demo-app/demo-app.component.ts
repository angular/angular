import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ZippyComponent } from './zippy/zippy.component';

@Component({
  selector: 'app-demo-component',
  templateUrl: './demo-app.component.html',
  styleUrls: ['./demo-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DemoAppComponent {
  @ViewChild(ZippyComponent) zippy: ZippyComponent;
  @ViewChild('elementReference') elementRef: ElementRef;

  @Input('input_one') inputOne = 'input one';
  @Input() inputTwo = 'input two';

  @Output() outputOne = new EventEmitter();
  @Output('output_two') outputTwo = new EventEmitter();

  getTitle(): '► Click to expand' | '▼ Click to collapse' {
    if (!this.zippy || !this.zippy.visible) {
      return '► Click to expand';
    }
    return '▼ Click to collapse';
  }
}
