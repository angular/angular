import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div *ngFor="let item of items">
       <div #foo></div>
        <span *ngIf="showing">
          {{ foo }} - {{ item }}
        </span>
    </div>`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
