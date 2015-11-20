library hello_world.index;

import "package:angular2/bootstrap.dart" show bootstrap;
import "package:angular2/core.dart"
    show ElementRef, Component, Directive, Injectable;
import "package:angular2/render.dart" show Renderer;

main() {
  // Bootstrapping only requires specifying a root component.

  // The boundary between the Angular application and the rest of the page is

  // the shadowDom of this root component.

  // The selector of the component passed in is used to find where to insert the

  // application.

  // You can use the light dom of the <hello-app> tag as temporary content (for

  // example 'Loading...') before the application is ready.
  bootstrap(HelloCmp);
}

// A service available to the Injector, used by the HelloCmp component.
@Injectable()
class GreetingService {
  String greeting = "hello";
}
// Directives are light-weight. They don't allow new

// expression contexts (use @Component for those needs).
@Directive(selector: "[red]")
class RedDec {
  // ElementRef is always injectable and it wraps the element on which the

  // directive was found by the compiler.
  RedDec(ElementRef el, Renderer renderer) {
    renderer.setElementStyle(el, "color", "red");
  }
}
// Angular 2.0 supports 2 basic types of directives:

// - Component - the basic building blocks of Angular 2.0 apps. Backed by

//   ShadowDom.(http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/)

// - Directive - add behavior to existing elements.

// @Component is AtScript syntax to annotate the HelloCmp class as an Angular

// 2.0 component.
@Component(
    selector: "hello-app",
    viewProviders: const [GreetingService],
    template:
        '''<div class="greeting">{{greeting}} <span red>world</span>!</div>
           <button class="changeButton" (click)="changeGreeting()">change greeting</button>''',
    directives: const [RedDec])
class HelloCmp {
  String greeting;
  HelloCmp(GreetingService service) {
    this.greeting = service.greeting;
  }
  void changeGreeting() {
    this.greeting = "howdy";
  }
}
