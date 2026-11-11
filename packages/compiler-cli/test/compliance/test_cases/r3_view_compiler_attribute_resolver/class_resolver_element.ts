import {BoundClassResolver, Component, ResolvedAttribute} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `<div class="p-2" [class.px-4]="wide" (class)="classes"></div>`,
})
export class MyComponent {
  wide = true;
  extra = 'py-1';

  classes(cn: BoundClassResolver): ResolvedAttribute {
    return cn(this.extra);
  }
}
