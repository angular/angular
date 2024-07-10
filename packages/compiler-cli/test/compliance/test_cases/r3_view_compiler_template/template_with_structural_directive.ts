import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  standalone: true,
  template: `
  <ng-template *ngIf="true">Content</ng-template>
`,
})
export class MyComponent {
}
