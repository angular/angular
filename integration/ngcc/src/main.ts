import {Component, NgModule, ɵrenderComponent as renderComponent} from '@angular/core';
import {CommonModule} from '@angular/common';
@Component({
  selector: 'hello-world',
  template: `
    <button (click)="visible = true">See Message</button>
    <h2 *ngIf="visible">Hello World</h2>
  `,
})
class HelloWorld {
  visible = false;
}

@NgModule({
  declarations: [HelloWorld],
  imports: [CommonModule],
})
class Module {}

renderComponent(HelloWorld);
