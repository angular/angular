import {BoundClassResolver, Component, ResolvedAttribute} from '@angular/core';

@Component({
  selector: 'ui-button',
  template: '<ng-content />',
})
export class UiButton {}

@Component({
  selector: 'my-component',
  imports: [UiButton],
  template: `<ui-button class="px-2" (class)="classes">Save</ui-button>`,
})
export class MyComponent {
  classes(cn: BoundClassResolver): ResolvedAttribute {
    return cn();
  }
}
