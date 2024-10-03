import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>
    {gender, select, male {male {{ weight }}} female {female {{ height }}} other {other}}
    <span *ngIf="ageVisible">
      {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {{ otherAge }}}}
    </span>
  </div>
`,
    standalone: false
})
export class MyComponent {
  gender = 'male';
  weight = 1;
  height = 1;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
