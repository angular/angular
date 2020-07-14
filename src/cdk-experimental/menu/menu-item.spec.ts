import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItem} from './menu-item';
import {CDK_MENU} from './menu-interface';
import {CdkMenu} from './menu';

describe('MenuItem', () => {
  describe('with no complex inner elements', () => {
    let fixture: ComponentFixture<SingleMenuItem>;
    let menuItem: CdkMenuItem;
    let nativeButton: HTMLButtonElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [SingleMenuItem],
        providers: [{provide: CDK_MENU, useClass: CdkMenu}],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleMenuItem);
      fixture.detectChanges();

      menuItem = fixture.debugElement.query(By.directive(CdkMenuItem)).injector.get(CdkMenuItem);
      nativeButton = fixture.debugElement.query(By.directive(CdkMenuItem)).nativeElement;
    });

    it('should have the menuitem role', () => {
      expect(nativeButton.getAttribute('role')).toBe('menuitem');
    });

    it('should coerce the disabled property', () => {
      (menuItem as any).disabled = '';
      expect(menuItem.disabled).toBeTrue();
    });

    it('should toggle the aria disabled attribute', () => {
      expect(nativeButton.hasAttribute('aria-disabled')).toBeFalse();

      menuItem.disabled = true;
      fixture.detectChanges();

      expect(nativeButton.getAttribute('aria-disabled')).toBe('true');

      menuItem.disabled = false;
      fixture.detectChanges();

      expect(nativeButton.hasAttribute('aria-disabled')).toBeFalse();
    });

    it('should be a button type', () => {
      expect(nativeButton.getAttribute('type')).toBe('button');
    });

    it('should not have a menu', () => {
      expect(menuItem.hasMenu()).toBeFalse();
    });
  });

  describe('with complex inner elements', () => {
    let fixture: ComponentFixture<ComplexMenuItem>;
    let menuItem: CdkMenuItem;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [ComplexMenuItem],
        providers: [{provide: CDK_MENU, useClass: CdkMenu}],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ComplexMenuItem);
      fixture.detectChanges();

      menuItem = fixture.debugElement.query(By.directive(CdkMenuItem)).injector.get(CdkMenuItem);
    });

    it('should be able to extract the label text, with text nested in bold tag', () => {
      expect(menuItem.getLabel()).toBe('Click me!');
    });
  });
});

@Component({
  template: `<button cdkMenuItem>Click me!</button>`,
})
class SingleMenuItem {}

@Component({
  template: ` <button cdkMenuItem>Click <b>me!</b></button> `,
})
class ComplexMenuItem {}
