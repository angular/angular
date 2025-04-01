/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Injectable,
  Injector,
  Input,
  NgModule,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

// #docregion SimpleExample
@Component({
  selector: 'hello-world',
  template: 'Hello World!',
  standalone: false,
})
export class HelloWorld {}

@Component({
  selector: 'ng-component-outlet-simple-example',
  template: `<ng-container *ngComponentOutlet="HelloWorld"></ng-container>`,
  standalone: false,
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
  template: `{{ label }}: <ng-content></ng-content> <ng-content></ng-content>{{ greeter.suffix }}`,
  standalone: false,
})
export class CompleteComponent {
  @Input() label!: string;

  constructor(public greeter: Greeter) {}
}

@Component({
  selector: 'ng-component-outlet-complete-example',
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
  standalone: false,
})
export class NgComponentOutletCompleteExample implements OnInit {
  // This field is necessary to expose CompleteComponent to the template.
  CompleteComponent = CompleteComponent;

  myInputs = {'label': 'Complete'};

  myInjector: Injector;
  @ViewChild('ahoj', {static: true}) ahojTemplateRef!: TemplateRef<any>;
  @ViewChild('svet', {static: true}) svetTemplateRef!: TemplateRef<any>;
  myContent?: any[][];

  constructor(
    injector: Injector,
    private vcr: ViewContainerRef,
  ) {
    this.myInjector = Injector.create({
      providers: [{provide: Greeter, deps: []}],
      parent: injector,
    });
  }

  ngOnInit() {
    // Create the projectable content from the templates
    this.myContent = [
      this.vcr.createEmbeddedView(this.ahojTemplateRef).rootNodes,
      this.vcr.createEmbeddedView(this.svetTemplateRef).rootNodes,
    ];
  }
}
// #enddocregion

@Component({
  selector: 'example-app',
  template: `<ng-component-outlet-simple-example></ng-component-outlet-simple-example>
    <hr />
    <ng-component-outlet-complete-example></ng-component-outlet-complete-example>`,
  standalone: false,
})
export class AppComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [
    AppComponent,
    NgComponentOutletSimpleExample,
    NgComponentOutletCompleteExample,
    HelloWorld,
    CompleteComponent,
  ],
})
export class AppModule {}
