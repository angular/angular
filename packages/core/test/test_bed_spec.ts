/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Inject, InjectionToken, NgModule, Optional} from '@angular/core';
import {TestBed, getTestBed} from '@angular/core/testing/src/test_bed';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';

const NAME = new InjectionToken<string>('name');

// -- module: HWModule
@Component({
  selector: 'hello-world',
  template: '<greeting-cmp></greeting-cmp>',
})
export class HelloWorld {
}

// -- module: Greeting
@Component({
  selector: 'greeting-cmp',
  template: 'Hello {{ name }}',
})
export class GreetingCmp {
  name: string;

  constructor(@Inject(NAME) @Optional() name: string) { this.name = name || 'nobody!'; }
}

@NgModule({
  declarations: [GreetingCmp],
  exports: [GreetingCmp],
})
export class GreetingModule {
}

@Component({selector: 'simple-cmp', template: '<b>simple</b>'})
export class SimpleCmp {
}

@NgModule({
  declarations: [HelloWorld, SimpleCmp],
  imports: [GreetingModule],
  providers: [
    {provide: NAME, useValue: 'World!'},
  ]
})
export class HelloWorldModule {
}

describe('TestBed', () => {
  beforeEach(() => {
    getTestBed().resetTestingModule();
    TestBed.configureTestingModule({imports: [HelloWorldModule]});
  });

  it('should compile and render a component', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    expect(hello.nativeElement).toHaveText('Hello World!');
  });

  it('should give access to the component instance', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    expect(hello.componentInstance).toBeAnInstanceOf(HelloWorld);
  });

  it('should give the ability to query by css', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    const greetingByCss = hello.debugElement.query(By.css('greeting-cmp'));
    expect(greetingByCss.nativeElement).toHaveText('Hello World!');
    expect(greetingByCss.componentInstance).toBeAnInstanceOf(GreetingCmp);
  });

  it('should give the ability to trigger the change detection', () => {
    const hello = TestBed.createComponent(HelloWorld);

    hello.detectChanges();
    const greetingByCss = hello.debugElement.query(By.css('greeting-cmp'));
    expect(greetingByCss.nativeElement).toHaveText('Hello World!');

    greetingByCss.componentInstance.name = 'TestBed!';
    hello.detectChanges();
    expect(greetingByCss.nativeElement).toHaveText('Hello TestBed!');
  });


  it('should give access to the node injector', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    const injector = hello.debugElement.query(By.css('greeting-cmp')).injector;

    // from the node injector
    const helloInjected = injector.get(HelloWorld);
    expect(helloInjected).toBe(hello.componentInstance);

    // from the module injector
    const nameInjected = injector.get(NAME);
    expect(nameInjected).toEqual('World!');
  });

  it('should give the ability to query by directive', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    const greetingByDirective = hello.debugElement.query(By.directive(GreetingCmp));
    expect(greetingByDirective.componentInstance).toBeAnInstanceOf(GreetingCmp);
  });


  it('allow to override a template', () => {
    // use original template when there is no override
    let hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello World!');

    // override the template
    getTestBed().resetTestingModule();
    TestBed.configureTestingModule({imports: [HelloWorldModule]});
    TestBed.overrideComponent(GreetingCmp, {set: {template: `Bonjour {{ name }}`}});
    hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Bonjour World!');

    // restore the original template by calling `.resetTestingModule()`
    getTestBed().resetTestingModule();
    TestBed.configureTestingModule({imports: [HelloWorldModule]});
    hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello World!');
  });

  it('allow to override a provider', () => {
    TestBed.overrideProvider(NAME, {useValue: 'injected World !'});
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello injected World !');
  });
});
