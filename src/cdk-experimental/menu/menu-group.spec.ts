import {Component, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItemCheckbox} from './menu-item-checkbox';
import {CdkMenuItemRadio} from './menu-item-radio';
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

      fixture.componentInstance.trigger.getMenuTrigger()?.toggle();
      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItemRadio))
        .map(e => e.injector.get(CdkMenuItemRadio));
    }));

    it('should change state of sibling menuitemradio in same group', () => {
      menuItems[1].trigger({keepOpen: true});

      expect(menuItems[1].checked).toBeTrue();
      expect(menuItems[0].checked).toBeFalse();
    });

    it('should not change state of menuitemradio in sibling group', () => {
      menuItems[3].trigger({keepOpen: true});

      expect(menuItems[3].checked).toBeTrue();
      expect(menuItems[0].checked).toBeTrue();
    });

    it('should not change radiogroup state with disabled button', () => {
      menuItems[1].disabled = true;

      menuItems[1].trigger({keepOpen: true});

      expect(menuItems[0].checked).toBeTrue();
      expect(menuItems[1].checked).toBeFalse();
    });
  });
});

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="panel"></button>
    </div>
    <ng-template #panel>
      <ul cdkMenu>
        <li role="none">
          <ul cdkMenuGroup>
            <li #first role="none">
              <button cdkMenuItemChecked="true" cdkMenuItemCheckbox>
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
}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="panel"></button>
    </div>
    <ng-template #panel>
      <ul cdkMenu>
        <li role="none">
          <ul cdkMenuGroup>
            <li role="none">
              <button cdkMenuItemChecked="true" cdkMenuItemRadio>
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
}
