// For more examples:
//   https://github.com/angular/angular/blob/master/modules/@angular/router/test/integration.spec.ts

import { waitForAsync, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { asyncData } from '../testing';

import { RouterTestingModule } from '@angular/router/testing';
import { SpyLocation } from '@angular/common/testing';

import { Router, RouterLinkWithHref } from '@angular/router';

import { By } from '@angular/platform-browser';
import { DebugElement, Type } from '@angular/core';
import { Location } from '@angular/common';

import { click } from '../testing';

import { routes } from './app-routing.module';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { HeroService, TestHeroService } from './model/testing/test-hero.service';
import { TwainService } from './twain/twain.service';

let comp: AppComponent;
let fixture: ComponentFixture<AppComponent>;
let page: Page;
let router: Router;
let location: SpyLocation;

describe('AppComponent & RouterTestingModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({
          imports: [
            AppModule,
            RouterTestingModule.withRoutes(routes),
          ],
          providers: [{provide: HeroService, useClass: TestHeroService}]
        })
        .compileComponents();
  }));

  it('should navigate to "Dashboard" immediately', fakeAsync(() => {
       createComponent();
       tick();  // wait for async data to arrive
       expectPathToBe('/dashboard', 'after initialNavigation()');
       expectElementOf(DashboardComponent);
     }));

  it('should navigate to "About" on click', fakeAsync(() => {
       createComponent();
       click(page.aboutLinkDe);
       // page.aboutLinkDe.nativeElement.click(); // ok but fails in phantom

       advance();
       expectPathToBe('/about');
       expectElementOf(AboutComponent);
     }));

  it('should navigate to "About" w/ browser location URL change', fakeAsync(() => {
       createComponent();
       location.simulateHashChange('/about');
       // location.go('/about'); // also works ... except, perhaps, in Stackblitz
       advance();
       expectPathToBe('/about');
       expectElementOf(AboutComponent);
     }));

  // Can't navigate to lazy loaded modules with this technique
  xit('should navigate to "Heroes" on click (not working yet)', fakeAsync(() => {
        createComponent();
        page.heroesLinkDe.nativeElement.click();
        advance();
        expectPathToBe('/heroes');
      }));
});


///////////////
import { NgModuleFactoryLoader } from '@angular/core';
import { SpyNgModuleFactoryLoader } from '@angular/router/testing';

import { HeroModule } from './hero/hero.module';  // should be lazy loaded
import { HeroListComponent } from './hero/hero-list.component';

let loader: SpyNgModuleFactoryLoader;

///////// Can't get lazy loaded Heroes to work yet
xdescribe('AppComponent & Lazy Loading (not working yet)', () => {
  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({
          imports: [
            AppModule,
            RouterTestingModule.withRoutes(routes),
          ],
        })
        .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    createComponent();
    loader = TestBed.inject(NgModuleFactoryLoader) as SpyNgModuleFactoryLoader;
    loader.stubbedModules = {expected: HeroModule};
    router.resetConfig([{path: 'heroes', loadChildren: 'expected'}]);
  }));

  it('should navigate to "Heroes" on click', waitForAsync(() => {
       page.heroesLinkDe.nativeElement.click();
       advance();
       expectPathToBe('/heroes');
       expectElementOf(HeroListComponent);
     }));

  it('can navigate to "Heroes" w/ browser location URL change', fakeAsync(() => {
       location.go('/heroes');
       advance();
       expectPathToBe('/heroes');
       expectElementOf(HeroListComponent);
     }));
});

////// Helpers /////////

/**
 * Advance to the routed page
 * Wait a tick, then detect changes, and tick again
 */
function advance(): void {
  tick();                   // wait while navigating
  fixture.detectChanges();  // update view
  tick();                   // wait for async data to arrive
}

function createComponent() {
  fixture = TestBed.createComponent(AppComponent);
  comp = fixture.componentInstance;

  const injector = fixture.debugElement.injector;
  location = injector.get(Location) as SpyLocation;
  router = injector.get(Router);
  router.initialNavigation();
  spyOn(injector.get(TwainService), 'getQuote')
      // fake fast async observable
      .and.returnValue(asyncData('Test Quote'));
  advance();

  page = new Page();
}

class Page {
  aboutLinkDe: DebugElement;
  dashboardLinkDe: DebugElement;
  heroesLinkDe: DebugElement;

  // for debugging
  comp: AppComponent;
  location: SpyLocation;
  router: Router;
  fixture: ComponentFixture<AppComponent>;

  constructor() {
    const links = fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));
    this.aboutLinkDe = links[2];
    this.dashboardLinkDe = links[0];
    this.heroesLinkDe = links[1];

    // for debugging
    this.comp = comp;
    this.fixture = fixture;
    this.router = router;
  }
}

function expectPathToBe(path: string, expectationFailOutput?: any) {
  expect(location.path()).toEqual(path, expectationFailOutput || 'location.path()');
}

function expectElementOf(type: Type<any>): any {
  const el = fixture.debugElement.query(By.directive(type));
  expect(el).toBeTruthy('expected an element for ' + type.name);
  return el;
}
