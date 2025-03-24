import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <ul *ngFor="let outer of items">
      <li *ngFor="let middle of outer.items">
        <div *ngFor="let inner of items"
             (click)="onClick(outer, middle, inner)"
             [title]="format(outer, middle, inner, component)"
             >
          {{format(outer, middle, inner, component)}}
        </div>
      </li>
    </ul>`,
    standalone: false
})
export class MyComponent {
  component = this;
  format(outer: any, middle: any, inner: any) {}
  onClick(outer: any, middle: any, inner: any) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
