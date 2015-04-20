import {Component, Decorator, View, NgElement} from 'angular2/angular2';
import {Injectable} from 'angular2/di';

// Angular 2.0 supports 3 basic types of directives:
// - Component - the basic building blocks of Angular 2.0 apps. Backed by
//   ShadowDom.(http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/)
// - Decorator - add behavior to existing elements.
// - Viewport - allow for stamping out of a html template (not in this demo).

// @Component is AtScript syntax to annotate the HelloCmp class as an Angular
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
export class HelloCmp {
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
