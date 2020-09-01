import {Component, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkMenuModule} from './menu-module';
import {CdkMenuGroup} from './menu-group';
import {CdkMenuItemCheckbox} from './menu-item-checkbox';
import {CdkMenuItemRadio} from './menu-item-radio';
import {CdkMenuPanel} from './menu-panel';
import {MenuStack} from './menu-stack';
import {CdkMenuItem} from './menu-item';

describe('MenuGroup', () => {
  describe('with MenuItems as checkbox', () => {
    let fixture: ComponentFixture<CheckboxMenu>;
    let menuItems: CdkMenuItemCheckbox[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [CheckboxMenu],
      }).compileComponents();

      fixture = TestBed.createComponent(CheckboxMenu);
      fixture.detectChanges();

      fixture.componentInstance.panel._menuStack = new MenuStack();
      fixture.componentInstance.trigger.getMenuTrigger()?.toggle();
      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItemCheckbox))
        .map(e => e.injector.get(CdkMenuItemCheckbox));
    }));

    it('should not change state of sibling checked menuitemcheckbox', () => {
      menuItems[1].trigger();

      expect(menuItems[0].checked).toBeTrue();
    });
  });

  describe('with MenuItems as radio button', () => {
    let fixture: ComponentFixture<MenuWithMultipleRadioGroups>;
    let menuItems: CdkMenuItemRadio[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuWithMultipleRadioGroups],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuWithMultipleRadioGroups);
      fixture.detectChanges();

      fixture.componentInstance.panel._menuStack = new MenuStack();
      fixture.componentInstance.trigger.getMenuTrigger()?.toggle();
      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItemRadio))
        .map(e => e.injector.get(CdkMenuItemRadio));
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
    let menuItems: CdkMenuItemRadio[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuWithMenuItemsAndRadioGroups],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuWithMenuItemsAndRadioGroups);
      fixture.detectChanges();

      fixture.componentInstance.panel._menuStack = new MenuStack();
      fixture.componentInstance.trigger.getMenuTrigger()?.toggle();
      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItemRadio))
        .map(element => element.injector.get(CdkMenuItemRadio));
    }));

    it('should emit from enclosing radio group only', () => {
      const spies: jasmine.Spy[] = [];

      fixture.debugElement.queryAll(By.directive(CdkMenuGroup)).forEach((group, index) => {
        const spy = jasmine.createSpy(`cdkMenuGroup ${index} change spy`);
        spies.push(spy);
        group.injector.get(CdkMenuGroup).change.subscribe(spy);
      });

      menuItems[0].trigger();

      expect(spies[2]).toHaveBeenCalledTimes(1);
      expect(spies[2]).toHaveBeenCalledWith(menuItems[0]);
      expect(spies[3]).not.toHaveBeenCalled();
      expect(spies[4]).not.toHaveBeenCalled();
    });

    it('should not emit with click on disabled button', () => {
      const spy = jasmine.createSpy('cdkMenuGroup change spy');

      fixture.debugElement
        .queryAll(By.directive(CdkMenuGroup))[1]
        .injector.get(CdkMenuGroup)
        .change.subscribe(spy);
      menuItems[0].disabled = true;

      menuItems[0].trigger();

      expect(spy).not.toHaveBeenCalled();
    });
  });
});

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="panel"></button>
    </div>
    <ng-template cdkMenuPanel #panel="cdkMenuPanel">
      <ul cdkMenu [cdkMenuPanel]="panel">
        <li role="none">
          <ul cdkMenuGroup>
            <li #first role="none">
              <button checked="true" cdkMenuItemCheckbox>
                one
              </button>
            </li>
            <li role="none">
              <button cdkMenuItemCheckbox>
                two
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </ng-template>
  `,
})
class CheckboxMenu {
  @ViewChild(CdkMenuItem) readonly trigger: CdkMenuItem;
  @ViewChild(CdkMenuPanel) readonly panel: CdkMenuPanel;
}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="panel"></button>
    </div>
    <ng-template cdkMenuPanel #panel="cdkMenuPanel">
      <ul cdkMenu [cdkMenuPanel]="panel">
        <li role="none">
          <ul cdkMenuGroup>
            <li role="none">
              <button checked="true" cdkMenuItemRadio>
                one
              </button>
            </li>
            <li role="none">
              <button cdkMenuItemRadio>
                two
              </button>
            </li>
          </ul>
        </li>
        <li role="none">
          <ul cdkMenuGroup>
            <li role="none">
              <button cdkMenuItemRadio>
                three
              </button>
            </li>
            <li role="none">
              <button cdkMenuItemRadio>
                four
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </ng-template>
  `,
})
class MenuWithMultipleRadioGroups {
  @ViewChild(CdkMenuItem) readonly trigger: CdkMenuItem;
  @ViewChild(CdkMenuPanel) readonly panel: CdkMenuPanel;
}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="panel"></button>
    </div>
    <ng-template cdkMenuPanel #panel="cdkMenuPanel">
      <ul cdkMenu [cdkMenuPanel]="panel">
        <li role="none">
          <ul cdkMenuGroup>
            <li role="none">
              <button cdkMenuItemRadio>
                one
              </button>
            </li>
          </ul>
        </li>
        <li role="none">
          <ul cdkMenuGroup>
            <li role="none">
              <button cdkMenuItemRadio>
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
    </ng-template>
  `,
})
class MenuWithMenuItemsAndRadioGroups {
  @ViewChild(CdkMenuItem) readonly trigger: CdkMenuItem;
  @ViewChild(CdkMenuPanel) readonly panel: CdkMenuPanel;
}
