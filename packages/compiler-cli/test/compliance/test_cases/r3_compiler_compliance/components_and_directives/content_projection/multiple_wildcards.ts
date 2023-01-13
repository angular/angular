import {Component, NgModule} from '@angular/core';

@Component({
  template: `
    <ng-content></ng-content>
    <ng-content select="[spacer]"></ng-content>
    <ng-content></ng-content>
  `,
})
class Cmp {
}

@NgModule({declarations: [Cmp]})
class Module {
}
