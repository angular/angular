import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {CdkMenuModule} from './menu-module';
import {CdkMenuGroup} from './menu-group';
import {CdkMenuItem} from './menu-item';
import {CdkMenu} from './menu';
import {By} from '@angular/platform-browser';

describe('MenuGroup', () => {
  describe('with MenuItems as checkbox', () => {
    let fixture: ComponentFixture<CheckboxMenu>;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [CheckboxMenu],
      }).compileComponents();

      fixture = TestBed.createComponent(CheckboxMenu);
      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItem))
        .map(e => e.injector.get(CdkMenuItem));
    }));

    it('should not change state of sibling checked menuitemcheckbox', () => {
      menuItems[1].trigger();

      expect(menuItems[0].checked).toBeTrue();
    });
  });

  describe('with MenuItems as radio button', () => {
    let fixture: ComponentFixture<MenuWithMultipleRadioGroups>;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuWithMultipleRadioGroups],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuWithMultipleRadioGroups);
      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItem))
        .map(e => e.injector.get(CdkMenuItem));
    }));

    it('should change state of sibling menuitemradio in same group', () => {
      menuItems[1].trigger();

      expect(menuItems[1].checked).toBeTrue();
      expect(menuItems[0].checked).toBeFalse();
    });

    it('should not change state of menuitemradio in sibling group', () => {
      menuItems[3].trigger();

      expect(menuItems[3].checked).toBeTrue();
      expect(menuItems[0].checked).toBeTrue();
    });

    it('should not change radiogroup state with disabled button', () => {
      menuItems[1].disabled = true;

      menuItems[1].trigger();

      expect(menuItems[0].checked).toBeTrue();
      expect(menuItems[1].checked).toBeFalse();
    });
  });

  describe('change events', () => {
    let fixture: ComponentFixture<MenuWithMenuItemsAndRadioGroups>;
    let menu: CdkMenu;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuWithMenuItemsAndRadioGroups],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuWithMenuItemsAndRadioGroups);
      fixture.detectChanges();

      menu = fixture.debugElement.query(By.directive(CdkMenu)).injector.get(CdkMenu);

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItem))
        .map(element => element.injector.get(CdkMenuItem));
    }));

    it('should not emit from root menu with nested groups', () => {
      const spy = jasmine.createSpy('changeSpy for root menu');
      menu.change.subscribe(spy);

      menuItems.forEach(menuItem => menuItem.trigger());

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('should emit from enclosing radio group only', () => {
      const spies: Array<jasmine.Spy> = [];

      fixture.debugElement.queryAll(By.directive(CdkMenuGroup)).forEach((group, index) => {
        const spy = jasmine.createSpy(`cdkMenuGroup ${index} change spy`);
        spies.push(spy);
        group.injector.get(CdkMenuGroup).change.subscribe(spy);
      });

      menuItems[0].trigger();

      expect(spies[1]).toHaveBeenCalledTimes(1);
      expect(spies[1]).toHaveBeenCalledWith(menuItems[0]);
      expect(spies[2]).toHaveBeenCalledTimes(0);
      expect(spies[3]).toHaveBeenCalledTimes(0);
    });

    it('should not emit with click on disabled button', () => {
      const spy = jasmine.createSpy('cdkMenuGroup change spy');

      fixture.debugElement
        .queryAll(By.directive(CdkMenuGroup))[1]
        .injector.get(CdkMenuGroup)
        .change.subscribe(spy);
      menuItems[0].disabled = true;

      menuItems[0].trigger();

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('should not emit on menuitem click', () => {
      const spies: Array<jasmine.Spy> = [];

      fixture.debugElement.queryAll(By.directive(CdkMenuGroup)).forEach((group, index) => {
        const spy = jasmine.createSpy(`cdkMenuGroup ${index} change spy`);
        spies.push(spy);
        group.injector.get(CdkMenuGroup).change.subscribe(spy);
      });

      menuItems[2].trigger();

      spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(0));
    });
  });
});

@Component({
  template: `
    <ul cdkMenu>
      <li role="none">
        <ul cdkMenuGroup>
          <li #first role="none">
            <button checked="true" role="menuitemcheckbox" cdkMenuItem>
              one
            </button>
          </li>
          <li role="none">
            <button role="menuitemcheckbox" cdkMenuItem>
              two
            </button>
          </li>
        </ul>
      </li>
    </ul>
  `,
})
class CheckboxMenu {}

@Component({
  template: `
    <ul cdkMenu>
      <li role="none">
        <ul cdkMenuGroup>
          <li role="none">
            <button checked="true" role="menuitemradio" cdkMenuItem>
              one
            </button>
          </li>
          <li role="none">
            <button role="menuitemradio" cdkMenuItem>
              two
            </button>
          </li>
        </ul>
      </li>
      <li role="none">
        <ul cdkMenuGroup>
          <li role="none">
            <button role="menuitemradio" cdkMenuItem>
              three
            </button>
          </li>
          <li role="none">
            <button role="menuitemradio" cdkMenuItem>
              four
            </button>
          </li>
        </ul>
      </li>
    </ul>
  `,
})
class MenuWithMultipleRadioGroups {}

@Component({
  template: `
    <ul cdkMenu>
      <li role="none">
        <ul cdkMenuGroup>
          <li role="none">
            <button role="menuitemradio" cdkMenuItem>
              one
            </button>
          </li>
        </ul>
      </li>
      <li role="none">
        <ul cdkMenuGroup>
          <li role="none">
            <button role="menuitemradio" cdkMenuItem>
              two
            </button>
          </li>
        </ul>
      </li>
      <li role="none">
        <ul cdkMenuGroup>
          <li role="none">
            <button cdkMenuItem>
              three
            </button>
          </li>
        </ul>
      </li>
    </ul>
  `,
})
class MenuWithMenuItemsAndRadioGroups {}
