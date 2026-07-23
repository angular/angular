// tslint:disable

import {Component, Input} from '@angular/core';

// @ts-ignore
import {} from 'google3/javascript/angular2/testing/catalyst/fake_async';

function renderComponent(inputs: Partial<TestableSecondaryRangePicker> = {}) {}

@Component({
  standalone: false,
  jit: true,
  template: '<bla [(ngModel)]="incompatible">',
})
class TestableSecondaryRangePicker {
  @Input() bla = true;
  @Input() incompatible = true;
}
