import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <ng-template let-obj>
      <button (click)="obj.value = 1">Change</button>
    </ng-template>
  `,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
