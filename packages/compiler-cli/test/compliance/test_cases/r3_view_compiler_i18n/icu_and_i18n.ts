import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div i18n>
      <div *ngFor="let diskView of disks">
        {{diskView.name}} has {diskView.length, plural, =1 {VM} other {VMs}}
      </div>
    </div>
  `,
})
export class MyComponent {
  disks: any;
}
