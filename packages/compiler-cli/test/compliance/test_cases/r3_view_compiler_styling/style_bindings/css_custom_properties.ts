import {Component} from '@angular/core';

@Component({
    selector: 'my-dir',
    template: `
    <div 
      [style.--camelCase]="value" 
      [style.--kebab-case]="value" 
      style="--camelCase: foo; --kebab-case: foo">
    </div>
  `,
    standalone: false
})
export class MyComponent {
  value: any;
}
