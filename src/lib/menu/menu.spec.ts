import {async, ComponentFixture, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {OverlayContainer} from '@angular/cdk/overlay';
import {ESCAPE, LEFT_ARROW, RIGHT_ARROW} from '@angular/cdk/keycodes';
import {
  MAT_MENU_DEFAULT_OPTIONS,
  MatMenu,
  MatMenuModule,
  MatMenuPanel,
  MatMenuTrigger,
  MenuPositionX,
  MenuPositionY,
  MatMenuItem,
} from './index';
import {MENU_PANEL_TOP_PADDING} from './menu-trigger';
import {MatRipple} from '@angular/material/core';
import {
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  dispatchEvent,
  createKeyboardEvent,
  createMouseEvent,
  dispatchFakeEvent,
} from '@angular/cdk/testing';


describe('MatMenu', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let dir: Direction;

  beforeEach(async(() => {
    dir = 'ltr';
    TestBed.configureTestingModule({
      imports: [MatMenuModule, NoopAnimationsModule],
      declarations: [
        SimpleMenu,
        PositionedMenu,
        OverlapMenu,
        CustomMenuPanel,
        CustomMenu,
        NestedMenu,
        NestedMenuCustomElevation,
        NestedMenuRepeater,
        FakeIcon
      ],
      providers: [
        {provide: Directionality, useFactory: () => ({value: dir})}
      ]
    });

    TestBed.compileComponents();

    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    })();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should open the menu as an idempotent operation', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.componentInstance.trigger.openMenu();

      expect(overlayContainerElement.textContent).toContain('Item');
      expect(overlayContainerElement.textContent).toContain('Disabled');
    }).not.toThrowError();
  });

  it('should close the menu when a click occurs outside the menu', fakeAsync(() => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const backdrop = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-backdrop');
    backdrop.click();
    fixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.textContent).toBe('');
  }));

  it('should restore focus to the trigger when the menu was opened by keyboard', fakeAsync(() => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();

    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    // A click without a mousedown before it is considered a keyboard open.
    triggerEl.click();
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('.mat-menu-panel')).toBeTruthy();

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);

    expect(document.activeElement).toBe(triggerEl);
  }));

  it('should restore focus to the root trigger when the menu was opened by mouse', fakeAsync(() => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();

    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
    dispatchFakeEvent(triggerEl, 'mousedown');
    triggerEl.click();
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('.mat-menu-panel')).toBeTruthy();

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);

    expect(document.activeElement).toBe(triggerEl);
  }));

  it('should close the menu when pressing ESCAPE', fakeAsync(() => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;
    const event = createKeyboardEvent('keydown', ESCAPE);
    const stopPropagationSpy = spyOn(event, 'stopPropagation').and.callThrough();

    dispatchEvent(panel, event);
    fixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.textContent).toBe('');
    expect(stopPropagationSpy).toHaveBeenCalled();
  }));

  it('should open a custom menu', () => {
    const fixture = TestBed.createComponent(CustomMenu);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.componentInstance.trigger.openMenu();

      expect(overlayContainerElement.textContent).toContain('Custom Menu header');
      expect(overlayContainerElement.textContent).toContain('Custom Content');
    }).not.toThrowError();
  });

  it('should set the panel direction based on the trigger direction', () => {
    dir = 'rtl';
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
    expect(overlayPane.getAttribute('dir')).toEqual('rtl');
  });

  it('should transfer any custom classes from the host to the overlay', () => {
    const fixture = TestBed.createComponent(SimpleMenu);

    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const menuEl = fixture.debugElement.query(By.css('mat-menu')).nativeElement;
    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;

    expect(menuEl.classList).not.toContain('custom-one');
    expect(menuEl.classList).not.toContain('custom-two');

    expect(panel.classList).toContain('custom-one');
    expect(panel.classList).toContain('custom-two');
  });

  it('should set the "menu" role on the overlay panel', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();

    const menuPanel = overlayContainerElement.querySelector('.mat-menu-panel');

    expect(menuPanel).toBeTruthy('Expected to find a menu panel.');

    const role = menuPanel ? menuPanel.getAttribute('role') : '';
    expect(role).toBe('menu', 'Expected panel to have the "menu" role.');
  });

  it('should not throw an error on destroy', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    expect(fixture.destroy.bind(fixture)).not.toThrow();
  });

  it('should be able to extract the menu item text', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    expect(fixture.componentInstance.items.first.getLabel()).toBe('Item');
  });

  it('should filter out non-text nodes when figuring out the label', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    expect(fixture.componentInstance.items.last.getLabel()).toBe('Item with an icon');
  });

  it('should focus the menu panel root node when it was opened by mouse', () => {
    const fixture = TestBed.createComponent(SimpleMenu);

    fixture.detectChanges();

    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    dispatchFakeEvent(triggerEl, 'mousedown');
    triggerEl.click();
    fixture.detectChanges();

    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;

    expect(panel).toBeTruthy('Expected the panel to be rendered.');
    expect(document.activeElement).toBe(panel, 'Expected the panel to be focused.');
  });

  describe('positions', () => {
    let fixture: ComponentFixture<PositionedMenu>;
    let panel: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(PositionedMenu);
      fixture.detectChanges();

      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the bottom edge of viewport,so it has space to open "above"
      trigger.style.position = 'fixed';
      trigger.style.top = '600px';

      // Push trigger to the right, so it has space to open "before"
      trigger.style.left = '100px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      panel = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;
    });

    it('should append mat-menu-before if the x position is changed', () => {
      expect(panel.classList).toContain('mat-menu-before');
      expect(panel.classList).not.toContain('mat-menu-after');

      fixture.componentInstance.xPosition = 'after';
      fixture.detectChanges();

      expect(panel.classList).toContain('mat-menu-after');
      expect(panel.classList).not.toContain('mat-menu-before');
    });

    it('should append mat-menu-above if the y position is changed', () => {
      expect(panel.classList).toContain('mat-menu-above');
      expect(panel.classList).not.toContain('mat-menu-below');

      fixture.componentInstance.yPosition = 'below';
      fixture.detectChanges();

      expect(panel.classList).toContain('mat-menu-below');
      expect(panel.classList).not.toContain('mat-menu-above');
    });

    it('should default to the "below" and "after" positions', () => {
      fixture.destroy();

      let newFixture = TestBed.createComponent(SimpleMenu);

      newFixture.detectChanges();
      newFixture.componentInstance.trigger.openMenu();
      newFixture.detectChanges();
      panel = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;

      expect(panel.classList).toContain('mat-menu-below');
      expect(panel.classList).toContain('mat-menu-after');
    });

  });

  describe('fallback positions', () => {

    it('should fall back to "before" mode if "after" mode would not fit on screen', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the right side of viewport, so it doesn't have space to open
      // in its default "after" position on the right side.
      trigger.style.position = 'fixed';
      trigger.style.right = '-50px';
      trigger.style.top = '200px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // In "before" position, the right sides of the overlay and the origin are aligned.
      // To find the overlay left, subtract the menu width from the origin's right side.
      const expectedLeft = triggerRect.right - overlayRect.width;
      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(expectedLeft),
              `Expected menu to open in "before" position if "after" position wouldn't fit.`);

      // The y-position of the overlay should be unaffected, as it can already fit vertically
      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(triggerRect.top),
              `Expected menu top position to be unchanged if it can fit in the viewport.`);
    });

    it('should fall back to "above" mode if "below" mode would not fit on screen', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the bottom part of viewport, so it doesn't have space to open
      // in its default "below" position below the trigger.
      trigger.style.position = 'fixed';
      trigger.style.bottom = '65px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // In "above" position, the bottom edges of the overlay and the origin are aligned.
      // To find the overlay top, subtract the menu height from the origin's bottom edge.
      const expectedTop = triggerRect.bottom - overlayRect.height;
      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(expectedTop),
              `Expected menu to open in "above" position if "below" position wouldn't fit.`);

      // The x-position of the overlay should be unaffected, as it can already fit horizontally
      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(triggerRect.left),
              `Expected menu x position to be unchanged if it can fit in the viewport.`);
    });

    it('should re-position menu on both axes if both defaults would not fit', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // push trigger to the bottom, right part of viewport, so it doesn't have space to open
      // in its default "after below" position.
      trigger.style.position = 'fixed';
      trigger.style.right = '-50px';
      trigger.style.bottom = '65px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      const expectedLeft = triggerRect.right - overlayRect.width;
      const expectedTop = triggerRect.bottom - overlayRect.height;

      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(expectedLeft),
              `Expected menu to open in "before" position if "after" position wouldn't fit.`);

      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(expectedTop),
              `Expected menu to open in "above" position if "below" position wouldn't fit.`);
    });

    it('should re-position a menu with custom position set', () => {
      const fixture = TestBed.createComponent(PositionedMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // As designated "before" position won't fit on screen, the menu should fall back
      // to "after" mode, where the left sides of the overlay and trigger are aligned.
      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(triggerRect.left),
              `Expected menu to open in "after" position if "before" position wouldn't fit.`);

      // As designated "above" position won't fit on screen, the menu should fall back
      // to "below" mode, where the top edges of the overlay and trigger are aligned.
      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(triggerRect.top),
              `Expected menu to open in "below" position if "above" position wouldn't fit.`);
    });

    function getOverlayPane(): HTMLElement {
      return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    }
  });

  describe('overlapping trigger', () => {
    /**
     * This test class is used to create components containing a menu.
     * It provides helpers to reposition the trigger, open the menu,
     * and access the trigger and overlay positions.
     * Additionally it can take any inputs for the menu wrapper component.
     *
     * Basic usage:
     * const subject = new OverlapSubject(MyComponent);
     * subject.openMenu();
     */
    class OverlapSubject<T extends TestableMenu> {
      readonly fixture: ComponentFixture<T>;
      readonly trigger: HTMLElement;

      constructor(ctor: {new(): T; }, inputs: {[key: string]: any} = {}) {
        this.fixture = TestBed.createComponent(ctor);
        Object.keys(inputs).forEach(key => this.fixture.componentInstance[key] = inputs[key]);
        this.fixture.detectChanges();
        this.trigger = this.fixture.componentInstance.triggerEl.nativeElement;
      }

      openMenu() {
        this.fixture.componentInstance.trigger.openMenu();
        this.fixture.detectChanges();
      }

      get overlayRect() {
        return this.overlayPane.getBoundingClientRect();
      }

      get triggerRect() {
        return this.trigger.getBoundingClientRect();
      }

      get menuPanel() {
        return overlayContainerElement.querySelector('.mat-menu-panel');
      }

      private get overlayPane() {
        return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      }
    }

    let subject: OverlapSubject<OverlapMenu>;
    describe('explicitly overlapping', () => {
      beforeEach(() => {
        subject = new OverlapSubject(OverlapMenu, {overlapTrigger: true});
      });

      it('positions the overlay below the trigger', () => {
        subject.openMenu();

        // Since the menu is overlaying the trigger, the overlay top should be the trigger top.
        expect(Math.floor(subject.overlayRect.top))
            .toBe(Math.floor(subject.triggerRect.top),
                `Expected menu to open in default "below" position.`);
      });
    });

    describe('not overlapping', () => {
      beforeEach(() => {
        subject = new OverlapSubject(OverlapMenu, {overlapTrigger: false});
      });

      it('positions the overlay below the trigger', () => {
        subject.openMenu();

        // Since the menu is below the trigger, the overlay top should be the trigger bottom.
        expect(Math.floor(subject.overlayRect.top))
            .toBe(Math.floor(subject.triggerRect.bottom),
                `Expected menu to open directly below the trigger.`);
      });

      it('supports above position fall back', () => {
        // Push trigger to the bottom part of viewport, so it doesn't have space to open
        // in its default "below" position below the trigger.
        subject.trigger.style.position = 'fixed';
        subject.trigger.style.bottom = '0';
        subject.openMenu();

        // Since the menu is above the trigger, the overlay bottom should be the trigger top.
        expect(Math.floor(subject.overlayRect.bottom))
            .toBe(Math.floor(subject.triggerRect.top),
                `Expected menu to open in "above" position if "below" position wouldn't fit.`);
      });

      it('repositions the origin to be below, so the menu opens from the trigger', () => {
        subject.openMenu();
        subject.fixture.detectChanges();

        expect(subject.menuPanel!.classList).toContain('mat-menu-below');
        expect(subject.menuPanel!.classList).not.toContain('mat-menu-above');
      });
    });
  });

  describe('animations', () => {
    it('should enable ripples on items by default', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();

      const item = fixture.debugElement.query(By.css('.mat-menu-item'));
      const ripple = item.query(By.css('.mat-ripple')).injector.get<MatRipple>(MatRipple);

      expect(ripple.disabled).toBe(false);
    });

    it('should disable ripples on disabled items', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();

      // The second menu item in the `SimpleMenu` component is disabled.
      const items = fixture.debugElement.queryAll(By.css('.mat-menu-item'));
      const ripple = items[1].query(By.css('.mat-ripple')).injector.get<MatRipple>(MatRipple);

      expect(ripple.disabled).toBe(true);
    });

    it('should disable ripples if disableRipple is set', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();

      // The third menu item in the `SimpleMenu` component has ripples disabled.
      const items = fixture.debugElement.queryAll(By.css('.mat-menu-item'));
      const ripple = items[2].query(By.css('.mat-ripple')).injector.get<MatRipple>(MatRipple);

      expect(ripple.disabled).toBe(true);
    });
  });

  describe('close event', () => {
    let fixture: ComponentFixture<SimpleMenu>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      fixture.componentInstance.trigger.openMenu();
    });

    it('should emit an event when a menu item is clicked', () => {
      const menuItem = overlayContainerElement.querySelector('[mat-menu-item]') as HTMLElement;

      menuItem.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith('click');
      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
    });

    it('should emit a close event when the backdrop is clicked', () => {
      const backdrop = overlayContainerElement
          .querySelector('.cdk-overlay-backdrop') as HTMLElement;

      backdrop.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith(undefined);
      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
    });

    it('should emit an event when pressing ESCAPE', () => {
      const menu = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;

      dispatchKeyboardEvent(menu, 'keydown', ESCAPE);
      fixture.detectChanges();

      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith('keydown');
      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
    });

    it('should complete the callback when the menu is destroyed', () => {
      const emitCallback = jasmine.createSpy('emit callback');
      const completeCallback = jasmine.createSpy('complete callback');

      fixture.componentInstance.menu.closed.subscribe(emitCallback, null, completeCallback);
      fixture.destroy();

      expect(emitCallback).toHaveBeenCalledWith(undefined);
      expect(emitCallback).toHaveBeenCalledTimes(1);
      expect(completeCallback).toHaveBeenCalled();
    });
  });

  describe('nested menu', () => {
    let fixture: ComponentFixture<NestedMenu>;
    let instance: NestedMenu;
    let overlay: HTMLElement;
    let compileTestComponent = () => {
      fixture = TestBed.createComponent(NestedMenu);
      fixture.detectChanges();
      instance = fixture.componentInstance;
      overlay = overlayContainerElement;
    };

    it('should set the `triggersSubmenu` flags on the triggers', () => {
      compileTestComponent();
      expect(instance.rootTrigger.triggersSubmenu()).toBe(false);
      expect(instance.levelOneTrigger.triggersSubmenu()).toBe(true);
      expect(instance.levelTwoTrigger.triggersSubmenu()).toBe(true);
    });

    it('should set the `parentMenu` on the sub-menu instances', () => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      expect(instance.rootMenu.parentMenu).toBeFalsy();
      expect(instance.levelOneMenu.parentMenu).toBe(instance.rootMenu);
      expect(instance.levelTwoMenu.parentMenu).toBe(instance.levelOneMenu);
    });

    it('should pass the layout direction the nested menus', () => {
      dir = 'rtl';
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      expect(instance.rootMenu.direction).toBe('rtl');
      expect(instance.levelOneMenu.direction).toBe('rtl');
      expect(instance.levelTwoMenu.direction).toBe('rtl');
    });

    it('should emit an event when the hover state of the menu items changes', () => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      const spy = jasmine.createSpy('hover spy');
      const subscription = instance.rootMenu._hovered().subscribe(spy);
      const menuItems = overlay.querySelectorAll('[mat-menu-item]');

      dispatchMouseEvent(menuItems[0], 'mouseenter');
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(1);

      dispatchMouseEvent(menuItems[1], 'mouseenter');
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    });

    it('should toggle a nested menu when its trigger is hovered', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1, 'Expected one open menu');

      const items = Array.from(overlay.querySelectorAll('.mat-menu-panel [mat-menu-item]'));
      const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

      dispatchMouseEvent(levelOneTrigger, 'mouseenter');
      fixture.detectChanges();
      expect(levelOneTrigger.classList)
          .toContain('mat-menu-item-highlighted', 'Expected the trigger to be highlighted');
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(2, 'Expected two open menus');

      dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1, 'Expected one open menu');
      expect(levelOneTrigger.classList)
          .not.toContain('mat-menu-item-highlighted', 'Expected the trigger to not be highlighted');
    }));

    it('should close all the open sub-menus when the hover state is changed at the root',
      fakeAsync(() => {
        compileTestComponent();
        instance.rootTriggerEl.nativeElement.click();
        fixture.detectChanges();

        const items = Array.from(overlay.querySelectorAll('.mat-menu-panel [mat-menu-item]'));
        const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

        dispatchMouseEvent(levelOneTrigger, 'mouseenter');
        fixture.detectChanges();

        const levelTwoTrigger = overlay.querySelector('#level-two-trigger')! as HTMLElement;
        dispatchMouseEvent(levelTwoTrigger, 'mouseenter');
        fixture.detectChanges();

        expect(overlay.querySelectorAll('.mat-menu-panel').length)
            .toBe(3, 'Expected three open menus');

        dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
        fixture.detectChanges();
        tick(500);

        expect(overlay.querySelectorAll('.mat-menu-panel').length)
            .toBe(1, 'Expected one open menu');
      }));

    it('should open a nested menu when its trigger is clicked', () => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1, 'Expected one open menu');

      const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

      levelOneTrigger.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(2, 'Expected two open menus');

      levelOneTrigger.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
          .toBe(2, 'Expected repeat clicks not to close the menu.');
    });

    it('should open and close a nested menu with arrow keys in ltr', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1, 'Expected one open menu');

      const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

      dispatchKeyboardEvent(levelOneTrigger, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      const panels = overlay.querySelectorAll('.mat-menu-panel');

      expect(panels.length).toBe(2, 'Expected two open menus');
      dispatchKeyboardEvent(panels[1], 'keydown', LEFT_ARROW);
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1);
    }));

    it('should open and close a nested menu with the arrow keys in rtl', fakeAsync(() => {
      dir = 'rtl';
      fixture.destroy();
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1, 'Expected one open menu');

      const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

      dispatchKeyboardEvent(levelOneTrigger, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      const panels = overlay.querySelectorAll('.mat-menu-panel');

      expect(panels.length).toBe(2, 'Expected two open menus');
      dispatchKeyboardEvent(panels[1], 'keydown', RIGHT_ARROW);
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1);
    }));

    it('should not do anything with the arrow keys for a top-level menu', () => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      const menu = overlay.querySelector('.mat-menu-panel')!;

      dispatchKeyboardEvent(menu, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
          .toBe(1, 'Expected one menu to remain open');

      dispatchKeyboardEvent(menu, 'keydown', LEFT_ARROW);
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
          .toBe(1, 'Expected one menu to remain open');
    });

    it('should close all of the menus when the backdrop is clicked', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
          .toBe(3, 'Expected three open menus');
      expect(overlay.querySelectorAll('.cdk-overlay-backdrop').length)
          .toBe(1, 'Expected one backdrop element');
      expect(overlay.querySelectorAll('.mat-menu-panel, .cdk-overlay-backdrop')[0].classList)
          .toContain('cdk-overlay-backdrop', 'Expected backdrop to be beneath all of the menus');

      (overlay.querySelector('.cdk-overlay-backdrop')! as HTMLElement).click();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(0, 'Expected no open menus');
    }));

    it('should shift focus between the sub-menus', () => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      expect(overlay.querySelector('.mat-menu-panel')!.contains(document.activeElement))
          .toBe(true, 'Expected focus to be inside the root menu');

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      expect(overlay.querySelectorAll('.mat-menu-panel')[1].contains(document.activeElement))
          .toBe(true, 'Expected focus to be inside the first nested menu');

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      expect(overlay.querySelectorAll('.mat-menu-panel')[2].contains(document.activeElement))
          .toBe(true, 'Expected focus to be inside the second nested menu');

      instance.levelTwoTrigger.closeMenu();
      fixture.detectChanges();

      expect(overlay.querySelectorAll('.mat-menu-panel')[1].contains(document.activeElement))
          .toBe(true, 'Expected focus to be back inside the first nested menu');

      instance.levelOneTrigger.closeMenu();
      fixture.detectChanges();

      expect(overlay.querySelector('.mat-menu-panel')!.contains(document.activeElement))
          .toBe(true, 'Expected focus to be back inside the root menu');
    });

    it('should position the sub-menu to the right edge of the trigger in ltr', () => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.style.position = 'fixed';
      instance.rootTriggerEl.nativeElement.style.left = '50px';
      instance.rootTriggerEl.nativeElement.style.top = '50px';
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
      const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

      expect(Math.round(triggerRect.right)).toBe(Math.round(panelRect.left));
      expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + MENU_PANEL_TOP_PADDING);
    });

    it('should fall back to aligning to the left edge of the trigger in ltr', () => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.style.position = 'fixed';
      instance.rootTriggerEl.nativeElement.style.right = '10px';
      instance.rootTriggerEl.nativeElement.style.top = '50%';
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
      const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

      expect(Math.round(triggerRect.left)).toBe(Math.round(panelRect.right));
      expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + MENU_PANEL_TOP_PADDING);
    });

    it('should position the sub-menu to the left edge of the trigger in rtl', () => {
      dir = 'rtl';
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.style.position = 'fixed';
      instance.rootTriggerEl.nativeElement.style.left = '50%';
      instance.rootTriggerEl.nativeElement.style.top = '50%';
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
      const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

      expect(Math.round(triggerRect.left)).toBe(Math.round(panelRect.right));
      expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + MENU_PANEL_TOP_PADDING);
    });

    it('should fall back to aligning to the right edge of the trigger in rtl', fakeAsync(() => {
      dir = 'rtl';
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.style.position = 'fixed';
      instance.rootTriggerEl.nativeElement.style.left = '10px';
      instance.rootTriggerEl.nativeElement.style.top = '50%';
      instance.rootTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
      const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

      expect(Math.round(triggerRect.right)).toBe(Math.round(panelRect.left));
      expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + MENU_PANEL_TOP_PADDING);
    }));

    it('should close all of the menus when an item is clicked', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      const menus = overlay.querySelectorAll('.mat-menu-panel');

      expect(menus.length).toBe(3, 'Expected three open menus');

      (menus[2].querySelector('.mat-menu-item')! as HTMLElement).click();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(0, 'Expected no open menus');
    }));

    it('should set a class on the menu items that trigger a sub-menu', () => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      const menuItems = overlay.querySelectorAll('[mat-menu-item]');

      expect(menuItems[0].classList).toContain('mat-menu-item-submenu-trigger');
      expect(menuItems[1].classList).not.toContain('mat-menu-item-submenu-trigger');
    });

    it('should increase the sub-menu elevation based on its depth', () => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      const menus = overlay.querySelectorAll('.mat-menu-panel');

      expect(menus[0].classList)
          .toContain('mat-elevation-z2', 'Expected root menu to have base elevation.');
      expect(menus[1].classList)
          .toContain('mat-elevation-z3', 'Expected first sub-menu to have base elevation + 1.');
      expect(menus[2].classList)
          .toContain('mat-elevation-z4', 'Expected second sub-menu to have base elevation + 2.');
    });

    it('should update the elevation when the same menu is opened at a different depth',
      fakeAsync(() => {
        compileTestComponent();
        instance.rootTrigger.openMenu();
        fixture.detectChanges();

        instance.levelOneTrigger.openMenu();
        fixture.detectChanges();

        instance.levelTwoTrigger.openMenu();
        fixture.detectChanges();

        let lastMenu = overlay.querySelectorAll('.mat-menu-panel')[2];

        expect(lastMenu.classList)
            .toContain('mat-elevation-z4', 'Expected menu to have the base elevation plus two.');

        (overlay.querySelector('.cdk-overlay-backdrop')! as HTMLElement).click();
        fixture.detectChanges();
        tick(500);

        expect(overlay.querySelectorAll('.mat-menu-panel').length)
            .toBe(0, 'Expected no open menus');

        instance.alternateTrigger.openMenu();
        fixture.detectChanges();

        lastMenu = overlay.querySelector('.mat-menu-panel') as HTMLElement;

        expect(lastMenu.classList)
            .not.toContain('mat-elevation-z4', 'Expected menu not to maintain old elevation.');
        expect(lastMenu.classList)
            .toContain('mat-elevation-z2', 'Expected menu to have the proper updated elevation.');
      }));

    it('should not increase the elevation if the user specified a custom one', () => {
      const elevationFixture = TestBed.createComponent(NestedMenuCustomElevation);

      elevationFixture.detectChanges();
      elevationFixture.componentInstance.rootTrigger.openMenu();
      elevationFixture.detectChanges();

      elevationFixture.componentInstance.levelOneTrigger.openMenu();
      elevationFixture.detectChanges();

      const menuClasses = overlayContainerElement.querySelectorAll('.mat-menu-panel')[1].classList;

      expect(menuClasses)
          .toContain('mat-elevation-z24', 'Expected user elevation to be maintained');
      expect(menuClasses)
          .not.toContain('mat-elevation-z3', 'Expected no stacked elevation.');
    });

    it('should close all of the menus when the root is closed programmatically', fakeAsync(() => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      const menus = overlay.querySelectorAll('.mat-menu-panel');

      expect(menus.length).toBe(3, 'Expected three open menus');

      instance.rootTrigger.closeMenu();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(0, 'Expected no open menus');
    }));

    it('should toggle a nested menu when its trigger is added after init', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1, 'Expected one open menu');

      instance.showLazy = true;
      fixture.detectChanges();

      const lazyTrigger = overlay.querySelector('#lazy-trigger')!;

      dispatchMouseEvent(lazyTrigger, 'mouseenter');
      fixture.detectChanges();
      expect(lazyTrigger.classList)
          .toContain('mat-menu-item-highlighted', 'Expected the trigger to be highlighted');
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(2, 'Expected two open menus');
    }));

    it('should prevent the default mousedown action if the menu item opens a sub-menu', () => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      const event = createMouseEvent('mousedown');

      Object.defineProperty(event, 'buttons', {get: () => 1});
      event.preventDefault = jasmine.createSpy('preventDefault spy');

      dispatchMouseEvent(overlay.querySelector('[mat-menu-item]')!, 'mousedown', 0, 0, event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle the items being rendered in a repeater', fakeAsync(() => {
      const repeaterFixture = TestBed.createComponent(NestedMenuRepeater);
      overlay = overlayContainerElement;

      expect(() => repeaterFixture.detectChanges()).not.toThrow();

      repeaterFixture.componentInstance.rootTriggerEl.nativeElement.click();
      repeaterFixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1, 'Expected one open menu');

      dispatchMouseEvent(overlay.querySelector('.level-one-trigger')!, 'mouseenter');
      repeaterFixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(2, 'Expected two open menus');
    }));

    it('should not re-focus a child menu trigger when hovering another trigger', fakeAsync(() => {
      compileTestComponent();

      dispatchFakeEvent(instance.rootTriggerEl.nativeElement, 'mousedown');
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      const items = Array.from(overlay.querySelectorAll('.mat-menu-panel [mat-menu-item]'));
      const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

      dispatchMouseEvent(levelOneTrigger, 'mouseenter');
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(2, 'Expected two open menus');

      dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
      fixture.detectChanges();
      tick(500);

      expect(document.activeElement)
          .not.toBe(levelOneTrigger, 'Expected focus not to be returned to the initial trigger.');
    }));

  });

});

describe('MatMenu default overrides', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, NoopAnimationsModule],
      declarations: [SimpleMenu, FakeIcon],
      providers: [{
        provide: MAT_MENU_DEFAULT_OPTIONS,
        useValue: {overlapTrigger: false, xPosition: 'before', yPosition: 'above'},
      }],
    }).compileComponents();
  }));

  it('should allow for the default menu options to be overridden', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    const menu = fixture.componentInstance.menu;

    expect(menu.overlapTrigger).toBe(false);
    expect(menu.xPosition).toBe('before');
    expect(menu.yPosition).toBe('above');
  });
});

@Component({
  template: `
    <button [matMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <mat-menu class="custom-one custom-two" #menu="matMenu" (closed)="closeCallback($event)">
      <button mat-menu-item> Item </button>
      <button mat-menu-item disabled> Disabled </button>
      <button mat-menu-item disableRipple>
        <fake-icon>unicorn</fake-icon>
        Item with an icon
      </button>
    </mat-menu>
  `
})
class SimpleMenu {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
  @ViewChild(MatMenu) menu: MatMenu;
  @ViewChildren(MatMenuItem) items: QueryList<MatMenuItem>;
  closeCallback = jasmine.createSpy('menu closed callback');
}

@Component({
  template: `
    <button [matMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <mat-menu [xPosition]="xPosition" [yPosition]="yPosition" #menu="matMenu">
      <button mat-menu-item> Positioned Content </button>
    </mat-menu>
  `
})
class PositionedMenu {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
  xPosition: MenuPositionX = 'before';
  yPosition: MenuPositionY = 'above';
}

interface TestableMenu {
  trigger: MatMenuTrigger;
  triggerEl: ElementRef;
}
@Component({
  template: `
    <button [matMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <mat-menu [overlapTrigger]="overlapTrigger" #menu="matMenu">
      <button mat-menu-item> Not overlapped Content </button>
    </mat-menu>
  `
})
class OverlapMenu implements TestableMenu {
  @Input() overlapTrigger: boolean;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
}

@Component({
  selector: 'custom-menu',
  template: `
    <ng-template>
      Custom Menu header
      <ng-content></ng-content>
    </ng-template>
  `,
  exportAs: 'matCustomMenu'
})
class CustomMenuPanel implements MatMenuPanel {
  direction: Direction;
  xPosition: MenuPositionX = 'after';
  yPosition: MenuPositionY = 'below';
  overlapTrigger = true;
  parentMenu: MatMenuPanel;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  @Output() close = new EventEmitter<void | 'click' | 'keydown'>();
  focusFirstItem = () => {};
  resetActiveItem = () => {};
  setPositionClasses = () => {};
}

@Component({
  template: `
    <button [matMenuTriggerFor]="menu">Toggle menu</button>
    <custom-menu #menu="matCustomMenu">
      <button mat-menu-item> Custom Content </button>
    </custom-menu>
  `
})
class CustomMenu {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
}


@Component({
  template: `
    <button
      [matMenuTriggerFor]="root"
      #rootTrigger="matMenuTrigger"
      #rootTriggerEl>Toggle menu</button>

    <button
      [matMenuTriggerFor]="levelTwo"
      #alternateTrigger="matMenuTrigger">Toggle alternate menu</button>

    <mat-menu #root="matMenu" (close)="rootCloseCallback($event)">
      <button mat-menu-item
        id="level-one-trigger"
        [matMenuTriggerFor]="levelOne"
        #levelOneTrigger="matMenuTrigger">One</button>
      <button mat-menu-item>Two</button>
      <button mat-menu-item
        *ngIf="showLazy"
        id="lazy-trigger"
        [matMenuTriggerFor]="lazy"
        #lazyTrigger="matMenuTrigger">Three</button>
    </mat-menu>

    <mat-menu #levelOne="matMenu" (close)="levelOneCloseCallback($event)">
      <button mat-menu-item>Four</button>
      <button mat-menu-item
        id="level-two-trigger"
        [matMenuTriggerFor]="levelTwo"
        #levelTwoTrigger="matMenuTrigger">Five</button>
      <button mat-menu-item>Six</button>
    </mat-menu>

    <mat-menu #levelTwo="matMenu" (close)="levelTwoCloseCallback($event)">
      <button mat-menu-item>Seven</button>
      <button mat-menu-item>Eight</button>
      <button mat-menu-item>Nine</button>
    </mat-menu>

    <mat-menu #lazy="matMenu">
      <button mat-menu-item>Ten</button>
      <button mat-menu-item>Eleven</button>
      <button mat-menu-item>Twelve</button>
    </mat-menu>
  `
})
class NestedMenu {
  @ViewChild('root') rootMenu: MatMenu;
  @ViewChild('rootTrigger') rootTrigger: MatMenuTrigger;
  @ViewChild('rootTriggerEl') rootTriggerEl: ElementRef;
  @ViewChild('alternateTrigger') alternateTrigger: MatMenuTrigger;
  readonly rootCloseCallback = jasmine.createSpy('root menu closed callback');

  @ViewChild('levelOne') levelOneMenu: MatMenu;
  @ViewChild('levelOneTrigger') levelOneTrigger: MatMenuTrigger;
  readonly levelOneCloseCallback = jasmine.createSpy('level one menu closed callback');

  @ViewChild('levelTwo') levelTwoMenu: MatMenu;
  @ViewChild('levelTwoTrigger') levelTwoTrigger: MatMenuTrigger;
  readonly levelTwoCloseCallback = jasmine.createSpy('level one menu closed callback');

  @ViewChild('lazy') lazyMenu: MatMenu;
  @ViewChild('lazyTrigger') lazyTrigger: MatMenuTrigger;
  showLazy = false;
}

@Component({
  template: `
    <button [matMenuTriggerFor]="root" #rootTrigger="matMenuTrigger">Toggle menu</button>

    <mat-menu #root="matMenu">
      <button mat-menu-item
        [matMenuTriggerFor]="levelOne"
        #levelOneTrigger="matMenuTrigger">One</button>
    </mat-menu>

    <mat-menu #levelOne="matMenu" class="mat-elevation-z24">
      <button mat-menu-item>Two</button>
    </mat-menu>
  `
})
class NestedMenuCustomElevation {
  @ViewChild('rootTrigger') rootTrigger: MatMenuTrigger;
  @ViewChild('levelOneTrigger') levelOneTrigger: MatMenuTrigger;
}


@Component({
  template: `
    <button [matMenuTriggerFor]="root" #rootTriggerEl>Toggle menu</button>
    <mat-menu #root="matMenu">
      <button
        mat-menu-item
        class="level-one-trigger"
        *ngFor="let item of items"
        [matMenuTriggerFor]="levelOne">{{item}}</button>
    </mat-menu>

    <mat-menu #levelOne="matMenu">
      <button mat-menu-item>Four</button>
      <button mat-menu-item>Five</button>
    </mat-menu>
  `
})
class NestedMenuRepeater {
  @ViewChild('rootTriggerEl') rootTriggerEl: ElementRef;
  @ViewChild('levelOneTrigger') levelOneTrigger: MatMenuTrigger;

  items = ['one', 'two', 'three'];
}

@Component({
  selector: 'fake-icon',
  template: '<ng-content></ng-content>'
})
class FakeIcon { }
