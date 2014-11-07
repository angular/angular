import {bootstrap, Component, Decorator, TemplateConfig, NgElement} from 'core/core';

@Component({
  selector: 'hello-app',
  componentServices: [GreetingService],
  template: new TemplateConfig({
    inline: `{{greeting}} <span red>world</foo>!`,
    directives: [RedDec]
  })
})
class HelloCmp {
  constructor(service: GreetingService) {
    this.greeting = service.greeting;
  }
}

@Decorator({
  selector: '[red]'
})
class RedDec {
  constructor(el: NgElement) {
    el.domElement.style.color = 'red';
  }
}

class GreetingService {
  constructor() {
    this.greeting = 'hello';
  }
}

export function main() {
  bootstrap(HelloCmp);
}
