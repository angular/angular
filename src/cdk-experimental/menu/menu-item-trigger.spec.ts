import {Component, ViewChildren, QueryList, ElementRef, ViewChild, Type} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {dispatchKeyboardEvent} from '@angular/cdk/testing/private';
import {TAB, SPACE} from '@angular/cdk/keycodes';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItem} from './menu-item';
import {CdkMenu} from './menu';
import {CdkMenuItemTrigger} from './menu-item-trigger';
import {Menu} from './menu-interface';

describe('MenuItemTrigger', () => {
  describe('on CdkMenuItem', () => {
    let fixture: ComponentFixture<TriggerForEmptyMenu>;
    let menuItem: CdkMenuItem;
    let menuItemElement: HTMLButtonElement;

    beforeEach(waitForAsync(() => {
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

    it('should set aria-haspopup to menu', () => {
      expect(menuItemElement.getAttribute('aria-haspopup')).toEqual('menu');
    });

    it('should be a button type', () => {
      expect(menuItemElement.getAttribute('type')).toBe('button');
    });

    it('should  have a menu', () => {
      expect(menuItem.hasMenu()).toBeTrue();
    });
  });

  describe('with nested sub-menus', () => {
    let fixture: ComponentFixture<MenuBarWithNestedSubMenus>;

    let menus: CdkMenu[];
    let nativeMenus: HTMLElement[];
    let menuItems: CdkMenuItem[];
    let triggers: CdkMenuItemTrigger[];
    let nativeTriggers: HTMLButtonElement[];

    const grabElementsForTesting = () => {
      menus = fixture.componentInstance.menus.toArray();
      nativeMenus = fixture.componentInstance.nativeMenus.map(m => m.nativeElement);

      menuItems = fixture.componentInstance.menuItems.toArray();
      triggers = fixture.componentInstance.triggers.toArray();
      nativeTriggers = fixture.componentInstance.nativeTriggers.map(t => t.nativeElement);
    };

    /** run change detection and, extract and set the rendered elements */
    const detectChanges = () => {
      fixture.detectChanges();
      grabElementsForTesting();
    };

    const setDocumentDirection = (dir: 'ltr' | 'rtl') => (document.dir = dir);

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarWithNestedSubMenus],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MenuBarWithNestedSubMenus);
      detectChanges();
    });

    afterEach(() => {
      setDocumentDirection('ltr');
    });

    it('should toggle the aria-expanded attribute', () => {
      expect(nativeTriggers[0].getAttribute('aria-expanded')).toEqual('false');

      triggers[0].toggle();
      detectChanges();
      expect(nativeTriggers[0].getAttribute('aria-expanded')).toEqual('true');

      triggers[0].toggle();
      detectChanges();
      expect(nativeTriggers[0].getAttribute('aria-expanded')).toEqual('false');
    });

    it('should hide menus on initial load', () => {
      expect(menus.length).toEqual(0);
    });

    it('should only open the attached menu', () => {
      triggers[0].toggle();
      detectChanges();

      expect(menus.length).toEqual(1);
      expect(menus[0] as Menu).toEqual(triggers[0].getMenu()!);
    });

    it('should not open the menu when menu item disabled', () => {
      menuItems[0].disabled = true;

      menuItems[0].trigger();
      detectChanges();

      expect(menus.length).toBe(0);
    });

    it('should toggle the attached menu', () => {
      triggers[0].toggle();
      detectChanges();
      expect(menus.length).toEqual(1);

      triggers[0].toggle();
      detectChanges();
      expect(menus.length).toEqual(0);
    });

    it('should open a nested submenu when nested trigger is clicked', () => {
      triggers[0].toggle();
      detectChanges();

      triggers[1].toggle();
      detectChanges();

      expect(menus.length).toEqual(2);
    });

    it('should close all menus when root menu is closed', () => {
      triggers[0].toggle();
      detectChanges();
      triggers[1].toggle();
      detectChanges();

      expect(menus.length).toEqual(2);

      triggers[0].toggle();
      detectChanges();

      expect(menus.length).toEqual(0);
    });

    it('should close nested submenu and leave parent open', () => {
      triggers[0].toggle();
      detectChanges();
      triggers[1].toggle();
      detectChanges();

      expect(menus.length).toEqual(2);

      triggers[1].toggle();
      detectChanges();

      expect(menus.length).withContext('first level menu should stay open').toEqual(1);
      expect(triggers[0].getMenu()).toEqual(menus[0]);
    });

    it('should emit request to open event on menu open', () => {
      const triggerSpy = jasmine.createSpy('cdkMenuItem open request emitter');
      triggers[0].opened.subscribe(triggerSpy);

      triggers[0].toggle();

      expect(triggerSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit request to close event on menu close', () => {
      const triggerSpy = jasmine.createSpy('cdkMeuItem close request emitter');
      const closedSpy = jasmine.createSpy('cdkMenu closed emitter');
      triggers[0].closed.subscribe(triggerSpy);

      triggers[0].toggle();
      detectChanges();
      menus[0].closed.subscribe(closedSpy);

      triggers[0].toggle();
      detectChanges();

      expect(triggerSpy).toHaveBeenCalledTimes(1);
      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('should position the overlay below the trigger by default for a horizontal Menu', () => {
      triggers[0].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[0].getBoundingClientRect().bottom))
        .withContext('MenuBar is horizontal by default')
        .toEqual(Math.floor(nativeMenus[0].getBoundingClientRect().top));
    });

    it(
      'should fallback to positioning the overlay above the trigger for horizontal Menu ' +
        'styled to bottom of viewport',
      () => {
        nativeTriggers[0].style.position = 'fixed';
        nativeTriggers[0].style.bottom = '0';

        triggers[0].toggle();
        detectChanges();

        expect(Math.floor(nativeTriggers[0].getBoundingClientRect().top))
          .withContext('trigger button position set to the bottom of the viewport')
          .toEqual(Math.floor(nativeMenus[0].getBoundingClientRect().bottom));
      }
    );

    it('should position nested submenu overlay to right by default in ltr layout', () => {
      triggers[0].toggle();
      detectChanges();
      triggers[1].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[1].getBoundingClientRect().right)).toEqual(
        Math.floor(nativeMenus[1].getBoundingClientRect().left)
      );
    });

    it('should fallback to positioning nested submenu overlay to the left in ltr layout', () => {
      nativeTriggers[0].style.position = 'fixed';
      nativeTriggers[0].style.right = '0';
      triggers[0].toggle();
      detectChanges();
      triggers[1].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[1].getBoundingClientRect().left))
        .withContext('trigger positioned on the right')
        .toEqual(Math.floor(nativeMenus[1].getBoundingClientRect().right));
    });

    it('should position nested submenu overlay to the left by default in rtl layout', () => {
      setDocumentDirection('rtl');

      triggers[0].toggle();
      detectChanges();
      triggers[1].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[1].getBoundingClientRect().left)).toEqual(
        Math.floor(nativeMenus[1].getBoundingClientRect().right)
      );
    });

    it('should fallback to positioning nested submenu overlay to the right in rtl layout', () => {
      setDocumentDirection('rtl');

      nativeTriggers[0].style.position = 'fixed';
      nativeTriggers[0].style.left = '0';
      triggers[0].toggle();
      detectChanges();

      triggers[1].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[1].getBoundingClientRect().right))
        .withContext('trigger positioned on the left')
        .toEqual(Math.floor(nativeMenus[1].getBoundingClientRect().left));
    });

    it('should position nested submenu at trigger level by default', () => {
      triggers[0].toggle();
      detectChanges();

      triggers[1].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[1].getBoundingClientRect().top))
        .withContext('submenu should be at height of its trigger by default')
        .toEqual(Math.floor(nativeMenus[1].getBoundingClientRect().top));
    });
  });

  describe('with shared triggered menu', () => {
    /**
     * Return a function which builds the given component and renders it.
     * @param componentClass the component to create
     */
    function createComponent<T>(componentClass: Type<T>) {
      return function () {
        TestBed.configureTestingModule({
          imports: [CdkMenuModule],
          declarations: [componentClass],
        }).compileComponents();

        TestBed.createComponent(componentClass).detectChanges();
      };
    }

    it('should throw an error if two triggers in different menubars open the same menu', () => {
      expect(createComponent(TriggersWithSameMenuDifferentMenuBars)).toThrowError(
        /CdkMenuPanel is already referenced by different CdkMenuTrigger/
      );
    });

    it('should throw an error if two triggers in the same menubar open the same menu', () => {
      expect(createComponent(TriggersWithSameMenuSameMenuBar)).toThrowError(
        /CdkMenuPanel is already referenced by different CdkMenuTrigger/
      );
    });

    // TODO uncomment once we figure out why this is failing in Ivy
    // it('should throw an error if a trigger in a submenu references its parent menu', () => {
    //   expect(createComponent(TriggerOpensItsMenu)).toThrowError(
    //     /CdkMenuPanel is already referenced by different CdkMenuTrigger/
    //   );
    // });
  });

  describe('standalone', () => {
    let fixture: ComponentFixture<StandaloneTriggerWithInlineMenu>;

    let nativeMenus: HTMLElement[];
    let nativeTrigger: HTMLElement;
    let submenuNativeItem: HTMLElement | undefined;

    const grabElementsForTesting = () => {
      nativeTrigger = fixture.componentInstance.nativeTrigger.nativeElement;
      nativeMenus = fixture.componentInstance.nativeMenus.map(m => m.nativeElement);
      submenuNativeItem = fixture.componentInstance.submenuItem?.nativeElement;
    };

    /** run change detection and, extract and set the rendered elements */
    const detectChanges = () => {
      fixture.detectChanges();
      grabElementsForTesting();
    };

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [StandaloneTriggerWithInlineMenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(StandaloneTriggerWithInlineMenu);
      detectChanges();
    });

    it('should have its tabindex set to 0', () => {
      expect(nativeTrigger.tabIndex).toBe(0);
    });

    it('should reset the tabindex to 0 when shift-tabbing out of standalone trigger', () => {
      nativeTrigger.focus();

      dispatchKeyboardEvent(nativeTrigger, 'keydown', TAB, undefined, {shift: true});
      detectChanges();
    });

    it('should reset the tabindex to 0 when tabbing out of submenu', () => {
      nativeTrigger.click();
      detectChanges();

      dispatchKeyboardEvent(submenuNativeItem!, 'keydown', TAB, undefined, {shift: true});
      detectChanges();

      expect(nativeTrigger.tabIndex).toBe(0);
    });

    it('should open the menu on trigger', () => {
      nativeTrigger.click();
      detectChanges();

      expect(nativeMenus.length).toBe(2);
    });

    it('should toggle the menu on trigger', () => {
      nativeTrigger.click();
      detectChanges();
      expect(nativeMenus.length).toBe(2);

      nativeTrigger.click();
      detectChanges();
      expect(nativeMenus.length).toBe(1);
    });

    it('should toggle the menu on keyboard events', () => {
      dispatchKeyboardEvent(nativeTrigger, 'keydown', SPACE);
      detectChanges();
      expect(nativeMenus.length).toBe(2);

      dispatchKeyboardEvent(nativeTrigger, 'keydown', SPACE);
      detectChanges();
      expect(nativeMenus.length).toBe(1);
    });

    it('should close the open menu on background click', () => {
      nativeTrigger.click();
      detectChanges();

      document.body.click();
      detectChanges();

      expect(nativeMenus.length).toBe(1);
    });

    it('should close the open menu when clicking on an inline menu item', () => {
      nativeTrigger.click();
      detectChanges();

      fixture.componentInstance.nativeInlineItem.nativeElement.click();
      detectChanges();

      expect(nativeMenus.length).toBe(1);
    });
  });
});

@Component({
  template: `
    <div cdkMenuBar><button cdkMenuItem [cdkMenuTriggerFor]="noop">Click me!</button></div>
    <ng-template cdkMenuPanel #noop="cdkMenuPanel"><div cdkMenu></div></ng-template>
  `,
})
class TriggerForEmptyMenu {}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="sub1">First</button>
    </div>

    <ng-template cdkMenuPanel #sub1="cdkMenuPanel">
      <div cdkMenu [cdkMenuPanel]="sub1">
        <button cdkMenuItem [cdkMenuTriggerFor]="sub2">Second</button>
      </div>
    </ng-template>

    <ng-template cdkMenuPanel #sub2="cdkMenuPanel">
      <div cdkMenu [cdkMenuPanel]="sub2">
        <button cdkMenuItem>Third</button>
      </div>
    </ng-template>
  `,
})
class MenuBarWithNestedSubMenus {
  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItemTrigger) triggers: QueryList<CdkMenuItemTrigger>;
  @ViewChildren(CdkMenuItemTrigger, {read: ElementRef}) nativeTriggers: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItem) menuItems: QueryList<CdkMenuItem>;
}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="menu">First</button>
    </div>
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="menu">Second</button>
    </div>

    <ng-template cdkMenuPanel #menu="cdkMenuPanel">
      <div cdkMenu [cdkMenuPanel]="menu">
        <button cdkMenuItem></button>
      </div>
    </ng-template>
  `,
})
class TriggersWithSameMenuDifferentMenuBars {}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="menu">First</button>
      <button cdkMenuItem [cdkMenuTriggerFor]="menu">Second</button>
    </div>

    <ng-template cdkMenuPanel #menu="cdkMenuPanel">
      <div cdkMenu [cdkMenuPanel]="menu">
        <button cdkMenuItem></button>
      </div>
    </ng-template>
  `,
})
class TriggersWithSameMenuSameMenuBar {}

// TODO uncomment once we figure out why this is failing in Ivy
// @Component({
//   template: `
//     <div cdkMenuBar>
//       <button cdkMenuItem [cdkMenuTriggerFor]="menu"></button>
//     </div>

//     <ng-template cdkMenuPanel #menu="cdkMenuPanel">
//       <div cdkMenu [cdkMenuPanel]="menu">
//         <button cdkMenuItem [cdkMenuTriggerFor]="menu"></button>
//       </div>
//     </ng-template>
//   `,
// })
// class TriggerOpensItsMenu implements AfterViewInit {
//   @ViewChild(CdkMenuItem, {read: ElementRef}) trigger: ElementRef<HTMLButtonElement>;

//   constructor(private readonly _changeDetector: ChangeDetectorRef) {}

//   ngAfterViewInit() {
//     this.trigger.nativeElement.click();
//     this._changeDetector.detectChanges();
//   }
// }
@Component({
  template: `
    <button cdkMenuItem [cdkMenuTriggerFor]="sub1">First</button>

    <ng-template cdkMenuPanel #sub1="cdkMenuPanel">
      <div cdkMenu [cdkMenuPanel]="sub1">
        <button #submenu_item cdkMenuItem [cdkMenuTriggerFor]="sub2">Second</button>
      </div>
    </ng-template>

    <div cdkMenu>
      <button #inline_item cdkMenuItem></button>
    </div>
  `,
})
class StandaloneTriggerWithInlineMenu {
  @ViewChild(CdkMenuItem, {read: ElementRef}) nativeTrigger: ElementRef<HTMLElement>;
  @ViewChild('submenu_item', {read: ElementRef}) submenuItem?: ElementRef<HTMLElement>;
  @ViewChild('inline_item', {read: ElementRef}) nativeInlineItem: ElementRef<HTMLElement>;
  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;
}
