import {Component, ViewChild, ElementRef, Type, ViewChildren, QueryList} from '@angular/core';
import {CdkMenuModule} from './menu-module';
import {TestBed, waitForAsync, ComponentFixture} from '@angular/core/testing';
import {CdkMenu} from './menu';
import {CdkContextMenuTrigger} from './context-menu-trigger';
import {dispatchKeyboardEvent, dispatchMouseEvent} from '@angular/cdk/testing/private';
import {By} from '@angular/platform-browser';
import {CdkMenuItem} from './menu-item';
import {CdkMenuTrigger} from './menu-trigger';
import {CdkMenuBar} from './menu-bar';
import {LEFT_ARROW, RIGHT_ARROW} from '@angular/cdk/keycodes';

describe('CdkContextMenuTrigger', () => {
  describe('with simple context menu trigger', () => {
    let fixture: ComponentFixture<SimpleContextMenu>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [SimpleContextMenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleContextMenu);
      fixture.detectChanges();
    });

    /** Get the menu opened by the context menu trigger. */
    function getContextMenu() {
      return fixture.componentInstance.menu;
    }

    /** Return a reference to the context menu native element. */
    function getNativeContextMenu() {
      return fixture.componentInstance.nativeMenu?.nativeElement;
    }

    /** Get the context in which the context menu should trigger. */
    function getMenuContext() {
      return fixture.componentInstance.triggerElement.nativeElement;
    }

    /** Open up the context menu and run change detection. */
    function openContextMenu() {
      // right click triggers a context menu event
      dispatchMouseEvent(getMenuContext(), 'contextmenu');
      fixture.detectChanges();
    }

    it('should display context menu on right click inside of context component', () => {
      expect(getContextMenu()).not.toBeDefined();
      openContextMenu();
      expect(getContextMenu()).toBeDefined();
    });

    it('should close out the context menu when clicking in the context', () => {
      openContextMenu();

      getMenuContext().click();
      fixture.detectChanges();

      expect(getContextMenu()).not.toBeDefined();
    });

    it('should close out the context menu when clicking on element outside of the context', () => {
      openContextMenu();

      fixture.nativeElement.querySelector('#other').click();
      fixture.detectChanges();

      expect(getContextMenu()).not.toBeDefined();
    });

    it('should not close the menu on first auxclick after opening via contextmenu event', () => {
      openContextMenu();

      fixture.nativeElement.querySelector('#other').dispatchEvent(new MouseEvent('auxclick'));
      fixture.detectChanges();

      expect(getContextMenu()).toBeDefined();

      fixture.nativeElement.querySelector('#other').dispatchEvent(new MouseEvent('auxclick'));
      fixture.detectChanges();

      expect(getContextMenu()).not.toBeDefined();
    });

    it('should close the menu on first auxclick after opening programmatically', () => {
      fixture.componentInstance.trigger.open({x: 0, y: 0});

      fixture.nativeElement.querySelector('#other').dispatchEvent(new MouseEvent('auxclick'));
      fixture.detectChanges();

      expect(getContextMenu()).not.toBeDefined();
    });

    it('should close out the context menu when clicking a menu item', () => {
      openContextMenu();

      fixture.debugElement.query(By.directive(CdkMenuItem)).injector.get(CdkMenuItem).trigger();
      fixture.detectChanges();

      expect(getContextMenu()).not.toBeDefined();
    });

    it('should re-open the same menu when right clicking twice in the context', () => {
      openContextMenu();
      openContextMenu();

      const menus = fixture.componentInstance.menus;
      expect(menus.length)
        .withContext('two context menu triggers should result in a single context menu')
        .toBe(1);
    });

    it('should retain the context menu on right click inside the open menu', () => {
      openContextMenu();

      dispatchMouseEvent(getNativeContextMenu()!, 'contextmenu');
      fixture.detectChanges();

      expect(getContextMenu()).toBeDefined();
    });

    it('should focus the first menuitem when the context menu is opened', () => {
      openContextMenu();
      expect(document.activeElement!.id).toEqual('first_menu_item');
    });

    it('should not close context menu when pressing left arrow', () => {
      openContextMenu();
      expect(document.activeElement!.id).toEqual('first_menu_item');
      dispatchKeyboardEvent(document.activeElement!, 'keydown', LEFT_ARROW, 'ArrowLeft');
      fixture.detectChanges();
      expect(getContextMenu()).toBeDefined();
    });

    it('should not close context menu when pressing right arrow', () => {
      openContextMenu();
      expect(document.activeElement!.id).toEqual('first_menu_item');
      dispatchKeyboardEvent(document.activeElement!, 'keydown', RIGHT_ARROW, 'ArrowRight');
      fixture.detectChanges();
      expect(getContextMenu()).toBeDefined();
    });
  });

  describe('nested context menu triggers', () => {
    let fixture: ComponentFixture<NestedContextMenu>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [NestedContextMenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(NestedContextMenu);
      fixture.detectChanges();
    });

    /** Get the cut context menu. */
    function getCutMenu() {
      return fixture.componentInstance.cutMenu;
    }

    /** Get the copy context menu. */
    function getCopyMenu() {
      return fixture.componentInstance.copyMenu;
    }

    /** Get the context in which the cut context menu should trigger. */
    function getCutMenuContext() {
      return fixture.componentInstance.cutContext.nativeElement;
    }

    /** Get the context in which the copy context menu should trigger. */
    function getCopyMenuContext() {
      return fixture.componentInstance.copyContext.nativeElement;
    }

    /** Open up the cut context menu and run change detection. */
    function openCutContextMenu() {
      // right click triggers a context menu event
      dispatchMouseEvent(getCutMenuContext(), 'contextmenu');
      fixture.detectChanges();
    }

    /** Open up the copy context menu and run change detection. */
    function openCopyContextMenu() {
      // right click triggers a context menu event
      dispatchMouseEvent(getCopyMenuContext(), 'contextmenu');
      fixture.detectChanges();
    }

    it('should open the cut context menu only when right clicked in its trigger context', () => {
      openCutContextMenu();

      expect(getCutMenu()).toBeDefined();
      expect(getCopyMenu()).not.toBeDefined();
    });

    it('should open the nested copy context menu only when right clicked in nested context', () => {
      openCopyContextMenu();

      expect(getCopyMenu()).toBeDefined();
      expect(getCutMenu()).not.toBeDefined();
    });

    it(
      'should open the parent context menu only when right clicked in nested context and nested' +
        ' is disabled',
      () => {
        fixture.componentInstance.copyMenuDisabled = true;
        fixture.detectChanges();
        openCopyContextMenu();

        expect(getCopyMenu()).not.toBeDefined();
        expect(getCutMenu()).toBeDefined();
      },
    );

    it('should close nested context menu when parent is opened', () => {
      openCopyContextMenu();

      openCutContextMenu();

      expect(getCopyMenu()).not.toBeDefined();
      expect(getCutMenu()).toBeDefined();
    });

    it('should close the parent context menu when nested is open', () => {
      openCutContextMenu();

      openCopyContextMenu();

      expect(getCopyMenu()).toBeDefined();
      expect(getCutMenu()).not.toBeDefined();
    });

    it('should close nested context menu when clicking in parent', () => {
      openCopyContextMenu();

      getCutMenuContext().click();
      fixture.detectChanges();

      expect(getCopyMenu()).not.toBeDefined();
    });

    it('should close parent context menu when clicking in nested menu', () => {
      openCutContextMenu();

      getCopyMenuContext().click();
      fixture.detectChanges();

      expect(getCutMenu()).not.toBeDefined();
    });
  });

  describe('with context menu that has submenu', () => {
    let fixture: ComponentFixture<ContextMenuWithSubmenu>;
    let instance: ContextMenuWithSubmenu;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [ContextMenuWithSubmenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ContextMenuWithSubmenu);
      fixture.detectChanges();

      instance = fixture.componentInstance;
    });

    it('should open context menu submenu without closing context menu', () => {
      dispatchMouseEvent(instance.context.nativeElement, 'contextmenu');
      fixture.detectChanges();

      instance.triggerNativeElement.nativeElement.click();
      fixture.detectChanges();

      expect(instance.cutMenu).toBeDefined();
      expect(instance.copyMenu).toBeDefined();
    });
  });

  describe('with menubar and inline menu on page', () => {
    let fixture: ComponentFixture<ContextMenuWithMenuBarAndInlineMenu>;
    let nativeMenuBar: HTMLElement;
    let nativeMenuBarTrigger: HTMLElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [ContextMenuWithMenuBarAndInlineMenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ContextMenuWithMenuBarAndInlineMenu);
      fixture.detectChanges();

      nativeMenuBar = fixture.componentInstance.nativeMenuBar.nativeElement;
      nativeMenuBarTrigger = fixture.componentInstance.nativeMenuBarTrigger.nativeElement;
    });

    /** Get the menu opened by the context menu trigger. */
    function getContextMenu() {
      return fixture.componentInstance.contextMenu;
    }

    /** Get the menu opened by the menu bar item trigger. */
    function getFileMenu() {
      return fixture.componentInstance.fileMenu;
    }

    /** Get the context in which the context menu should trigger. */
    function getMenuContext() {
      return fixture.componentInstance.trigger.nativeElement;
    }

    /** Get the inline menus trigger element. */
    function getInlineMenuTrigger() {
      return fixture.componentInstance.nativeInlineMenuButton.nativeElement;
    }

    /** Return the native element for the inline menu. */
    function getInlineMenuElement() {
      return fixture.componentInstance.nativeInlineMenu.nativeElement;
    }

    /** Open up the context menu and run change detection. */
    function openContextMenu() {
      // right click triggers a context menu event
      dispatchMouseEvent(getMenuContext(), 'contextmenu');
      dispatchMouseEvent(getMenuContext(), 'mousedown');
      fixture.detectChanges();
    }

    /** Open up the file menu from the menu bar. */
    function openFileMenu() {
      nativeMenuBarTrigger.click();
      fixture.detectChanges();
    }

    it('should close the open context menu when clicking on the menubar element', () => {
      openContextMenu();

      dispatchMouseEvent(nativeMenuBar, 'click');
      fixture.detectChanges();

      expect(getContextMenu()).not.toBeDefined();
    });

    it('should close the open context menu when clicking on the menubar menu item', () => {
      openContextMenu();

      nativeMenuBarTrigger.click();
      fixture.detectChanges();

      expect(getContextMenu()).not.toBeDefined();
    });

    it('should close the open context menu when clicking on the inline menu element', () => {
      openContextMenu();

      getInlineMenuElement().click();
      fixture.detectChanges();

      expect(getContextMenu()).not.toBeDefined();
    });

    it('should close the open context menu when clicking on an inline menu item', () => {
      openContextMenu();

      getInlineMenuTrigger().click();
      fixture.detectChanges();

      expect(getContextMenu()).not.toBeDefined();
    });

    it('should close the open menu when opening a context menu', () => {
      openFileMenu();

      openContextMenu();

      expect(getFileMenu()).not.toBeDefined();
    });
  });

  describe('with shared triggered menu', () => {
    /**
     * Return a function which builds the given component and renders it.
     * @param componentClass the component to create
     */
    function createComponent<T>(componentClass: Type<T>) {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [componentClass],
      }).compileComponents();

      const fixture = TestBed.createComponent(componentClass);
      fixture.detectChanges();
      return fixture;
    }

    it('should allow a context menu and menubar trigger share a menu', () => {
      const fixture = createComponent(MenuBarAndContextTriggerShareMenu);
      expect(fixture.componentInstance.menus.length).toBe(0);
      fixture.componentInstance.menuBarTrigger.toggle();
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(1);
      fixture.componentInstance.menuBarTrigger.toggle();
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(0);
      fixture.componentInstance.contextTrigger.open({x: 0, y: 0});
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(1);
    });
  });
});

@Component({
  template: `
    <div [cdkContextMenuTriggerFor]="context"></div>
    <div id="other"></div>

    <ng-template #context>
      <div cdkMenu>
        <button id="first_menu_item" cdkMenuItem></button>
      </div>
    </ng-template>
  `,
})
class SimpleContextMenu {
  @ViewChild(CdkContextMenuTrigger) trigger: CdkContextMenuTrigger;
  @ViewChild(CdkContextMenuTrigger, {read: ElementRef}) triggerElement: ElementRef<HTMLElement>;
  @ViewChild(CdkMenu) menu?: CdkMenu;
  @ViewChild(CdkMenu, {read: ElementRef}) nativeMenu?: ElementRef<HTMLElement>;

  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
}

@Component({
  template: `
    <div #cut_trigger [cdkContextMenuTriggerFor]="cut">
      <div
        #copy_trigger
        [cdkContextMenuDisabled]="copyMenuDisabled"
        [cdkContextMenuTriggerFor]="copy"
      ></div>
    </div>

    <ng-template #cut>
      <div #cut_menu cdkMenu></div>
    </ng-template>

    <ng-template #copy>
      <div #copy_menu cdkMenu></div>
    </ng-template>
  `,
})
class NestedContextMenu {
  @ViewChild('cut_trigger', {read: ElementRef}) cutContext: ElementRef<HTMLElement>;
  @ViewChild('copy_trigger', {read: ElementRef}) copyContext: ElementRef<HTMLElement>;

  @ViewChild('cut_menu', {read: CdkMenu}) cutMenu: CdkMenu;
  @ViewChild('copy_menu', {read: CdkMenu}) copyMenu: CdkMenu;

  copyMenuDisabled = false;
}

@Component({
  template: `
    <div [cdkContextMenuTriggerFor]="cut"></div>

    <ng-template #cut>
      <div #cut_menu cdkMenu>
        <button cdkMenuItem [cdkMenuTriggerFor]="copy"></button>
      </div>
    </ng-template>

    <ng-template #copy>
      <div #copy_menu cdkMenu></div>
    </ng-template>
  `,
})
class ContextMenuWithSubmenu {
  @ViewChild(CdkContextMenuTrigger, {read: ElementRef}) context: ElementRef<HTMLElement>;
  @ViewChild(CdkMenuTrigger, {read: ElementRef}) triggerNativeElement: ElementRef<HTMLElement>;

  @ViewChild('cut_menu', {read: CdkMenu}) cutMenu: CdkMenu;
  @ViewChild('copy_menu', {read: CdkMenu}) copyMenu: CdkMenu;
}

@Component({
  template: `
    <div cdkMenuBar id="menu_bar">
      <button #trigger cdkMenuItem [cdkMenuTriggerFor]="file">File</button>
    </div>

    <ng-template #file>
      <div cdkMenu #file_menu id="file_menu"></div>
    </ng-template>

    <div [cdkContextMenuTriggerFor]="context"></div>
    <ng-template #context>
      <div cdkMenu #context_menu>
        <button cdkMenuItem></button>
      </div>
    </ng-template>

    <div #inline_menu cdkMenu>
      <button #inline_menu_button cdkMenuItem></button>
    </div>
  `,
})
class ContextMenuWithMenuBarAndInlineMenu {
  @ViewChild(CdkMenuBar, {read: ElementRef}) nativeMenuBar: ElementRef;
  @ViewChild('trigger', {read: ElementRef}) nativeMenuBarTrigger: ElementRef;

  @ViewChild('context_menu') contextMenu?: CdkMenu;
  @ViewChild(CdkContextMenuTrigger, {read: ElementRef}) trigger: ElementRef<HTMLElement>;

  @ViewChild('file_menu') fileMenu?: CdkMenu;

  @ViewChild('inline_menu') nativeInlineMenu: ElementRef;
  @ViewChild('inline_menu_button') nativeInlineMenuButton: ElementRef;
}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="menu">First</button>
    </div>

    <div [cdkContextMenuTriggerFor]="menu"></div>

    <ng-template #menu>
      <div cdkMenu>
        <button cdkMenuItem></button>
      </div>
    </ng-template>
  `,
})
class MenuBarAndContextTriggerShareMenu {
  @ViewChild(CdkMenuTrigger) menuBarTrigger: CdkMenuTrigger;
  @ViewChild(CdkContextMenuTrigger) contextTrigger: CdkContextMenuTrigger;
  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
}
