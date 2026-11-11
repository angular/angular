import {BoundClassResolver, Component, ResolvedAttribute} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `@if (show) { <span></span> }`,
  host: {'(class)': 'classes'},
})
export class MyComponent {
  show = true;

  classes(cn: BoundClassResolver): ResolvedAttribute {
    return cn();
  }
}
