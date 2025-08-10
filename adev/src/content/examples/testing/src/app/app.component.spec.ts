// #docplaster
import {Component, DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideRouter, Router, RouterLink, RouterOutlet} from '@angular/router';

import {AppComponent} from './app.component';
import {appConfig} from './app.config';
import {UserService} from './model';
import {WelcomeComponent} from './welcome/welcome.component';

// #docregion component-stubs
@Component({selector: 'app-banner', template: ''})
class BannerStubComponent {}

@Component({selector: 'router-outlet', template: ''})
class RouterOutletStubComponent {}

@Component({selector: 'app-welcome', template: ''})
class WelcomeStubComponent {}
// #enddocregion component-stubs

let comp: AppComponent;
let fixture: ComponentFixture<AppComponent>;

describe('AppComponent & TestModule', () => {
  beforeEach(() => {
    // #docregion testbed-stubs
    TestBed.configureTestingModule(
      Object.assign({}, appConfig, {
        providers: [provideRouter([]), UserService],
      }),
    ).overrideComponent(AppComponent, {
      set: {
        imports: [BannerStubComponent, RouterLink, RouterOutletStubComponent, WelcomeStubComponent],
      },
    });
    // #enddocregion testbed-stubs

    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
  });
  tests();
});

//////// Testing w/ NO_ERRORS_SCHEMA //////
describe('AppComponent & NO_ERRORS_SCHEMA', () => {
  beforeEach(() => {
    // #docregion no-errors-schema
    TestBed.configureTestingModule(
      Object.assign({}, appConfig, {
        providers: [provideRouter([]), UserService],
      }),
    ).overrideComponent(AppComponent, {
      set: {
        imports: [], // resets all imports
        schemas: [NO_ERRORS_SCHEMA],
      },
    });
    // #enddocregion no-errors-schema

    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
  });
  tests();
});

describe('AppComponent & NO_ERRORS_SCHEMA', () => {
  beforeEach(() => {
    // #docregion mixed-setup
    TestBed.configureTestingModule(
      Object.assign({}, appConfig, {
        providers: [provideRouter([]), UserService],
      }),
    ).overrideComponent(AppComponent, {
      remove: {
        imports: [RouterOutlet, WelcomeComponent],
      },
      set: {
        schemas: [NO_ERRORS_SCHEMA],
      },
    });
    // #enddocregion mixed-setup

    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
  });
  tests();
});

function tests() {
  let routerLinks: RouterLink[];
  let linkDes: DebugElement[];

  // #docregion test-setup
  beforeEach(() => {
    fixture.detectChanges(); // trigger initial data binding

    // find DebugElements with an attached RouterLinkStubDirective
    linkDes = fixture.debugElement.queryAll(By.directive(RouterLink));

    // get attached link directive instances
    // using each DebugElement's injector
    routerLinks = linkDes.map((de) => de.injector.get(RouterLink));
  });
  // #enddocregion test-setup

  it('can instantiate the component', () => {
    expect(comp).not.toBeNull();
  });

  // #docregion tests
  it('can get RouterLinks from template', () => {
    expect(routerLinks.length).withContext('should have 3 routerLinks').toBe(3);
    expect(routerLinks[0].href).toBe('/dashboard');
    expect(routerLinks[1].href).toBe('/heroes');
    expect(routerLinks[2].href).toBe('/about');
  });

  it('can click Heroes link in template', fakeAsync(() => {
    const heroesLinkDe = linkDes[1]; // heroes link DebugElement

    TestBed.inject(Router).resetConfig([{path: '**', children: []}]);
    heroesLinkDe.triggerEventHandler('click', {button: 0});
    tick();
    fixture.detectChanges();

    expect(TestBed.inject(Router).url).toBe('/heroes');
  }));
  // #enddocregion tests
}
