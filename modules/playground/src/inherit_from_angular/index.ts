//main entry point
import {bootstrap} from '@angular/platform-browser';
import { Directive, Component, ViewContainerRef, TemplateRef, Injectable } from '@angular/core';
import { NgIf } from '@angular/common';

@Injectable()
class MyService { }

@Directive({
  selector: '[ngIfService]'
})
class NgIfService extends NgIf {
  constructor(_viewContainerRef: ViewContainerRef, _templateRef: TemplateRef<Object>, myService: MyService) {
    super(_viewContainerRef, _templateRef);
    console.log(myService);
    if (myService) {
      Object.getOwnPropertyDescriptor(NgIf.prototype, 'ngIf').set.apply(this, [true])
    } else {
      Object.getOwnPropertyDescriptor(NgIf.prototype, 'ngIf').set.apply(this, [false])
    }
  }
}

@Component({
  selector: 'my-app',
  providers: [MyService],
  template: `
    <div>
      <h2>Hello</h2>
      <div class="service" *ngIfService>Your service is present</div>
    </div>
  `,
  directives: [NgIfService]
})
class App {
  constructor() {
  }
}


export function main() {
  bootstrap(App)
}
