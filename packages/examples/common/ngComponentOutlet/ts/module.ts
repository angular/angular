/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable, Injector, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';


// #docregion SimpleExample
@Component({selector: 'hello-world', template: 'Hello World!'})
export class HelloWorld {
}

@Component({
  selector: 'ng-component-outlet-simple-example',
  template: `<ng-container *ngComponentOutlet="HelloWorld"></ng-container>`
})
export class NgComponentOutletSimpleExample {
  // This field is necessary to expose HelloWorld to the template.
  HelloWorld = HelloWorld;
}
// #enddocregion

// #docregion CompleteExample
@Injectable()
export class Greeter {
  suffix = '!';
}

@Component({
  selector: 'complete-component',
  template: `Complete: <ng-content></ng-content> <ng-content></ng-content>{{ greeter.suffix }}`
})
export class CompleteComponent {
  constructor(public greeter: Greeter) {}
}

@Component({
  selector: 'ng-component-outlet-complete-example',
  template: `
    <ng-container *ngComponentOutlet="CompleteComponent;
                                      injector: myInjector;
                                      content: myContent"></ng-container>`
})
export class NgComponentOutletCompleteExample {
  // This field is necessary to expose CompleteComponent to the template.
  CompleteComponent = CompleteComponent;
  myInjector: Injector;

  myContent = [[document.createTextNode('Ahoj')], [document.createTextNode('Svet')]];

  constructor(injector: Injector) {
    this.myInjector =
        Injector.create({providers: [{provide: Greeter, deps: []}], parent: injector});
  }
}
// #enddocregion


@Component({
  selector: 'example-app',
  template: `<ng-component-outlet-simple-example></ng-component-outlet-simple-example>
             <hr/>
             <ng-component-outlet-complete-example></ng-component-outlet-complete-example>`
})
export class AppComponent {
}

@NgModule({
  imports: [BrowserModule],
  declarations: [
    AppComponent, NgComponentOutletSimpleExample, NgComponentOutletCompleteExample, HelloWorld,
    CompleteComponent
  ],
  entryComponents: [HelloWorld, CompleteComponent]
})
export class AppModule {
}
