import {HelloWorldComponent, HelloWorldShadowComponent, TestCardComponent} from './elements';

import {NgModule, Injector} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {createCustomElement} from '@angular/elements';


@NgModule({
  declarations: [HelloWorldComponent, HelloWorldShadowComponent, TestCardComponent],
  entryComponents: [HelloWorldComponent, HelloWorldShadowComponent, TestCardComponent],
  imports: [BrowserModule],
})
export class AppModule {
  constructor(private injector:Injector){
    customElements.define(
      'hello-world-el',
      createCustomElement(HelloWorldComponent, {injector})
    );
    customElements.define(
      'hello-world-shadow-el',
      createCustomElement(HelloWorldShadowComponent, {injector})
    );
    customElements.define(
      'test-card',
      createCustomElement(HelloWorldShadowComponent, {injector})
    );
  }
  ngDoBootstrap(){

  }
}

export {HelloWorldComponent};
