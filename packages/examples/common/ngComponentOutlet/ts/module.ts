/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgComponentOutlet} from '@angular/common';
import {
  Component,
  effect,
  Injectable,
  Injector,
  input,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';

// #docregion SimpleExample
@Component({
  selector: 'hello-world',
  template: 'Hello World!',
})
export class HelloWorld {}

@Component({
  selector: 'ng-component-outlet-simple-example',
  imports: [NgComponentOutlet],
  template: `<ng-container *ngComponentOutlet="HelloWorld"></ng-container>`,
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
  template: `{{ label() }}: <ng-content></ng-content> <ng-content></ng-content
    >{{ greeter.suffix }}`,
})
export class CompleteComponent {
  label = input.required<string>();

  constructor(public greeter: Greeter) {}
}

@Component({
  selector: 'ng-component-outlet-complete-example',
  imports: [NgComponentOutlet],
  template: ` <ng-template #ahoj>Ahoj</ng-template>
    <ng-template #svet>Svet</ng-template>
    <ng-container
      *ngComponentOutlet="
        CompleteComponent;
        inputs: myInputs;
        injector: myInjector;
        content: myContent
      "
    ></ng-container>`,
})
export class NgComponentOutletCompleteExample {
  // This field is necessary to expose CompleteComponent to the template.
  CompleteComponent = CompleteComponent;

  myInputs = {'label': 'Complete'};

  myInjector: Injector;
  ahojTemplateRef = viewChild.required<TemplateRef<any>>('ahoj');
  svetTemplateRef = viewChild.required<TemplateRef<any>>('svet');
  myContent?: any[][];

  constructor(
    injector: Injector,
    private vcr: ViewContainerRef,
  ) {
    this.myInjector = Injector.create({
      providers: [{provide: Greeter, deps: []}],
      parent: injector,
    });

    effect(() => {
      this.myContent = [
        this.vcr.createEmbeddedView(this.ahojTemplateRef()).rootNodes,
        this.vcr.createEmbeddedView(this.svetTemplateRef()).rootNodes,
      ];
    });
  }
}
// #enddocregion

@Component({
  selector: 'example-app',
  imports: [NgComponentOutletSimpleExample, NgComponentOutletCompleteExample],
  template: `<ng-component-outlet-simple-example />
    <hr />
    <ng-component-outlet-complete-example />`,
})
export class AppComponent {}
