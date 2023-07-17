// #docplaster
import {Component, DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideRouter, Router, RouterLink} from '@angular/router';

import {AppComponent} from './app.component';

// #docregion component-stubs
@Component({selector: 'app-banner', template: ''})
class BannerStubComponent {
}

@Component({selector: 'router-outlet', template: ''})
class RouterOutletStubComponent {
}

@Component({selector: 'app-welcome', template: ''})
class WelcomeStubComponent {
}
// #enddocregion component-stubs

let comp: AppComponent;
let fixture: ComponentFixture<AppComponent>;

describe('AppComponent & TestModule', () => {
  beforeEach(waitForAsync(() => {
    // #docregion testbed-stubs
    TestBed
        .configureTestingModule({
          imports: [RouterLink],
          providers: [provideRouter([])],
          declarations:
              [AppComponent, BannerStubComponent, RouterOutletStubComponent, WelcomeStubComponent]
        })
        // #enddocregion testbed-stubs
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(AppComponent);
          comp = fixture.componentInstance;
        });
  }));
  tests();
});

//////// Testing w/ NO_ERRORS_SCHEMA //////
describe('AppComponent & NO_ERRORS_SCHEMA', () => {
  beforeEach(waitForAsync(() => {
    // #docregion no-errors-schema, mixed-setup
    TestBed
        .configureTestingModule({
          declarations: [
            AppComponent,
            // #enddocregion no-errors-schema
            BannerStubComponent,
            // #docregion no-errors-schema
          ],
          providers: [provideRouter([])],
          imports: [RouterLink],
          schemas: [NO_ERRORS_SCHEMA]
        })
        // #enddocregion no-errors-schema, mixed-setup
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(AppComponent);
          comp = fixture.componentInstance;
        });
  }));
  tests();
});

//////// Testing w/ real root module //////
import {AppModule} from './app.module';
import {AppRoutingModule} from './app-routing.module';

describe('AppComponent & AppModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({
          imports: [AppModule],
        })

        // Get rid of app's Router configuration otherwise many failures.
        // Doing so removes Router declarations; add the Router stubs
        .overrideModule(AppModule, {
          remove: {imports: [AppRoutingModule]},
          add: {
            declarations: [RouterOutletStubComponent],
            imports: [RouterLink],
            providers: [provideRouter([])],
          }
        })

        .compileComponents()

        .then(() => {
          fixture = TestBed.createComponent(AppComponent);
          comp = fixture.componentInstance;
        });
  }));

  tests();
});

function tests() {
  let routerLinks: RouterLink[];
  let linkDes: DebugElement[];

  // #docregion test-setup
  beforeEach(() => {
    fixture.detectChanges();  // trigger initial data binding

    // find DebugElements with an attached RouterLinkStubDirective
    linkDes = fixture.debugElement.queryAll(By.directive(RouterLink));

    // get attached link directive instances
    // using each DebugElement's injector
    routerLinks = linkDes.map(de => de.injector.get(RouterLink));
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
       const heroesLinkDe = linkDes[1];  // heroes link DebugElement

       TestBed.inject(Router).resetConfig([{path: '**', children: []}]);
       heroesLinkDe.triggerEventHandler('click', {button: 0});
       tick();
       fixture.detectChanges();

       expect(TestBed.inject(Router).url).toBe('/heroes');
     }));
  // #enddocregion tests
}
