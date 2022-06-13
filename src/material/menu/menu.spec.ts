import {FocusMonitor} from '@angular/cdk/a11y';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {
  DOWN_ARROW,
  END,
  ENTER,
  ESCAPE,
  HOME,
  LEFT_ARROW,
  RIGHT_ARROW,
  TAB,
} from '@angular/cdk/keycodes';
import {Overlay, OverlayContainer} from '@angular/cdk/overlay';
import {ScrollDispatcher, ViewportRuler} from '@angular/cdk/scrolling';
import {
  createKeyboardEvent,
  createMouseEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  MockNgZone,
  patchElementFocus,
} from '../../cdk/testing/private';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  Provider,
  QueryList,
  TemplateRef,
  Type,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {MatRipple} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';
import {
  MAT_MENU_DEFAULT_OPTIONS,
  MatMenu,
  MatMenuItem,
  MatMenuModule,
  MatMenuPanel,
  MatMenuTrigger,
  MenuPositionX,
  MenuPositionY,
} from './index';
import {MAT_MENU_SCROLL_STRATEGY} from './menu-trigger';

const MENU_PANEL_TOP_PADDING = 8;

describe('MatMenu', () => {
  let overlayContainerElement: HTMLElement;
  let focusMonitor: FocusMonitor;
  let viewportRuler: ViewportRuler;

  function createComponent<T>(
    component: Type<T>,
    providers: Provider[] = [],
    declarations: any[] = [],
  ): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, NoopAnimationsModule],
      declarations: [component, ...declarations],
      providers,
    }).compileComponents();

    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    focusMonitor = TestBed.inject(FocusMonitor);
    viewportRuler = TestBed.inject(ViewportRuler);
    const fixture = TestBed.createComponent<T>(component);
    window.scroll(0, 0);
    return fixture;
  }

  it('should aria-controls the menu panel', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);
    expect(fixture.componentInstance.triggerEl.nativeElement.getAttribute('aria-controls')).toBe(
      fixture.componentInstance.menu.panelId,
    );
  }));

  it('should set aria-haspopup based on whether a menu is assigned', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const triggerElement = fixture.componentInstance.triggerEl.nativeElement;

    expect(triggerElement.getAttribute('aria-haspopup')).toBe('menu');

    fixture.componentInstance.trigger.menu = null;
    fixture.detectChanges();

    expect(triggerElement.hasAttribute('aria-haspopup')).toBe(false);
  }));

  it('should open the menu as an idempotent operation', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      expect(overlayContainerElement.textContent).toContain('Item');
      expect(overlayContainerElement.textContent).toContain('Disabled');
    }).not.toThrowError();
  }));

  it('should close the menu when a click occurs outside the menu', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const backdrop = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-backdrop');
    backdrop.click();
    fixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.textContent).toBe('');
  }));

  it('should be able to remove the backdrop', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();

    fixture.componentInstance.menu.hasBackdrop = false;
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
  }));

  it('should set the correct aria-haspopup value on the trigger element', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const triggerElement = fixture.componentInstance.triggerEl.nativeElement;

    expect(triggerElement.getAttribute('aria-haspopup')).toBe('menu');
  }));

  it('should be able to remove the backdrop on repeat openings', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();

    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    // Start off with a backdrop.
    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);

    // Change `hasBackdrop` after the first open.
    fixture.componentInstance.menu.hasBackdrop = false;
    fixture.detectChanges();

    // Reopen the menu.
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
  }));

  it('should restore focus to the trigger when the menu was opened by keyboard', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
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

  it('should not restore focus to the trigger if focus restoration is disabled', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    fixture.componentInstance.restoreFocus = false;
    fixture.detectChanges();

    // A click without a mousedown before it is considered a keyboard open.
    triggerEl.click();
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('.mat-menu-panel')).toBeTruthy();

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);

    expect(document.activeElement).not.toBe(triggerEl);
  }));

  it('should be able to move focus in the closed event', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    const instance = fixture.componentInstance;
    fixture.detectChanges();
    const triggerEl = instance.triggerEl.nativeElement;
    const button = document.createElement('button');
    button.setAttribute('tabindex', '0');
    document.body.appendChild(button);

    triggerEl.click();
    fixture.detectChanges();

    const subscription = instance.trigger.menuClosed.subscribe(() => button.focus());
    instance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);

    expect(document.activeElement).toBe(button);
    button.remove();
    subscription.unsubscribe();
  }));

  it('should restore focus to the trigger immediately once the menu is closed', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    // A click without a mousedown before it is considered a keyboard open.
    triggerEl.click();
    fixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.querySelector('.mat-menu-panel')).toBeTruthy();

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    // Note: don't add a `tick` here since we're testing
    // that focus is restored before the animation is done.

    expect(document.activeElement).toBe(triggerEl);
    tick(500);
  }));

  it('should move focus to another item if the active item is destroyed', fakeAsync(() => {
    const fixture = createComponent(MenuWithRepeatedItems, [], [FakeIcon]);
    fixture.detectChanges();
    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    triggerEl.click();
    fixture.detectChanges();
    tick(500);

    const items = overlayContainerElement.querySelectorAll('.mat-menu-panel .mat-menu-item');

    expect(document.activeElement).toBe(items[0]);

    fixture.componentInstance.items.shift();
    fixture.detectChanges();
    tick(500);

    expect(document.activeElement).toBe(items[1]);
  }));

  it('should be able to set a custom class on the backdrop', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);

    fixture.componentInstance.backdropClass = 'custom-backdrop';
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const backdrop = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-backdrop');

    expect(backdrop.classList).toContain('custom-backdrop');
  }));

  it('should be able to set a custom class on the overlay panel', fakeAsync(() => {
    const optionsProvider = {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: {overlayPanelClass: 'custom-panel-class'},
    };
    const fixture = createComponent(SimpleMenu, [optionsProvider], [FakeIcon]);

    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const overlayPane = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-pane');

    expect(overlayPane.classList).toContain('custom-panel-class');
  }));

  it('should be able to set a custom classes on the overlay panel', fakeAsync(() => {
    const optionsProvider = {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: {overlayPanelClass: ['custom-panel-class-1', 'custom-panel-class-2']},
    };
    const fixture = createComponent(SimpleMenu, [optionsProvider], [FakeIcon]);

    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const overlayPane = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-pane');

    expect(overlayPane.classList).toContain('custom-panel-class-1');
    expect(overlayPane.classList).toContain('custom-panel-class-2');
  }));

  it('should restore focus to the root trigger when the menu was opened by mouse', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
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

  it('should restore focus to the root trigger when the menu was opened by touch', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();

    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
    dispatchFakeEvent(triggerEl, 'touchstart');
    triggerEl.click();
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('.mat-menu-panel')).toBeTruthy();

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    flush();

    expect(document.activeElement).toBe(triggerEl);
  }));

  it('should scroll the panel to the top on open, when it is scrollable', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();

    // Add 50 items to make the menu scrollable
    fixture.componentInstance.extraItems = new Array(50).fill('Hello there');
    fixture.detectChanges();
    tick(50);

    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
    dispatchFakeEvent(triggerEl, 'mousedown');
    triggerEl.click();
    fixture.detectChanges();

    // Flush due to the additional tick that is necessary for the FocusMonitor.
    flush();

    expect(overlayContainerElement.querySelector('.mat-menu-panel')!.scrollTop).toBe(0);
  }));

  it('should set the proper focus origin when restoring focus after opening by keyboard', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    patchElementFocus(triggerEl);
    focusMonitor.monitor(triggerEl, false);
    triggerEl.click(); // A click without a mousedown before it is considered a keyboard open.
    fixture.detectChanges();
    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();

    expect(triggerEl.classList).toContain('cdk-program-focused');
    focusMonitor.stopMonitoring(triggerEl);
  }));

  it('should set the proper focus origin when restoring focus after opening by mouse', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    dispatchMouseEvent(triggerEl, 'mousedown');
    triggerEl.click();
    fixture.detectChanges();
    patchElementFocus(triggerEl);
    focusMonitor.monitor(triggerEl, false);
    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();

    expect(triggerEl.classList).toContain('cdk-mouse-focused');
    focusMonitor.stopMonitoring(triggerEl);
  }));

  it('should set proper focus origin when right clicking on trigger, before opening by keyboard', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    patchElementFocus(triggerEl);
    focusMonitor.monitor(triggerEl, false);

    // Trigger a fake right click.
    dispatchEvent(triggerEl, createMouseEvent('mousedown', 50, 100, undefined, undefined, 2));

    // A click without a left button mousedown before it is considered a keyboard open.
    triggerEl.click();
    fixture.detectChanges();

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();

    expect(triggerEl.classList).toContain('cdk-program-focused');
    focusMonitor.stopMonitoring(triggerEl);
  }));

  it('should set the proper focus origin when restoring focus after opening by touch', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    dispatchMouseEvent(triggerEl, 'touchstart');
    triggerEl.click();
    fixture.detectChanges();
    patchElementFocus(triggerEl);
    focusMonitor.monitor(triggerEl, false);
    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();
    flush();

    expect(triggerEl.classList).toContain('cdk-touch-focused');
    focusMonitor.stopMonitoring(triggerEl);
  }));

  it('should close the menu when pressing ESCAPE', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;
    const event = createKeyboardEvent('keydown', ESCAPE);
    spyOn(event, 'stopPropagation').and.callThrough();

    dispatchEvent(panel, event);
    fixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.textContent).toBe('');
    expect(event.defaultPrevented).toBe(true);
    expect(event.stopPropagation).toHaveBeenCalled();
  }));

  it('should not close the menu when pressing ESCAPE with a modifier', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;
    const event = createKeyboardEvent('keydown', ESCAPE, undefined, {alt: true});

    dispatchEvent(panel, event);
    fixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.textContent).toBeTruthy();
    expect(event.defaultPrevented).toBe(false);
  }));

  it('should open a custom menu', fakeAsync(() => {
    const fixture = createComponent(CustomMenu, [], [CustomMenuPanel]);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.componentInstance.trigger.openMenu();

      expect(overlayContainerElement.textContent).toContain('Custom Menu header');
      expect(overlayContainerElement.textContent).toContain('Custom Content');
    }).not.toThrowError();
  }));

  it('should set the panel direction based on the trigger direction', fakeAsync(() => {
    const fixture = createComponent(
      SimpleMenu,
      [
        {
          provide: Directionality,
          useFactory: () => ({value: 'rtl'}),
        },
      ],
      [FakeIcon],
    );

    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const boundingBox = overlayContainerElement.querySelector(
      '.cdk-overlay-connected-position-bounding-box',
    )!;
    expect(boundingBox.getAttribute('dir')).toEqual('rtl');
  }));

  it('should update the panel direction if the trigger direction changes', fakeAsync(() => {
    const dirProvider = {value: 'rtl'};
    const fixture = createComponent(
      SimpleMenu,
      [
        {
          provide: Directionality,
          useFactory: () => dirProvider,
        },
      ],
      [FakeIcon],
    );

    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    let boundingBox = overlayContainerElement.querySelector(
      '.cdk-overlay-connected-position-bounding-box',
    )!;
    expect(boundingBox.getAttribute('dir')).toEqual('rtl');

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);

    dirProvider.value = 'ltr';
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    boundingBox = overlayContainerElement.querySelector(
      '.cdk-overlay-connected-position-bounding-box',
    )!;
    expect(boundingBox.getAttribute('dir')).toEqual('ltr');
  }));

  it('should transfer any custom classes from the host to the overlay', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);

    fixture.componentInstance.panelClass = 'custom-one custom-two';
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const menuEl = fixture.debugElement.query(By.css('mat-menu'))!.nativeElement;
    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;

    expect(menuEl.classList).not.toContain('custom-one');
    expect(menuEl.classList).not.toContain('custom-two');

    expect(panel.classList).toContain('custom-one');
    expect(panel.classList).toContain('custom-two');
  }));

  it('should not remove mat-elevation class from overlay when panelClass is changed', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);

    fixture.componentInstance.panelClass = 'custom-one';
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;

    expect(panel.classList).toContain('custom-one');
    expect(panel.classList).toContain('mat-elevation-z4');

    fixture.componentInstance.panelClass = 'custom-two';
    fixture.detectChanges();

    expect(panel.classList).not.toContain('custom-one');
    expect(panel.classList).toContain('custom-two');
    expect(panel.classList)
      .withContext('Expected mat-elevation-z4 not to be removed')
      .toContain('mat-elevation-z4');
  }));

  it('should set the "menu" role on the overlay panel', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const menuPanel = overlayContainerElement.querySelector('.mat-menu-panel');

    expect(menuPanel).withContext('Expected to find a menu panel.').toBeTruthy();

    const role = menuPanel ? menuPanel.getAttribute('role') : '';
    expect(role).withContext('Expected panel to have the "menu" role.').toBe('menu');
  }));

  it('should forward ARIA attributes to the menu panel', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    const instance = fixture.componentInstance;
    fixture.detectChanges();
    instance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const menuPanel = overlayContainerElement.querySelector('.mat-menu-panel')!;
    expect(menuPanel.hasAttribute('aria-label')).toBe(false);
    expect(menuPanel.hasAttribute('aria-labelledby')).toBe(false);
    expect(menuPanel.hasAttribute('aria-describedby')).toBe(false);

    // Note that setting all of these at the same time is invalid,
    // but it's up to the consumer to handle it correctly.
    instance.ariaLabel = 'Custom aria-label';
    instance.ariaLabelledby = 'custom-labelled-by';
    instance.ariaDescribedby = 'custom-described-by';
    fixture.detectChanges();

    expect(menuPanel.getAttribute('aria-label')).toBe('Custom aria-label');
    expect(menuPanel.getAttribute('aria-labelledby')).toBe('custom-labelled-by');
    expect(menuPanel.getAttribute('aria-describedby')).toBe('custom-described-by');

    // Change these to empty strings to make sure that we don't preserve empty attributes.
    instance.ariaLabel = instance.ariaLabelledby = instance.ariaDescribedby = '';
    fixture.detectChanges();

    expect(menuPanel.hasAttribute('aria-label')).toBe(false);
    expect(menuPanel.hasAttribute('aria-labelledby')).toBe(false);
    expect(menuPanel.hasAttribute('aria-describedby')).toBe(false);
  }));

  it('should set the "menuitem" role on the items by default', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const items = Array.from(overlayContainerElement.querySelectorAll('.mat-menu-item'));

    expect(items.length).toBeGreaterThan(0);
    expect(items.every(item => item.getAttribute('role') === 'menuitem')).toBe(true);
  }));

  it('should be able to set an alternate role on the menu items', fakeAsync(() => {
    const fixture = createComponent(MenuWithCheckboxItems);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const items = Array.from(overlayContainerElement.querySelectorAll('.mat-menu-item'));

    expect(items.length).toBeGreaterThan(0);
    expect(items.every(item => item.getAttribute('role') === 'menuitemcheckbox')).toBe(true);
  }));

  it('should not change focus origin if origin not specified for menu items', fakeAsync(() => {
    const fixture = createComponent(MenuWithCheckboxItems);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    let [firstMenuItemDebugEl, secondMenuItemDebugEl] = fixture.debugElement.queryAll(
      By.css('.mat-menu-item'),
    )!;

    const firstMenuItemInstance = firstMenuItemDebugEl.componentInstance as MatMenuItem;
    const secondMenuItemInstance = secondMenuItemDebugEl.componentInstance as MatMenuItem;

    firstMenuItemDebugEl.nativeElement.blur();
    firstMenuItemInstance.focus('mouse');
    secondMenuItemDebugEl.nativeElement.blur();
    secondMenuItemInstance.focus();
    tick(500);

    expect(secondMenuItemDebugEl.nativeElement.classList).toContain('cdk-focused');
    expect(secondMenuItemDebugEl.nativeElement.classList).toContain('cdk-mouse-focused');
  }));

  it('should not throw an error on destroy', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    expect(fixture.destroy.bind(fixture)).not.toThrow();
  }));

  it('should be able to extract the menu item text', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    expect(fixture.componentInstance.items.first.getLabel()).toBe('Item');
  }));

  it('should filter out icon nodes when figuring out the label', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const items = fixture.componentInstance.items.toArray();
    expect(items[2].getLabel()).toBe('Item with an icon');
  }));

  it('should get the label of an item if the text is not in a direct descendant node', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const items = fixture.componentInstance.items.toArray();
    expect(items[3].getLabel()).toBe('Item with text inside span');
  }));

  it('should set the proper focus origin when opening by mouse', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    spyOn(fixture.componentInstance.items.first, 'focus').and.callThrough();

    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    dispatchMouseEvent(triggerEl, 'mousedown');
    triggerEl.click();
    fixture.detectChanges();
    tick(500);

    expect(fixture.componentInstance.items.first.focus).toHaveBeenCalledWith('mouse');
  }));

  it('should set the proper focus origin when opening by touch', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    spyOn(fixture.componentInstance.items.first, 'focus').and.callThrough();

    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    dispatchMouseEvent(triggerEl, 'touchstart');
    triggerEl.click();
    fixture.detectChanges();
    flush();

    expect(fixture.componentInstance.items.first.focus).toHaveBeenCalledWith('touch');
  }));

  it('should close the menu when using the CloseScrollStrategy', fakeAsync(() => {
    const scrolledSubject = new Subject();
    const fixture = createComponent(
      SimpleMenu,
      [
        {provide: ScrollDispatcher, useFactory: () => ({scrolled: () => scrolledSubject})},
        {
          provide: MAT_MENU_SCROLL_STRATEGY,
          deps: [Overlay],
          useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
        },
      ],
      [FakeIcon],
    );
    fixture.detectChanges();
    const trigger = fixture.componentInstance.trigger;

    trigger.openMenu();
    fixture.detectChanges();

    expect(trigger.menuOpen).toBe(true);

    scrolledSubject.next();
    tick(500);

    expect(trigger.menuOpen).toBe(false);
  }));

  it('should switch to keyboard focus when using the keyboard after opening using the mouse', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);

    fixture.detectChanges();
    fixture.componentInstance.triggerEl.nativeElement.click();
    fixture.detectChanges();

    const panel = document.querySelector('.mat-menu-panel')! as HTMLElement;
    const items: HTMLElement[] = Array.from(
      panel.querySelectorAll('.mat-menu-panel [mat-menu-item]'),
    );

    items.forEach(item => patchElementFocus(item));

    tick(500);
    tick();
    fixture.detectChanges();
    expect(items.some(item => item.classList.contains('cdk-keyboard-focused'))).toBe(false);

    dispatchKeyboardEvent(panel, 'keydown', DOWN_ARROW);
    fixture.detectChanges();

    // Flush due to the additional tick that is necessary for the FocusMonitor.
    flush();

    // We skip to the third item, because the second one is disabled.
    expect(items[2].classList).toContain('cdk-focused');
    expect(items[2].classList).toContain('cdk-keyboard-focused');
  }));

  it('should set the keyboard focus origin when opened using the keyboard', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const trigger = fixture.componentInstance.triggerEl.nativeElement;

    // Note that we dispatch both a `click` and a `keydown` to imitate the browser behavior.
    dispatchKeyboardEvent(trigger, 'keydown', ENTER);
    trigger.click();
    fixture.detectChanges();

    const items = Array.from<HTMLElement>(
      document.querySelectorAll('.mat-menu-panel [mat-menu-item]'),
    );

    items.forEach(item => patchElementFocus(item));
    tick(500);
    tick();
    fixture.detectChanges();

    expect(items[0].classList).toContain('cdk-keyboard-focused');
  }));

  it('should toggle the aria-expanded attribute on the trigger', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

    expect(triggerEl.hasAttribute('aria-expanded')).toBe(false);

    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    expect(triggerEl.getAttribute('aria-expanded')).toBe('true');

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);

    expect(triggerEl.hasAttribute('aria-expanded')).toBe(false);
  }));

  it('should throw if assigning a menu that contains the trigger', fakeAsync(() => {
    expect(() => {
      const fixture = createComponent(InvalidRecursiveMenu, [], [FakeIcon]);
      fixture.detectChanges();
      tick(500);
    }).toThrowError(/menu cannot contain its own trigger/);
  }));

  it('should be able to swap out a menu after the first time it is opened', fakeAsync(() => {
    const fixture = createComponent(DynamicPanelMenu);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');

    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('One');
    expect(overlayContainerElement.textContent).not.toContain('Two');

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toBe('');

    fixture.componentInstance.trigger.menu = fixture.componentInstance.secondMenu;
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).not.toContain('One');
    expect(overlayContainerElement.textContent).toContain('Two');

    fixture.componentInstance.trigger.closeMenu();
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toBe('');
  }));

  it('should focus the first item when pressing home', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();

    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();

    // Reset the automatic focus when the menu is opened.
    (document.activeElement as HTMLElement)?.blur();

    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;
    const items = Array.from(panel.querySelectorAll('.mat-menu-item')) as HTMLElement[];
    items.forEach(patchElementFocus);

    // Focus the last item since focus starts from the first one.
    items[items.length - 1].focus();
    fixture.detectChanges();

    spyOn(items[0], 'focus').and.callThrough();

    const event = dispatchKeyboardEvent(panel, 'keydown', HOME);
    fixture.detectChanges();

    expect(items[0].focus).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    flush();
  }));

  it('should not focus the first item when pressing home with a modifier key', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();

    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();

    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;
    const items = Array.from(panel.querySelectorAll('.mat-menu-item')) as HTMLElement[];
    items.forEach(patchElementFocus);

    // Focus the last item since focus starts from the first one.
    items[items.length - 1].focus();
    fixture.detectChanges();

    spyOn(items[0], 'focus').and.callThrough();

    const event = createKeyboardEvent('keydown', HOME, undefined, {alt: true});

    dispatchEvent(panel, event);
    fixture.detectChanges();

    expect(items[0].focus).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
    flush();
  }));

  it('should focus the last item when pressing end', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();

    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();

    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;
    const items = Array.from(panel.querySelectorAll('.mat-menu-item')) as HTMLElement[];
    items.forEach(patchElementFocus);

    spyOn(items[items.length - 1], 'focus').and.callThrough();

    const event = dispatchKeyboardEvent(panel, 'keydown', END);
    fixture.detectChanges();

    expect(items[items.length - 1].focus).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    flush();
  }));

  it('should not focus the last item when pressing end with a modifier key', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();

    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();

    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;
    const items = Array.from(panel.querySelectorAll('.mat-menu-item')) as HTMLElement[];
    items.forEach(patchElementFocus);

    spyOn(items[items.length - 1], 'focus').and.callThrough();

    const event = createKeyboardEvent('keydown', END, undefined, {alt: true});

    dispatchEvent(panel, event);
    fixture.detectChanges();

    expect(items[items.length - 1].focus).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
    flush();
  }));

  it(
    'should respect the DOM order, rather than insertion order, when moving focus using ' +
      'the arrow keys',
    fakeAsync(() => {
      let fixture = createComponent(SimpleMenuWithRepeater);

      fixture.detectChanges();
      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      let menuPanel = document.querySelector('.mat-menu-panel')!;
      let items = menuPanel.querySelectorAll('.mat-menu-panel [mat-menu-item]');

      expect(document.activeElement)
        .withContext('Expected first item to be focused on open')
        .toBe(items[0]);

      // Add a new item after the first one.
      fixture.componentInstance.items.splice(1, 0, {label: 'Calzone', disabled: false});
      fixture.detectChanges();

      items = menuPanel.querySelectorAll('.mat-menu-panel [mat-menu-item]');
      dispatchKeyboardEvent(menuPanel, 'keydown', DOWN_ARROW);
      fixture.detectChanges();
      tick();

      expect(document.activeElement)
        .withContext('Expected second item to be focused')
        .toBe(items[1]);
      flush();
    }),
  );

  it('should sync the focus order when an item is focused programmatically', fakeAsync(() => {
    const fixture = createComponent(SimpleMenuWithRepeater);

    // Add some more items to work with.
    for (let i = 0; i < 5; i++) {
      fixture.componentInstance.items.push({label: `Extra ${i}`, disabled: false});
    }

    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const menuPanel = document.querySelector('.mat-menu-panel')!;
    const items = menuPanel.querySelectorAll('.mat-menu-panel [mat-menu-item]');

    expect(document.activeElement)
      .withContext('Expected first item to be focused on open')
      .toBe(items[0]);

    fixture.componentInstance.itemInstances.toArray()[3].focus();
    fixture.detectChanges();

    expect(document.activeElement).withContext('Expected fourth item to be focused').toBe(items[3]);

    dispatchKeyboardEvent(menuPanel, 'keydown', DOWN_ARROW);
    fixture.detectChanges();
    tick();

    expect(document.activeElement).withContext('Expected fifth item to be focused').toBe(items[4]);
    flush();
  }));

  it('should open submenus when the menu is inside an OnPush component', fakeAsync(() => {
    const fixture = createComponent(LazyMenuWithOnPush);
    fixture.detectChanges();

    // Open the top-level menu
    fixture.componentInstance.rootTrigger.nativeElement.click();
    fixture.detectChanges();
    flush();

    // Dispatch a `mouseenter` on the menu item to open the submenu.
    // This will only work if the top-level menu is aware the this menu item exists.
    dispatchMouseEvent(fixture.componentInstance.menuItemWithSubmenu.nativeElement, 'mouseenter');
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('.mat-menu-item').length)
      .withContext('Expected two open menus')
      .toBe(2);
  }));

  it('should focus the menu panel if all items are disabled', fakeAsync(() => {
    const fixture = createComponent(SimpleMenuWithRepeater, [], [FakeIcon]);
    fixture.componentInstance.items.forEach(item => (item.disabled = true));
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    expect(document.activeElement).toBe(overlayContainerElement.querySelector('.mat-menu-panel'));
  }));

  it('should focus the menu panel if all items are disabled inside lazy content', fakeAsync(() => {
    const fixture = createComponent(SimpleMenuWithRepeaterInLazyContent, [], [FakeIcon]);
    fixture.componentInstance.items.forEach(item => (item.disabled = true));
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    expect(document.activeElement).toBe(overlayContainerElement.querySelector('.mat-menu-panel'));
  }));

  it('should clear the static aria-label from the menu host', fakeAsync(() => {
    const fixture = createComponent(StaticAriaLabelMenu);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-menu').hasAttribute('aria-label')).toBe(false);
  }));

  it('should clear the static aria-labelledby from the menu host', fakeAsync(() => {
    const fixture = createComponent(StaticAriaLabelledByMenu);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-menu').hasAttribute('aria-labelledby')).toBe(
      false,
    );
  }));

  it('should clear the static aria-describedby from the menu host', fakeAsync(() => {
    const fixture = createComponent(StaticAriaDescribedbyMenu);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-menu').hasAttribute('aria-describedby')).toBe(
      false,
    );
  }));

  it('should be able to move focus inside the `open` event', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();

    fixture.componentInstance.trigger.menuOpened.subscribe(() => {
      (document.querySelectorAll('.mat-menu-panel [mat-menu-item]')[3] as HTMLElement).focus();
    });
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);

    const items = document.querySelectorAll('.mat-menu-panel [mat-menu-item]');
    expect(document.activeElement).withContext('Expected fourth item to be focused').toBe(items[3]);
  }));

  it('should default to the "below" and "after" positions', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);
    const panel = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;

    expect(panel.classList).toContain('mat-menu-below');
    expect(panel.classList).toContain('mat-menu-after');
  }));

  it('should keep the panel in the viewport when more items are added while open', () => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();

    const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
    triggerEl.style.position = 'absolute';
    triggerEl.style.left = '200px';
    triggerEl.style.bottom = '300px';
    triggerEl.click();
    fixture.detectChanges();

    const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;
    const viewportHeight = viewportRuler.getViewportSize().height;
    let panelRect = panel.getBoundingClientRect();
    expect(Math.floor(panelRect.bottom)).toBeLessThan(viewportHeight);

    fixture.componentInstance.extraItems = new Array(50).fill('Hello there');
    fixture.detectChanges();
    panelRect = panel.getBoundingClientRect();
    expect(Math.floor(panelRect.bottom)).toBe(viewportHeight);
  });

  describe('lazy rendering', () => {
    it('should be able to render the menu content lazily', fakeAsync(() => {
      const fixture = createComponent(SimpleLazyMenu);

      fixture.detectChanges();
      fixture.componentInstance.triggerEl.nativeElement.click();
      fixture.detectChanges();
      tick(500);

      const panel = overlayContainerElement.querySelector('.mat-menu-panel')!;

      expect(panel).withContext('Expected panel to be defined').toBeTruthy();
      expect(panel.textContent)
        .withContext('Expected panel to have correct content')
        .toContain('Another item');
      expect(fixture.componentInstance.trigger.menuOpen)
        .withContext('Expected menu to be open')
        .toBe(true);
    }));

    it('should detach the lazy content when the menu is closed', fakeAsync(() => {
      const fixture = createComponent(SimpleLazyMenu);

      fixture.detectChanges();
      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      expect(fixture.componentInstance.items.length).toBeGreaterThan(0);

      fixture.componentInstance.trigger.closeMenu();
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();

      expect(fixture.componentInstance.items.length).toBe(0);
    }));

    it('should wait for the close animation to finish before considering the panel as closed', fakeAsync(() => {
      const fixture = createComponent(SimpleLazyMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.trigger;

      expect(trigger.menuOpen).withContext('Expected menu to start off closed').toBe(false);

      trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      expect(trigger.menuOpen).withContext('Expected menu to be open').toBe(true);

      trigger.closeMenu();
      fixture.detectChanges();

      expect(trigger.menuOpen)
        .withContext('Expected menu to be considered open while the close animation is running')
        .toBe(true);
      tick(500);
      fixture.detectChanges();

      expect(trigger.menuOpen).withContext('Expected menu to be closed').toBe(false);
    }));

    it('should focus the first menu item when opening a lazy menu via keyboard', fakeAsync(() => {
      let zone: MockNgZone;
      let fixture = createComponent(SimpleLazyMenu, [
        {
          provide: NgZone,
          useFactory: () => (zone = new MockNgZone()),
        },
      ]);

      fixture.detectChanges();

      // A click without a mousedown before it is considered a keyboard open.
      fixture.componentInstance.triggerEl.nativeElement.click();
      fixture.detectChanges();
      tick(500);
      zone!.simulateZoneExit();

      // Flush due to the additional tick that is necessary for the FocusMonitor.
      flush();

      const item = document.querySelector('.mat-menu-panel [mat-menu-item]')!;

      expect(document.activeElement).withContext('Expected first item to be focused').toBe(item);
    }));

    it('should be able to open the same menu with a different context', fakeAsync(() => {
      const fixture = createComponent(LazyMenuWithContext);

      fixture.detectChanges();
      fixture.componentInstance.triggerOne.openMenu();
      fixture.detectChanges();
      tick(500);

      let item = overlayContainerElement.querySelector('.mat-menu-panel [mat-menu-item]')!;

      expect(item.textContent!.trim()).toBe('one');

      fixture.componentInstance.triggerOne.closeMenu();
      fixture.detectChanges();
      tick(500);

      fixture.componentInstance.triggerTwo.openMenu();
      fixture.detectChanges();
      tick(500);
      item = overlayContainerElement.querySelector('.mat-menu-panel [mat-menu-item]')!;

      expect(item.textContent!.trim()).toBe('two');
    }));
  });

  describe('positions', () => {
    let fixture: ComponentFixture<PositionedMenu>;
    let trigger: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(PositionedMenu);
      fixture.detectChanges();

      trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the bottom edge of viewport,so it has space to open "above"
      trigger.style.position = 'fixed';
      trigger.style.top = '600px';

      // Push trigger to the right, so it has space to open "before"
      trigger.style.left = '100px';
    }));

    it('should append mat-menu-before if the x position is changed', fakeAsync(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const panel = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;

      expect(panel.classList).toContain('mat-menu-before');
      expect(panel.classList).not.toContain('mat-menu-after');

      fixture.componentInstance.xPosition = 'after';
      fixture.detectChanges();

      expect(panel.classList).toContain('mat-menu-after');
      expect(panel.classList).not.toContain('mat-menu-before');
    }));

    it('should append mat-menu-above if the y position is changed', fakeAsync(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const panel = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;

      expect(panel.classList).toContain('mat-menu-above');
      expect(panel.classList).not.toContain('mat-menu-below');

      fixture.componentInstance.yPosition = 'below';
      fixture.detectChanges();

      expect(panel.classList).toContain('mat-menu-below');
      expect(panel.classList).not.toContain('mat-menu-above');
    }));

    it('should update the position classes if the window is resized', fakeAsync(() => {
      trigger.style.position = 'fixed';
      trigger.style.top = '300px';
      fixture.componentInstance.yPosition = 'above';
      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const panel = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;

      expect(panel.classList).toContain('mat-menu-above');
      expect(panel.classList).not.toContain('mat-menu-below');

      trigger.style.top = '0';
      dispatchFakeEvent(window, 'resize');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();

      expect(panel.classList).not.toContain('mat-menu-above');
      expect(panel.classList).toContain('mat-menu-below');
    }));

    it('should be able to update the position after the first open', fakeAsync(() => {
      trigger.style.position = 'fixed';
      trigger.style.top = '200px';

      fixture.componentInstance.yPosition = 'above';
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      let panel = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;

      expect(Math.floor(panel.getBoundingClientRect().bottom))
        .withContext('Expected menu to open above')
        .toBe(Math.floor(trigger.getBoundingClientRect().top));

      fixture.componentInstance.trigger.closeMenu();
      fixture.detectChanges();
      tick(500);

      fixture.componentInstance.yPosition = 'below';
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);
      panel = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;

      expect(Math.floor(panel.getBoundingClientRect().top))
        .withContext('Expected menu to open below')
        .toBe(Math.floor(trigger.getBoundingClientRect().bottom));
    }));

    it('should not throw if a menu reposition is requested while the menu is closed', fakeAsync(() => {
      expect(() => fixture.componentInstance.trigger.updatePosition()).not.toThrow();
    }));
  });

  describe('fallback positions', () => {
    it('should fall back to "before" mode if "after" mode would not fit on screen', fakeAsync(() => {
      const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the right side of viewport, so it doesn't have space to open
      // in its default "after" position on the right side.
      trigger.style.position = 'fixed';
      trigger.style.right = '0';
      trigger.style.top = '200px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // In "before" position, the right sides of the overlay and the origin are aligned.
      // To find the overlay left, subtract the menu width from the origin's right side.
      const expectedLeft = triggerRect.right - overlayRect.width;
      expect(Math.floor(overlayRect.left))
        .withContext(
          `Expected menu to open in "before" position if "after" position ` + `wouldn't fit.`,
        )
        .toBe(Math.floor(expectedLeft));

      // The y-position of the overlay should be unaffected, as it can already fit vertically
      // The y-position of the overlay should be unaffected, as it can already fit vertically
      expect(Math.floor(overlayRect.top))
        .withContext(`Expected menu top position to be unchanged if it can fit in the viewport.`)
        .toBe(Math.floor(triggerRect.bottom));
    }));

    it('should fall back to "above" mode if "below" mode would not fit on screen', fakeAsync(() => {
      const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the bottom part of viewport, so it doesn't have space to open
      // in its default "below" position below the trigger.
      trigger.style.position = 'fixed';
      trigger.style.bottom = '65px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom))
        .withContext(`Expected menu to open in "above" position if "below" position wouldn't fit.`)
        .toBe(Math.floor(triggerRect.top));

      // The x-position of the overlay should be unaffected, as it can already fit horizontally
      // The x-position of the overlay should be unaffected, as it can already fit horizontally
      expect(Math.floor(overlayRect.left))
        .withContext(`Expected menu x position to be unchanged if it can fit in the viewport.`)
        .toBe(Math.floor(triggerRect.left));
    }));

    it('should re-position menu on both axes if both defaults would not fit', fakeAsync(() => {
      const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // push trigger to the bottom, right part of viewport, so it doesn't have space to open
      // in its default "after below" position.
      trigger.style.position = 'fixed';
      trigger.style.right = '0';
      trigger.style.bottom = '0';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      const expectedLeft = triggerRect.right - overlayRect.width;

      expect(Math.floor(overlayRect.left))
        .withContext(`Expected menu to open in "before" position if "after" position wouldn't fit.`)
        .toBe(Math.floor(expectedLeft));

      expect(Math.floor(overlayRect.bottom))
        .withContext(`Expected menu to open in "above" position if "below" position wouldn't fit.`)
        .toBe(Math.floor(triggerRect.top));
    }));

    it('should re-position a menu with custom position set', fakeAsync(() => {
      const fixture = createComponent(PositionedMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // As designated "before" position won't fit on screen, the menu should fall back
      // to "after" mode, where the left sides of the overlay and trigger are aligned.
      // As designated "before" position won't fit on screen, the menu should fall back
      // to "after" mode, where the left sides of the overlay and trigger are aligned.
      expect(Math.floor(overlayRect.left))
        .withContext(`Expected menu to open in "after" position if "before" position wouldn't fit.`)
        .toBe(Math.floor(triggerRect.left));

      // As designated "above" position won't fit on screen, the menu should fall back
      // to "below" mode, where the top edges of the overlay and trigger are aligned.
      // As designated "above" position won't fit on screen, the menu should fall back
      // to "below" mode, where the top edges of the overlay and trigger are aligned.
      expect(Math.floor(overlayRect.top))
        .withContext(`Expected menu to open in "below" position if "above" position wouldn't fit.`)
        .toBe(Math.floor(triggerRect.bottom));
    }));

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

      constructor(ctor: {new (): T}, inputs: {[key: string]: any} = {}) {
        this.fixture = createComponent(ctor);
        Object.keys(inputs).forEach(
          key => ((this.fixture.componentInstance as any)[key] = inputs[key]),
        );
        this.fixture.detectChanges();
        this.trigger = this.fixture.componentInstance.triggerEl.nativeElement;
      }

      openMenu() {
        this.fixture.componentInstance.trigger.openMenu();
        this.fixture.detectChanges();
        tick(500);
      }

      get overlayRect() {
        return this._getOverlayPane().getBoundingClientRect();
      }

      get triggerRect() {
        return this.trigger.getBoundingClientRect();
      }

      get menuPanel() {
        return overlayContainerElement.querySelector('.mat-menu-panel');
      }

      private _getOverlayPane() {
        return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      }
    }

    let subject: OverlapSubject<OverlapMenu>;
    describe('explicitly overlapping', () => {
      beforeEach(fakeAsync(() => {
        subject = new OverlapSubject(OverlapMenu, {overlapTrigger: true});
      }));

      it('positions the overlay below the trigger', fakeAsync(() => {
        subject.openMenu();

        // Since the menu is overlaying the trigger, the overlay top should be the trigger top.
        // Since the menu is overlaying the trigger, the overlay top should be the trigger top.
        expect(Math.floor(subject.overlayRect.top))
          .withContext(`Expected menu to open in default "below" position.`)
          .toBe(Math.floor(subject.triggerRect.top));
      }));
    });

    describe('not overlapping', () => {
      beforeEach(fakeAsync(() => {
        subject = new OverlapSubject(OverlapMenu, {overlapTrigger: false});
      }));

      it('positions the overlay below the trigger', fakeAsync(() => {
        subject.openMenu();

        // Since the menu is below the trigger, the overlay top should be the trigger bottom.
        // Since the menu is below the trigger, the overlay top should be the trigger bottom.
        expect(Math.floor(subject.overlayRect.top))
          .withContext(`Expected menu to open directly below the trigger.`)
          .toBe(Math.floor(subject.triggerRect.bottom));
      }));

      it('supports above position fall back', fakeAsync(() => {
        // Push trigger to the bottom part of viewport, so it doesn't have space to open
        // in its default "below" position below the trigger.
        subject.trigger.style.position = 'fixed';
        subject.trigger.style.bottom = '0';
        subject.openMenu();

        // Since the menu is above the trigger, the overlay bottom should be the trigger top.
        // Since the menu is above the trigger, the overlay bottom should be the trigger top.
        expect(Math.floor(subject.overlayRect.bottom))
          .withContext(
            `Expected menu to open in "above" position if "below" position ` + `wouldn't fit.`,
          )
          .toBe(Math.floor(subject.triggerRect.top));
      }));

      it('repositions the origin to be below, so the menu opens from the trigger', fakeAsync(() => {
        subject.openMenu();
        subject.fixture.detectChanges();

        expect(subject.menuPanel!.classList).toContain('mat-menu-below');
        expect(subject.menuPanel!.classList).not.toContain('mat-menu-above');
      }));
    });
  });

  describe('animations', () => {
    it('should enable ripples on items by default', fakeAsync(() => {
      const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const item = fixture.debugElement.query(By.css('.mat-menu-item'))!;
      const ripple = item.query(By.css('.mat-ripple'))!.injector.get<MatRipple>(MatRipple);

      expect(ripple.disabled).toBe(false);
    }));

    it('should disable ripples on disabled items', fakeAsync(() => {
      const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const items = fixture.debugElement.queryAll(By.css('.mat-menu-item'));
      const ripple = items[1].query(By.css('.mat-ripple'))!.injector.get<MatRipple>(MatRipple);

      expect(ripple.disabled).toBe(true);
    }));

    it('should disable ripples if disableRipple is set', fakeAsync(() => {
      const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);

      // The third menu item in the `SimpleMenu` component has ripples disabled.
      const items = fixture.debugElement.queryAll(By.css('.mat-menu-item'));
      const ripple = items[2].query(By.css('.mat-ripple'))!.injector.get<MatRipple>(MatRipple);

      expect(ripple.disabled).toBe(true);
    }));
  });

  describe('close event', () => {
    let fixture: ComponentFixture<SimpleMenu>;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(SimpleMenu, [], [FakeIcon]);
      fixture.detectChanges();
      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      tick(500);
    }));

    it('should emit an event when a menu item is clicked', fakeAsync(() => {
      const menuItem = overlayContainerElement.querySelector('[mat-menu-item]') as HTMLElement;

      menuItem.click();
      fixture.detectChanges();
      tick(500);

      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith('click');
      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
    }));

    it('should emit a close event when the backdrop is clicked', fakeAsync(() => {
      const backdrop = overlayContainerElement.querySelector(
        '.cdk-overlay-backdrop',
      ) as HTMLElement;

      backdrop.click();
      fixture.detectChanges();
      tick(500);

      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith(undefined);
      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
    }));

    it('should emit an event when pressing ESCAPE', fakeAsync(() => {
      const menu = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;

      dispatchKeyboardEvent(menu, 'keydown', ESCAPE);
      fixture.detectChanges();
      tick(500);

      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith('keydown');
      expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
    }));

    it('should complete the callback when the menu is destroyed', fakeAsync(() => {
      const emitCallback = jasmine.createSpy('emit callback');
      const completeCallback = jasmine.createSpy('complete callback');

      fixture.componentInstance.menu.closed.subscribe(emitCallback, null, completeCallback);
      fixture.destroy();
      tick(500);

      expect(emitCallback).toHaveBeenCalledWith(undefined);
      expect(emitCallback).toHaveBeenCalledTimes(1);
      expect(completeCallback).toHaveBeenCalled();
    }));
  });

  describe('nested menu', () => {
    let fixture: ComponentFixture<NestedMenu>;
    let instance: NestedMenu;
    let overlay: HTMLElement;
    let compileTestComponent = (direction: Direction = 'ltr') => {
      fixture = createComponent(NestedMenu, [
        {
          provide: Directionality,
          useFactory: () => ({value: direction}),
        },
      ]);

      fixture.detectChanges();
      instance = fixture.componentInstance;
      overlay = overlayContainerElement;
    };

    it('should set the `triggersSubmenu` flags on the triggers', fakeAsync(() => {
      compileTestComponent();
      expect(instance.rootTrigger.triggersSubmenu()).toBe(false);
      expect(instance.levelOneTrigger.triggersSubmenu()).toBe(true);
      expect(instance.levelTwoTrigger.triggersSubmenu()).toBe(true);
    }));

    it('should set the `parentMenu` on the sub-menu instances', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      tick(500);

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      expect(instance.rootMenu.parentMenu).toBeFalsy();
      expect(instance.levelOneMenu.parentMenu).toBe(instance.rootMenu);
      expect(instance.levelTwoMenu.parentMenu).toBe(instance.levelOneMenu);
    }));

    it('should pass the layout direction the nested menus', fakeAsync(() => {
      compileTestComponent('rtl');
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      expect(instance.rootMenu.direction).toBe('rtl');
      expect(instance.levelOneMenu.direction).toBe('rtl');
      expect(instance.levelTwoMenu.direction).toBe('rtl');
    }));

    it('should emit an event when the hover state of the menu items changes', fakeAsync(() => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const spy = jasmine.createSpy('hover spy');
      const subscription = instance.rootMenu._hovered().subscribe(spy);
      const menuItems = overlay.querySelectorAll('[mat-menu-item]');

      dispatchMouseEvent(menuItems[0], 'mouseenter');
      fixture.detectChanges();
      tick(500);

      expect(spy).toHaveBeenCalledTimes(1);

      dispatchMouseEvent(menuItems[1], 'mouseenter');
      fixture.detectChanges();
      tick(500);

      expect(spy).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    }));

    it('should toggle a nested menu when its trigger is hovered', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);

      const items = Array.from(overlay.querySelectorAll('.mat-menu-panel [mat-menu-item]'));
      const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

      dispatchMouseEvent(levelOneTrigger, 'mouseenter');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(levelOneTrigger.classList)
        .withContext('Expected the trigger to be highlighted')
        .toContain('mat-menu-item-highlighted');
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected two open menus')
        .toBe(2);

      dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);
      expect(levelOneTrigger.classList).not.toContain(
        'mat-menu-item-highlighted',
        'Expected the trigger to not be highlighted',
      );
    }));

    it('should close all the open sub-menus when the hover state is changed at the root', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      const items = Array.from(overlay.querySelectorAll('.mat-menu-panel [mat-menu-item]'));
      const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

      dispatchMouseEvent(levelOneTrigger, 'mouseenter');
      fixture.detectChanges();
      tick();

      const levelTwoTrigger = overlay.querySelector('#level-two-trigger')! as HTMLElement;
      dispatchMouseEvent(levelTwoTrigger, 'mouseenter');
      fixture.detectChanges();
      tick();

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected three open menus')
        .toBe(3);

      dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);
    }));

    it('should close submenu when hovering over disabled sibling item', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      tick(500);

      const items = fixture.debugElement.queryAll(By.directive(MatMenuItem));

      dispatchFakeEvent(items[0].nativeElement, 'mouseenter');
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected two open menus')
        .toBe(2);

      items[1].componentInstance.disabled = true;
      fixture.detectChanges();

      // Invoke the handler directly since the fake events are flaky on disabled elements.
      items[1].componentInstance._handleMouseEnter();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);
    }));

    it('should not open submenu when hovering over disabled trigger', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);

      const item = fixture.debugElement.query(By.directive(MatMenuItem))!;

      item.componentInstance.disabled = true;
      fixture.detectChanges();

      // Invoke the handler directly since the fake events are flaky on disabled elements.
      item.componentInstance._handleMouseEnter();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected to remain at one open menu')
        .toBe(1);
    }));

    it('should open a nested menu when its trigger is clicked', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      tick(500);
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);

      const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

      levelOneTrigger.click();
      fixture.detectChanges();
      tick(500);
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected two open menus')
        .toBe(2);

      levelOneTrigger.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected repeat clicks not to close the menu.')
        .toBe(2);
    }));

    it('should open and close a nested menu with arrow keys in ltr', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);

      const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

      dispatchKeyboardEvent(levelOneTrigger, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      const panels = overlay.querySelectorAll('.mat-menu-panel');

      expect(panels.length).withContext('Expected two open menus').toBe(2);
      dispatchKeyboardEvent(panels[1], 'keydown', LEFT_ARROW);
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1);
    }));

    it('should open and close a nested menu with the arrow keys in rtl', fakeAsync(() => {
      compileTestComponent('rtl');
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);

      const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

      dispatchKeyboardEvent(levelOneTrigger, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      const panels = overlay.querySelectorAll('.mat-menu-panel');

      expect(panels.length).withContext('Expected two open menus').toBe(2);
      dispatchKeyboardEvent(panels[1], 'keydown', RIGHT_ARROW);
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length).toBe(1);
    }));

    it('should not do anything with the arrow keys for a top-level menu', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      tick(500);

      const menu = overlay.querySelector('.mat-menu-panel')!;

      dispatchKeyboardEvent(menu, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();
      tick(500);
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one menu to remain open')
        .toBe(1);

      dispatchKeyboardEvent(menu, 'keydown', LEFT_ARROW);
      fixture.detectChanges();
      tick(500);
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one menu to remain open')
        .toBe(1);
    }));

    it('should close all of the menus when the backdrop is clicked', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      tick(500);

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected three open menus')
        .toBe(3);
      expect(overlay.querySelectorAll('.cdk-overlay-backdrop').length)
        .withContext('Expected one backdrop element')
        .toBe(1);
      expect(overlay.querySelectorAll('.mat-menu-panel, .cdk-overlay-backdrop')[0].classList)
        .withContext('Expected backdrop to be beneath all of the menus')
        .toContain('cdk-overlay-backdrop');

      (overlay.querySelector('.cdk-overlay-backdrop')! as HTMLElement).click();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected no open menus')
        .toBe(0);
    }));

    it('should shift focus between the sub-menus', fakeAsync(() => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelector('.mat-menu-panel')!.contains(document.activeElement))
        .withContext('Expected focus to be inside the root menu')
        .toBe(true);

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel')[1].contains(document.activeElement))
        .withContext('Expected focus to be inside the first nested menu')
        .toBe(true);

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel')[2].contains(document.activeElement))
        .withContext('Expected focus to be inside the second nested menu')
        .toBe(true);

      instance.levelTwoTrigger.closeMenu();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel')[1].contains(document.activeElement))
        .withContext('Expected focus to be back inside the first nested menu')
        .toBe(true);

      instance.levelOneTrigger.closeMenu();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelector('.mat-menu-panel')!.contains(document.activeElement))
        .withContext('Expected focus to be back inside the root menu')
        .toBe(true);
    }));

    it('should restore focus to a nested trigger when navigating via the keyboard', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;
      dispatchKeyboardEvent(levelOneTrigger, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      const spy = spyOn(levelOneTrigger, 'focus').and.callThrough();
      dispatchKeyboardEvent(overlay.querySelectorAll('.mat-menu-panel')[1], 'keydown', LEFT_ARROW);
      fixture.detectChanges();
      tick(500);

      expect(spy).toHaveBeenCalled();
    }));

    it('should position the sub-menu to the right edge of the trigger in ltr', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.style.position = 'fixed';
      instance.rootTriggerEl.nativeElement.style.left = '50px';
      instance.rootTriggerEl.nativeElement.style.top = '200px';
      instance.rootTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
      const panelRect = overlay.querySelectorAll('.mat-menu-panel')[1].getBoundingClientRect();

      expect(Math.round(triggerRect.right)).toBe(Math.round(panelRect.left));
      expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + MENU_PANEL_TOP_PADDING);
    }));

    it('should fall back to aligning to the left edge of the trigger in ltr', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.style.position = 'fixed';
      instance.rootTriggerEl.nativeElement.style.right = '10px';
      instance.rootTriggerEl.nativeElement.style.top = '200px';
      instance.rootTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
      const panelRect = overlay.querySelectorAll('.mat-menu-panel')[1].getBoundingClientRect();

      expect(Math.round(triggerRect.left)).toBe(Math.round(panelRect.right));
      expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + MENU_PANEL_TOP_PADDING);
    }));

    it('should position the sub-menu to the left edge of the trigger in rtl', fakeAsync(() => {
      compileTestComponent('rtl');
      instance.rootTriggerEl.nativeElement.style.position = 'fixed';
      instance.rootTriggerEl.nativeElement.style.left = '50%';
      instance.rootTriggerEl.nativeElement.style.top = '200px';
      instance.rootTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
      const panelRect = overlay.querySelectorAll('.mat-menu-panel')[1].getBoundingClientRect();

      expect(Math.round(triggerRect.left)).toBe(Math.round(panelRect.right));
      expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + MENU_PANEL_TOP_PADDING);
    }));

    it('should fall back to aligning to the right edge of the trigger in rtl', fakeAsync(() => {
      compileTestComponent('rtl');
      instance.rootTriggerEl.nativeElement.style.position = 'fixed';
      instance.rootTriggerEl.nativeElement.style.left = '10px';
      instance.rootTriggerEl.nativeElement.style.top = '200px';
      instance.rootTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
      const panelRect = overlay.querySelectorAll('.mat-menu-panel')[1].getBoundingClientRect();

      expect(Math.round(triggerRect.right)).toBe(Math.round(panelRect.left));
      expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + MENU_PANEL_TOP_PADDING);
    }));

    it('should account for custom padding when offsetting the sub-menu', () => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.style.position = 'fixed';
      instance.rootTriggerEl.nativeElement.style.left = '10px';
      instance.rootTriggerEl.nativeElement.style.top = '200px';
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      // Change the padding to something different from the default.
      (overlay.querySelector('.mat-menu-content') as HTMLElement).style.padding = '15px 0';

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
      const panelRect = overlay.querySelectorAll('.mat-menu-panel')[1].getBoundingClientRect();

      expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + 15);
    });

    it('should close all of the menus when an item is clicked', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      const menus = overlay.querySelectorAll('.mat-menu-panel');

      expect(menus.length).withContext('Expected three open menus').toBe(3);

      (menus[2].querySelector('.mat-menu-item')! as HTMLElement).click();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected no open menus')
        .toBe(0);
    }));

    it('should close all of the menus when the user tabs away', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      const menus = overlay.querySelectorAll('.mat-menu-panel');

      expect(menus.length).withContext('Expected three open menus').toBe(3);

      dispatchKeyboardEvent(menus[menus.length - 1], 'keydown', TAB);
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected no open menus')
        .toBe(0);
    }));

    it('should set a class on the menu items that trigger a sub-menu', fakeAsync(() => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const menuItems = overlay.querySelectorAll('[mat-menu-item]');

      expect(menuItems[0].classList).toContain('mat-menu-item-submenu-trigger');
      expect(menuItems[0].querySelector('.mat-menu-submenu-icon')).toBeTruthy();
      expect(menuItems[1].classList).not.toContain('mat-menu-item-submenu-trigger');
      expect(menuItems[1].querySelector('.mat-menu-submenu-icon')).toBeFalsy();
    }));

    it('should increase the sub-menu elevation based on its depth', fakeAsync(() => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const menus = overlay.querySelectorAll('.mat-menu-panel');

      expect(menus[0].classList)
        .withContext('Expected root menu to have base elevation.')
        .toContain('mat-elevation-z4');
      expect(menus[1].classList)
        .withContext('Expected first sub-menu to have base elevation + 1.')
        .toContain('mat-elevation-z5');
      expect(menus[2].classList)
        .withContext('Expected second sub-menu to have base elevation + 2.')
        .toContain('mat-elevation-z6');
    }));

    it('should update the elevation when the same menu is opened at a different depth', fakeAsync(() => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      let lastMenu = overlay.querySelectorAll('.mat-menu-panel')[2];

      expect(lastMenu.classList)
        .withContext('Expected menu to have the base elevation plus two.')
        .toContain('mat-elevation-z6');

      (overlay.querySelector('.cdk-overlay-backdrop')! as HTMLElement).click();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected no open menus')
        .toBe(0);

      instance.alternateTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      lastMenu = overlay.querySelector('.mat-menu-panel') as HTMLElement;

      expect(lastMenu.classList)
        .not.withContext('Expected menu not to maintain old elevation.')
        .toContain('mat-elevation-z6');
      expect(lastMenu.classList)
        .withContext('Expected menu to have the proper updated elevation.')
        .toContain('mat-elevation-z4');
    }));

    it('should not change focus origin if origin not specified for trigger', fakeAsync(() => {
      compileTestComponent();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();
      tick(500);
      instance.levelOneTrigger.focus('mouse');
      fixture.detectChanges();

      instance.levelTwoTrigger.focus();
      fixture.detectChanges();
      tick(500);

      const levelTwoTrigger = overlay.querySelector('#level-two-trigger')! as HTMLElement;

      expect(levelTwoTrigger.classList).toContain('cdk-focused');
      expect(levelTwoTrigger.classList).toContain('cdk-mouse-focused');
    }));

    it('should not increase the elevation if the user specified a custom one', fakeAsync(() => {
      const elevationFixture = createComponent(NestedMenuCustomElevation);

      elevationFixture.detectChanges();
      elevationFixture.componentInstance.rootTrigger.openMenu();
      elevationFixture.detectChanges();
      tick(500);

      elevationFixture.componentInstance.levelOneTrigger.openMenu();
      elevationFixture.detectChanges();
      tick(500);

      const menuClasses = overlayContainerElement.querySelectorAll('.mat-menu-panel')[1].classList;

      expect(menuClasses)
        .withContext('Expected user elevation to be maintained')
        .toContain('mat-elevation-z24');
      expect(menuClasses)
        .not.withContext('Expected no stacked elevation.')
        .toContain('mat-elevation-z3');
    }));

    it('should close all of the menus when the root is closed programmatically', fakeAsync(() => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();

      instance.levelOneTrigger.openMenu();
      fixture.detectChanges();

      instance.levelTwoTrigger.openMenu();
      fixture.detectChanges();

      const menus = overlay.querySelectorAll('.mat-menu-panel');

      expect(menus.length).withContext('Expected three open menus').toBe(3);

      instance.rootTrigger.closeMenu();
      fixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected no open menus')
        .toBe(0);
    }));

    it('should toggle a nested menu when its trigger is added after init', fakeAsync(() => {
      compileTestComponent();
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();
      tick(500);
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);

      instance.showLazy = true;
      fixture.detectChanges();

      const lazyTrigger = overlay.querySelector('#lazy-trigger')!;

      dispatchMouseEvent(lazyTrigger, 'mouseenter');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();

      expect(lazyTrigger.classList)
        .withContext('Expected the trigger to be highlighted')
        .toContain('mat-menu-item-highlighted');
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected two open menus')
        .toBe(2);
    }));

    it('should prevent the default mousedown action if the menu item opens a sub-menu', fakeAsync(() => {
      compileTestComponent();
      instance.rootTrigger.openMenu();
      fixture.detectChanges();
      tick(500);

      const event = createMouseEvent('mousedown');
      Object.defineProperty(event, 'buttons', {get: () => 1});
      event.preventDefault = jasmine.createSpy('preventDefault spy');

      dispatchEvent(overlay.querySelector('[mat-menu-item]')!, event);
      fixture.detectChanges();
      tick(500);

      expect(event.preventDefault).toHaveBeenCalled();
    }));

    it('should handle the items being rendered in a repeater', fakeAsync(() => {
      const repeaterFixture = createComponent(NestedMenuRepeater);
      overlay = overlayContainerElement;

      expect(() => repeaterFixture.detectChanges()).not.toThrow();

      repeaterFixture.componentInstance.rootTriggerEl.nativeElement.click();
      repeaterFixture.detectChanges();
      tick(500);
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);

      dispatchMouseEvent(overlay.querySelector('.level-one-trigger')!, 'mouseenter');
      repeaterFixture.detectChanges();
      tick(500);
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected two open menus')
        .toBe(2);
    }));

    it('should be able to trigger the same nested menu from different triggers', fakeAsync(() => {
      const repeaterFixture = createComponent(NestedMenuRepeater);
      overlay = overlayContainerElement;

      repeaterFixture.detectChanges();
      repeaterFixture.componentInstance.rootTriggerEl.nativeElement.click();
      repeaterFixture.detectChanges();
      tick(500);
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);

      const triggers = overlay.querySelectorAll('.level-one-trigger');

      dispatchMouseEvent(triggers[0], 'mouseenter');
      repeaterFixture.detectChanges();
      tick(500);
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected two open menus')
        .toBe(2);

      dispatchMouseEvent(triggers[1], 'mouseenter');
      repeaterFixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected two open menus')
        .toBe(2);
    }));

    it('should close the initial menu if the user moves away while animating', fakeAsync(() => {
      const repeaterFixture = createComponent(NestedMenuRepeater);
      overlay = overlayContainerElement;

      repeaterFixture.detectChanges();
      repeaterFixture.componentInstance.rootTriggerEl.nativeElement.click();
      repeaterFixture.detectChanges();
      tick(500);
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected one open menu')
        .toBe(1);

      const triggers = overlay.querySelectorAll('.level-one-trigger');

      dispatchMouseEvent(triggers[0], 'mouseenter');
      repeaterFixture.detectChanges();
      tick(100);
      dispatchMouseEvent(triggers[1], 'mouseenter');
      repeaterFixture.detectChanges();
      tick(500);

      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected two open menus')
        .toBe(2);
    }));

    it(
      'should be able to open a submenu through an item that is not a direct descendant ' +
        'of the panel',
      fakeAsync(() => {
        const nestedFixture = createComponent(SubmenuDeclaredInsideParentMenu);
        overlay = overlayContainerElement;

        nestedFixture.detectChanges();
        nestedFixture.componentInstance.rootTriggerEl.nativeElement.click();
        nestedFixture.detectChanges();
        tick(500);
        expect(overlay.querySelectorAll('.mat-menu-panel').length)
          .withContext('Expected one open menu')
          .toBe(1);

        dispatchMouseEvent(overlay.querySelector('.level-one-trigger')!, 'mouseenter');
        nestedFixture.detectChanges();
        tick(500);

        expect(overlay.querySelectorAll('.mat-menu-panel').length)
          .withContext('Expected two open menus')
          .toBe(2);
      }),
    );

    it(
      'should not close when hovering over a menu item inside a sub-menu panel that is declared' +
        'inside the root menu',
      fakeAsync(() => {
        const nestedFixture = createComponent(SubmenuDeclaredInsideParentMenu);
        overlay = overlayContainerElement;

        nestedFixture.detectChanges();
        nestedFixture.componentInstance.rootTriggerEl.nativeElement.click();
        nestedFixture.detectChanges();
        tick(500);
        expect(overlay.querySelectorAll('.mat-menu-panel').length)
          .withContext('Expected one open menu')
          .toBe(1);

        dispatchMouseEvent(overlay.querySelector('.level-one-trigger')!, 'mouseenter');
        nestedFixture.detectChanges();
        tick(500);

        expect(overlay.querySelectorAll('.mat-menu-panel').length)
          .withContext('Expected two open menus')
          .toBe(2);

        dispatchMouseEvent(overlay.querySelector('.level-two-item')!, 'mouseenter');
        nestedFixture.detectChanges();
        tick(500);

        expect(overlay.querySelectorAll('.mat-menu-panel').length)
          .withContext('Expected two open menus to remain')
          .toBe(2);
      }),
    );

    it('should not re-focus a child menu trigger when hovering another trigger', fakeAsync(() => {
      compileTestComponent();

      dispatchFakeEvent(instance.rootTriggerEl.nativeElement, 'mousedown');
      instance.rootTriggerEl.nativeElement.click();
      fixture.detectChanges();

      const items = Array.from(overlay.querySelectorAll('.mat-menu-panel [mat-menu-item]'));
      const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

      dispatchMouseEvent(levelOneTrigger, 'mouseenter');
      fixture.detectChanges();
      tick();
      expect(overlay.querySelectorAll('.mat-menu-panel').length)
        .withContext('Expected two open menus')
        .toBe(2);

      dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
      fixture.detectChanges();
      tick(500);

      expect(document.activeElement).not.toBe(
        levelOneTrigger,
        'Expected focus not to be returned to the initial trigger.',
      );
    }));
  });

  it('should have a focus indicator', fakeAsync(() => {
    const fixture = createComponent(SimpleMenu, [], [FakeIcon]);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();
    tick(500);
    const menuItemNativeElements = Array.from(
      overlayContainerElement.querySelectorAll('.mat-menu-item'),
    );

    expect(
      menuItemNativeElements.every(element => element.classList.contains('mat-focus-indicator')),
    ).toBe(true);
  }));
});

describe('MatMenu default overrides', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, NoopAnimationsModule],
      declarations: [SimpleMenu, FakeIcon],
      providers: [
        {
          provide: MAT_MENU_DEFAULT_OPTIONS,
          useValue: {overlapTrigger: true, xPosition: 'before', yPosition: 'above'},
        },
      ],
    }).compileComponents();
  }));

  it('should allow for the default menu options to be overridden', fakeAsync(() => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    const menu = fixture.componentInstance.menu;

    expect(menu.overlapTrigger).toBe(true);
    expect(menu.xPosition).toBe('before');
    expect(menu.yPosition).toBe('above');
  }));
});

@Component({
  template: `
    <button
      [matMenuTriggerFor]="menu"
      [matMenuTriggerRestoreFocus]="restoreFocus"
      #triggerEl>Toggle menu</button>
    <mat-menu
      #menu="matMenu"
      [class]="panelClass"
      (closed)="closeCallback($event)"
      [backdropClass]="backdropClass"
      [aria-label]="ariaLabel"
      [aria-labelledby]="ariaLabelledby"
      [aria-describedby]="ariaDescribedby">

      <button mat-menu-item> Item </button>
      <button mat-menu-item disabled> Disabled </button>
      <button mat-menu-item disableRipple>
        <mat-icon>unicorn</mat-icon>
        Item with an icon
      </button>
      <button mat-menu-item>
        <span>Item with text inside span</span>
      </button>
      <button *ngFor="let item of extraItems" mat-menu-item> {{item}} </button>
    </mat-menu>
  `,
})
class SimpleMenu {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef<HTMLElement>;
  @ViewChild(MatMenu) menu: MatMenu;
  @ViewChildren(MatMenuItem) items: QueryList<MatMenuItem>;
  extraItems: string[] = [];
  closeCallback = jasmine.createSpy('menu closed callback');
  backdropClass: string;
  panelClass: string;
  restoreFocus = true;
  ariaLabel: string;
  ariaLabelledby: string;
  ariaDescribedby: string;
}

@Component({
  template: `
    <button [matMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <mat-menu [xPosition]="xPosition" [yPosition]="yPosition" #menu="matMenu">
      <button mat-menu-item> Positioned Content </button>
    </mat-menu>
  `,
})
class PositionedMenu {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef<HTMLElement>;
  xPosition: MenuPositionX = 'before';
  yPosition: MenuPositionY = 'above';
}

interface TestableMenu {
  trigger: MatMenuTrigger;
  triggerEl: ElementRef<HTMLElement>;
}
@Component({
  template: `
    <button [matMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <mat-menu [overlapTrigger]="overlapTrigger" #menu="matMenu">
      <button mat-menu-item> Not overlapped Content </button>
    </mat-menu>
  `,
})
class OverlapMenu implements TestableMenu {
  @Input() overlapTrigger: boolean;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef<HTMLElement>;
}

@Component({
  selector: 'custom-menu',
  template: `
    <ng-template>
      Custom Menu header
      <ng-content></ng-content>
    </ng-template>
  `,
  exportAs: 'matCustomMenu',
})
class CustomMenuPanel implements MatMenuPanel {
  direction: Direction;
  xPosition: MenuPositionX = 'after';
  yPosition: MenuPositionY = 'below';
  overlapTrigger = true;
  parentMenu: MatMenuPanel;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  @Output() readonly close = new EventEmitter<void | 'click' | 'keydown' | 'tab'>();
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
  `,
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

    <mat-menu #root="matMenu" (closed)="rootCloseCallback($event)">
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

    <mat-menu #levelOne="matMenu" (closed)="levelOneCloseCallback($event)">
      <button mat-menu-item>Four</button>
      <button mat-menu-item
        id="level-two-trigger"
        [matMenuTriggerFor]="levelTwo"
        #levelTwoTrigger="matMenuTrigger">Five</button>
      <button mat-menu-item>Six</button>
    </mat-menu>

    <mat-menu #levelTwo="matMenu" (closed)="levelTwoCloseCallback($event)">
      <button mat-menu-item>Seven</button>
      <button mat-menu-item>Eight</button>
      <button mat-menu-item>Nine</button>
    </mat-menu>

    <mat-menu #lazy="matMenu">
      <button mat-menu-item>Ten</button>
      <button mat-menu-item>Eleven</button>
      <button mat-menu-item>Twelve</button>
    </mat-menu>
  `,
})
class NestedMenu {
  @ViewChild('root') rootMenu: MatMenu;
  @ViewChild('rootTrigger') rootTrigger: MatMenuTrigger;
  @ViewChild('rootTriggerEl') rootTriggerEl: ElementRef<HTMLElement>;
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
  `,
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
  `,
})
class NestedMenuRepeater {
  @ViewChild('rootTriggerEl') rootTriggerEl: ElementRef<HTMLElement>;
  @ViewChild('levelOneTrigger') levelOneTrigger: MatMenuTrigger;

  items = ['one', 'two', 'three'];
}

@Component({
  template: `
    <button [matMenuTriggerFor]="root" #rootTriggerEl>Toggle menu</button>

    <mat-menu #root="matMenu">
      <button mat-menu-item class="level-one-trigger" [matMenuTriggerFor]="levelOne">One</button>

      <mat-menu #levelOne="matMenu">
        <button mat-menu-item class="level-two-item">Two</button>
      </mat-menu>
    </mat-menu>
  `,
})
class SubmenuDeclaredInsideParentMenu {
  @ViewChild('rootTriggerEl') rootTriggerEl: ElementRef;
}

@Component({
  selector: 'mat-icon',
  template: '<ng-content></ng-content>',
})
class FakeIcon {}

@Component({
  template: `
    <button [matMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>

    <mat-menu #menu="matMenu">
      <ng-template matMenuContent>
        <button mat-menu-item>Item</button>
        <button mat-menu-item>Another item</button>
      </ng-template>
    </mat-menu>
  `,
})
class SimpleLazyMenu {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef<HTMLElement>;
  @ViewChildren(MatMenuItem) items: QueryList<MatMenuItem>;
}

@Component({
  template: `
    <button
      [matMenuTriggerFor]="menu"
      [matMenuTriggerData]="{label: 'one'}"
      #triggerOne="matMenuTrigger">One</button>

    <button
      [matMenuTriggerFor]="menu"
      [matMenuTriggerData]="{label: 'two'}"
      #triggerTwo="matMenuTrigger">Two</button>

    <mat-menu #menu="matMenu">
      <ng-template let-label="label" matMenuContent>
        <button mat-menu-item>{{label}}</button>
      </ng-template>
    </mat-menu>
  `,
})
class LazyMenuWithContext {
  @ViewChild('triggerOne') triggerOne: MatMenuTrigger;
  @ViewChild('triggerTwo') triggerTwo: MatMenuTrigger;
}

@Component({
  template: `
    <button [matMenuTriggerFor]="one">Toggle menu</button>
    <mat-menu #one="matMenu">
      <button mat-menu-item>One</button>
    </mat-menu>

    <mat-menu #two="matMenu">
      <button mat-menu-item>Two</button>
    </mat-menu>
  `,
})
class DynamicPanelMenu {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('one') firstMenu: MatMenu;
  @ViewChild('two') secondMenu: MatMenu;
}

@Component({
  template: `
    <button [matMenuTriggerFor]="menu">Toggle menu</button>

    <mat-menu #menu="matMenu">
      <button mat-menu-item role="menuitemcheckbox" aria-checked="true">Checked</button>
      <button mat-menu-item role="menuitemcheckbox" aria-checked="false">Not checked</button>
    </mat-menu>
  `,
})
class MenuWithCheckboxItems {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
}

@Component({
  template: `
    <button [matMenuTriggerFor]="menu">Toggle menu</button>
    <mat-menu #menu="matMenu">
      <button
        *ngFor="let item of items"
        [disabled]="item.disabled"
        mat-menu-item>{{item.label}}</button>
    </mat-menu>
  `,
})
class SimpleMenuWithRepeater {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild(MatMenu) menu: MatMenu;
  @ViewChildren(MatMenuItem) itemInstances: QueryList<MatMenuItem>;
  items = [
    {label: 'Pizza', disabled: false},
    {label: 'Pasta', disabled: false},
  ];
}

@Component({
  template: `
    <button [matMenuTriggerFor]="menu">Toggle menu</button>
    <mat-menu #menu="matMenu">
      <ng-template matMenuContent>
        <button
          *ngFor="let item of items"
          [disabled]="item.disabled"
          mat-menu-item>{{item.label}}</button>
      </ng-template>
    </mat-menu>
  `,
})
class SimpleMenuWithRepeaterInLazyContent {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild(MatMenu) menu: MatMenu;
  items = [
    {label: 'Pizza', disabled: false},
    {label: 'Pasta', disabled: false},
  ];
}

@Component({
  template: `
    <button [matMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>

    <mat-menu #menu="matMenu">
      <ng-template matMenuContent>
        <button [matMenuTriggerFor]="menu2" mat-menu-item #menuItem>Item</button>
      </ng-template>
    </mat-menu>

    <mat-menu #menu2="matMenu">
      <ng-template matMenuContent>
        <button mat-menu-item #subMenuItem>Sub item</button>
      </ng-template>
    </mat-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LazyMenuWithOnPush {
  @ViewChild('triggerEl', {read: ElementRef}) rootTrigger: ElementRef;
  @ViewChild('menuItem', {read: ElementRef}) menuItemWithSubmenu: ElementRef;
}

@Component({
  template: `
    <mat-menu #menu="matMenu">
      <button [matMenuTriggerFor]="menu"></button>
    </mat-menu>
  `,
})
class InvalidRecursiveMenu {}

@Component({
  template: '<mat-menu aria-label="label"></mat-menu>',
})
class StaticAriaLabelMenu {}

@Component({
  template: '<mat-menu aria-labelledby="some-element"></mat-menu>',
})
class StaticAriaLabelledByMenu {}

@Component({
  template: '<mat-menu aria-describedby="some-element"></mat-menu>',
})
class StaticAriaDescribedbyMenu {}

@Component({
  template: `
    <button [matMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <mat-menu #menu="matMenu">
      <button *ngFor="let item of items" mat-menu-item>{{item}}</button>
    </mat-menu>
  `,
})
class MenuWithRepeatedItems {
  @ViewChild(MatMenuTrigger, {static: false}) trigger: MatMenuTrigger;
  @ViewChild('triggerEl', {static: false}) triggerEl: ElementRef<HTMLElement>;
  @ViewChild(MatMenu, {static: false}) menu: MatMenu;
  items = ['One', 'Two', 'Three'];
}
