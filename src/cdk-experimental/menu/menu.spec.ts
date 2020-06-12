import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {CdkMenu} from './menu';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItem} from './menu-item';
import {By} from '@angular/platform-browser';

describe('Menu', () => {
  describe('as radio group', () => {
    let fixture: ComponentFixture<MenuRadioGroup>;
    let menu: CdkMenu;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuRadioGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuRadioGroup);
      fixture.detectChanges();

      menu = fixture.debugElement.query(By.directive(CdkMenu)).injector.get(CdkMenu);

      menuItems = menu._allItems.toArray();
    }));

    it('should toggle menuitemradio items', () => {
      expect(menuItems[0].checked).toBeTrue();
      expect(menuItems[1].checked).toBeFalse();

      menuItems[1].trigger();

      expect(menuItems[0].checked).toBeFalse();
      expect(menuItems[1].checked).toBeTrue();
    });
  });

  describe('as checkbox group', () => {
    let fixture: ComponentFixture<MenuCheckboxGroup>;
    let menu: CdkMenu;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuCheckboxGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuCheckboxGroup);

      menu = fixture.debugElement.query(By.directive(CdkMenu)).injector.get(CdkMenu);
      fixture.detectChanges();

      menuItems = menu._allItems.toArray();
    }));

    it('should toggle menuitemcheckbox', () => {
      expect(menuItems[0].checked).toBeTrue();
      expect(menuItems[1].checked).toBeFalse();

      menuItems[1].trigger();
      expect(menuItems[0].checked).toBeTrue(); // checkbox should not change

      menuItems[0].trigger();

      expect(menuItems[0].checked).toBeFalse();
      expect(menuItems[1].checked).toBeTrue();
    });
  });

  describe('checkbox change events', () => {
    let fixture: ComponentFixture<MenuCheckboxGroup>;
    let menu: CdkMenu;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuCheckboxGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuCheckboxGroup);

      menu = fixture.debugElement.query(By.directive(CdkMenu)).injector.get(CdkMenu);
      fixture.detectChanges();

      menuItems = menu._allItems.toArray();
    }));

    it('should emit on click', () => {
      const spy = jasmine.createSpy('cdkMenu change spy');
      fixture.debugElement.query(By.directive(CdkMenu)).injector.get(CdkMenu).change.subscribe(spy);

      menuItems[0].trigger();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(menuItems[0]);
    });
  });

  describe('radiogroup change events', () => {
    let fixture: ComponentFixture<MenuRadioGroup>;
    let menu: CdkMenu;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuRadioGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuRadioGroup);

      menu = fixture.debugElement.query(By.directive(CdkMenu)).injector.get(CdkMenu);
      fixture.detectChanges();

      menuItems = menu._allItems.toArray();
    }));

    it('should emit on click', () => {
      const spy = jasmine.createSpy('cdkMenu change spy');
      fixture.debugElement.query(By.directive(CdkMenu)).injector.get(CdkMenu).change.subscribe(spy);

      menuItems[0].trigger();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(menuItems[0]);
    });
  });
});

@Component({
  selector: 'menu-as-radio-group',
  template: `
    <ul cdkMenu>
      <li role="none">
        <button checked="true" role="menuitemradio" cdkMenuItem>
          first
        </button>
      </li>
      <li role="none">
        <button role="menuitemradio" cdkMenuItem>
          second
        </button>
      </li>
    </ul>
  `,
})
class MenuRadioGroup {}

@Component({
  selector: 'menu-as-checkbox-group',
  template: `
    <ul cdkMenu>
      <li role="none">
        <button checked="true" role="menuitemcheckbox" cdkMenuItem>
          first
        </button>
      </li>
      <li role="none">
        <button role="menuitemcheckbox" cdkMenuItem>
          second
        </button>
      </li>
    </ul>
  `,
})
class MenuCheckboxGroup {}
