import { Component } from '@angular/core';

@Component({
  selector: 'app-zippy-ngprojectas',
  template: `
  <h2>Content projection with ngProjectAs</h2>
  Default:
  <ng-content></ng-content>
  Question:
  <ng-content select="[question]"></ng-content>
`
})
export class ZippyNgprojectasComponent {}
