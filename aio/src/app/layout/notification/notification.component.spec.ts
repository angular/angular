import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CurrentDateToken } from 'app/shared/current-date';
import { NotificationComponent } from './notification.component';
import { WindowToken } from 'app/shared/window';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<TestComponent>;

  function configTestingModule(now = new Date('2018-01-20')) {
    TestBed.configureTestingModule({
      declarations: [TestComponent, NotificationComponent],
      providers: [
        { provide: WindowToken, useClass: MockWindow },
        { provide: CurrentDateToken, useValue: now },
      ],
      imports: [NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
  }

  function createComponent() {
    fixture = TestBed.createComponent(TestComponent);
    const debugElement = fixture.debugElement.query(By.directive(NotificationComponent));
    component = debugElement.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
  }

  describe('content projection', () => {
    it('should display the message text', () => {
      configTestingModule();
      createComponent();
      expect(fixture.nativeElement.innerHTML).toContain('Version 6 of Angular Now Available!');
    });

    it('should render HTML elements', () => {
      configTestingModule();
      createComponent();
      const button = fixture.debugElement.query(By.css('.action-button'));
      expect(button.nativeElement.textContent).toEqual('Learn More');
    });

    it('should process Angular directives', () => {
      configTestingModule();
      createComponent();
      const badSpans = fixture.debugElement.queryAll(By.css('.bad'));
      expect(badSpans.length).toEqual(0);
    });
  });

  it('should call dismiss() when the message link is clicked, if dismissOnContentClick is true', () => {
    configTestingModule();
    createComponent();
    spyOn(component, 'dismiss');
    component.dismissOnContentClick = true;
    const message: HTMLSpanElement = fixture.debugElement.query(By.css('.messageholder')).nativeElement;
    message.click();
    expect(component.dismiss).toHaveBeenCalled();
  });

  it('should not call dismiss() when the message link is clicked, if dismissOnContentClick is false', () => {
    configTestingModule();
    createComponent();
    spyOn(component, 'dismiss');
    component.dismissOnContentClick = false;
    const message: HTMLSpanElement = fixture.debugElement.query(By.css('.messageholder')).nativeElement;
    message.click();
    expect(component.dismiss).not.toHaveBeenCalled();
  });

  it('should call dismiss() when the close button is clicked', () => {
    configTestingModule();
    createComponent();
    spyOn(component, 'dismiss');
    fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.dismiss).toHaveBeenCalled();
  });

  it('should hide the notification when dismiss is called', () => {
    configTestingModule();
    createComponent();
    expect(component.showNotification).toBe('show');
    component.dismiss();
    expect(component.showNotification).toBe('hide');
  });

  it('should update localStorage key when dismiss is called', () => {
    configTestingModule();
    createComponent();
    const setItemSpy: jasmine.Spy = (TestBed.inject(WindowToken) as MockWindow).localStorage.setItem;
    component.dismiss();
    expect(setItemSpy).toHaveBeenCalledWith('aio-notification/survey-january-2018', 'hide');
  });

  it('should not show the notification if the date is after the expiry date', () => {
    configTestingModule(new Date('2018-01-23'));
    createComponent();
    expect(component.showNotification).toBe('hide');
  });

  it('should not show the notification if the there is a "hide" flag in localStorage', () => {
    configTestingModule();
    const getItemSpy: jasmine.Spy = (TestBed.inject(WindowToken) as MockWindow).localStorage.getItem;
    getItemSpy.and.returnValue('hide');
    createComponent();
    expect(getItemSpy).toHaveBeenCalledWith('aio-notification/survey-january-2018');
    expect(component.showNotification).toBe('hide');
  });

  it('should not break when cookies are disabled in the browser', () => {
    configTestingModule();

    // Simulate `window.localStorage` being inaccessible, when cookies are disabled.
    const mockWindow: MockWindow = TestBed.inject(WindowToken);
    Object.defineProperty(mockWindow, 'localStorage', {
      get() { throw new Error('The operation is insecure'); },
    });

    expect(() => createComponent()).not.toThrow();
    expect(component.showNotification).toBe('show');

    component.dismiss();
    expect(component.showNotification).toBe('hide');
  });
});

@Component({
  template: `
  <aio-notification
    notificationId="survey-january-2018"
    expirationDate="2018-01-22">
    <span class="messageholder">
    <a href="https://blog.angular.io/version-6-0-0-of-angular-now-available-cc56b0efa7a4">
      <span *ngIf="false" class="bad">This should not appear</span>
      <span class="message">Version 6 of Angular Now Available!</span>
      <span class="action-button">Learn More</span>
    </a>
    </span>
  </aio-notification>`
})
class TestComponent {
}

class MockWindow {
  localStorage = jasmine.createSpyObj('localStorage', ['getItem', 'setItem']);
}
