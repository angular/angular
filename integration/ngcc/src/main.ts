import {Component, NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

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
  imports: [BrowserModule, MatButtonModule],
  bootstrap: [HelloWorld],
})
class Module {
}

platformBrowser().bootstrapModule(Module);
