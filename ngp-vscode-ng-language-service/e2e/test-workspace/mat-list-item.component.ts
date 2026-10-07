import {Component, Input} from '@angular/core';

@Component({
  selector: '[mat-list-item]',
  standalone: true,
  template: '<ng-content></ng-content>',
})
export class MatListItemStub {
  @Input() activated: boolean = false;
}
