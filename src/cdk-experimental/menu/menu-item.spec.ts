import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItem} from './menu-item';

describe('MenuItem', () => {
  let fixture: ComponentFixture<SingleMenuItem>;
  let button: CdkMenuItem;
  let nativeButton: HTMLButtonElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CdkMenuModule],
      declarations: [SingleMenuItem],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleMenuItem);
    fixture.detectChanges();

    button = fixture.debugElement.query(By.directive(CdkMenuItem)).injector.get(CdkMenuItem);
    nativeButton = fixture.debugElement.query(By.directive(CdkMenuItem)).nativeElement;
  });

  it('should have the menuitem role', () => {
    expect(nativeButton.getAttribute('role')).toBe('menuitem');
  });

  it('should coerce the disabled property', () => {
    (button as any).disabled = '';
    expect(button.disabled).toBeTrue();
  });

  it('should toggle the aria disabled attribute', () => {
    expect(nativeButton.getAttribute('aria-disabled')).toBeNull();

    button.disabled = true;
    fixture.detectChanges();

    expect(nativeButton.getAttribute('aria-disabled')).toBe('true');

    button.disabled = false;
    fixture.detectChanges();

    expect(nativeButton.getAttribute('aria-disabled')).toBeNull();
  });

  it('should be a button type', () => {
    expect(nativeButton.getAttribute('type')).toBe('button');
  });

  it('should not have a submenu', () => {
    expect(button.hasSubmenu).toBeFalse();
  });
});

@Component({
  template: `<button cdkMenuItem>Click me!</button>`,
})
class SingleMenuItem {}
