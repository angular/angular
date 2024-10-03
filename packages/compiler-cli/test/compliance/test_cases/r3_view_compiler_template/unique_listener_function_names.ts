import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div *ngFor="let item of items">
      <p (click)="$event">{{ item }}</p>
      <p (click)="$event">{{ item }}</p>
    </div>
    <div *ngFor="let item of items">
      <p (click)="$event">{{ item }}</p>
    </div>
  `,
    standalone: false
})
export class MyComponent {
  items = [4, 2];
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
