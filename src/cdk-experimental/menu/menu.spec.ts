import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {CdkMenu} from './menu';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItem} from './menu-item';
import {By} from '@angular/platform-browser';

describe('Menu', () => {
  describe('as checkbox group', () => {
    let fixture: ComponentFixture<MenuCheckboxGroup>;
    let menuItems: CdkMenuItem[];

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuCheckboxGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuCheckboxGroup);

      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItem))
        .map(element => element.injector.get(CdkMenuItem));
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
    let menuItems: CdkMenuItem[];

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuCheckboxGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuCheckboxGroup);

      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItem))
        .map(element => element.injector.get(CdkMenuItem));
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
