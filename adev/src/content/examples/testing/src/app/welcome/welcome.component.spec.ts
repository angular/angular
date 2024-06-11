// #docplaster
import {ComponentFixture, inject, TestBed} from '@angular/core/testing';

import {UserService} from '../model/user.service';
import {WelcomeComponent} from './welcome.component';

// #docregion mock-user-service
class MockUserService {
  isLoggedIn = true;
  user = {name: 'Test User'};
}
// #enddocregion mock-user-service

describe('WelcomeComponent', () => {
  let comp: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let componentUserService: UserService; // the actually injected service
  let userService: UserService; // the TestBed injected service
  let el: HTMLElement; // the DOM element with the welcome message

  // #docregion setup
  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    fixture.autoDetectChanges();
    comp = fixture.componentInstance;

    // #docregion injected-service
    // UserService actually injected into the component
    userService = fixture.debugElement.injector.get(UserService);
    // #enddocregion injected-service
    componentUserService = userService;
    // #docregion inject-from-testbed
    // UserService from the root injector
    userService = TestBed.inject(UserService);
    // #enddocregion inject-from-testbed

    //  get the "welcome" element by CSS selector (e.g., by class name)
    el = fixture.nativeElement.querySelector('.welcome');
  });
  // #enddocregion setup

  // #docregion tests
  it('should welcome the user', async () => {
    await fixture.whenStable();
    const content = el.textContent;
    expect(content).withContext('"Welcome ..."').toContain('Welcome');
    expect(content).withContext('expected name').toContain('Test User');
  });

  it('should welcome "Bubba"', async () => {
    userService.user.set({name: 'Bubba'}); // welcome message hasn't been shown yet
    await fixture.whenStable();
    expect(el.textContent).toContain('Bubba');
  });

  it('should request login if not logged in', async () => {
    userService.isLoggedIn.set(false); // welcome message hasn't been shown yet
    await fixture.whenStable();
    const content = el.textContent;
    expect(content).withContext('not welcomed').not.toContain('Welcome');
    expect(content)
      .withContext('"log in"')
      .toMatch(/log in/i);
  });
  // #enddocregion tests

  it("should inject the component's UserService instance", inject(
    [UserService],
    (service: UserService) => {
      expect(service).toBe(componentUserService);
    },
  ));

  it('TestBed and Component UserService should be the same', () => {
    expect(userService).toBe(componentUserService);
  });
});
