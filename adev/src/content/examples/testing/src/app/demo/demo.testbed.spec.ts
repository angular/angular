// #docplaster
import {Component, DebugElement, Injectable} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  inject,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {FormsModule, NgControl, NgModel} from '@angular/forms';
import {By} from '@angular/platform-browser';

import {addMatchers, click} from '../../testing';

import {
  BankAccountComponent,
  BankAccountParentComponent,
  Child1Component,
  Child2Component,
  Child3Component,
  ExternalTemplateComponent,
  InputComponent,
  IoComponent,
  IoParentComponent,
  LightswitchComponent,
  MasterService,
  MyIfChildComponent,
  MyIfComponent,
  MyIfParentComponent,
  NeedsContentComponent,
  ParentComponent,
  ReversePipeComponent,
  ShellComponent,
  TestProvidersComponent,
  TestViewProvidersComponent,
  ValueService,
} from './demo';

export class NotProvided extends ValueService {
  /* example below */
}
beforeEach(addMatchers);

describe('demo (with TestBed):', () => {
  ////////  Service Tests  /////////////

  describe('ValueService', () => {
    // #docregion value-service-before-each
    let service: ValueService;

    // #docregion value-service-inject-before-each
    beforeEach(() => {
      TestBed.configureTestingModule({providers: [ValueService]});
      // #enddocregion value-service-before-each
      service = TestBed.inject(ValueService);
      // #docregion value-service-before-each
    });
    // #enddocregion value-service-before-each, value-service-inject-before-each

    // #docregion value-service-inject-it
    it('should use ValueService', () => {
      service = TestBed.inject(ValueService);
      expect(service.getValue()).toBe('real value');
    });
    // #enddocregion value-service-inject-it

    it('can inject a default value when service is not provided', () => {
      // #docregion testbed-get-w-null
      expect(TestBed.inject(NotProvided, null)).toBeNull();
      // #enddocregion testbed-get-w-null
    });

    it('test should wait for ValueService.getPromiseValue', waitForAsync(() => {
      service.getPromiseValue().then((value) => expect(value).toBe('promise value'));
    }));

    it('test should wait for ValueService.getObservableValue', waitForAsync(() => {
      service.getObservableValue().subscribe((value) => expect(value).toBe('observable value'));
    }));

    // Must use done. See https://github.com/angular/angular/issues/10127
    it('test should wait for ValueService.getObservableDelayValue', (done: DoneFn) => {
      service.getObservableDelayValue().subscribe((value) => {
        expect(value).toBe('observable delay value');
        done();
      });
    });

    it('should allow the use of fakeAsync', fakeAsync(() => {
      let value: any;
      service.getPromiseValue().then((val: any) => (value = val));
      tick(); // Trigger JS engine cycle until all promises resolve.
      expect(value).toBe('promise value');
    }));
  });

  describe('MasterService', () => {
    // #docregion master-service-before-each
    let masterService: MasterService;
    let valueServiceSpy: jasmine.SpyObj<ValueService>;

    beforeEach(() => {
      const spy = jasmine.createSpyObj('ValueService', ['getValue']);

      TestBed.configureTestingModule({
        // Provide both the service-to-test and its (spy) dependency
        providers: [MasterService, {provide: ValueService, useValue: spy}],
      });
      // Inject both the service-to-test and its (spy) dependency
      masterService = TestBed.inject(MasterService);
      valueServiceSpy = TestBed.inject(ValueService) as jasmine.SpyObj<ValueService>;
    });
    // #enddocregion master-service-before-each

    // #docregion master-service-it
    it('#getValue should return stubbed value from a spy', () => {
      const stubValue = 'stub value';
      valueServiceSpy.getValue.and.returnValue(stubValue);

      expect(masterService.getValue()).withContext('service returned stub value').toBe(stubValue);
      expect(valueServiceSpy.getValue.calls.count())
        .withContext('spy method was called once')
        .toBe(1);
      expect(valueServiceSpy.getValue.calls.mostRecent().returnValue).toBe(stubValue);
    });
    // #enddocregion master-service-it
  });

  describe('use inject within `it`', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({providers: [ValueService]});
    });

    it('should use modified providers', inject([ValueService], (service: ValueService) => {
      service.setValue('value modified in beforeEach');
      expect(service.getValue()).toBe('value modified in beforeEach');
    }));
  });

  describe('using waitForAsync(inject) within beforeEach', () => {
    let serviceValue: string;

    beforeEach(() => {
      TestBed.configureTestingModule({providers: [ValueService]});
    });

    beforeEach(waitForAsync(
      inject([ValueService], (service: ValueService) => {
        service.getPromiseValue().then((value) => (serviceValue = value));
      }),
    ));

    it('should use asynchronously modified value ... in synchronous test', () => {
      expect(serviceValue).toBe('promise value');
    });
  });

  /////////// Component Tests //////////////////

  describe('TestBed component tests', () => {
    // beforeEach(waitForAsync(() => {
    //   TestBed.configureTestingModule()
    //     // Compile everything in DemoModule
    //     ;
    // }));

    it('should create a component with inline template', () => {
      const fixture = TestBed.createComponent(Child1Component);
      fixture.detectChanges();

      expect(fixture).toHaveText('Child');
    });

    it('should create a component with external template', () => {
      const fixture = TestBed.createComponent(ExternalTemplateComponent);
      fixture.detectChanges();

      expect(fixture).toHaveText('from external template');
    });

    it('should allow changing members of the component', () => {
      const fixture = TestBed.createComponent(MyIfComponent);

      fixture.detectChanges();
      expect(fixture).toHaveText('MyIf()');

      fixture.componentInstance.showMore = true;
      fixture.detectChanges();
      expect(fixture).toHaveText('MyIf(More)');
    });

    it('should create a nested component bound to inputs/outputs', () => {
      const fixture = TestBed.createComponent(IoParentComponent);

      fixture.detectChanges();
      const heroes = fixture.debugElement.queryAll(By.css('.hero'));
      expect(heroes.length).withContext('has heroes').toBeGreaterThan(0);

      const comp = fixture.componentInstance;
      const hero = comp.heroes[0];

      click(heroes[0]);
      fixture.detectChanges();

      const selected = fixture.debugElement.query(By.css('p'));
      expect(selected).toHaveText(hero.name);
    });

    it('can access the instance variable of an `*ngFor` row component', () => {
      const fixture = TestBed.createComponent(IoParentComponent);
      const comp = fixture.componentInstance;
      const heroName = comp.heroes[0].name; // first hero's name

      fixture.detectChanges();
      const ngForRow = fixture.debugElement.query(By.directive(IoComponent)); // first hero ngForRow

      const hero = ngForRow.context.hero; // the hero object passed into the row
      expect(hero.name).withContext('ngRow.context.hero').toBe(heroName);

      const rowComp = ngForRow.componentInstance;
      // jasmine.any is an "instance-of-type" test.
      expect(rowComp).withContext('component is IoComp').toEqual(jasmine.any(IoComponent));
      expect(rowComp.hero.name).withContext('component.hero').toBe(heroName);
    });

    it('should support clicking a button', () => {
      const fixture = TestBed.createComponent(LightswitchComponent);
      const btn = fixture.debugElement.query(By.css('button'));
      const span = fixture.debugElement.query(By.css('span')).nativeElement;

      fixture.detectChanges();
      expect(span.textContent)
        .withContext('before click')
        .toMatch(/is off/i);

      click(btn);
      fixture.detectChanges();
      expect(span.textContent).withContext('after click').toMatch(/is on/i);
    });

    // ngModel is async so we must wait for it with promise-based `whenStable`
    it('should support entering text in input box (ngModel)', waitForAsync(() => {
      const expectedOrigName = 'John';
      const expectedNewName = 'Sally';

      const fixture = TestBed.createComponent(InputComponent);
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

      expect(comp.name)
        .withContext(`At start name should be ${expectedOrigName} `)
        .toBe(expectedOrigName);

      // wait until ngModel binds comp.name to input box
      fixture
        .whenStable()
        .then(() => {
          expect(input.value)
            .withContext(
              `After ngModel updates input box, input.value should be ${expectedOrigName} `,
            )
            .toBe(expectedOrigName);

          // simulate user entering new name in input
          input.value = expectedNewName;

          // that change doesn't flow to the component immediately
          expect(comp.name)
            .withContext(
              `comp.name should still be ${expectedOrigName} after value change, before binding happens`,
            )
            .toBe(expectedOrigName);

          // Dispatch a DOM event so that Angular learns of input value change.
          // then wait while ngModel pushes input.box value to comp.name
          input.dispatchEvent(new Event('input'));
          return fixture.whenStable();
        })
        .then(() => {
          expect(comp.name)
            .withContext(`After ngModel updates the model, comp.name should be ${expectedNewName} `)
            .toBe(expectedNewName);
        });
    }));

    // fakeAsync version of ngModel input test enables sync test style
    // synchronous `tick` replaces asynchronous promise-base `whenStable`
    it('should support entering text in input box (ngModel) - fakeAsync', fakeAsync(() => {
      const expectedOrigName = 'John';
      const expectedNewName = 'Sally';

      const fixture = TestBed.createComponent(InputComponent);
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

      expect(comp.name)
        .withContext(`At start name should be ${expectedOrigName} `)
        .toBe(expectedOrigName);

      // wait until ngModel binds comp.name to input box
      tick();
      expect(input.value)
        .withContext(`After ngModel updates input box, input.value should be ${expectedOrigName} `)
        .toBe(expectedOrigName);

      // simulate user entering new name in input
      input.value = expectedNewName;

      // that change doesn't flow to the component immediately
      expect(comp.name)
        .withContext(
          `comp.name should still be ${expectedOrigName} after value change, before binding happens`,
        )
        .toBe(expectedOrigName);

      // Dispatch a DOM event so that Angular learns of input value change.
      // then wait a tick while ngModel pushes input.box value to comp.name
      input.dispatchEvent(new Event('input'));
      tick();
      expect(comp.name)
        .withContext(`After ngModel updates the model, comp.name should be ${expectedNewName} `)
        .toBe(expectedNewName);
    }));

    it('ReversePipeComp should reverse the input text', fakeAsync(() => {
      const inputText = 'the quick brown fox.';
      const expectedText = '.xof nworb kciuq eht';

      const fixture = TestBed.createComponent(ReversePipeComponent);
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
      const span = fixture.debugElement.query(By.css('span')).nativeElement as HTMLElement;

      // simulate user entering new name in input
      input.value = inputText;

      // Dispatch a DOM event so that Angular learns of input value change.
      // then wait a tick while ngModel pushes input.box value to comp.text
      // and Angular updates the output span
      input.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();
      expect(span.textContent).withContext('output span').toBe(expectedText);
      expect(comp.text).withContext('component.text').toBe(inputText);
    }));

    // Use this technique to find attached directives of any kind
    it('can examine attached directives and listeners', () => {
      const fixture = TestBed.createComponent(InputComponent);
      fixture.detectChanges();

      const inputEl = fixture.debugElement.query(By.css('input'));

      expect(inputEl.providerTokens).withContext('NgModel directive').toContain(NgModel);

      const ngControl = inputEl.injector.get(NgControl);
      expect(ngControl).withContext('NgControl directive').toEqual(jasmine.any(NgControl));

      expect(inputEl.listeners.length).withContext('several listeners attached').toBeGreaterThan(2);
    });

    it('BankAccountComponent should set attributes, styles, classes, and properties', () => {
      const fixture = TestBed.createComponent(BankAccountParentComponent);
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      // the only child is debugElement of the BankAccount component
      const el = fixture.debugElement.children[0];
      const childComp = el.componentInstance as BankAccountComponent;
      expect(childComp).toEqual(jasmine.any(BankAccountComponent));

      expect(el.context).withContext('context is the child component').toBe(childComp);

      expect(el.attributes['account']).withContext('account attribute').toBe(childComp.id);
      expect(el.attributes['bank']).withContext('bank attribute').toBe(childComp.bank);

      expect(el.classes['closed']).withContext('closed class').toBe(true);
      expect(el.classes['open']).withContext('open class').toBeFalsy();

      expect(el.styles['color']).withContext('color style').toBe(comp.color);
      expect(el.styles['width'])
        .withContext('width style')
        .toBe(comp.width + 'px');

      // Removed on 12/02/2016 when ceased public discussion of the `Renderer`. Revive in future?
      // expect(el.properties['customProperty']).toBe(true, 'customProperty');
    });
  });

  describe('TestBed component overrides:', () => {
    it("should override ChildComp's template", () => {
      const fixture = TestBed.configureTestingModule({
        imports: [Child1Component],
      })
        .overrideComponent(Child1Component, {
          set: {template: '<span>Fake</span>'},
        })
        .createComponent(Child1Component);

      fixture.detectChanges();
      expect(fixture).toHaveText('Fake');
    });

    it("should override TestProvidersComp's ValueService provider", () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestProvidersComponent],
      })
        .overrideComponent(TestProvidersComponent, {
          remove: {providers: [ValueService]},
          add: {providers: [{provide: ValueService, useClass: FakeValueService}]},

          // Or replace them all (this component has only one provider)
          // set:    { providers: [{ provide: ValueService, useClass: FakeValueService }] },
        })
        .createComponent(TestProvidersComponent);

      fixture.detectChanges();
      expect(fixture).toHaveText('injected value: faked value', 'text');

      // Explore the providerTokens
      const tokens = fixture.debugElement.providerTokens;
      expect(tokens).withContext('component ctor').toContain(fixture.componentInstance.constructor);
      expect(tokens).withContext('TestProvidersComp').toContain(TestProvidersComponent);
      expect(tokens).withContext('ValueService').toContain(ValueService);
    });

    it("should override TestViewProvidersComp's ValueService viewProvider", () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestViewProvidersComponent],
      })
        .overrideComponent(TestViewProvidersComponent, {
          // remove: { viewProviders: [ValueService]},
          // add:    { viewProviders: [{ provide: ValueService, useClass: FakeValueService }]
          // },

          // Or replace them all (this component has only one viewProvider)
          set: {viewProviders: [{provide: ValueService, useClass: FakeValueService}]},
        })
        .createComponent(TestViewProvidersComponent);

      fixture.detectChanges();
      expect(fixture).toHaveText('injected value: faked value');
    });

    it("injected provider should not be same as component's provider", () => {
      // TestComponent is parent of TestProvidersComponent
      @Component({
        template: '<my-service-comp></my-service-comp>',
        imports: [TestProvidersComponent],
      })
      class TestComponent {}

      // 3 levels of ValueService provider: module, TestComponent, TestProvidersComponent
      const fixture = TestBed.configureTestingModule({
        imports: [TestComponent, TestProvidersComponent],
        providers: [ValueService],
      })
        .overrideComponent(TestComponent, {
          set: {providers: [{provide: ValueService, useValue: {}}]},
        })
        .overrideComponent(TestProvidersComponent, {
          set: {providers: [{provide: ValueService, useClass: FakeValueService}]},
        })
        .createComponent(TestComponent);

      let testBedProvider!: ValueService;

      // `inject` uses TestBed's injector
      inject([ValueService], (s: ValueService) => (testBedProvider = s))();
      const tcProvider = fixture.debugElement.injector.get(ValueService) as ValueService;
      const tpcProvider = fixture.debugElement.children[0].injector.get(
        ValueService,
      ) as FakeValueService;

      expect(testBedProvider).withContext('testBed/tc not same providers').not.toBe(tcProvider);
      expect(testBedProvider).withContext('testBed/tpc not same providers').not.toBe(tpcProvider);

      expect(testBedProvider instanceof ValueService)
        .withContext('testBedProvider is ValueService')
        .toBe(true);
      expect(tcProvider)
        .withContext('tcProvider is {}')
        .toEqual({} as ValueService);
      expect(tpcProvider instanceof FakeValueService)
        .withContext('tpcProvider is FakeValueService')
        .toBe(true);
    });

    it('can access template local variables as references', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [
          ShellComponent,
          NeedsContentComponent,
          Child1Component,
          Child2Component,
          Child3Component,
        ],
      })
        .overrideComponent(ShellComponent, {
          set: {
            selector: 'test-shell',
            imports: [NeedsContentComponent, Child1Component, Child2Component, Child3Component],
            template: `
          <needs-content #nc>
            <child-1 #content text="My"></child-1>
            <child-2 #content text="dog"></child-2>
            <child-2 text="has"></child-2>
            <child-3 #content text="fleas"></child-3>
            <div #content>!</div>
          </needs-content>
          `,
          },
        })
        .createComponent(ShellComponent);

      fixture.detectChanges();

      // NeedsContentComp is the child of ShellComp
      const el = fixture.debugElement.children[0];
      const comp = el.componentInstance;

      expect(comp.children.toArray().length)
        .withContext('three different child components and an ElementRef with #content')
        .toBe(4);

      expect(el.references['nc']).withContext('#nc reference to component').toBe(comp);

      // #docregion custom-predicate
      // Filter for DebugElements with a #content reference
      const contentRefs = el.queryAll((de) => de.references['content']);
      // #enddocregion custom-predicate
      expect(contentRefs.length).withContext('elements w/ a #content reference').toBe(4);
    });
  });

  describe('nested (one-deep) component override', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ParentComponent, FakeChildComponent],
      }).overrideComponent(ParentComponent, {
        set: {imports: [FakeChildComponent]},
      });
    });

    it('ParentComp should use Fake Child component', () => {
      const fixture = TestBed.createComponent(ParentComponent);
      fixture.detectChanges();
      expect(fixture).toHaveText('Parent(Fake Child)');
    });
  });

  describe('nested (two-deep) component override', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ParentComponent, FakeChildWithGrandchildComponent, FakeGrandchildComponent],
      }).overrideComponent(ParentComponent, {
        set: {imports: [FakeChildWithGrandchildComponent, FakeGrandchildComponent]},
      });
    });

    it('should use Fake Grandchild component', () => {
      const fixture = TestBed.createComponent(ParentComponent);
      fixture.detectChanges();
      expect(fixture).toHaveText('Parent(Fake Child(Fake Grandchild))');
    });
  });

  describe('lifecycle hooks w/ MyIfParentComp', () => {
    let fixture: ComponentFixture<MyIfParentComponent>;
    let parent: MyIfParentComponent;
    let child: MyIfChildComponent;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [FormsModule, MyIfChildComponent, MyIfParentComponent],
      });

      fixture = TestBed.createComponent(MyIfParentComponent);
      parent = fixture.componentInstance;
    });

    it('should instantiate parent component', () => {
      expect(parent).withContext('parent component should exist').not.toBeNull();
    });

    it('parent component OnInit should NOT be called before first detectChanges()', () => {
      expect(parent.ngOnInitCalled).toBe(false);
    });

    it('parent component OnInit should be called after first detectChanges()', () => {
      fixture.detectChanges();
      expect(parent.ngOnInitCalled).toBe(true);
    });

    it('child component should exist after OnInit', () => {
      fixture.detectChanges();
      getChild();
      expect(child instanceof MyIfChildComponent)
        .withContext('should create child')
        .toBe(true);
    });

    it("should have called child component's OnInit ", () => {
      fixture.detectChanges();
      getChild();
      expect(child.ngOnInitCalled).toBe(true);
    });

    it('child component called OnChanges once', () => {
      fixture.detectChanges();
      getChild();
      expect(child.ngOnChangesCounter).toBe(1);
    });

    it('changed parent value flows to child', () => {
      fixture.detectChanges();
      getChild();

      parent.parentValue = 'foo';
      fixture.detectChanges();

      expect(child.ngOnChangesCounter)
        .withContext('expected 2 changes: initial value and changed value')
        .toBe(2);
      expect(child.childValue).withContext('childValue should eq changed parent value').toBe('foo');
    });

    // must be async test to see child flow to parent
    it('changed child value flows to parent', waitForAsync(() => {
      fixture.detectChanges();
      getChild();

      child.childValue = 'bar';

      return new Promise<void>((resolve) => {
        // Wait one JS engine turn!
        setTimeout(() => resolve(), 0);
      }).then(() => {
        fixture.detectChanges();

        expect(child.ngOnChangesCounter)
          .withContext('expected 2 changes: initial value and changed value')
          .toBe(2);
        expect(parent.parentValue)
          .withContext('parentValue should eq changed parent value')
          .toBe('bar');
      });
    }));

    it('clicking "Close Child" triggers child OnDestroy', () => {
      fixture.detectChanges();
      getChild();

      const btn = fixture.debugElement.query(By.css('button'));
      click(btn);

      fixture.detectChanges();
      expect(child.ngOnDestroyCalled).toBe(true);
    });

    ////// helpers ///
    /**
     * Get the MyIfChildComp from parent; fail w/ good message if cannot.
     */
    function getChild() {
      let childDe: DebugElement; // DebugElement that should hold the MyIfChildComp

      // The Hard Way: requires detailed knowledge of the parent template
      try {
        childDe = fixture.debugElement.children[4].children[0];
      } catch (err) {
        /* we'll report the error */
      }

      // DebugElement.queryAll: if we wanted all of many instances:
      childDe = fixture.debugElement.queryAll(
        (de) => de.componentInstance instanceof MyIfChildComponent,
      )[0];

      // WE'LL USE THIS APPROACH !
      // DebugElement.query: find first instance (if any)
      childDe = fixture.debugElement.query(
        (de) => de.componentInstance instanceof MyIfChildComponent,
      );

      if (childDe && childDe.componentInstance) {
        child = childDe.componentInstance;
      } else {
        fail('Unable to find MyIfChildComp within MyIfParentComp');
      }

      return child;
    }
  });
});
////////// Fakes ///////////

@Component({
  selector: 'child-1',
  template: 'Fake Child',
})
class FakeChildComponent {}

@Component({
  selector: 'grandchild-1',
  template: 'Fake Grandchild',
})
class FakeGrandchildComponent {}

@Component({
  selector: 'child-1',
  imports: [FakeGrandchildComponent],
  template: 'Fake Child(<grandchild-1></grandchild-1>)',
})
class FakeChildWithGrandchildComponent {}

@Injectable()
class FakeValueService extends ValueService {
  override value = 'faked value';
}
