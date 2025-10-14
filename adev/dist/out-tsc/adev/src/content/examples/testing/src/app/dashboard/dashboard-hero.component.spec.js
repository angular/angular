import {__esDecorate, __runInitializers} from 'tslib';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {addMatchers, click} from '../../testing';
import {appProviders} from '../app.config';
import {DashboardHeroComponent} from './dashboard-hero.component';
beforeEach(addMatchers);
describe('DashboardHeroComponent when tested directly', () => {
  let comp;
  let expectedHero;
  let fixture;
  let heroDe;
  let heroEl;
  beforeEach(() => {
    // #docregion setup, config-testbed
    TestBed.configureTestingModule({
      providers: appProviders,
    });
    // #enddocregion setup, config-testbed
  });
  beforeEach(async () => {
    // #docregion setup
    fixture = TestBed.createComponent(DashboardHeroComponent);
    fixture.autoDetectChanges();
    comp = fixture.componentInstance;
    // find the hero's DebugElement and element
    heroDe = fixture.debugElement.query(By.css('.hero'));
    heroEl = heroDe.nativeElement;
    // mock the hero supplied by the parent component
    expectedHero = {id: 42, name: 'Test Name'};
    // simulate the parent setting the input property with that hero
    fixture.componentRef.setInput('hero', expectedHero);
    // wait for initial data binding
    await fixture.whenStable();
    // #enddocregion setup
  });
  // #docregion name-test
  it('should display hero name in uppercase', () => {
    const expectedPipedName = expectedHero.name.toUpperCase();
    expect(heroEl.textContent).toContain(expectedPipedName);
  });
  // #enddocregion name-test
  // #docregion click-test
  it('should raise selected event when clicked (triggerEventHandler)', () => {
    let selectedHero;
    comp.selected.subscribe((hero) => (selectedHero = hero));
    // #docregion trigger-event-handler
    heroDe.triggerEventHandler('click');
    // #enddocregion trigger-event-handler
    expect(selectedHero).toBe(expectedHero);
  });
  // #enddocregion click-test
  // #docregion click-test-2
  it('should raise selected event when clicked (element.click)', () => {
    let selectedHero;
    comp.selected.subscribe((hero) => (selectedHero = hero));
    heroEl.click();
    expect(selectedHero).toBe(expectedHero);
  });
  // #enddocregion click-test-2
  // #docregion click-test-3
  it('should raise selected event when clicked (click helper with DebugElement)', () => {
    let selectedHero;
    comp.selected.subscribe((hero) => (selectedHero = hero));
    click(heroDe); // click helper with DebugElement
    expect(selectedHero).toBe(expectedHero);
  });
  // #enddocregion click-test-3
  it('should raise selected event when clicked (click helper with native element)', () => {
    let selectedHero;
    comp.selected.subscribe((hero) => (selectedHero = hero));
    click(heroEl); // click helper with native element
    expect(selectedHero).toBe(expectedHero);
  });
});
//////////////////
describe('DashboardHeroComponent when inside a test host', () => {
  let testHost;
  let fixture;
  let heroEl;
  beforeEach(waitForAsync(() => {
    // #docregion test-host-setup
    TestBed.configureTestingModule({
      providers: appProviders,
    });
    // #enddocregion test-host-setup
  }));
  beforeEach(() => {
    // #docregion test-host-setup
    // create TestHostComponent instead of DashboardHeroComponent
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    heroEl = fixture.nativeElement.querySelector('.hero');
    fixture.detectChanges(); // trigger initial data binding
    // #enddocregion test-host-setup
  });
  // #docregion test-host-tests
  it('should display hero name', () => {
    const expectedPipedName = testHost.hero.name.toUpperCase();
    expect(heroEl.textContent).toContain(expectedPipedName);
  });
  it('should raise selected event when clicked', () => {
    click(heroEl);
    // selected hero should be the same data bound hero
    expect(testHost.selectedHero).toBe(testHost.hero);
  });
  // #enddocregion test-host-tests
});
////// Test Host Component //////
import {Component} from '@angular/core';
// #docregion test-host
let TestHostComponent = (() => {
  let _classDecorators = [
    Component({
      imports: [DashboardHeroComponent],
      template: ` <dashboard-hero [hero]="hero" (selected)="onSelected($event)"> </dashboard-hero>`,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TestHostComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      TestHostComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    hero = {id: 42, name: 'Test Name'};
    selectedHero;
    onSelected(hero) {
      this.selectedHero = hero;
    }
  };
  return (TestHostComponent = _classThis);
})();
// #enddocregion test-host
//# sourceMappingURL=dashboard-hero.component.spec.js.map
