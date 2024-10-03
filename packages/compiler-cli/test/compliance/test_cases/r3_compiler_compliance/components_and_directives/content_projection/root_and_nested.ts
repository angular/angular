import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    <ng-content select="[id=toMainBefore]"></ng-content>
    <ng-template>
      <ng-content select="[id=toTemplate]"></ng-content>
      <ng-template>
        <ng-content select="[id=toNestedTemplate]"></ng-content>
      </ng-template>
    </ng-template>
    <ng-template>
      '*' selector in a template: <ng-content></ng-content>
    </ng-template>
    <ng-content select="[id=toMainAfter]"></ng-content>
  `,
    standalone: false
})
class Cmp {
}

@NgModule({declarations: [Cmp]})
class Module {
}
