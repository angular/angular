import { Component } from '@angular/core';

@Component({
  selector: 'app-zippy-ngprojectas',
  template: `
  <h2>Content projection with ngProjectAs</h2>
  <ng-content></ng-content>
  <ng-content select="[question]"></ng-content>
`
})
export class ZippyNgprojectasComponent {}
