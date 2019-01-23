/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Inject, InjectionToken, NgModule, Optional, Pipe} from '@angular/core';
import {TestBed, getTestBed} from '@angular/core/testing/src/test_bed';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

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

@Component({selector: 'with-refs-cmp', template: '<div #firstDiv></div>'})
export class WithRefsCmp {
}

@Component({selector: 'inherited-cmp', template: 'inherited'})
export class InheritedCmp extends SimpleCmp {
}

@Directive({selector: '[hostBindingDir]', host: {'[id]': 'id'}})
export class HostBindingDir {
  id = 'one';
}

@Component({
  selector: 'component-with-prop-bindings',
  template: `
    <div hostBindingDir [title]="title" [attr.aria-label]="label"></div>
    <p title="( {{ label }} - {{ title }} )" [attr.aria-label]="label" id="[ {{ label }} ] [ {{ title }} ]">
    </p>
  `
})
export class ComponentWithPropBindings {
  title = 'some title';
  label = 'some label';
}

@Component({
  selector: 'simple-app',
  template: `
    <simple-cmp></simple-cmp> - <inherited-cmp></inherited-cmp>
  `
})
export class SimpleApp {
}

@Component({selector: 'inline-template', template: '<p>Hello</p>'})
export class ComponentWithInlineTemplate {
}

@NgModule({
  declarations: [
    HelloWorld, SimpleCmp, WithRefsCmp, InheritedCmp, SimpleApp, ComponentWithPropBindings,
    HostBindingDir
  ],
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

  it('should give the ability to access property bindings on a node', () => {
    const fixture = TestBed.createComponent(ComponentWithPropBindings);
    fixture.detectChanges();

    const divElement = fixture.debugElement.query(By.css('div'));
    expect(divElement.properties).toEqual({id: 'one', title: 'some title'});
  });

  it('should give the ability to access interpolated properties on a node', () => {
    const fixture = TestBed.createComponent(ComponentWithPropBindings);
    fixture.detectChanges();

    const paragraphEl = fixture.debugElement.query(By.css('p'));
    expect(paragraphEl.properties)
        .toEqual({title: '( some label - some title )', id: '[ some label ] [ some title ]'});
  });

  it('should give access to the node injector', () => {
    const fixture = TestBed.createComponent(HelloWorld);
    fixture.detectChanges();
    const injector = fixture.debugElement.query(By.css('greeting-cmp')).injector;

    // from the node injector
    const greetingCmp = injector.get(GreetingCmp);
    expect(greetingCmp.constructor).toBe(GreetingCmp);

    // from the node injector (inherited from a parent node)
    const helloWorldCmp = injector.get(HelloWorld);
    expect(fixture.componentInstance).toBe(helloWorldCmp);

    const nameInjected = injector.get(NAME);
    expect(nameInjected).toEqual('World!');
  });

  it('should give access to the node injector for root node', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    const injector = hello.debugElement.injector;

    // from the node injector
    const helloInjected = injector.get(HelloWorld);
    expect(helloInjected).toBe(hello.componentInstance);

    // from the module injector
    const nameInjected = injector.get(NAME);
    expect(nameInjected).toEqual('World!');
  });

  it('should give access to local refs on a node', () => {
    const withRefsCmp = TestBed.createComponent(WithRefsCmp);
    const firstDivDebugEl = withRefsCmp.debugElement.query(By.css('div'));
    // assert that a native element is referenced by a local ref
    expect(firstDivDebugEl.references.firstDiv.tagName.toLowerCase()).toBe('div');
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

  it('should resolve components that are extended by other components', () => {
    // SimpleApp uses SimpleCmp in its template, which is extended by InheritedCmp
    const simpleApp = TestBed.createComponent(SimpleApp);
    simpleApp.detectChanges();
    expect(simpleApp.nativeElement).toHaveText('simple - inherited');
  });

  it('should resolve components without async resources synchronously', (done) => {
    TestBed
        .configureTestingModule({
          declarations: [ComponentWithInlineTemplate],
        })
        .compileComponents()
        .then(done)
        .catch(error => {
          // This should not throw any errors. If an error is thrown, the test will fail.
          // Specifically use `catch` here to mark the test as done and *then* throw the error
          // so that the test isn't treated as a timeout.
          done();
          throw error;
        });

    // Intentionally call `createComponent` before `compileComponents` is resolved. We want this to
    // work for components that don't have any async resources (templateUrl, styleUrls).
    TestBed.createComponent(ComponentWithInlineTemplate);
  });

  onlyInIvy('patched ng defs should be removed after resetting TestingModule')
      .it('make sure we restore ng defs to their initial states', () => {
        @Pipe({name: 'somePipe', pure: true})
        class SomePipe {
          transform(value: string): string { return `transformed ${value}`; }
        }

        @Directive({selector: 'someDirective'})
        class SomeDirective {
          someProp = 'hello';
        }

        @Component({selector: 'comp', template: 'someText'})
        class SomeComponent {
        }

        @NgModule({declarations: [SomeComponent]})
        class SomeModule {
        }

        TestBed.configureTestingModule({imports: [SomeModule]});

        // adding Pipe and Directive via metadata override
        TestBed.overrideModule(
            SomeModule, {set: {declarations: [SomeComponent, SomePipe, SomeDirective]}});
        TestBed.overrideComponent(
            SomeComponent, {set: {template: `<span someDirective>{{'hello' | somePipe}}</span>`}});
        TestBed.createComponent(SomeComponent);

        const defBeforeReset = (SomeComponent as any).ngComponentDef;
        expect(defBeforeReset.pipeDefs().length).toEqual(1);
        expect(defBeforeReset.directiveDefs().length).toEqual(2);  // directive + component

        TestBed.resetTestingModule();

        const defAfterReset = (SomeComponent as any).ngComponentDef;
        expect(defAfterReset.pipeDefs().length).toEqual(0);
        expect(defAfterReset.directiveDefs().length).toEqual(1);  // component
      });
});
