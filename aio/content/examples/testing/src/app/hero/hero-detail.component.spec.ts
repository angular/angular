// #docplaster
import {
  async, ComponentFixture, fakeAsync, inject, TestBed, tick
} from '@angular/core/testing';

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  ActivatedRoute, ActivatedRouteStub, click, newEvent, Router, RouterStub
} from '../../testing';

import { Hero }                from '../model';
import { HeroDetailComponent } from './hero-detail.component';
import { HeroDetailService }   from './hero-detail.service';
import { HeroModule }          from './hero.module';

////// Testing Vars //////
let activatedRoute: ActivatedRouteStub;
let comp: HeroDetailComponent;
let fixture: ComponentFixture<HeroDetailComponent>;
let page: Page;

////// Tests //////
describe('HeroDetailComponent', () => {
  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
  });
  describe('with HeroModule setup', heroModuleSetup);
  describe('when override its provided HeroDetailService', overrideSetup);
  describe('with FormsModule setup', formsModuleSetup);
  describe('with SharedModule setup', sharedModuleSetup);
});

////////////////////
function overrideSetup() {
  // #docregion hds-spy
  class HeroDetailServiceSpy {
    testHero = new Hero(42, 'Test Hero');

    getHero = jasmine.createSpy('getHero').and.callFake(
      () => Promise
        .resolve(true)
        .then(() => Object.assign({}, this.testHero))
    );

    saveHero = jasmine.createSpy('saveHero').and.callFake(
      (hero: Hero) => Promise
        .resolve(true)
        .then(() => Object.assign(this.testHero, hero))
    );
  }
  // #enddocregion hds-spy

  // the `id` value is irrelevant because ignored by service stub
  beforeEach(() => activatedRoute.testParams = { id: 99999 } );

  // #docregion setup-override
  beforeEach( async(() => {
    TestBed.configureTestingModule({
      imports:   [ HeroModule ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router,         useClass: RouterStub},
  // #enddocregion setup-override
        // HeroDetailService at this level is IRRELEVANT!
        { provide: HeroDetailService, useValue: {} }
  // #docregion setup-override
      ]
    })

    // Override component's own provider
    // #docregion override-component-method
    .overrideComponent(HeroDetailComponent, {
      set: {
        providers: [
          { provide: HeroDetailService, useClass: HeroDetailServiceSpy }
        ]
      }
    })
    // #enddocregion override-component-method

    .compileComponents();
  }));
  // #enddocregion setup-override

  // #docregion override-tests
  let hdsSpy: HeroDetailServiceSpy;

  beforeEach( async(() => {
    createComponent();
    // get the component's injected HeroDetailServiceSpy
    hdsSpy = fixture.debugElement.injector.get(HeroDetailService) as any;
  }));

  it('should have called `getHero`', () => {
    expect(hdsSpy.getHero.calls.count()).toBe(1, 'getHero called once');
  });

  it('should display stub hero\'s name', () => {
    expect(page.nameDisplay.textContent).toBe(hdsSpy.testHero.name);
  });

  it('should save stub hero change', fakeAsync(() => {
    const origName = hdsSpy.testHero.name;
    const newName = 'New Name';

    page.nameInput.value = newName;
    page.nameInput.dispatchEvent(newEvent('input')); // tell Angular

    expect(comp.hero.name).toBe(newName, 'component hero has new name');
    expect(hdsSpy.testHero.name).toBe(origName, 'service hero unchanged before save');

    click(page.saveBtn);
    expect(hdsSpy.saveHero.calls.count()).toBe(1, 'saveHero called once');

    tick(); // wait for async save to complete
    expect(hdsSpy.testHero.name).toBe(newName, 'service hero has new name after save');
    expect(page.navSpy.calls.any()).toBe(true, 'router.navigate called');
  }));
  // #enddocregion override-tests

  it('fixture injected service is not the component injected service',
    inject([HeroDetailService], (service: HeroDetailService) => {

    expect(service).toEqual({}, 'service injected from fixture');
    expect(hdsSpy).toBeTruthy('service injected into component');
  }));
}

////////////////////
import { HEROES, FakeHeroService } from '../model/testing';
import { HeroService }             from '../model';

const firstHero = HEROES[0];

function heroModuleSetup() {
  // #docregion setup-hero-module
  beforeEach( async(() => {
     TestBed.configureTestingModule({
      imports:   [ HeroModule ],
  // #enddocregion setup-hero-module
  //  declarations: [ HeroDetailComponent ], // NO!  DOUBLE DECLARATION
  // #docregion setup-hero-module
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: HeroService,    useClass: FakeHeroService },
        { provide: Router,         useClass: RouterStub},
      ]
    })
    .compileComponents();
  }));
  // #enddocregion setup-hero-module

  // #docregion route-good-id
  describe('when navigate to existing hero', () => {
    let expectedHero: Hero;

    beforeEach( async(() => {
      expectedHero = firstHero;
      activatedRoute.testParams = { id: expectedHero.id };
      createComponent();
    }));

  // #docregion selected-tests
    it('should display that hero\'s name', () => {
      expect(page.nameDisplay.textContent).toBe(expectedHero.name);
    });
  // #enddocregion route-good-id

    it('should navigate when click cancel', () => {
      click(page.cancelBtn);
      expect(page.navSpy.calls.any()).toBe(true, 'router.navigate called');
    });

    it('should save when click save but not navigate immediately', () => {
      // Get service injected into component and spy on its`saveHero` method.
      // It delegates to fake `HeroService.updateHero` which delivers a safe test result.
      const hds = fixture.debugElement.injector.get(HeroDetailService);
      const saveSpy = spyOn(hds, 'saveHero').and.callThrough();

      click(page.saveBtn);
      expect(saveSpy.calls.any()).toBe(true, 'HeroDetailService.save called');
      expect(page.navSpy.calls.any()).toBe(false, 'router.navigate not called');
    });

    it('should navigate when click save and save resolves', fakeAsync(() => {
      click(page.saveBtn);
      tick(); // wait for async save to complete
      expect(page.navSpy.calls.any()).toBe(true, 'router.navigate called');
    }));

    // #docregion title-case-pipe
    it('should convert hero name to Title Case', () => {
      const inputName = 'quick BROWN  fox';
      const titleCaseName = 'Quick Brown  Fox';

      // simulate user entering new name into the input box
      page.nameInput.value = inputName;

      // dispatch a DOM event so that Angular learns of input value change.
      page.nameInput.dispatchEvent(newEvent('input'));

      // Tell Angular to update the output span through the title pipe
      fixture.detectChanges();

      expect(page.nameDisplay.textContent).toBe(titleCaseName);
    });
    // #enddocregion title-case-pipe
  // #enddocregion selected-tests
  // #docregion route-good-id
  });
  // #enddocregion route-good-id

  // #docregion route-no-id
  describe('when navigate with no hero id', () => {
    beforeEach( async( createComponent ));

    it('should have hero.id === 0', () => {
      expect(comp.hero.id).toBe(0);
    });

    it('should display empty hero name', () => {
      expect(page.nameDisplay.textContent).toBe('');
    });
  });
  // #enddocregion route-no-id

  // #docregion route-bad-id
  describe('when navigate to non-existant hero id', () => {
    beforeEach( async(() => {
      activatedRoute.testParams = { id: 99999 };
      createComponent();
    }));

    it('should try to navigate back to hero list', () => {
      expect(page.gotoSpy.calls.any()).toBe(true, 'comp.gotoList called');
      expect(page.navSpy.calls.any()).toBe(true, 'router.navigate called');
    });
  });
  // #enddocregion route-bad-id

  // Why we must use `fixture.debugElement.injector` in `Page()`
  it('cannot use `inject` to get component\'s provided HeroDetailService', () => {
    let service: HeroDetailService;
    fixture = TestBed.createComponent(HeroDetailComponent);
    expect(
      // Throws because `inject` only has access to TestBed's injector
      // which is an ancestor of the component's injector
      inject([HeroDetailService], (hds: HeroDetailService) =>  service = hds )
    )
    .toThrowError(/No provider for HeroDetailService/);

    // get `HeroDetailService` with component's own injector
    service = fixture.debugElement.injector.get(HeroDetailService);
    expect(service).toBeDefined('debugElement.injector');
  });
}

/////////////////////
import { FormsModule }         from '@angular/forms';
import { TitleCasePipe }       from '../shared/title-case.pipe';

function formsModuleSetup() {
 // #docregion setup-forms-module
  beforeEach( async(() => {
     TestBed.configureTestingModule({
      imports:      [ FormsModule ],
      declarations: [ HeroDetailComponent, TitleCasePipe ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: HeroService,    useClass: FakeHeroService },
        { provide: Router,         useClass: RouterStub},
      ]
    })
    .compileComponents();
  }));
  // #enddocregion setup-forms-module

  it('should display 1st hero\'s name', fakeAsync(() => {
    const expectedHero = firstHero;
    activatedRoute.testParams = { id: expectedHero.id };
    createComponent().then(() => {
      expect(page.nameDisplay.textContent).toBe(expectedHero.name);
    });
  }));
}

///////////////////////
import { SharedModule }        from '../shared/shared.module';

function sharedModuleSetup() {
  // #docregion setup-shared-module
  beforeEach( async(() => {
    TestBed.configureTestingModule({
      imports:      [ SharedModule ],
      declarations: [ HeroDetailComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: HeroService,    useClass: FakeHeroService },
        { provide: Router,         useClass: RouterStub},
      ]
    })
    .compileComponents();
  }));
  // #enddocregion setup-shared-module

  it('should display 1st hero\'s name', fakeAsync(() => {
    const expectedHero = firstHero;
    activatedRoute.testParams = { id: expectedHero.id };
    createComponent().then(() => {
      expect(page.nameDisplay.textContent).toBe(expectedHero.name);
    });
  }));
}

/////////// Helpers /////

// #docregion create-component
/** Create the HeroDetailComponent, initialize it, set test variables  */
function createComponent() {
  fixture = TestBed.createComponent(HeroDetailComponent);
  comp    = fixture.componentInstance;
  page    = new Page();

  // 1st change detection triggers ngOnInit which gets a hero
  fixture.detectChanges();
  return fixture.whenStable().then(() => {
    // 2nd change detection displays the async-fetched hero
    fixture.detectChanges();
    page.addPageElements();
  });
}
// #enddocregion create-component

// #docregion page
class Page {
  gotoSpy:      jasmine.Spy;
  navSpy:       jasmine.Spy;

  saveBtn:      DebugElement;
  cancelBtn:    DebugElement;
  nameDisplay:  HTMLElement;
  nameInput:    HTMLInputElement;

  constructor() {
    const router = TestBed.get(Router); // get router from root injector
    this.gotoSpy = spyOn(comp, 'gotoList').and.callThrough();
    this.navSpy  = spyOn(router, 'navigate');
  }

  /** Add page elements after hero arrives */
  addPageElements() {
    if (comp.hero) {
      // have a hero so these elements are now in the DOM
      const buttons    = fixture.debugElement.queryAll(By.css('button'));
      this.saveBtn     = buttons[0];
      this.cancelBtn   = buttons[1];
      this.nameDisplay = fixture.debugElement.query(By.css('span')).nativeElement;
      this.nameInput   = fixture.debugElement.query(By.css('input')).nativeElement;
    }
  }
}
// #enddocregion page
