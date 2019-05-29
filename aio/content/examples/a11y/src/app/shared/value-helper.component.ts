import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-value-helper',
  templateUrl: './value-helper.component.html',
  styles: [`
    .value-label {
      position:relative;
      top: -15px;
    }
`]
})
export class ValueHelperComponent {
  @Input() displayValue: any;

}
