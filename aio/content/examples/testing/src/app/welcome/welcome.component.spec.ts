// #docplaster
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { UserService } from '../model/user.service';
import { WelcomeComponent } from './welcome.component';

// #docregion mock-user-service
class MockUserService {
  isLoggedIn = true;
  user = { name: 'Test User'};
}
// #enddocregion mock-user-service

describe('WelcomeComponent (class only)', () => {
  let comp: WelcomeComponent;
  let userService: UserService;

  // #docregion class-only-before-each
  beforeEach(() => {
    TestBed.configureTestingModule({
      // provide the component-under-test and dependent service
      providers: [
        WelcomeComponent,
        { provide: UserService, useClass: MockUserService }
      ]
    });
    // inject both the component and the dependent service.
    comp = TestBed.inject(WelcomeComponent);
    userService = TestBed.inject(UserService);
  });
  // #enddocregion class-only-before-each

  // #docregion class-only-tests
  it('should not have welcome message after construction', () => {
    expect(comp.welcome).toBe('');
  });

  it('should welcome logged in user after Angular calls ngOnInit', () => {
    comp.ngOnInit();
    expect(comp.welcome).toContain(userService.user.name);
  });

  it('should ask user to log in if not logged in after ngOnInit', () => {
    userService.isLoggedIn = false;
    comp.ngOnInit();
    expect(comp.welcome).not.toContain(userService.user.name);
    expect(comp.welcome).toContain('log in');
  });
  // #enddocregion class-only-tests
});

describe('WelcomeComponent', () => {

  let comp: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let componentUserService: UserService; // the actually injected service
  let userService: UserService; // the TestBed injected service
  let el: HTMLElement; // the DOM element with the welcome message

  // #docregion setup, user-service-stub
  let userServiceStub: Partial<UserService>;

  // #enddocregion user-service-stub
  beforeEach(() => {
    // stub UserService for test purposes
    // #docregion user-service-stub
    userServiceStub = {
      isLoggedIn: true,
      user: { name: 'Test User' },
    };
    // #enddocregion user-service-stub

    // #docregion config-test-module
    TestBed.configureTestingModule({
       declarations: [ WelcomeComponent ],
    // #enddocregion setup
    // providers: [ UserService ],  // NO! Don't provide the real service!
                                    // Provide a test-double instead
    // #docregion setup
       providers: [ { provide: UserService, useValue: userServiceStub } ],
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
    userService = TestBed.inject(UserService);
    // #enddocregion inject-from-testbed

    //  get the "welcome" element by CSS selector (e.g., by class name)
    el = fixture.nativeElement.querySelector('.welcome');
  });
  // #enddocregion setup

  // #docregion tests
  it('should welcome the user', () => {
    fixture.detectChanges();
    const content = el.textContent;
    expect(content)
      .withContext('"Welcome ..."')
      .toContain('Welcome');
    expect(content)
      .withContext('expected name')
      .toContain('Test User');
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
    expect(content)
      .withContext('not welcomed')
      .not.toContain('Welcome');
    expect(content)
      .withContext('"log in"')
      .toMatch(/log in/i);
  });
  // #enddocregion tests

  it("should inject the component's UserService instance",
    inject([UserService], (service: UserService) => {
    expect(service).toBe(componentUserService);
  }));

  it('TestBed and Component UserService should be the same', () => {
    expect(userService).toBe(componentUserService);
  });
});
