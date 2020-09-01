import {QueryList, ViewChild, ViewChildren, Component} from '@angular/core';
import {CdkMenu} from './menu';
import {CdkMenuBar} from './menu-bar';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CdkMenuItemTrigger} from './menu-item-trigger';
import {MenuStack} from './menu-stack';
import {CdkMenuModule} from './menu-module';

describe('MenuStack', () => {
  let fixture: ComponentFixture<MultiMenuWithSubmenu>;
  let menuStack: MenuStack;
  let triggers: CdkMenuItemTrigger[];
  let menus: CdkMenu[];

  /** Fetch triggers, menus and the menu stack from the test component.  */
  function getElementsForTesting() {
    fixture.detectChanges();
    triggers = fixture.componentInstance.triggers.toArray();
    menus = fixture.componentInstance.menus.toArray();
    menuStack = fixture.componentInstance.menuBar._menuStack;
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CdkMenuModule],
      declarations: [MultiMenuWithSubmenu],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiMenuWithSubmenu);
    fixture.detectChanges();

    getElementsForTesting();
  });

  /** Open up all of the menus in the test component. */
  function openAllMenus() {
    triggers[0].openMenu();
    getElementsForTesting();
    triggers[1].openMenu();
    getElementsForTesting();
    triggers[2].openMenu();
    getElementsForTesting();
  }

  it(
    'should fill the menu stack with the latest menu at the end of the stack and oldest at' +
      ' the start of the stack',
    () => {
      openAllMenus();
      expect(menus.length).toBe(3);
      const spy = jasmine.createSpy('menu stack closed spy');

      menuStack.closed.subscribe(spy);
      menuStack.closeAll();

      expect(spy).toHaveBeenCalledTimes(3);
      const callArgs = spy.calls.all().map((v: jasmine.CallInfo<jasmine.Func>) => v.args[0]);
      expect(callArgs).toEqual(menus.reverse());
      expect(menuStack.isEmpty()).toBeTrue();
    }
  );

  it('should close triggering menu and all menus below it', () => {
    openAllMenus();
    expect(menus.length).toBe(3);

    triggers[1].toggle();
    getElementsForTesting();

    expect(menus.length).toBe(1);
    expect(menuStack.length()).withContext('menu stack should only have the single menu').toBe(1);
    expect(menuStack.peek()).toEqual(menus[0]);
  });
});

@Component({
  template: `
    <div>
      <div cdkMenuBar id="menu_bar">
        <button cdkMenuItem [cdkMenuTriggerFor]="file">File</button>
      </div>

      <ng-template cdkMenuPanel #file="cdkMenuPanel">
        <div cdkMenu id="file_menu" [cdkMenuPanel]="file">
          <button cdkMenuItem [cdkMenuTriggerFor]="share">Share</button>
        </div>
      </ng-template>

      <ng-template cdkMenuPanel #share="cdkMenuPanel">
        <div cdkMenu id="share_menu" [cdkMenuPanel]="share">
          <button cdkMenuItem [cdkMenuTriggerFor]="chat">Chat</button>
        </div>
      </ng-template>

      <ng-template cdkMenuPanel #chat="cdkMenuPanel">
        <div cdkMenu id="chat_menu" [cdkMenuPanel]="chat">
          <button cdkMenuItem>GVC</button>
        </div>
      </ng-template>
    </div>
  `,
})
class MultiMenuWithSubmenu {
  @ViewChild(CdkMenuBar) menuBar: CdkMenuBar;

  @ViewChildren(CdkMenuItemTrigger) triggers: QueryList<CdkMenuItemTrigger>;
  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
}
