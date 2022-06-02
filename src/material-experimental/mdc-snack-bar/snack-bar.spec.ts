import {LiveAnnouncer} from '@angular/cdk/a11y';
import {OverlayContainer} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {
  Component,
  Directive,
  Inject,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, inject, TestBed, tick} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
  MAT_SNACK_BAR_DATA,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  SimpleSnackBar,
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarContainer,
  MatSnackBarModule,
  MatSnackBarRef,
} from './index';
import {Platform} from '@angular/cdk/platform';

describe('MatSnackBar', () => {
  let snackBar: MatSnackBar;
  let liveAnnouncer: LiveAnnouncer;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  let simpleMessage = 'Burritos are here!';
  let simpleActionLabel = 'pickup';

  const announceDelay = 150;
  const animationFrameDelay = 16;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, CommonModule, NoopAnimationsModule],
      declarations: [
        ComponentWithChildViewContainer,
        BurritosNotification,
        DirectiveWithViewContainer,
      ],
    }).compileComponents();
  }));

  beforeEach(inject(
    [MatSnackBar, LiveAnnouncer, OverlayContainer],
    (sb: MatSnackBar, la: LiveAnnouncer, oc: OverlayContainer) => {
      snackBar = sb;
      liveAnnouncer = la;
      overlayContainerElement = oc.getContainerElement();
    },
  ));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should open with content first in the inert region', () => {
    snackBar.open('Snack time!', 'Chew');
    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
    const inertElement = containerElement.querySelector('[aria-hidden]')!;

    expect(inertElement.getAttribute('aria-hidden'))
      .withContext('Expected the non-live region to be aria-hidden')
      .toBe('true');
    expect(inertElement.textContent)
      .withContext('Expected non-live region to contain the snack bar content')
      .toContain('Snack time!');

    const liveElement = containerElement.querySelector('[aria-live]')!;
    expect(liveElement.childNodes.length)
      .withContext('Expected live region to not contain any content')
      .toBe(0);
  });

  it('should move content to the live region after 150ms', fakeAsync(() => {
    snackBar.open('Snack time!', 'Chew');
    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
    const liveElement = containerElement.querySelector('[aria-live]')!;
    tick(announceDelay);

    expect(liveElement.textContent)
      .withContext('Expected live region to contain the snack bar content')
      .toContain('Snack time!');

    const inertElement = containerElement.querySelector('[aria-hidden]')!;
    expect(inertElement)
      .withContext('Expected non-live region to not contain any content')
      .toBeFalsy();
    flush();
  }));

  it('should preserve focus when moving content to the live region', fakeAsync(() => {
    snackBar.open('Snack time!', 'Chew');
    viewContainerFixture.detectChanges();
    tick(animationFrameDelay);

    const actionButton = overlayContainerElement.querySelector(
      '.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-action',
    )! as HTMLElement;
    actionButton.focus();
    expect(document.activeElement)
      .withContext('Expected the focus to move to the action button')
      .toBe(actionButton);

    flush();
    expect(document.activeElement)
      .withContext('Expected the focus to remain on the action button')
      .toBe(actionButton);
  }));

  it(
    'should have aria-live of `assertive` with an `assertive` politeness if no announcement ' +
      'message is provided',
    () => {
      snackBar.openFromComponent(BurritosNotification, {
        announcementMessage: '',
        politeness: 'assertive',
      });

      viewContainerFixture.detectChanges();

      const containerElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
      const liveElement = containerElement.querySelector('[aria-live]')!;

      expect(liveElement.getAttribute('aria-live'))
        .withContext('Expected snack bar container live region to have aria-live="assertive"')
        .toBe('assertive');
    },
  );

  it(
    'should have aria-live of `polite` with an `assertive` politeness if an announcement ' +
      'message is provided',
    () => {
      snackBar.openFromComponent(BurritosNotification, {
        announcementMessage: 'Yay Burritos',
        politeness: 'assertive',
      });
      viewContainerFixture.detectChanges();

      const containerElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
      const liveElement = containerElement.querySelector('[aria-live]')!;

      expect(liveElement.getAttribute('aria-live'))
        .withContext('Expected snack bar container live region to have aria-live="polite"')
        .toBe('polite');
    },
  );

  it('should have aria-live of `polite` with a `polite` politeness', () => {
    snackBar.openFromComponent(BurritosNotification, {politeness: 'polite'});
    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
    const liveElement = containerElement.querySelector('[aria-live]')!;

    expect(liveElement.getAttribute('aria-live'))
      .withContext('Expected snack bar container live region to have aria-live="polite"')
      .toBe('polite');
  });

  it('should have aria-live of `off` if the politeness is turned off', () => {
    snackBar.openFromComponent(BurritosNotification, {politeness: 'off'});
    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
    const liveElement = containerElement.querySelector('[aria-live]')!;

    expect(liveElement.getAttribute('aria-live'))
      .withContext('Expected snack bar container live region to have aria-live="off"')
      .toBe('off');
  });

  it('should have role of `alert` with an `assertive` politeness (Firefox only)', () => {
    const platform = TestBed.inject(Platform);
    snackBar.openFromComponent(BurritosNotification, {politeness: 'assertive'});
    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
    const liveElement = containerElement.querySelector('[aria-live]')!;

    expect(liveElement.getAttribute('role')).toBe(platform.FIREFOX ? 'alert' : null);
  });

  it('should have role of `status` with an `polite` politeness (Firefox only)', () => {
    const platform = TestBed.inject(Platform);
    snackBar.openFromComponent(BurritosNotification, {politeness: 'polite'});
    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
    const liveElement = containerElement.querySelector('[aria-live]')!;

    expect(liveElement.getAttribute('role')).toBe(platform.FIREFOX ? 'status' : null);
  });

  it('should have exactly one MDC label element when opened through simple snack bar', () => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    snackBar.open(simpleMessage, simpleActionLabel, config);
    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelectorAll('.mdc-snackbar__label').length).toBe(1);
  });

  it('should open and close a snackbar without a ViewContainerRef', fakeAsync(() => {
    let snackBarRef = snackBar.open('Snack time!', 'Chew');
    viewContainerFixture.detectChanges();

    let messageElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
    expect(messageElement.textContent)
      .withContext('Expected snack bar to show a message without a ViewContainerRef')
      .toContain('Snack time!');

    snackBarRef.dismiss();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childNodes.length)
      .withContext('Expected snack bar to be dismissed without a ViewContainerRef')
      .toBe(0);
  }));

  it('should open a simple message with a button', () => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let snackBarRef = snackBar.open(simpleMessage, simpleActionLabel, config);

    viewContainerFixture.detectChanges();

    expect(snackBarRef.instance instanceof SimpleSnackBar)
      .withContext('Expected the snack bar content component to be SimpleSnackBar')
      .toBe(true);
    expect(snackBarRef.instance.snackBarRef)
      .withContext('Expected the snack bar reference to be placed in the component instance')
      .toBe(snackBarRef);

    let messageElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
    expect(messageElement.textContent)
      .withContext(`Expected the snack bar message to be '${simpleMessage}'`)
      .toContain(simpleMessage);

    let buttonElement = overlayContainerElement.querySelector('button.mat-mdc-button')!;
    expect(buttonElement.tagName)
      .withContext('Expected snack bar action label to be a <button>')
      .toBe('BUTTON');
    expect((buttonElement.textContent || '').trim())
      .withContext(`Expected the snack bar action label to be '${simpleActionLabel}'`)
      .toBe(simpleActionLabel);
  });

  it('should open a simple message with no button', () => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let snackBarRef = snackBar.open(simpleMessage, undefined, config);

    viewContainerFixture.detectChanges();

    expect(snackBarRef.instance instanceof SimpleSnackBar)
      .withContext('Expected the snack bar content component to be SimpleSnackBar')
      .toBe(true);
    expect(snackBarRef.instance.snackBarRef)
      .withContext('Expected the snack bar reference to be placed in the component instance')
      .toBe(snackBarRef);

    let messageElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;
    expect(messageElement.textContent)
      .withContext(`Expected the snack bar message to be '${simpleMessage}'`)
      .toContain(simpleMessage);
    expect(overlayContainerElement.querySelector('button.mat-mdc-button'))
      .withContext('Expected the query selection for action label to be null')
      .toBeNull();
  });

  it('should dismiss the snack bar and remove itself from the view', fakeAsync(() => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let dismissCompleteSpy = jasmine.createSpy('dismiss complete spy');

    let snackBarRef = snackBar.open(simpleMessage, undefined, config);
    viewContainerFixture.detectChanges();
    flush();
    expect(overlayContainerElement.childElementCount)
      .withContext('Expected overlay container element to have at least one child')
      .toBeGreaterThan(0);

    snackBarRef.afterDismissed().subscribe({complete: dismissCompleteSpy});
    const messageElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;

    snackBarRef.dismiss();
    viewContainerFixture.detectChanges();
    expect(messageElement.hasAttribute('mat-exit'))
      .withContext('Expected the snackbar container to have the "exit" attribute upon dismiss')
      .toBe(true);

    flush();

    expect(dismissCompleteSpy).toHaveBeenCalled();
    expect(overlayContainerElement.childElementCount)
      .withContext('Expected the overlay container element to have no child elements')
      .toBe(0);
  }));

  it('should clear the announcement message if it is the same as main message', fakeAsync(() => {
    spyOn(liveAnnouncer, 'announce');

    snackBar.open(simpleMessage, undefined, {announcementMessage: simpleMessage});
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount)
      .withContext('Expected the overlay with the default announcement message to be added')
      .toBe(1);

    expect(liveAnnouncer.announce).not.toHaveBeenCalled();
  }));

  it('should be able to specify a custom announcement message', fakeAsync(() => {
    spyOn(liveAnnouncer, 'announce');

    snackBar.open(simpleMessage, '', {
      announcementMessage: 'Custom announcement',
      politeness: 'assertive',
    });
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount)
      .withContext('Expected the overlay with a custom `announcementMessage` to be added')
      .toBe(1);

    expect(liveAnnouncer.announce).toHaveBeenCalledWith('Custom announcement', 'assertive');
  }));

  it('should be able to get dismissed through the service', fakeAsync(() => {
    snackBar.open(simpleMessage);
    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    snackBar.dismiss();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount).toBe(0);
  }));

  it('should clean itself up when the view container gets destroyed', fakeAsync(() => {
    snackBar.open(simpleMessage, undefined, {viewContainerRef: testViewContainerRef});
    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    viewContainerFixture.componentInstance.childComponentExists = false;
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount)
      .withContext('Expected snack bar to be removed after the view container was destroyed')
      .toBe(0);
  }));

  it('should set the animation state to visible on entry', () => {
    const config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    const snackBarRef = snackBar.open(simpleMessage, undefined, config);

    viewContainerFixture.detectChanges();
    const container = snackBarRef.containerInstance as MatSnackBarContainer;
    expect(container._animationState)
      .withContext(`Expected the animation state would be 'visible'.`)
      .toBe('visible');
    snackBarRef.dismiss();

    viewContainerFixture.detectChanges();
    expect(container._animationState)
      .withContext(`Expected the animation state would be 'hidden'.`)
      .toBe('hidden');
  });

  it('should set the animation state to complete on exit', () => {
    const config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    const snackBarRef = snackBar.open(simpleMessage, undefined, config);
    snackBarRef.dismiss();

    viewContainerFixture.detectChanges();
    const container = snackBarRef.containerInstance as MatSnackBarContainer;
    expect(container._animationState)
      .withContext(`Expected the animation state would be 'hidden'.`)
      .toBe('hidden');
  });

  it(`should set the old snack bar animation state to complete and the new snack bar animation
      state to visible on entry of new snack bar`, fakeAsync(() => {
    const config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    const snackBarRef = snackBar.open(simpleMessage, undefined, config);
    const dismissCompleteSpy = jasmine.createSpy('dismiss complete spy');

    viewContainerFixture.detectChanges();
    const container1 = snackBarRef.containerInstance as MatSnackBarContainer;
    expect(container1._animationState)
      .withContext(`Expected the animation state would be 'visible'.`)
      .toBe('visible');

    const config2 = {viewContainerRef: testViewContainerRef};
    const snackBarRef2 = snackBar.open(simpleMessage, undefined, config2);

    viewContainerFixture.detectChanges();
    snackBarRef.afterDismissed().subscribe({complete: dismissCompleteSpy});
    flush();

    expect(dismissCompleteSpy).toHaveBeenCalled();
    const container2 = snackBarRef2.containerInstance as MatSnackBarContainer;
    expect(container1._animationState)
      .withContext(`Expected the animation state would be 'hidden'.`)
      .toBe('hidden');
    expect(container2._animationState)
      .withContext(`Expected the animation state would be 'visible'.`)
      .toBe('visible');
  }));

  it('should open a new snackbar after dismissing a previous snackbar', fakeAsync(() => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let snackBarRef = snackBar.open(simpleMessage, 'Dismiss', config);

    viewContainerFixture.detectChanges();

    snackBarRef.dismiss();
    viewContainerFixture.detectChanges();

    // Wait for the snackbar dismiss animation to finish.
    flush();
    snackBar.open('Second snackbar');
    viewContainerFixture.detectChanges();

    // Wait for the snackbar open animation to finish.
    flush();
    expect(overlayContainerElement.textContent!.trim()).toBe('Second snackbar');
  }));

  it('should remove past snackbars when opening new snackbars', fakeAsync(() => {
    snackBar.open('First snackbar');
    viewContainerFixture.detectChanges();

    snackBar.open('Second snackbar');
    viewContainerFixture.detectChanges();
    flush();

    snackBar.open('Third snackbar');
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent!.trim()).toBe('Third snackbar');
  }));

  it('should remove snackbar if another is shown while its still animating open', fakeAsync(() => {
    snackBar.open('First snackbar');
    viewContainerFixture.detectChanges();

    snackBar.open('Second snackbar');
    viewContainerFixture.detectChanges();

    flush();
    expect(overlayContainerElement.textContent!.trim()).toBe('Second snackbar');
  }));

  it('should dismiss the snackbar when the action is called, notifying of both action and dismiss', fakeAsync(() => {
    const dismissNextSpy = jasmine.createSpy('dismiss next spy');
    const dismissCompleteSpy = jasmine.createSpy('dismiss complete spy');
    const actionNextSpy = jasmine.createSpy('action next spy');
    const actionCompleteSpy = jasmine.createSpy('action complete spy');
    const snackBarRef = snackBar.open('Some content', 'Dismiss');
    viewContainerFixture.detectChanges();

    snackBarRef.afterDismissed().subscribe({next: dismissNextSpy, complete: dismissCompleteSpy});
    snackBarRef.onAction().subscribe({next: actionNextSpy, complete: actionCompleteSpy});

    const actionButton = overlayContainerElement.querySelector(
      'button.mat-mdc-button',
    ) as HTMLButtonElement;
    actionButton.click();
    viewContainerFixture.detectChanges();
    tick();

    expect(dismissNextSpy).toHaveBeenCalled();
    expect(dismissCompleteSpy).toHaveBeenCalled();
    expect(actionNextSpy).toHaveBeenCalled();
    expect(actionCompleteSpy).toHaveBeenCalled();

    tick(500);
  }));

  it('should allow manually dismissing with an action', fakeAsync(() => {
    const dismissCompleteSpy = jasmine.createSpy('dismiss complete spy');
    const actionCompleteSpy = jasmine.createSpy('action complete spy');
    const snackBarRef = snackBar.open('Some content');
    viewContainerFixture.detectChanges();

    snackBarRef.afterDismissed().subscribe({complete: dismissCompleteSpy});
    snackBarRef.onAction().subscribe({complete: actionCompleteSpy});

    snackBarRef.dismissWithAction();
    flush();

    expect(dismissCompleteSpy).toHaveBeenCalled();
    expect(actionCompleteSpy).toHaveBeenCalled();
  }));

  it('should indicate in `afterClosed` whether it was dismissed by an action', fakeAsync(() => {
    const dismissSpy = jasmine.createSpy('dismiss spy');
    const snackBarRef = snackBar.open('Some content');
    viewContainerFixture.detectChanges();

    snackBarRef.afterDismissed().subscribe(dismissSpy);
    snackBarRef.dismissWithAction();
    flush();

    expect(dismissSpy).toHaveBeenCalledWith(jasmine.objectContaining({dismissedByAction: true}));
  }));

  it('should complete the onAction stream when not closing via an action', fakeAsync(() => {
    const actionCompleteSpy = jasmine.createSpy('action complete spy');
    const snackBarRef = snackBar.open('Some content');
    viewContainerFixture.detectChanges();

    snackBarRef.onAction().subscribe({complete: actionCompleteSpy});
    snackBarRef.dismiss();
    viewContainerFixture.detectChanges();
    flush();

    expect(actionCompleteSpy).toHaveBeenCalled();
  }));

  it('should dismiss automatically after a specified timeout', fakeAsync(() => {
    const config = new MatSnackBarConfig();
    config.duration = 250;
    const snackBarRef = snackBar.open('content', 'test', config);
    const afterDismissSpy = jasmine.createSpy('after dismiss spy');
    snackBarRef.afterDismissed().subscribe(afterDismissSpy);

    viewContainerFixture.detectChanges();
    tick();
    expect(afterDismissSpy).not.toHaveBeenCalled();

    tick(1000);
    viewContainerFixture.detectChanges();
    tick();
    expect(afterDismissSpy).toHaveBeenCalled();
  }));

  it('should clear the dismiss timeout when dismissed before timeout expiration', fakeAsync(() => {
    let config = new MatSnackBarConfig();
    config.duration = 1000;
    snackBar.open('content', 'test', config);

    setTimeout(() => snackBar.dismiss(), 500);

    tick(600);
    flush();

    expect(viewContainerFixture.isStable()).toBe(true);
  }));

  it('should clear the dismiss timeout when dismissed with action', fakeAsync(() => {
    let config = new MatSnackBarConfig();
    config.duration = 1000;
    const snackBarRef = snackBar.open('content', 'test', config);

    setTimeout(() => snackBarRef.dismissWithAction(), 500);

    tick(600);
    viewContainerFixture.detectChanges();
    tick();

    expect(viewContainerFixture.isStable()).toBe(true);
  }));

  it('should add extra classes to the container', () => {
    snackBar.open(simpleMessage, simpleActionLabel, {panelClass: ['one', 'two']});
    viewContainerFixture.detectChanges();

    let containerClasses =
      overlayContainerElement.querySelector('mat-snack-bar-container')!.classList;

    expect(containerClasses).toContain('one');
    expect(containerClasses).toContain('two');
  });

  it('should set the layout direction', () => {
    snackBar.open(simpleMessage, simpleActionLabel, {direction: 'rtl'});
    viewContainerFixture.detectChanges();

    let pane = overlayContainerElement.querySelector('.cdk-global-overlay-wrapper')!;

    expect(pane.getAttribute('dir'))
      .withContext('Expected the pane to be in RTL mode.')
      .toBe('rtl');
  });

  it('should be able to override the default config', fakeAsync(() => {
    viewContainerFixture.destroy();

    TestBed.resetTestingModule()
      .overrideProvider(MAT_SNACK_BAR_DEFAULT_OPTIONS, {
        deps: [],
        useFactory: () => ({panelClass: 'custom-class'}),
      })
      .configureTestingModule({imports: [MatSnackBarModule, NoopAnimationsModule]})
      .compileComponents();

    inject([MatSnackBar, OverlayContainer], (sb: MatSnackBar, oc: OverlayContainer) => {
      snackBar = sb;
      overlayContainerElement = oc.getContainerElement();
    })();

    snackBar.open(simpleMessage);
    flush();

    expect(overlayContainerElement.querySelector('mat-snack-bar-container')!.classList)
      .withContext('Expected class applied through the defaults to be applied.')
      .toContain('custom-class');
  }));

  it('should dismiss the open snack bar on destroy', fakeAsync(() => {
    snackBar.open(simpleMessage);
    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    snackBar.ngOnDestroy();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount).toBe(0);
  }));

  it('should cap the timeout to the maximum accepted delay in setTimeout', fakeAsync(() => {
    const config = new MatSnackBarConfig();
    config.duration = Infinity;
    snackBar.open('content', 'test', config);
    viewContainerFixture.detectChanges();
    spyOn(window, 'setTimeout').and.callThrough();
    tick(100);

    expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), Math.pow(2, 31) - 1);

    flush();
  }));

  it('should only keep one snack bar in the DOM if multiple are opened at the same time', fakeAsync(() => {
    for (let i = 0; i < 10; i++) {
      snackBar.open('Snack time!', 'Chew');
      viewContainerFixture.detectChanges();
    }

    flush();
    expect(overlayContainerElement.querySelectorAll('mat-snack-bar-container').length).toBe(1);
  }));

  describe('with custom component', () => {
    it('should open a custom component', () => {
      const snackBarRef = snackBar.openFromComponent(BurritosNotification);

      expect(snackBarRef.instance instanceof BurritosNotification)
        .withContext('Expected the snack bar content component to be BurritosNotification')
        .toBe(true);
      expect(overlayContainerElement.textContent!.trim())
        .withContext('Expected component to have the proper text.')
        .toBe('Burritos are on the way.');
    });

    it('should inject the snack bar reference into the component', () => {
      const snackBarRef = snackBar.openFromComponent(BurritosNotification);

      expect(snackBarRef.instance.snackBarRef)
        .withContext('Expected component to have an injected snack bar reference.')
        .toBe(snackBarRef);
    });

    it('should have exactly one MDC label element', () => {
      snackBar.openFromComponent(BurritosNotification);
      viewContainerFixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.mdc-snackbar__label').length).toBe(1);
    });

    it('should be able to inject arbitrary user data', () => {
      const snackBarRef = snackBar.openFromComponent(BurritosNotification, {
        data: {
          burritoType: 'Chimichanga',
        },
      });

      expect(snackBarRef.instance.data)
        .withContext('Expected component to have a data object.')
        .toBeTruthy();
      expect(snackBarRef.instance.data.burritoType)
        .withContext('Expected the injected data object to be the one the user provided.')
        .toBe('Chimichanga');
    });

    it('should allow manually dismissing with an action', fakeAsync(() => {
      const dismissCompleteSpy = jasmine.createSpy('dismiss complete spy');
      const actionCompleteSpy = jasmine.createSpy('action complete spy');
      const snackBarRef = snackBar.openFromComponent(BurritosNotification);
      viewContainerFixture.detectChanges();

      snackBarRef.afterDismissed().subscribe({complete: dismissCompleteSpy});
      snackBarRef.onAction().subscribe({complete: actionCompleteSpy});

      snackBarRef.dismissWithAction();
      flush();

      expect(dismissCompleteSpy).toHaveBeenCalled();
      expect(actionCompleteSpy).toHaveBeenCalled();
    }));
  });

  describe('with TemplateRef', () => {
    let templateFixture: ComponentFixture<ComponentWithTemplateRef>;

    beforeEach(() => {
      templateFixture = TestBed.createComponent(ComponentWithTemplateRef);
      templateFixture.detectChanges();
    });

    it('should be able to open a snack bar using a TemplateRef', () => {
      templateFixture.componentInstance.localValue = 'Pizza';
      snackBar.openFromTemplate(templateFixture.componentInstance.templateRef);
      templateFixture.detectChanges();

      const containerElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;

      expect(containerElement.textContent).toContain('Fries');
      expect(containerElement.textContent).toContain('Pizza');

      templateFixture.componentInstance.localValue = 'Pasta';
      templateFixture.detectChanges();

      expect(containerElement.textContent).toContain('Pasta');
    });

    it('should be able to pass in contextual data when opening with a TemplateRef', () => {
      snackBar.openFromTemplate(templateFixture.componentInstance.templateRef, {
        data: {value: 'Oranges'},
      });
      templateFixture.detectChanges();

      const containerElement = overlayContainerElement.querySelector('mat-snack-bar-container')!;

      expect(containerElement.textContent).toContain('Oranges');
    });
  });
});

describe('MatSnackBar with parent MatSnackBar', () => {
  let parentSnackBar: MatSnackBar;
  let childSnackBar: MatSnackBar;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ComponentThatProvidesMatSnackBar>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, CommonModule, NoopAnimationsModule],
      declarations: [ComponentThatProvidesMatSnackBar, DirectiveWithViewContainer],
    }).compileComponents();
  }));

  beforeEach(inject([MatSnackBar, OverlayContainer], (sb: MatSnackBar, oc: OverlayContainer) => {
    parentSnackBar = sb;
    overlayContainerElement = oc.getContainerElement();

    fixture = TestBed.createComponent(ComponentThatProvidesMatSnackBar);
    childSnackBar = fixture.componentInstance.snackBar;
    fixture.detectChanges();
  }));

  it('should close snackBars opened by parent when opening from child', fakeAsync(() => {
    parentSnackBar.open('Pizza');
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
      .withContext('Expected a snackBar to be opened')
      .toContain('Pizza');

    childSnackBar.open('Taco');
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
      .withContext('Expected parent snackbar msg to be dismissed by opening from child')
      .toContain('Taco');
  }));

  it('should close snackBars opened by child when opening from parent', fakeAsync(() => {
    childSnackBar.open('Pizza');
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
      .withContext('Expected a snackBar to be opened')
      .toContain('Pizza');

    parentSnackBar.open('Taco');
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
      .withContext('Expected child snackbar msg to be dismissed by opening from parent')
      .toContain('Taco');
  }));

  it('should not dismiss parent snack bar if child is destroyed', fakeAsync(() => {
    parentSnackBar.open('Pizza');
    fixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    childSnackBar.ngOnDestroy();
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);
  }));
});

describe('MatSnackBar Positioning', () => {
  let snackBar: MatSnackBar;
  let overlayContainerEl: HTMLElement;

  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  let simpleMessage = 'Burritos are here!';
  let simpleActionLabel = 'pickup';

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, CommonModule, NoopAnimationsModule],
      declarations: [ComponentWithChildViewContainer, DirectiveWithViewContainer],
    }).compileComponents();
  }));

  beforeEach(inject([MatSnackBar, OverlayContainer], (sb: MatSnackBar, oc: OverlayContainer) => {
    snackBar = sb;
    overlayContainerEl = oc.getContainerElement();
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);
    viewContainerFixture.detectChanges();
  });

  it('should default to bottom center', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel);

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginTop).withContext('Expected margin-top to be ""').toBe('');
    expect(overlayPaneEl.style.marginRight).withContext('Expected margin-right to be ""').toBe('');
    expect(overlayPaneEl.style.marginLeft).withContext('Expected margin-left  to be ""').toBe('');
  }));

  it('should be in the bottom left corner', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'bottom',
      horizontalPosition: 'left',
    });

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginTop).withContext('Expected margin-top to be ""').toBe('');
    expect(overlayPaneEl.style.marginRight).withContext('Expected margin-right to be ""').toBe('');
    expect(overlayPaneEl.style.marginLeft)
      .withContext('Expected margin-left  to be "0px"')
      .toBe('0px');
  }));

  it('should be in the bottom right corner', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
    });

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginTop).withContext('Expected margin-top to be ""').toBe('');
    expect(overlayPaneEl.style.marginRight)
      .withContext('Expected margin-right to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginLeft).withContext('Expected margin-left  to be ""').toBe('');
  }));

  it('should be in the bottom center', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginTop).withContext('Expected margin-top to be ""').toBe('');
    expect(overlayPaneEl.style.marginRight).withContext('Expected margin-right to be ""').toBe('');
    expect(overlayPaneEl.style.marginLeft).withContext('Expected margin-left  to be ""').toBe('');
  }));

  it('should be in the top left corner', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'left',
    });

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be ""')
      .toBe('');
    expect(overlayPaneEl.style.marginTop)
      .withContext('Expected margin-top to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginRight).withContext('Expected margin-right to be ""').toBe('');
    expect(overlayPaneEl.style.marginLeft)
      .withContext('Expected margin-left  to be "0px"')
      .toBe('0px');
  }));

  it('should be in the top right corner', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be ""')
      .toBe('');
    expect(overlayPaneEl.style.marginTop)
      .withContext('Expected margin-top to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginRight)
      .withContext('Expected margin-right to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginLeft).withContext('Expected margin-left  to be ""').toBe('');
  }));

  it('should be in the top center', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be ""')
      .toBe('');
    expect(overlayPaneEl.style.marginTop)
      .withContext('Expected margin-top to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginRight).withContext('Expected margin-right to be ""').toBe('');
    expect(overlayPaneEl.style.marginLeft).withContext('Expected margin-left  to be ""').toBe('');
  }));

  it('should handle start based on direction (rtl)', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'start',
      direction: 'rtl',
    });

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be ""')
      .toBe('');
    expect(overlayPaneEl.style.marginTop)
      .withContext('Expected margin-top to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginRight)
      .withContext('Expected margin-right to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginLeft).withContext('Expected margin-left  to be ""').toBe('');
  }));

  it('should handle start based on direction (ltr)', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'start',
      direction: 'ltr',
    });

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be ""')
      .toBe('');
    expect(overlayPaneEl.style.marginTop)
      .withContext('Expected margin-top to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginRight).withContext('Expected margin-right to be ""').toBe('');
    expect(overlayPaneEl.style.marginLeft)
      .withContext('Expected margin-left  to be "0px"')
      .toBe('0px');
  }));

  it('should handle end based on direction (rtl)', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'end',
      direction: 'rtl',
    });

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be ""')
      .toBe('');
    expect(overlayPaneEl.style.marginTop)
      .withContext('Expected margin-top to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginRight).withContext('Expected margin-right to be ""').toBe('');
    expect(overlayPaneEl.style.marginLeft)
      .withContext('Expected margin-left  to be "0px"')
      .toBe('0px');
  }));

  it('should handle end based on direction (ltr)', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'end',
      direction: 'ltr',
    });

    viewContainerFixture.detectChanges();
    flush();

    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPaneEl.style.marginBottom)
      .withContext('Expected margin-bottom to be ""')
      .toBe('');
    expect(overlayPaneEl.style.marginTop)
      .withContext('Expected margin-top to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginRight)
      .withContext('Expected margin-right to be "0px"')
      .toBe('0px');
    expect(overlayPaneEl.style.marginLeft).withContext('Expected margin-left  to be ""').toBe('');
  }));
});

@Directive({selector: 'dir-with-view-container'})
class DirectiveWithViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
  selector: 'arbitrary-component',
  template: `<dir-with-view-container *ngIf="childComponentExists"></dir-with-view-container>`,
})
class ComponentWithChildViewContainer {
  @ViewChild(DirectiveWithViewContainer) childWithViewContainer: DirectiveWithViewContainer;

  childComponentExists: boolean = true;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

@Component({
  selector: 'arbitrary-component-with-template-ref',
  template: `
    <ng-template let-data>
      Fries {{localValue}} {{data?.value}}
    </ng-template>
  `,
})
class ComponentWithTemplateRef {
  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  localValue: string;
}

/** Simple component for testing ComponentPortal. */
@Component({template: '<p>Burritos are on the way.</p>'})
class BurritosNotification {
  constructor(
    public snackBarRef: MatSnackBarRef<BurritosNotification>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
  ) {}
}

@Component({
  template: '',
  providers: [MatSnackBar],
})
class ComponentThatProvidesMatSnackBar {
  constructor(public snackBar: MatSnackBar) {}
}
