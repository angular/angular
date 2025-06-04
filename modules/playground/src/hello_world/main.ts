/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Directive, ElementRef, Injectable, NgModule, Renderer2} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

// A service available to the Injector, used by the HelloCmp component.
@Injectable()
export class GreetingService {
  greeting: string = 'hello';
}

// Directives are light-weight. They don't allow new
// expression contexts (use @Component for those needs).
@Directive({
  selector: '[red]',
  standalone: false,
})
export class RedDec {
  // ElementRef is always injectable and it wraps the element on which the
  // directive was found by the compiler.
  constructor(el: ElementRef, renderer: Renderer2) {
    renderer.setStyle(el.nativeElement, 'color', 'red');
  }
}

// Angular supports 2 basic types of directives:
// - Component - the basic building blocks of Angular apps. Backed by
//   ShadowDom. (https://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/)
// - Directive - add behavior to existing elements.

@Component({
  // The Selector prop tells Angular on which elements to instantiate this
  // class. The syntax supported is a basic subset of CSS selectors, for example
  // 'element', '[attr]', [attr=foo]', etc.
  selector: 'hello-app',
  // These are services that would be created if a class in the component's
  // template tries to inject them.
  viewProviders: [GreetingService],
  // Expressions in the template (like {{greeting}}) are evaluated in the
  // context of the HelloCmp class below.
  template: `<div class="greeting">{{ greeting }} <span red>world</span>!</div>
    <button class="changeButton" (click)="changeGreeting()">change greeting</button>`,
  standalone: false,
})
export class HelloCmp {
  greeting: string;

  constructor(service: GreetingService) {
    this.greeting = service.greeting;
  }

  changeGreeting(): void {
    this.greeting = 'howdy';
  }
}

@NgModule({declarations: [HelloCmp, RedDec], bootstrap: [HelloCmp], imports: [BrowserModule]})
export class ExampleModule {}

platformBrowser().bootstrapModule(ExampleModule);
