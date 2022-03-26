import {Component, ElementRef} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItemRadio} from './menu-item-radio';
import {CDK_MENU} from './menu-interface';
import {CdkMenu} from './menu';

describe('MenuItemRadio', () => {
  let fixture: ComponentFixture<SimpleRadioButton>;
  let radioButton: CdkMenuItemRadio;
  let radioElement: HTMLButtonElement;
  let selectionDispatcher: UniqueSelectionDispatcher;

  beforeEach(waitForAsync(() => {
    selectionDispatcher = new UniqueSelectionDispatcher();
    TestBed.configureTestingModule({
      imports: [CdkMenuModule],
      declarations: [SimpleRadioButton],
      providers: [
        {provide: UniqueSelectionDispatcher, useValue: selectionDispatcher},
        {provide: CDK_MENU, useClass: CdkMenu},
        // View engine can't figure out the ElementRef to inject so we need to provide a fake
        {provide: ElementRef, useValue: new ElementRef<null>(null)},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleRadioButton);
    fixture.detectChanges();

    radioButton = fixture.debugElement
      .query(By.directive(CdkMenuItemRadio))
      .injector.get(CdkMenuItemRadio);
    radioElement = fixture.debugElement.query(By.directive(CdkMenuItemRadio)).nativeElement;
  });

  it('should have the menuitemradio role', () => {
    expect(radioElement.getAttribute('role')).toBe('menuitemradio');
  });

  it('should set the aria disabled attribute', () => {
    expect(radioElement.getAttribute('aria-disabled')).toBeNull();

    radioButton.disabled = true;
    fixture.detectChanges();

    expect(radioElement.getAttribute('aria-disabled')).toBe('true');
  });

  it('should toggle the aria checked attribute', () => {
    expect(radioElement.getAttribute('aria-checked')).toBeNull();

    radioElement.click();
    fixture.detectChanges();

    expect(radioElement.getAttribute('aria-checked')).toBe('true');
  });

  it('should be a button type', () => {
    expect(radioElement.getAttribute('type')).toBe('button');
  });

  it('should not have a menu', () => {
    expect(radioButton.hasMenu()).toBeFalse();
  });

  it('should not toggle checked state when disabled', () => {
    radioButton.disabled = true;
    radioButton.trigger();

    expect(radioButton.checked).toBeFalse();
  });

  it('should emit on clicked emitter when triggered', () => {
    const spy = jasmine.createSpy('cdkMenuItemRadio clicked spy');
    radioButton.toggled.subscribe(spy);

    radioButton.trigger();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit on clicked emitter when disabled', () => {
    const spy = jasmine.createSpy('cdkMenuItemRadio clicked spy');
    radioButton.toggled.subscribe(spy);
    radioButton.disabled = true;

    radioButton.trigger();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should toggle state when called with own id and not toggle when called with other id', () => {
    const id = 'id-1';
    const name = 'name-1';
    radioButton.id = id;
    radioButton.name = name;

    expect(radioButton.checked).withContext('Initial state').toBeFalse();

    selectionDispatcher.notify(id, name);
    expect(radioButton.checked).withContext('Called with own id and name').toBeTrue();

    selectionDispatcher.notify('another-id', 'another-name');
    expect(radioButton.checked).withContext('Called with differing id and name').toBeFalse();
  });
});

@Component({
  template: `<button cdkMenuItemRadio>Click me!</button>`,
})
class SimpleRadioButton {}
