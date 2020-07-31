import {Component, ViewChild, ElementRef} from '@angular/core';
import {CdkMenuModule} from './menu-module';
import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {CdkMenu} from './menu';
import {CdkContextMenuTrigger} from './context-menu';
import {dispatchMouseEvent} from '@angular/cdk/testing/private';
import {By} from '@angular/platform-browser';
import {CdkMenuItem} from './menu-item';
import {CdkMenuItemTrigger} from './menu-item-trigger';

describe('CdkContextMenuTrigger', () => {
  describe('with simple context menu trigger', () => {
    let fixture: ComponentFixture<SimpleContextMenu>;

    beforeEach(async(() => {
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
      return fixture.componentInstance.trigger.nativeElement;
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

    it('should close out the context menu when clicking a menu item', () => {
      openContextMenu();

      fixture.debugElement.query(By.directive(CdkMenuItem)).injector.get(CdkMenuItem).trigger();
      fixture.detectChanges();

      expect(getContextMenu()).not.toBeDefined();
    });

    it('should re-open the same menu when right clicking twice in the context', () => {
      openContextMenu();
      openContextMenu();

      const menus = fixture.debugElement.queryAll(By.directive(CdkMenu));
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
  });

  describe('nested context menu triggers', () => {
    let fixture: ComponentFixture<NestedContextMenu>;

    beforeEach(async(() => {
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
      }
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

    beforeEach(async(() => {
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
});

@Component({
  template: `
    <div [cdkContextMenuTriggerFor]="context"></div>
    <div id="other"></div>

    <ng-template cdkMenuPanel #context="cdkMenuPanel">
      <div cdkMenu [cdkMenuPanel]="context">
        <button cdkMenuItem></button>
      </div>
    </ng-template>
  `,
})
class SimpleContextMenu {
  @ViewChild(CdkContextMenuTrigger, {read: ElementRef}) trigger: ElementRef<HTMLElement>;
  @ViewChild(CdkMenu) menu?: CdkMenu;
  @ViewChild(CdkMenu, {read: ElementRef}) nativeMenu?: ElementRef<HTMLElement>;
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

    <ng-template cdkMenuPanel #cut="cdkMenuPanel">
      <div #cut_menu cdkMenu [cdkMenuPanel]="cut"></div>
    </ng-template>

    <ng-template cdkMenuPanel #copy="cdkMenuPanel">
      <div #copy_menu cdkMenu [cdkMenuPanel]="copy"></div>
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

    <ng-template cdkMenuPanel #cut="cdkMenuPanel">
      <div #cut_menu cdkMenu [cdkMenuPanel]="cut">
        <button cdkMenuItem [cdkMenuTriggerFor]="copy"></button>
      </div>
    </ng-template>

    <ng-template cdkMenuPanel #copy="cdkMenuPanel">
      <div #copy_menu cdkMenu [cdkMenuPanel]="copy"></div>
    </ng-template>
  `,
})
class ContextMenuWithSubmenu {
  @ViewChild(CdkContextMenuTrigger, {read: ElementRef}) context: ElementRef<HTMLElement>;
  @ViewChild(CdkMenuItemTrigger, {read: ElementRef}) triggerNativeElement: ElementRef<HTMLElement>;

  @ViewChild('cut_menu', {read: CdkMenu}) cutMenu: CdkMenu;
  @ViewChild('copy_menu', {read: CdkMenu}) copyMenu: CdkMenu;
}
