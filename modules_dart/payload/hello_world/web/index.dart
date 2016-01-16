library hello_world.index;

import "package:angular2/bootstrap.dart" show AngularEntrypoint, bootstrap;
import "package:angular2/angular2.dart"
    show Component, Directive, ElementRef, Injectable, Renderer;

@AngularEntrypoint("Hello World Entrypoint")
main() {
  bootstrap(HelloCmp);
}

@Injectable()
class GreetingService {
  String greeting = "hello";
}

@Directive(selector: "[red]")
class RedDec {
  RedDec(ElementRef el, Renderer renderer) {
    renderer.setElementStyle(el, "color", "red");
  }
}

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
