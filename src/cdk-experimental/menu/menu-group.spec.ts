import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {CdkMenuModule} from './menu-module';
import {CdkMenuGroup} from './menu-group';
import {CdkMenuItem} from './menu-item';
import {CdkMenu} from './menu';
import {By} from '@angular/platform-browser';

describe('MenuGroup', () => {
  describe('MenuItem', () => {
    let fixture: ComponentFixture<MenuGroups>;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuGroups],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuGroups);
      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItem))
        .map((element) => element.injector.get(CdkMenuItem));
    }));

    it('should not change state of sibling menuitemcheckbox', () => {
      menuItems[1].trigger();

      expect(menuItems[0].checked).toBeTrue(); // default state true
    });

    it('should change state of sibling menuitemradio in same group', () => {
      menuItems[3].trigger();

      expect(menuItems[3].checked).toBeTrue();
      expect(menuItems[2].checked).toBeFalse();
    });

    it('should not change state of menuitemradio in sibling group', () => {
      menuItems[4].trigger();

      expect(menuItems[4].checked).toBeTrue();
      expect(menuItems[2].checked).toBeTrue();
    });

    it('should not change radiogroup state with disabled button', () => {
      menuItems[3].disabled = true;

      menuItems[3].trigger();

      expect(menuItems[2].checked).toBeTrue();
      expect(menuItems[3].checked).toBeFalse();
    });
  });

  describe('change events', () => {
    let fixture: ComponentFixture<MenuGroups>;
    let menu: CdkMenu;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuGroups],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuGroups);
      fixture.detectChanges();

      menu = fixture.debugElement.query(By.directive(CdkMenu)).injector.get(CdkMenu);

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItem))
        .map((element) => element.injector.get(CdkMenuItem));
    }));

    it('should not emit from root menu with nested groups', () => {
      const spy = jasmine.createSpy('changeSpy for root menu');
      menu.change.subscribe(spy);

      menuItems.forEach((menuItem) => menuItem.trigger());

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('should emit from groups with clicked menu items', () => {
      const spies: Array<jasmine.Spy> = [];

      fixture.debugElement.queryAll(By.directive(CdkMenuGroup)).forEach((group, index) => {
        const spy = jasmine.createSpy(`cdkMenuGroup ${index} change spy`);
        spies.push(spy);
        group.injector.get(CdkMenuGroup).change.subscribe(spy);
      });

      menuItems[2].trigger();
      menuItems[4].trigger();

      expect(spies[1]).toHaveBeenCalledTimes(0);
      expect(spies[2]).toHaveBeenCalledTimes(1);
      expect(spies[2]).toHaveBeenCalledWith(menuItems[2]);
      expect(spies[3]).toHaveBeenCalledTimes(1);
      expect(spies[3]).toHaveBeenCalledWith(menuItems[4]);
    });

    it('should not emit with click on disabled button', () => {
      const spy = jasmine.createSpy('cdkMenuGroup change spy');

      fixture.debugElement
        .queryAll(By.directive(CdkMenuGroup))[3]
        .injector.get(CdkMenuGroup)
        .change.subscribe(spy);
      menuItems[4].disabled = true;

      menuItems[4].trigger();

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('should not emit from sibling groups', () => {
      const spies: Array<jasmine.Spy> = [];

      fixture.debugElement.queryAll(By.directive(CdkMenuGroup)).forEach((group, index) => {
        const spy = jasmine.createSpy(`cdkMenuGroup ${index} change spy`);
        spies.push(spy);
        group.injector.get(CdkMenuGroup).change.subscribe(spy);
      });

      menuItems[0].trigger();

      expect(spies[1]).toHaveBeenCalledTimes(1);
      expect(spies[2]).toHaveBeenCalledTimes(0);
      expect(spies[3]).toHaveBeenCalledTimes(0);
    });

    it('should not emit on menuitem click', () => {
      const spies: Array<jasmine.Spy> = [];

      fixture.debugElement.queryAll(By.directive(CdkMenuGroup)).forEach((group, index) => {
        const spy = jasmine.createSpy(`cdkMenuGroup ${index} change spy`);
        spies.push(spy);
        group.injector.get(CdkMenuGroup).change.subscribe(spy);
      });

      menuItems[7].trigger();

      spies.forEach((spy) => expect(spy).toHaveBeenCalledTimes(0));
    });
  });
});

@Component({
  template: `
    <ul cdkMenu>
      <!-- Checkbox group -->
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
      <!-- Radio group -->
      <li role="none">
        <ul cdkMenuGroup>
          <li role="none">
            <button checked="true" role="menuitemradio" cdkMenuItem>
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
      <!-- Radio group -->
      <li role="none">
        <ul cdkMenuGroup>
          <li role="none">
            <button role="menuitemradio" cdkMenuItem>
              five
            </button>
          </li>
          <li role="none">
            <button role="menuitemradio" cdkMenuItem>
              six
            </button>
          </li>
        </ul>
      </li>
      <li role="none">
        <ul cdkMenuGroup>
          <li role="none">
            <button cdkMenuItem>
              seven
            </button>
          </li>
          <li role="none">
            <button cdkMenuItem>
              eight
            </button>
          </li>
        </ul>
      </li>
    </ul>
  `,
})
class MenuGroups {}
