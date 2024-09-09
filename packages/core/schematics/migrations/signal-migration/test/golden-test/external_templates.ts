// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  templateUrl: './external_templates.html',
  selector: 'with-template',
})
export class WithTemplate {
  @Input() test = true;
}
