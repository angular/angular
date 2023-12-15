import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  standalone: true,
  template: `
  <div attr class="attr"></div>
  <div ngProjectAs="selector" class="selector"></div>
  <div style="width:0px" class="width"></div>
  <div [tabindex]="tabIndex" class="tabindex"></div>
  <div *ngIf="cond" class="ngIf"></div>
  <div aria-label="label" i18n-aria-label class="aria-label"></div>
  <div all ngProjectAs="all" style="all:all" [all]="all" *all="all" i18n-all class="all"></div>
`
})
export class MyComponent {
  tabIndex = 0;
}
