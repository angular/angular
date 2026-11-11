import {BoundClassResolver, Component, ResolvedAttribute} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `@if (show) { <div (class)="classes"></div> }`,
})
export class MyComponent {
  show = true;

  classes(cn: BoundClassResolver): ResolvedAttribute {
    return cn();
  }
}
