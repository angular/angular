/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Compiler, Component, Injectable, Injector, NgModule, NgModuleFactory, ReflectiveInjector} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';



// #docregion SimpleExample
@Component({selector: 'hello-world', template: 'Hello World!'})
class HelloWorld {
}

@Component({
  selector: 'ng-component-outlet-simple-example',
  template: `<ng-container *ngComponentOutlet="HelloWorld"></ng-container>`
})
class NgTemplateOutletSimpleExample {
  // This field is necessary to expose HelloWorld to the template.
  HelloWorld = HelloWorld;
}
// #enddocregion

// #docregion CompleteExample
@Injectable()
class Greeter {
  suffix = '!';
}

@Component({
  selector: 'complete-component',
  template: `Complete: <ng-content></ng-content> <ng-content></ng-content>{{ greeter.suffix }}`
})
class CompleteComponent {
  constructor(public greeter: Greeter) {}
}

@Component({
  selector: 'ng-component-outlet-complete-example',
  template: `
    <ng-container *ngComponentOutlet="CompleteComponent; 
                                      injector: myInjector; 
                                      content: myContent"></ng-container>`
})
class NgTemplateOutletCompleteExample {
  // This field is necessary to expose CompleteComponent to the template.
  CompleteComponent = CompleteComponent;
  myInjector: Injector;

  myContent = [[document.createTextNode('Ahoj')], [document.createTextNode('Svet')]];

  constructor(injector: Injector) {
    this.myInjector = ReflectiveInjector.resolveAndCreate([Greeter], injector);
  }
}
// #enddocregion

// #docregion NgModuleFactoryExample
@Component({selector: 'other-module-component', template: `Other Module Component!`})
class OtherModuleComponent {
}

@Component({
  selector: 'ng-component-outlet-other-module-example',
  template: `
    <ng-container *ngComponentOutlet="OtherModuleComponent;
                                      ngModuleFactory: myModule;"></ng-container>`
})
class NgTemplateOutletOtherModuleExample {
  // This field is necessary to expose OtherModuleComponent to the template.
  OtherModuleComponent = OtherModuleComponent;
  myModule: NgModuleFactory<any>;

  constructor(compiler: Compiler) { this.myModule = compiler.compileModuleSync(OtherModule); }
}
// #enddocregion


@Component({
  selector: 'example-app',
  template: `<ng-component-outlet-simple-example></ng-component-outlet-simple-example>
             <hr/>
             <ng-component-outlet-complete-example></ng-component-outlet-complete-example>
             <hr/>
             <ng-component-outlet-other-module-example></ng-component-outlet-other-module-example>`
})
class ExampleApp {
}

@NgModule({
  imports: [BrowserModule],
  declarations: [
    ExampleApp, NgTemplateOutletSimpleExample, NgTemplateOutletCompleteExample,
    NgTemplateOutletOtherModuleExample, HelloWorld, CompleteComponent
  ],
  entryComponents: [HelloWorld, CompleteComponent],
  bootstrap: [ExampleApp]
})
export class AppModule {
}

@NgModule({
  imports: [CommonModule],
  declarations: [OtherModuleComponent],
  entryComponents: [OtherModuleComponent]
})
export class OtherModule {
}