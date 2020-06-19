import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItem} from './menu-item';

describe('MenuItemTrigger', () => {
  describe('on CdkMenuItem', () => {
    let fixture: ComponentFixture<TriggerForEmptyMenu>;
    let menuItem: CdkMenuItem;
    let menuItemElement: HTMLButtonElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [TriggerForEmptyMenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TriggerForEmptyMenu);
      fixture.detectChanges();

      menuItem = fixture.debugElement.query(By.directive(CdkMenuItem)).injector.get(CdkMenuItem);
      menuItemElement = fixture.debugElement.query(By.directive(CdkMenuItem)).nativeElement;
    });

    it('should have the menuitem role', () => {
      expect(menuItemElement.getAttribute('role')).toBe('menuitem');
    });

    it('should set the aria disabled attribute', () => {
      expect(menuItemElement.getAttribute('aria-disabled')).toBeNull();

      menuItem.disabled = true;
      fixture.detectChanges();

      expect(menuItemElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should be a button type', () => {
      expect(menuItemElement.getAttribute('type')).toBe('button');
    });

    it('should  have a submenu', () => {
      expect(menuItem.hasSubmenu).toBeTrue();
    });
  });
});

@Component({
  template: `
    <button cdkMenuItem [cdkMenuTriggerFor]="noop">Click me!</button>
    <ng-template cdkMenuPanel #noop="cdkMenuPanel"><div cdkMenu></div></ng-template>
  `,
})
class TriggerForEmptyMenu {}
