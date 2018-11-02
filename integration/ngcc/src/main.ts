import {Component, NgModule, ɵrenderComponent as renderComponent} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'hello-world',
  template: `
    <button mat-button (click)="visible = true">See Message</button>
    <h2 *ngIf="visible">Hello World</h2>
  `,
})
class HelloWorld {
  visible = false;
}

@NgModule({
  declarations: [HelloWorld],
  imports: [CommonModule, MatButtonModule],
})
class Module {}

renderComponent(HelloWorld);
