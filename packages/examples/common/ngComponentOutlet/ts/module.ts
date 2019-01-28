/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {COMPILER_OPTIONS, Compiler, CompilerFactory, Component, Injectable, Injector, NgModule, NgModuleFactory} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {JitCompilerFactory} from '@angular/platform-browser-dynamic';



// #docregion SimpleExample
@Component({selector: 'hello-world', template: 'Hello World!'})
export class HelloWorld {
}

@Component({
  selector: 'ng-component-outlet-simple-example',
  template: `<ng-container *ngComponentOutlet="HelloWorld"></ng-container>`
})
export class NgTemplateOutletSimpleExample {
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
export class NgTemplateOutletCompleteExample {
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

// #docregion NgModuleFactoryExample
@Component({selector: 'other-module-component', template: `Other Module Component!`})
export class OtherModuleComponent {
}

@Component({
  selector: 'ng-component-outlet-other-module-example',
  template: `
    <ng-container *ngComponentOutlet="OtherModuleComponent;
                                      ngModuleFactory: myModule;"></ng-container>`
})
export class NgTemplateOutletOtherModuleExample {
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
export class AppComponent {
}

@NgModule({
  imports: [CommonModule],
  declarations: [OtherModuleComponent],
  entryComponents: [OtherModuleComponent]
})
export class OtherModule {
}

export function createCompiler(compilerFactory: CompilerFactory) {
  return compilerFactory.createCompiler();
}

@NgModule({
  imports: [BrowserModule],
  declarations: [
    AppComponent, NgTemplateOutletSimpleExample, NgTemplateOutletCompleteExample,
    NgTemplateOutletOtherModuleExample, HelloWorld, CompleteComponent
  ],
  entryComponents: [HelloWorld, CompleteComponent],
  providers: [
    // Setup the JIT compiler that is not set up by default because the examples
    // are bootstrapped using their NgModule factory. Since this example uses the
    // JIT compiler, we manually set it up for this module.
    {provide: COMPILER_OPTIONS, useValue: {}, multi: true},
    {provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS]},
    {provide: Compiler, useFactory: createCompiler, deps: [CompilerFactory]}
  ]
})
export class AppModule {
}
