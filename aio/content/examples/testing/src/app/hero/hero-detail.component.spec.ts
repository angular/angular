// #docplaster
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';

import {asyncData, click} from '../../testing';
import {Hero} from '../model/hero';
import {SharedModule} from '../shared/shared.module';

import {HeroDetailComponent} from './hero-detail.component';
import {HeroDetailService} from './hero-detail.service';
import {HeroListComponent} from './hero-list.component';
import {HeroModule} from './hero.module';

////// Testing Vars //////
let component: HeroDetailComponent;
let harness: RouterTestingHarness;
let page: Page;

////// Tests //////
describe('HeroDetailComponent', () => {
  describe('with HeroModule setup', heroModuleSetup);
  describe('when override its provided HeroDetailService', overrideSetup);
  describe('with FormsModule setup', formsModuleSetup);
  describe('with SharedModule setup', sharedModuleSetup);
});

///////////////////

const testHero = getTestHeroes()[0];
function overrideSetup() {
  // #docregion hds-spy
  class HeroDetailServiceSpy {
    testHero: Hero = {...testHero};

    /* emit cloned test hero */
    getHero = jasmine.createSpy('getHero').and.callFake(
        () => asyncData(Object.assign({}, this.testHero)));

    /* emit clone of test hero, with changes merged in */
    saveHero = jasmine.createSpy('saveHero')
                   .and.callFake((hero: Hero) => asyncData(Object.assign(this.testHero, hero)));
  }

  // #enddocregion hds-spy

  // #docregion setup-override
  beforeEach(async () => {
    await TestBed
        .configureTestingModule({
          imports: [HeroModule],
          providers: [
            provideRouter([{path: 'heroes/:id', component: HeroDetailComponent}]),
            // HeroDetailService at this level is IRRELEVANT!
            {provide: HeroDetailService, useValue: {}}
          ]
        })
        // #docregion override-component-method
        .overrideComponent(
            HeroDetailComponent,
            {set: {providers: [{provide: HeroDetailService, useClass: HeroDetailServiceSpy}]}})
        // #enddocregion override-component-method
        .compileComponents();
  });
  // #enddocregion setup-override

  // #docregion override-tests
  let hdsSpy: HeroDetailServiceSpy;

  beforeEach(async () => {
    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl(`/heroes/${testHero.id}`, HeroDetailComponent);
    page = new Page();
    // get the component's injected HeroDetailServiceSpy
    hdsSpy = harness.routeDebugElement!.injector.get(HeroDetailService) as any;

    harness.detectChanges();
  });

  it('should have called `getHero`', () => {
    expect(hdsSpy.getHero.calls.count())
        .withContext('getHero called once')
        .toBe(1, 'getHero called once');
  });

  it('should display stub hero\'s name', () => {
    expect(page.nameDisplay.textContent).toBe(hdsSpy.testHero.name);
  });

  it('should save stub hero change', fakeAsync(() => {
       const origName = hdsSpy.testHero.name;
       const newName = 'New Name';

       page.nameInput.value = newName;

       page.nameInput.dispatchEvent(new Event('input'));  // tell Angular

       expect(component.hero.name).withContext('component hero has new name').toBe(newName);
       expect(hdsSpy.testHero.name)
           .withContext('service hero unchanged before save')
           .toBe(origName);

       click(page.saveBtn);
       expect(hdsSpy.saveHero.calls.count()).withContext('saveHero called once').toBe(1);

       tick();  // wait for async save to complete
       expect(hdsSpy.testHero.name)
           .withContext('service hero has new name after save')
           .toBe(newName);
       expect(TestBed.inject(Router).url).toEqual('/heroes');
     }));
}

////////////////////
import {getTestHeroes} from '../model/testing/test-hero.service';

const firstHero = getTestHeroes()[0];

function heroModuleSetup() {
  // #docregion setup-hero-module
  beforeEach(async () => {
    await TestBed
        .configureTestingModule({
          imports: [HeroModule],
          //  declarations: [ HeroDetailComponent ], // NO!  DOUBLE DECLARATION
          providers: [
            provideRouter([
              {path: 'heroes/:id', component: HeroDetailComponent},
              {path: 'heroes', component: HeroListComponent},
            ]),
            provideHttpClient(),
            provideHttpClientTesting(),
          ]
        })
        .compileComponents();
  });
  // #enddocregion setup-hero-module

  // #docregion route-good-id
  describe('when navigate to existing hero', () => {
    let expectedHero: Hero;

    beforeEach(async () => {
      expectedHero = firstHero;
      await createComponent(expectedHero.id);
    });
    // #docregion selected-tests
    it('should display that hero\'s name', () => {
      expect(page.nameDisplay.textContent).toBe(expectedHero.name);
    });
    // #enddocregion route-good-id

    it('should navigate when click cancel', () => {
      click(page.cancelBtn);
      expect(TestBed.inject(Router).url).toEqual(`/heroes/${expectedHero.id}`);
    });

    it('should save when click save but not navigate immediately', () => {
      click(page.saveBtn);
      expect(TestBed.inject(HttpTestingController).expectOne({method: 'PUT', url: 'api/heroes'}));
      expect(TestBed.inject(Router).url).toEqual('/heroes/41');
    });

    it('should navigate when click save and save resolves', fakeAsync(() => {
         click(page.saveBtn);
         tick();  // wait for async save to complete
         expect(TestBed.inject(Router).url).toEqual('/heroes/41');
       }));

    // #docregion title-case-pipe
    it('should convert hero name to Title Case', () => {
      // get the name's input and display elements from the DOM
      const hostElement: HTMLElement = harness.routeNativeElement!;
      const nameInput: HTMLInputElement = hostElement.querySelector('input')!;
      const nameDisplay: HTMLElement = hostElement.querySelector('span')!;

      // simulate user entering a new name into the input box
      nameInput.value = 'quick BROWN  fOx';

      // Dispatch a DOM event so that Angular learns of input value change.
      nameInput.dispatchEvent(new Event('input'));

      // Tell Angular to update the display binding through the title pipe
      harness.detectChanges();

      expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
    });
    // #enddocregion selected-tests

    // #enddocregion title-case-pipe
  });

  // #docregion route-bad-id
  describe('when navigate to non-existent hero id', () => {
    beforeEach(async () => {
      await createComponent(999);
    });

    it('should try to navigate back to hero list', () => {
      expect(TestBed.inject(Router).url).toEqual('/heroes');
    });
  });
  // #enddocregion route-bad-id
}

/////////////////////
import {FormsModule} from '@angular/forms';
import {TitleCasePipe} from '../shared/title-case.pipe';

function formsModuleSetup() {
  // #docregion setup-forms-module
  beforeEach(async () => {
    await TestBed
        .configureTestingModule({
          imports: [FormsModule],
          declarations: [HeroDetailComponent, TitleCasePipe],
          providers: [
            provideHttpClient(),
            provideHttpClientTesting(),
            provideRouter([{path: 'heroes/:id', component: HeroDetailComponent}]),
          ]
        })
        .compileComponents();
  });
  // #enddocregion setup-forms-module

  it('should display 1st hero\'s name', async () => {
    const expectedHero = firstHero;
    await createComponent(expectedHero.id).then(() => {
      expect(page.nameDisplay.textContent).toBe(expectedHero.name);
    });
  });
}

///////////////////////

function sharedModuleSetup() {
  // #docregion setup-shared-module
  beforeEach(async () => {
    await TestBed
        .configureTestingModule({
          imports: [SharedModule],
          declarations: [HeroDetailComponent],
          providers: [
            provideRouter([{path: 'heroes/:id', component: HeroDetailComponent}]),
            provideHttpClient(),
            provideHttpClientTesting(),
          ]
        })
        .compileComponents();
  });
  // #enddocregion setup-shared-module

  it('should display 1st hero\'s name', async () => {
    const expectedHero = firstHero;
    await createComponent(expectedHero.id).then(() => {
      expect(page.nameDisplay.textContent).toBe(expectedHero.name);
    });
  });
}

/////////// Helpers /////

/** Create the HeroDetailComponent, initialize it, set test variables  */
// #docregion create-component
async function createComponent(id: number) {
  harness = await RouterTestingHarness.create();
  component = await harness.navigateByUrl(`/heroes/${id}`, HeroDetailComponent);
  page = new Page();

  const request = TestBed.inject(HttpTestingController).expectOne(`api/heroes/?id=${id}`);
  const hero = getTestHeroes().find(h => h.id === Number(id));
  request.flush(hero ? [hero] : []);
  harness.detectChanges();
}
// #enddocregion create-component

// #docregion page
class Page {
  // getter properties wait to query the DOM until called.
  get buttons() {
    return this.queryAll<HTMLButtonElement>('button');
  }
  get saveBtn() {
    return this.buttons[0];
  }
  get cancelBtn() {
    return this.buttons[1];
  }
  get nameDisplay() {
    return this.query<HTMLElement>('span');
  }
  get nameInput() {
    return this.query<HTMLInputElement>('input');
  }

  //// query helpers ////
  private query<T>(selector: string): T {
    return harness.routeNativeElement!.querySelector(selector)! as T;
  }

  private queryAll<T>(selector: string): T[] {
    return harness.routeNativeElement!.querySelectorAll(selector) as any as T[];
  }
}
// #enddocregion page
