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

  it('should display the message', () => {
    configTestingModule();
    createComponent();
    expect(fixture.nativeElement.innerHTML).toContain('Help Angular by taking a <strong>1 minute survey</strong>!');
  });

  it('should display an icon', () => {
    configTestingModule();
    createComponent();
    const iconElement = fixture.debugElement.query(By.css('.icon'));
    expect(iconElement.properties['svgIcon']).toEqual('insert_comment');
    expect(iconElement.attributes['aria-label']).toEqual('Survey');
  });

  it('should display a button', () => {
    configTestingModule();
    createComponent();
    const button = fixture.debugElement.query(By.css('.action-button'));
    expect(button.nativeElement.textContent).toEqual('Go to survey');
  });

  it('should call dismiss when the message link is clicked', () => {
    configTestingModule();
    createComponent();
    spyOn(component, 'dismiss');
    fixture.debugElement.query(By.css('a')).triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.dismiss).toHaveBeenCalled();
  });

  it('should call dismiss when the close button is clicked', () => {
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
    const setItemSpy: jasmine.Spy = TestBed.get(WindowToken).localStorage.setItem;
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
    const getItemSpy: jasmine.Spy = TestBed.get(WindowToken).localStorage.getItem;
    getItemSpy.and.returnValue('hide');
    createComponent();
    expect(getItemSpy).toHaveBeenCalledWith('aio-notification/survey-january-2018');
    expect(component.showNotification).toBe('hide');
  });
});

@Component({
  template: `
  <aio-notification
    icon="insert_comment"
    iconLabel="Survey"
    buttonText="Go to survey"
    actionUrl="https://bit.ly/angular-survey-2018"
    notificationId="survey-january-2018"
    expirationDate="2018-01-22">
    Help Angular by taking a <strong>1 minute survey</strong>!
  </aio-notification>`
})
class TestComponent {
}

class MockWindow {
  localStorage = jasmine.createSpyObj('localStorage', ['getItem', 'setItem']);
}
