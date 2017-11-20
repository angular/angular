import {
  inject,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
} from '@angular/core/testing';
import {NgModule, Component, Directive, ViewChild, ViewContainerRef, Inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {OverlayContainer} from '@angular/cdk/overlay';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {
  MatSnackBarModule,
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
  SimpleSnackBar,
  MAT_SNACK_BAR_DATA,
} from './index';

describe('MatSnackBar', () => {
  let snackBar: MatSnackBar;
  let liveAnnouncer: LiveAnnouncer;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  let simpleMessage = 'Burritos are here!';
  let simpleActionLabel = 'pickup';

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, SnackBarTestModule, NoopAnimationsModule],
    }).compileComponents();
  }));

  beforeEach(inject([MatSnackBar, LiveAnnouncer, OverlayContainer],
    (sb: MatSnackBar, la: LiveAnnouncer, oc: OverlayContainer) => {
    snackBar = sb;
    liveAnnouncer = la;
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
    liveAnnouncer.ngOnDestroy();
  });

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should have the role of alert', () => {
    snackBar.open(simpleMessage, simpleActionLabel);

    let containerElement = overlayContainerElement.querySelector('snack-bar-container')!;
    expect(containerElement.getAttribute('role'))
        .toBe('alert', 'Expected snack bar container to have role="alert"');
   });

   it('should open and close a snackbar without a ViewContainerRef', fakeAsync(() => {
      let snackBarRef = snackBar.open('Snack time!', 'Chew');
      viewContainerFixture.detectChanges();

      let messageElement = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Snack time!',
         'Expected snack bar to show a message without a ViewContainerRef');

      snackBarRef.dismiss();
      viewContainerFixture.detectChanges();
      flush();

      expect(overlayContainerElement.childNodes.length)
          .toBe(0, 'Expected snack bar to be dismissed without a ViewContainerRef');
   }));

  it('should open a simple message with a button', () => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let snackBarRef = snackBar.open(simpleMessage, simpleActionLabel, config);

    viewContainerFixture.detectChanges();

    expect(snackBarRef.instance instanceof SimpleSnackBar)
      .toBe(true, 'Expected the snack bar content component to be SimpleSnackBar');
    expect(snackBarRef.instance.snackBarRef)
      .toBe(snackBarRef,
            'Expected the snack bar reference to be placed in the component instance');

    let messageElement = overlayContainerElement.querySelector('snack-bar-container')!;
    expect(messageElement.textContent)
        .toContain(simpleMessage, `Expected the snack bar message to be '${simpleMessage}'`);

    let buttonElement = overlayContainerElement.querySelector('button.mat-simple-snackbar-action')!;
    expect(buttonElement.tagName)
        .toBe('BUTTON', 'Expected snack bar action label to be a <button>');
    expect(buttonElement.textContent)
        .toBe(simpleActionLabel,
              `Expected the snack bar action label to be '${simpleActionLabel}'`);
  });

  it('should open a simple message with no button', () => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let snackBarRef = snackBar.open(simpleMessage, undefined, config);

    viewContainerFixture.detectChanges();

    expect(snackBarRef.instance instanceof SimpleSnackBar)
      .toBe(true, 'Expected the snack bar content component to be SimpleSnackBar');
    expect(snackBarRef.instance.snackBarRef)
      .toBe(snackBarRef, 'Expected the snack bar reference to be placed in the component instance');

    let messageElement = overlayContainerElement.querySelector('snack-bar-container')!;
    expect(messageElement.textContent)
        .toContain(simpleMessage, `Expected the snack bar message to be '${simpleMessage}'`);
    expect(overlayContainerElement.querySelector('button.mat-simple-snackbar-action'))
        .toBeNull('Expected the query selection for action label to be null');
  });

  it('should dismiss the snack bar and remove itself from the view', fakeAsync(() => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let dismissCompleteSpy = jasmine.createSpy('dismiss complete spy');

    let snackBarRef = snackBar.open(simpleMessage, undefined, config);
    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.childElementCount)
        .toBeGreaterThan(0, 'Expected overlay container element to have at least one child');

    snackBarRef.afterDismissed().subscribe(undefined, undefined, dismissCompleteSpy);

    snackBarRef.dismiss();
    viewContainerFixture.detectChanges();  // Run through animations for dismissal
    flush();

    expect(dismissCompleteSpy).toHaveBeenCalled();
    expect(overlayContainerElement.childElementCount)
        .toBe(0, 'Expected the overlay container element to have no child elements');
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
    snackBar.open(simpleMessage, undefined, { viewContainerRef: testViewContainerRef });
    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    viewContainerFixture.componentInstance.childComponentExists = false;
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount)
        .toBe(0, 'Expected snack bar to be removed after the view container was destroyed');
  }));

  it('should set the animation state to visible on entry', () => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let snackBarRef = snackBar.open(simpleMessage, undefined, config);

    viewContainerFixture.detectChanges();
    expect(snackBarRef.containerInstance._animationState)
        .toBe('visible-bottom', `Expected the animation state would be 'visible-bottom'.`);
    snackBarRef.dismiss();

    viewContainerFixture.detectChanges();
    expect(snackBarRef.containerInstance._animationState)
        .toBe('hidden-bottom', `Expected the animation state would be 'hidden-bottom'.`);
  });

  it('should set the animation state to complete on exit', () => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let snackBarRef = snackBar.open(simpleMessage, undefined, config);
    snackBarRef.dismiss();

    viewContainerFixture.detectChanges();
    expect(snackBarRef.containerInstance._animationState)
        .toBe('hidden-bottom', `Expected the animation state would be 'hidden-bottom'.`);
  });

  it(`should set the old snack bar animation state to complete and the new snack bar animation
      state to visible on entry of new snack bar`, fakeAsync(() => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let snackBarRef = snackBar.open(simpleMessage, undefined, config);
    let dismissCompleteSpy = jasmine.createSpy('dismiss complete spy');

    viewContainerFixture.detectChanges();
    expect(snackBarRef.containerInstance._animationState)
        .toBe('visible-bottom', `Expected the animation state would be 'visible-bottom'.`);

    let config2 = {viewContainerRef: testViewContainerRef};
    let snackBarRef2 = snackBar.open(simpleMessage, undefined, config2);

    viewContainerFixture.detectChanges();
    snackBarRef.afterDismissed().subscribe(undefined, undefined, dismissCompleteSpy);
    flush();

    expect(dismissCompleteSpy).toHaveBeenCalled();
    expect(snackBarRef.containerInstance._animationState)
        .toBe('hidden-bottom', `Expected the animation state would be 'hidden-bottom'.`);
    expect(snackBarRef2.containerInstance._animationState)
        .toBe('visible-bottom', `Expected the animation state would be 'visible-bottom'.`);
  }));

  it('should open a new snackbar after dismissing a previous snackbar', fakeAsync(() => {
    let config: MatSnackBarConfig = {viewContainerRef: testViewContainerRef};
    let snackBarRef = snackBar.open(simpleMessage, 'Dismiss', config);

    viewContainerFixture.detectChanges();

    snackBarRef.dismiss();
    viewContainerFixture.detectChanges();

    // Wait for the snackbar dismiss animation to finish.
    flush();
    snackBarRef = snackBar.open('Second snackbar', 'Dismiss', config);
    viewContainerFixture.detectChanges();

    // Wait for the snackbar open animation to finish.
    flush();
    expect(snackBarRef.containerInstance._animationState)
        .toBe('visible-bottom', `Expected the animation state would be 'visible-bottom'.`);
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

    tick();
    expect(overlayContainerElement.textContent!.trim()).toBe('Second snackbar');

    // Let remaining animations run.
    tick(500);
  }));

  it('should dismiss the snackbar when the action is called, notifying of both action and dismiss',
     fakeAsync(() => {
      const dismissCompleteSpy = jasmine.createSpy('dismiss complete spy');
      const actionCompleteSpy = jasmine.createSpy('action complete spy');
      const snackBarRef = snackBar.open('Some content', 'Dismiss');
      viewContainerFixture.detectChanges();

      snackBarRef.afterDismissed().subscribe(undefined, undefined, dismissCompleteSpy);
      snackBarRef.onAction().subscribe(undefined, undefined, actionCompleteSpy);

      const actionButton =
        overlayContainerElement.querySelector('.mat-simple-snackbar-action') as HTMLButtonElement;
      actionButton.click();
      viewContainerFixture.detectChanges();
      tick();

      expect(dismissCompleteSpy).toHaveBeenCalled();
      expect(actionCompleteSpy).toHaveBeenCalled();

      tick(500);
    }));

  it('should allow manually closing with an action', fakeAsync(() => {
    const dismissCompleteSpy = jasmine.createSpy('dismiss complete spy');
    const actionCompleteSpy = jasmine.createSpy('action complete spy');
    const snackBarRef = snackBar.open('Some content');
    viewContainerFixture.detectChanges();

    snackBarRef.afterDismissed().subscribe(undefined, undefined, dismissCompleteSpy);
    snackBarRef.onAction().subscribe(undefined, undefined, actionCompleteSpy);

    snackBarRef.closeWithAction();
    viewContainerFixture.detectChanges();
    tick();

    expect(dismissCompleteSpy).toHaveBeenCalled();
    expect(actionCompleteSpy).toHaveBeenCalled();

    tick(500);
  }));

  it('should complete the onAction stream when not closing via an action', fakeAsync(() => {
    const actionCompleteSpy = jasmine.createSpy('action complete spy');
    const snackBarRef = snackBar.open('Some content');
    viewContainerFixture.detectChanges();

    snackBarRef.onAction().subscribe(undefined, undefined, actionCompleteSpy);
    snackBarRef.dismiss();
    viewContainerFixture.detectChanges();
    tick();

    expect(actionCompleteSpy).toHaveBeenCalled();

    tick(500);
  }));

  it('should dismiss automatically after a specified timeout', fakeAsync(() => {
    let config = new MatSnackBarConfig();
    config.duration = 250;
    let snackBarRef = snackBar.open('content', 'test', config);
    let afterDismissSpy = jasmine.createSpy('after dismiss spy');
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
    viewContainerFixture.detectChanges();
    tick();

    expect(viewContainerFixture.isStable()).toBe(true);
  }));

  it('should add extra classes to the container', () => {
    snackBar.open(simpleMessage, simpleActionLabel, { panelClass: ['one', 'two'] });
    viewContainerFixture.detectChanges();

    let containerClasses = overlayContainerElement.querySelector('snack-bar-container')!.classList;

    expect(containerClasses).toContain('one');
    expect(containerClasses).toContain('two');
  });

  it('should set the layout direction', () => {
    snackBar.open(simpleMessage, simpleActionLabel, { direction: 'rtl' });
    viewContainerFixture.detectChanges();

    let pane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;

    expect(pane.getAttribute('dir')).toBe('rtl', 'Expected the pane to be in RTL mode.');
  });

  describe('with custom component', () => {
    it('should open a custom component', () => {
      const snackBarRef = snackBar.openFromComponent(BurritosNotification);

      expect(snackBarRef.instance instanceof BurritosNotification)
        .toBe(true, 'Expected the snack bar content component to be BurritosNotification');
      expect(overlayContainerElement.textContent!.trim())
          .toBe('Burritos are on the way.', 'Expected component to have the proper text.');
    });

    it('should inject the snack bar reference into the component', () => {
      const snackBarRef = snackBar.openFromComponent(BurritosNotification);

      expect(snackBarRef.instance.snackBarRef)
        .toBe(snackBarRef, 'Expected component to have an injected snack bar reference.');
    });

    it('should be able to inject arbitrary user data', () => {
      const snackBarRef = snackBar.openFromComponent(BurritosNotification, {
        data: {
          burritoType: 'Chimichanga'
        }
      });

      expect(snackBarRef.instance.data).toBeTruthy('Expected component to have a data object.');
      expect(snackBarRef.instance.data.burritoType)
        .toBe('Chimichanga', 'Expected the injected data object to be the one the user provided.');
    });

    it('should allow manually closing with an action', fakeAsync(() => {
      const dismissCompleteSpy = jasmine.createSpy('dismiss complete spy');
      const actionCompleteSpy = jasmine.createSpy('action complete spy');
      const snackBarRef = snackBar.openFromComponent(BurritosNotification);
      viewContainerFixture.detectChanges();

      snackBarRef.afterDismissed().subscribe(undefined, undefined, dismissCompleteSpy);
      snackBarRef.onAction().subscribe(undefined, undefined, actionCompleteSpy);

      snackBarRef.closeWithAction();
      viewContainerFixture.detectChanges();
      tick();

      expect(dismissCompleteSpy).toHaveBeenCalled();
      expect(actionCompleteSpy).toHaveBeenCalled();

      tick(500);
    }));

  });

});

describe('MatSnackBar with parent MatSnackBar', () => {
  let parentSnackBar: MatSnackBar;
  let childSnackBar: MatSnackBar;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ComponentThatProvidesMatSnackBar>;
  let liveAnnouncer: LiveAnnouncer;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, SnackBarTestModule, NoopAnimationsModule],
      declarations: [ComponentThatProvidesMatSnackBar],
    }).compileComponents();
  }));

  beforeEach(inject([MatSnackBar, LiveAnnouncer, OverlayContainer],
    (sb: MatSnackBar, la: LiveAnnouncer, oc: OverlayContainer) => {
    parentSnackBar = sb;
    liveAnnouncer = la;
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();

    fixture = TestBed.createComponent(ComponentThatProvidesMatSnackBar);
    childSnackBar = fixture.componentInstance.snackBar;
    fixture.detectChanges();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
    liveAnnouncer.ngOnDestroy();
  });

  it('should close snackBars opened by parent when opening from child', fakeAsync(() => {
    parentSnackBar.open('Pizza');
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
        .toContain('Pizza', 'Expected a snackBar to be opened');

    childSnackBar.open('Taco');
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
        .toContain('Taco', 'Expected parent snackbar msg to be dismissed by opening from child');
  }));

  it('should close snackBars opened by child when opening from parent', fakeAsync(() => {
    childSnackBar.open('Pizza');
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
        .toContain('Pizza', 'Expected a snackBar to be opened');

    parentSnackBar.open('Taco');
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
        .toContain('Taco', 'Expected child snackbar msg to be dismissed by opening from parent');
  }));
});


describe('MatSnackBar Positioning', () => {
  let snackBar: MatSnackBar;
  let liveAnnouncer: LiveAnnouncer;
  let overlayContainer: OverlayContainer;
  let overlayContainerEl: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  let simpleMessage = 'Burritos are here!';
  let simpleActionLabel = 'pickup';

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, SnackBarTestModule, NoopAnimationsModule],
    }).compileComponents();
  }));

  beforeEach(inject([MatSnackBar, LiveAnnouncer, OverlayContainer],
    (sb: MatSnackBar, la: LiveAnnouncer, oc: OverlayContainer) => {
    snackBar = sb;
    liveAnnouncer = la;
    overlayContainer = oc;
    overlayContainerEl = oc.getContainerElement();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
    liveAnnouncer.ngOnDestroy();
  });

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should default to bottom center', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel);

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeTruthy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeFalsy();

    expect(overlayPaneEl.style.marginBottom).toBe('0px', 'Expected margin-bottom to be "0px"');
    expect(overlayPaneEl.style.marginTop).toBe('', 'Expected margin-top to be ""');
    expect(overlayPaneEl.style.marginRight).toBe('', 'Expected margin-right to be ""');
    expect(overlayPaneEl.style.marginLeft).toBe('', 'Expected margin-left  to be ""');
  }));

  it('should be in the bottom left corner', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'bottom',
      horizontalPosition: 'left'
    });

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeFalsy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeFalsy();
    expect(overlayPaneEl.style.marginBottom).toBe('0px', 'Expected margin-bottom to be "0px"');
    expect(overlayPaneEl.style.marginTop).toBe('', 'Expected margin-top to be ""');
    expect(overlayPaneEl.style.marginRight).toBe('', 'Expected margin-right to be ""');
    expect(overlayPaneEl.style.marginLeft).toBe('0px', 'Expected margin-left  to be "0px"');
   }));

   it('should be in the bottom right corner', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'bottom',
      horizontalPosition: 'right'
    });

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeFalsy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeFalsy();
    expect(overlayPaneEl.style.marginBottom).toBe('0px', 'Expected margin-bottom to be "0px"');
    expect(overlayPaneEl.style.marginTop).toBe('', 'Expected margin-top to be ""');
    expect(overlayPaneEl.style.marginRight).toBe('0px', 'Expected margin-right to be "0px"');
    expect(overlayPaneEl.style.marginLeft).toBe('', 'Expected margin-left  to be ""');
   }));

   it('should be in the bottom center', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'bottom',
      horizontalPosition: 'center'
    });

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeTruthy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeFalsy();
    expect(overlayPaneEl.style.marginBottom).toBe('0px', 'Expected margin-bottom to be "0px"');
    expect(overlayPaneEl.style.marginTop).toBe('', 'Expected margin-top to be ""');
    expect(overlayPaneEl.style.marginRight).toBe('', 'Expected margin-right to be ""');
    expect(overlayPaneEl.style.marginLeft).toBe('', 'Expected margin-left  to be ""');
   }));

   it('should be in the top left corner', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'left'
    });

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeFalsy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeTruthy();
    expect(overlayPaneEl.style.marginBottom).toBe('', 'Expected margin-bottom to be ""');
    expect(overlayPaneEl.style.marginTop).toBe('0px', 'Expected margin-top to be "0px"');
    expect(overlayPaneEl.style.marginRight).toBe('', 'Expected margin-right to be ""');
    expect(overlayPaneEl.style.marginLeft).toBe('0px', 'Expected margin-left  to be "0px"');
   }));

   it('should be in the top right corner', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeFalsy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeTruthy();
    expect(overlayPaneEl.style.marginBottom).toBe('', 'Expected margin-bottom to be ""');
    expect(overlayPaneEl.style.marginTop).toBe('0px', 'Expected margin-top to be "0px"');
    expect(overlayPaneEl.style.marginRight).toBe('0px', 'Expected margin-right to be "0px"');
    expect(overlayPaneEl.style.marginLeft).toBe('', 'Expected margin-left  to be ""');
   }));

   it('should be in the top center', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeTruthy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeTruthy();
    expect(overlayPaneEl.style.marginBottom).toBe('', 'Expected margin-bottom to be ""');
    expect(overlayPaneEl.style.marginTop).toBe('0px', 'Expected margin-top to be "0px"');
    expect(overlayPaneEl.style.marginRight).toBe('', 'Expected margin-right to be ""');
    expect(overlayPaneEl.style.marginLeft).toBe('', 'Expected margin-left  to be ""');
   }));

   it('should handle start based on direction (rtl)', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'start',
      direction: 'rtl',
    });

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeFalsy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeTruthy();
    expect(overlayPaneEl.style.marginBottom).toBe('', 'Expected margin-bottom to be ""');
    expect(overlayPaneEl.style.marginTop).toBe('0px', 'Expected margin-top to be "0px"');
    expect(overlayPaneEl.style.marginRight).toBe('0px', 'Expected margin-right to be "0px"');
    expect(overlayPaneEl.style.marginLeft).toBe('', 'Expected margin-left  to be ""');
  }));

  it('should handle start based on direction (ltr)', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'start',
      direction: 'ltr',
    });

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeFalsy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeTruthy();
    expect(overlayPaneEl.style.marginBottom).toBe('', 'Expected margin-bottom to be ""');
    expect(overlayPaneEl.style.marginTop).toBe('0px', 'Expected margin-top to be "0px"');
    expect(overlayPaneEl.style.marginRight).toBe('', 'Expected margin-right to be ""');
    expect(overlayPaneEl.style.marginLeft).toBe('0px', 'Expected margin-left  to be "0px"');
  }));

  it('should handle end based on direction (rtl)', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'end',
      direction: 'rtl',
    });

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeFalsy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeTruthy();
    expect(overlayPaneEl.style.marginBottom).toBe('', 'Expected margin-bottom to be ""');
    expect(overlayPaneEl.style.marginTop).toBe('0px', 'Expected margin-top to be "0px"');
    expect(overlayPaneEl.style.marginRight).toBe('', 'Expected margin-right to be ""');
    expect(overlayPaneEl.style.marginLeft).toBe('0px', 'Expected margin-left  to be "0px"');
  }));

  it('should handle end based on direction (ltr)', fakeAsync(() => {
    snackBar.open(simpleMessage, simpleActionLabel, {
      verticalPosition: 'top',
      horizontalPosition: 'end',
      direction: 'ltr',
    });

    viewContainerFixture.detectChanges();
    flush();

    const containerEl = overlayContainerEl.querySelector('snack-bar-container') as HTMLElement;
    const overlayPaneEl = overlayContainerEl.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(containerEl.classList.contains('mat-snack-bar-center')).toBeFalsy();
    expect(containerEl.classList.contains('mat-snack-bar-top')).toBeTruthy();
    expect(overlayPaneEl.style.marginBottom).toBe('', 'Expected margin-bottom to be ""');
    expect(overlayPaneEl.style.marginTop).toBe('0px', 'Expected margin-top to be "0px"');
    expect(overlayPaneEl.style.marginRight).toBe('0px', 'Expected margin-right to be "0px"');
    expect(overlayPaneEl.style.marginLeft).toBe('', 'Expected margin-left  to be ""');
  }));

});


@Directive({selector: 'dir-with-view-container'})
class DirectiveWithViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) { }
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

/** Simple component for testing ComponentPortal. */
@Component({template: '<p>Burritos are on the way.</p>'})
class BurritosNotification {
  constructor(
    public snackBarRef: MatSnackBarRef<BurritosNotification>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}


@Component({
  template: '',
  providers: [MatSnackBar]
})
class ComponentThatProvidesMatSnackBar {
  constructor(public snackBar: MatSnackBar) {}
}


/** Simple component to open snack bars from.
 * Create a real (non-test) NgModule as a workaround forRoot
 * https://github.com/angular/angular/issues/10760
 */
const TEST_DIRECTIVES = [ComponentWithChildViewContainer,
                         BurritosNotification,
                         DirectiveWithViewContainer];
@NgModule({
  imports: [CommonModule, MatSnackBarModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [ComponentWithChildViewContainer, BurritosNotification],
})
class SnackBarTestModule { }
