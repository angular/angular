import {bootstrap, Component, Decorator, View, NgElement} from 'angular2/angular2';
import {Binding, Injectable, bind} from 'angular2/di';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_factory';
import * as rvf from 'angular2/src/render/dom/view/view_factory';

// Angular 2.0 supports 3 basic types of directives:
// - Component - the basic building blocks of Angular 2.0 apps. Backed by
//   ShadowDom.(http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/)
// - Decorator - add behavior to existing elements.
// - Viewport - allow for stamping out of a html template (not in this demo).

// @Component is TypeScript syntax to annotate the HelloCmp class as an Angular
// 2.0 component.
@Component({
  // The Selector prop tells Angular on which elements to instantiate this
  // class. The syntax supported is a basic subset of CSS selectors, for example
  // 'element', '[attr]', [attr=foo]', etc.
  selector: 'hello-app',
  // These are services that would be created if a class in the component's
  // template tries to inject them.
  injectables: [GreetingService]
})
// The template for the component.
@View({
  // Expressions in the template (like {{greeting}}) are evaluated in the
  // context of the HelloCmp class below.
  template: `<div class="greeting">{{greeting}} <span red>world</span>!</div>
           <button class="changeButton" (click)="changeGreeting()">change greeting</button><content></content>`,
  // All directives used in the template need to be specified. This allows for
  // modularity (RedDec can only be used in this template)
  // and better tooling (the template can be invalidated if the attribute is
  // misspelled).
  directives: [RedDec]
})
class HelloCmp {
  greeting: string;
  constructor(service: GreetingService) {
    this.greeting = service.greeting;
  }
  changeGreeting() {
    this.greeting = 'howdy';
  }
}

// Decorators are light-weight. They don't allow for templates, or new
// expression contexts (use @Component or @Viewport for those needs).
@Decorator({
  selector: '[red]'
})
class RedDec {
  // NgElement is always injectable and it wraps the element on which the
  // directive was found by the compiler.
  constructor(el: NgElement) {
    el.domElement.style.color = 'red';
  }
}

// A service available to the Injector, used by the HelloCmp component.
@Injectable()
class GreetingService {
  greeting:string;
  constructor() {
    this.greeting = 'hello';
  }
}

function createBindings() {
  // You can specify bindings for the app injector to override default injection
  // behavior.
  return [
      bind(VIEW_POOL_CAPACITY).toValue(10000),
      bind(rvf.VIEW_POOL_CAPACITY).toValue(10000)
  ];
}

export function main() {
  // Initializing the reflector is only required for the Dart version of the application.
  // When using Dart, the reflection information is not embedded by default in the source code
  // to keep the size of the generated file small. Importing ReflectionCapabilities and initializing
  // the reflector is required to use the reflection information from Dart mirrors.
  // Dart mirrors are not intended to be use in production code.
  // Angular 2 provides a transformer which generates static code rather than rely on reflection.
  // For an example, run `pub serve` on the Dart application and inspect this file in your browser.
  reflector.reflectionCapabilities = new ReflectionCapabilities();

  // Bootstrapping only requires specifying a root component.
  // The boundary between the Angular application and the rest of the page is
  // the shadowDom of this root component.
  // The selector of the component passed in is used to find where to insert the
  // application.
  // You can use the light dom of the <hello-app> tag as temporary content (for
  // example 'Loading...') before the application is ready.
  bootstrap(HelloCmp, createBindings());
}
