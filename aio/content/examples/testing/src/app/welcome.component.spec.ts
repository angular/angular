// #docplaster
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By }                                from '@angular/platform-browser';
import { DebugElement }                      from '@angular/core';

import { UserService }      from './model';
import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {

  let comp: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let componentUserService: UserService; // the actually injected service
  let userService: UserService; // the TestBed injected service
  let de: DebugElement;  // the DebugElement with the welcome message
  let el: HTMLElement; // the DOM element with the welcome message

  let userServiceStub: {
    isLoggedIn: boolean;
    user: { name: string}
  };

  // #docregion setup
  beforeEach(() => {
    // stub UserService for test purposes
    // #docregion user-service-stub
    userServiceStub = {
      isLoggedIn: true,
      user: { name: 'Test User'}
    };
    // #enddocregion user-service-stub

    // #docregion config-test-module
    TestBed.configureTestingModule({
       declarations: [ WelcomeComponent ],
    // #enddocregion setup
    // providers:    [ UserService ]  // NO! Don't provide the real service!
                                      // Provide a test-double instead
    // #docregion setup
       providers:    [ {provide: UserService, useValue: userServiceStub } ]
    });
    // #enddocregion config-test-module

    fixture = TestBed.createComponent(WelcomeComponent);
    comp    = fixture.componentInstance;

    // #enddocregion setup
   // #docregion injected-service
    // UserService actually injected into the component
    userService = fixture.debugElement.injector.get(UserService);
    // #enddocregion injected-service
    componentUserService = userService;
    // #docregion setup
    // #docregion inject-from-testbed
    // UserService from the root injector
    userService = TestBed.get(UserService);
    // #enddocregion inject-from-testbed

    //  get the "welcome" element by CSS selector (e.g., by class name)
    de = fixture.debugElement.query(By.css('.welcome'));
    el = de.nativeElement;
  });
  // #enddocregion setup

  // #docregion tests
  it('should welcome the user', () => {
    fixture.detectChanges();
    const content = el.textContent;
    expect(content).toContain('Welcome', '"Welcome ..."');
    expect(content).toContain('Test User', 'expected name');
  });

  it('should welcome "Bubba"', () => {
    userService.user.name = 'Bubba'; // welcome message hasn't been shown yet
    fixture.detectChanges();
    expect(el.textContent).toContain('Bubba');
  });

  it('should request login if not logged in', () => {
    userService.isLoggedIn = false; // welcome message hasn't been shown yet
    fixture.detectChanges();
    const content = el.textContent;
    expect(content).not.toContain('Welcome', 'not welcomed');
    expect(content).toMatch(/log in/i, '"log in"');
  });
  // #enddocregion tests

  // #docregion inject-it
  it('should inject the component\'s UserService instance',
    inject([UserService], (service: UserService) => {
    expect(service).toBe(componentUserService);
  }));
  // #enddocregion inject-it

  it('TestBed and Component UserService should be the same', () => {
    expect(userService === componentUserService).toBe(true);
  });

  // #docregion stub-not-injected
  it('stub object and injected UserService should not be the same', () => {
    expect(userServiceStub === userService).toBe(false);

    // Changing the stub object has no effect on the injected service
    userServiceStub.isLoggedIn = false;
    expect(userService.isLoggedIn).toBe(true);
  });
  // #enddocregion stub-not-injected
});
