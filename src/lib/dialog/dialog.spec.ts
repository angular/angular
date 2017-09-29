import {
  async,
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  inject,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Inject,
  Injector,
  NgModule,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Location} from '@angular/common';
import {SpyLocation} from '@angular/common/testing';
import {Directionality} from '@angular/cdk/bidi';
import {MatDialogContainer} from './dialog-container';
import {OverlayContainer} from '@angular/cdk/overlay';
import {ESCAPE} from '@angular/cdk/keycodes';
import {dispatchKeyboardEvent} from '@angular/cdk/testing';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from './index';


describe('MatDialog', () => {
  let dialog: MatDialog;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;
  let mockLocation: SpyLocation;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, DialogTestModule],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Location, useClass: SpyLocation}
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MatDialog, Location], (d: MatDialog, l: Location) => {
    dialog = d;
    mockLocation = l as SpyLocation;
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should open a dialog with a component', () => {
    let dialogRef = dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef
    });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(dialogRef.componentInstance instanceof PizzaMsg).toBe(true);
    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();
    let dialogContainerElement = overlayContainerElement.querySelector('mat-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
  });

  it('should open a dialog with a template', () => {
    const templateRefFixture = TestBed.createComponent(ComponentWithTemplateRef);
    templateRefFixture.componentInstance.localValue = 'Bees';
    templateRefFixture.detectChanges();

    const data = {value: 'Knees'};

    let dialogRef = dialog.open(templateRefFixture.componentInstance.templateRef, { data });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Cheese Bees Knees');
    expect(templateRefFixture.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('mat-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');

    dialogRef.close();
  });

  it('should emit when dialog opening animation is complete', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const spy = jasmine.createSpy('afterOpen spy');

    dialogRef.afterOpen().subscribe(spy);

    viewContainerFixture.detectChanges();

    // callback should not be called before animation is complete
    expect(spy).not.toHaveBeenCalled();

    flushMicrotasks();
    expect(spy).toHaveBeenCalled();
  }));

  it('should use injector from viewContainerRef for DialogInjector', () => {
    let dialogRef = dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef
    });

    viewContainerFixture.detectChanges();

    let dialogInjector = dialogRef.componentInstance.dialogInjector;

    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);
    expect(dialogInjector.get<DirectiveWithViewContainer>(DirectiveWithViewContainer)).toBeTruthy(
      'Expected the dialog component to be created with the injector from the viewContainerRef.'
    );
  });

  it('should open a dialog with a component and no ViewContainerRef', () => {
    let dialogRef = dialog.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(dialogRef.componentInstance instanceof PizzaMsg).toBe(true);
    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();
    let dialogContainerElement = overlayContainerElement.querySelector('mat-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
  });

  it('should apply the configured role to the dialog element', () => {
    dialog.open(PizzaMsg, { role: 'alertdialog' });

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('mat-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('alertdialog');
  });

  it('should apply the specified `aria-describedby`', () => {
    dialog.open(PizzaMsg, { ariaDescribedBy: 'description-element' });

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('mat-dialog-container')!;
    expect(dialogContainerElement.getAttribute('aria-describedby')).toBe('description-element');
  });

  it('should close a dialog and get back a result', async(() => {
    let dialogRef = dialog.open(PizzaMsg, { viewContainerRef: testViewContainerRef });
    let afterCloseCallback = jasmine.createSpy('afterClose callback');

    dialogRef.afterClosed().subscribe(afterCloseCallback);
    dialogRef.close('Charmander');
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(afterCloseCallback).toHaveBeenCalledWith('Charmander');
      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
    });
  }));

  it('should close a dialog and get back a result before it is closed', async(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    // beforeClose should emit before dialog container is destroyed
    const beforeCloseHandler = jasmine.createSpy('beforeClose callback').and.callFake(() => {
      expect(overlayContainerElement.querySelector('mat-dialog-container'))
          .not.toBeNull('dialog container exists when beforeClose is called');
    });

    dialogRef.beforeClose().subscribe(beforeCloseHandler);
    dialogRef.close('Bulbasaurus');
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(beforeCloseHandler).toHaveBeenCalledWith('Bulbasaurus');
      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
    });
  }));

  it('should close a dialog via the escape key', async(() => {
    dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef
    });

    dispatchKeyboardEvent(document, 'keydown', ESCAPE);
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
    });
  }));

  it('should close from a ViewContainerRef with OnPush change detection', fakeAsync(() => {
    const onPushFixture = TestBed.createComponent(ComponentWithOnPushViewContainer);

    onPushFixture.detectChanges();

    const dialogRef = dialog.open(PizzaMsg, {
      viewContainerRef: onPushFixture.componentInstance.viewContainerRef
    });

    flushMicrotasks();
    onPushFixture.detectChanges();
    flushMicrotasks();

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length)
        .toBe(1, 'Expected one open dialog.');

    dialogRef.close();
    flushMicrotasks();
    onPushFixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length)
        .toBe(0, 'Expected no open dialogs.');
  }));

  it('should close when clicking on the overlay backdrop', async(() => {
    dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef
    });

    viewContainerFixture.detectChanges();

    let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

    backdrop.click();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeFalsy();
    });
  }));

  it('should emit the backdropClick stream when clicking on the overlay backdrop', async(() => {
    const dialogRef = dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef
    });

    const spy = jasmine.createSpy('backdropClick spy');
    dialogRef.backdropClick().subscribe(spy);

    viewContainerFixture.detectChanges();

    let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);

    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      // Additional clicks after the dialog has closed should not be emitted
      backdrop.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  }));

  it('should notify the observers if a dialog has been opened', () => {
    dialog.afterOpen.subscribe(ref => {
      expect(dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef
      })).toBe(ref);
    });
  });

  it('should notify the observers if all open dialogs have finished closing', async(() => {
    const ref1 = dialog.open(PizzaMsg, { viewContainerRef: testViewContainerRef });
    const ref2 = dialog.open(ContentElementDialog, { viewContainerRef: testViewContainerRef });
    const spy = jasmine.createSpy('afterAllClosed spy');

    dialog.afterAllClosed.subscribe(spy);

    ref1.close();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(spy).not.toHaveBeenCalled();

      ref2.close();
      viewContainerFixture.detectChanges();
      viewContainerFixture.whenStable().then(() => expect(spy).toHaveBeenCalled());
    });
  }));

  it('should emit the afterAllClosed stream on subscribe if there are no open dialogs', () => {
    const spy = jasmine.createSpy('afterAllClosed spy');

    dialog.afterAllClosed.subscribe(spy);

    expect(spy).toHaveBeenCalled();
  });

  it('should should override the width of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      width: '500px'
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.width).toBe('500px');
  });

  it('should should override the height of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      height: '100px'
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.height).toBe('100px');
  });

  it('should should override the top offset of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      position: {
        top: '100px'
      }
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginTop).toBe('100px');
  });

  it('should should override the bottom offset of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      position: {
        bottom: '200px'
      }
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginBottom).toBe('200px');
  });

  it('should should override the left offset of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      position: {
        left: '250px'
      }
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginLeft).toBe('250px');
  });

  it('should should override the right offset of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      position: {
        right: '125px'
      }
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginRight).toBe('125px');
  });

  it('should allow for the position to be updated', () => {
    let dialogRef = dialog.open(PizzaMsg, {
      position: {
        left: '250px'
      }
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginLeft).toBe('250px');

    dialogRef.updatePosition({ left: '500px' });

    expect(overlayPane.style.marginLeft).toBe('500px');
  });

  it('should allow for the dimensions to be updated', () => {
    let dialogRef = dialog.open(PizzaMsg, { width: '100px' });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.width).toBe('100px');

    dialogRef.updateSize('200px');

    expect(overlayPane.style.width).toBe('200px');
  });

  it('should allow setting the layout direction', () => {
    dialog.open(PizzaMsg, { direction: 'rtl' });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;

    expect(overlayPane.getAttribute('dir')).toBe('rtl');
  });

  it('should inject the correct layout direction in the component instance', () => {
    const dialogRef = dialog.open(PizzaMsg, { direction: 'rtl' });

    viewContainerFixture.detectChanges();

    expect(dialogRef.componentInstance.directionality.value).toBe('rtl');
  });

  it('should close all of the dialogs', async(() => {
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(3);

    dialog.closeAll();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(0);
    });
  }));

  it('should set the proper animation states', () => {
    let dialogRef = dialog.open(PizzaMsg, { viewContainerRef: testViewContainerRef });
    let dialogContainer: MatDialogContainer =
        viewContainerFixture.debugElement.query(By.directive(MatDialogContainer)).componentInstance;

    expect(dialogContainer._state).toBe('enter');

    dialogRef.close();

    expect(dialogContainer._state).toBe('exit');
  });

  it('should close all dialogs when the user goes forwards/backwards in history', async(() => {
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(2);

    mockLocation.simulateUrlPop('');
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(0);
    });
  }));

  it('should close all open dialogs when the location hash changes', async(() => {
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(2);

    mockLocation.simulateHashChange('');
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(0);
    });
  }));

  it('should have the componentInstance available in the afterClosed callback', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg);
    let spy = jasmine.createSpy('afterClosed spy');

    flushMicrotasks();
    viewContainerFixture.detectChanges();
    flushMicrotasks();

    dialogRef.afterClosed().subscribe(() => {
      spy();
      expect(dialogRef.componentInstance).toBeTruthy('Expected component instance to be defined.');
    });

    dialogRef.close();

    flushMicrotasks();
    viewContainerFixture.detectChanges();
    tick(500);

    // Ensure that the callback actually fires.
    expect(spy).toHaveBeenCalled();
  }));

  describe('passing in data', () => {
    it('should be able to pass in data', () => {
      let config = {
        data: {
          stringParam: 'hello',
          dateParam: new Date()
        }
      };

      let instance = dialog.open(DialogWithInjectedData, config).componentInstance;

      expect(instance.data.stringParam).toBe(config.data.stringParam);
      expect(instance.data.dateParam).toBe(config.data.dateParam);
    });

    it('should default to null if no data is passed', () => {
      expect(() => {
        let dialogRef = dialog.open(DialogWithInjectedData);
        expect(dialogRef.componentInstance.data).toBeNull();
      }).not.toThrow();
    });
  });

  it('should not keep a reference to the component after the dialog is closed', async(() => {
    let dialogRef = dialog.open(PizzaMsg);

    expect(dialogRef.componentInstance).toBeTruthy();

    dialogRef.close();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(dialogRef.componentInstance).toBeFalsy('Expected reference to have been cleared.');
    });
  }));

  it('should assign a unique id to each dialog', () => {
    const one = dialog.open(PizzaMsg);
    const two = dialog.open(PizzaMsg);

    expect(one.id).toBeTruthy();
    expect(two.id).toBeTruthy();
    expect(one.id).not.toBe(two.id);
  });

  it('should allow for the id to be overwritten', () => {
    const dialogRef = dialog.open(PizzaMsg, { id: 'pizza' });
    expect(dialogRef.id).toBe('pizza');
  });

  it('should throw when trying to open a dialog with the same id as another dialog', () => {
    dialog.open(PizzaMsg, { id: 'pizza' });
    expect(() => dialog.open(PizzaMsg, { id: 'pizza' })).toThrowError(/must be unique/g);
  });

  it('should be able to find a dialog by id', () => {
    const dialogRef = dialog.open(PizzaMsg, { id: 'pizza' });
    expect(dialog.getDialogById('pizza')).toBe(dialogRef);
  });

  describe('disableClose option', () => {
    it('should prevent closing via clicks on the backdrop', () => {
      dialog.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();

      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeTruthy();
    });

    it('should prevent closing via the escape key', () => {
      dialog.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();
      dispatchKeyboardEvent(document, 'keydown', ESCAPE);

      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeTruthy();
    });

    it('should allow for the disableClose option to be updated while open', async(() => {
      let dialogRef = dialog.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();

      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeTruthy();

      dialogRef.disableClose = false;
      backdrop.click();

      viewContainerFixture.detectChanges();
      viewContainerFixture.whenStable().then(() => {
        expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeFalsy();
      });
    }));
  });

  describe('hasBackdrop option', () => {
    it('should have a backdrop', () => {
      dialog.open(PizzaMsg, {
        hasBackdrop: true,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();
    });

    it('should not have a backdrop', () => {
      dialog.open(PizzaMsg, {
        hasBackdrop: false,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
    });
  });

  describe('panelClass option', () => {
    it('should have custom panel class', () => {
      dialog.open(PizzaMsg, {
        panelClass: 'custom-panel-class',
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.custom-panel-class')).toBeTruthy();
    });
  });

  describe('backdropClass option', () => {
    it('should have default backdrop class', () => {
      dialog.open(PizzaMsg, {
        backdropClass: '',
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-dark-backdrop')).toBeTruthy();
    });

    it('should have custom backdrop class', () => {
      dialog.open(PizzaMsg, {
        backdropClass: 'custom-backdrop-class',
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.custom-backdrop-class')).toBeTruthy();
    });
  });

  describe('focus management', () => {
    // When testing focus, all of the elements must be in the DOM.
    beforeEach(() => document.body.appendChild(overlayContainerElement));
    afterEach(() => document.body.removeChild(overlayContainerElement));

    it('should focus the first tabbable element of the dialog on open', fakeAsync(() => {
      dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement.tagName)
          .toBe('INPUT', 'Expected first tabbable element (input) in the dialog to be focused.');
    }));

    it('should re-focus trigger element when dialog closes', fakeAsync(() => {
      // Create a element that has focus before the dialog is opened.
      let button = document.createElement('button');
      button.id = 'dialog-trigger';
      document.body.appendChild(button);
      button.focus();

      let dialogRef = dialog.open(PizzaMsg, { viewContainerRef: testViewContainerRef });

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement.id)
          .not.toBe('dialog-trigger', 'Expected the focus to change when dialog was opened.');

      dialogRef.close();
      expect(document.activeElement.id).not.toBe('dialog-trigger',
          'Expcted the focus not to have changed before the animation finishes.');

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      tick(500);

      expect(document.activeElement.id).toBe('dialog-trigger',
          'Expected that the trigger was refocused after the dialog is closed.');

      document.body.removeChild(button);
    }));

    it('should allow the consumer to shift focus in afterClosed', fakeAsync(() => {
      // Create a element that has focus before the dialog is opened.
      let button = document.createElement('button');
      let input = document.createElement('input');

      button.id = 'dialog-trigger';
      input.id = 'input-to-be-focused';

      document.body.appendChild(button);
      document.body.appendChild(input);
      button.focus();

      let dialogRef = dialog.open(PizzaMsg, { viewContainerRef: testViewContainerRef });

      tick(500);
      viewContainerFixture.detectChanges();

      dialogRef.afterClosed().subscribe(() => input.focus());
      dialogRef.close();

      tick(500);
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement.id).toBe('input-to-be-focused',
          'Expected that the trigger was refocused after the dialog is closed.');

      document.body.removeChild(button);
      document.body.removeChild(input);
    }));

    it('should move focus to the container if there are no focusable elements in the dialog',
      fakeAsync(() => {
        dialog.open(DialogWithoutFocusableElements);

        viewContainerFixture.detectChanges();
        flushMicrotasks();

        expect(document.activeElement.tagName)
            .toBe('MAT-DIALOG-CONTAINER', 'Expected dialog container to be focused.');
      }));

  });

  describe('dialog content elements', () => {
    let dialogRef: MatDialogRef<ContentElementDialog>;

    beforeEach(() => {
      dialogRef = dialog.open(ContentElementDialog);
      viewContainerFixture.detectChanges();
    });

    it('should close the dialog when clicking on the close button', async(() => {
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);

      (overlayContainerElement.querySelector('button[mat-dialog-close]') as HTMLElement).click();
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
      });
    }));

    it('should not close the dialog if [mat-dialog-close] is applied on a non-button node', () => {
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);

      (overlayContainerElement.querySelector('div[mat-dialog-close]') as HTMLElement).click();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
    });

    it('should allow for a user-specified aria-label on the close button', async(() => {
      let button = overlayContainerElement.querySelector('button[mat-dialog-close]')!;

      dialogRef.componentInstance.closeButtonAriaLabel = 'Best close button ever';
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        expect(button.getAttribute('aria-label')).toBe('Best close button ever');
      });
    }));

    it('should override the "type" attribute of the close button', () => {
      let button = overlayContainerElement.querySelector('button[mat-dialog-close]')!;

      expect(button.getAttribute('type')).toBe('button');
    });

    it('should return the [mat-dialog-close] result when clicking the close button', async(() => {
      let afterCloseCallback = jasmine.createSpy('afterClose callback');
      dialogRef.afterClosed().subscribe(afterCloseCallback);

      (overlayContainerElement.querySelector('button.close-with-true') as HTMLElement).click();
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        expect(afterCloseCallback).toHaveBeenCalledWith(true);
      });
    }));

    it('should set the aria-labelledby attribute to the id of the title', async(() => {
      let title = overlayContainerElement.querySelector('[mat-dialog-title]')!;
      let container = overlayContainerElement.querySelector('mat-dialog-container')!;

      viewContainerFixture.whenStable().then(() => {
        expect(title.id).toBeTruthy('Expected title element to have an id.');
        expect(container.getAttribute('aria-labelledby'))
            .toBe(title.id, 'Expected the aria-labelledby to match the title id.');
      });
    }));

  });
});

describe('MatDialog with a parent MatDialog', () => {
  let parentDialog: MatDialog;
  let childDialog: MatDialog;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ComponentThatProvidesMatDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, DialogTestModule],
      declarations: [ComponentThatProvidesMatDialog],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Location, useClass: SpyLocation}
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MatDialog], (d: MatDialog) => {
    parentDialog = d;

    fixture = TestBed.createComponent(ComponentThatProvidesMatDialog);
    childDialog = fixture.componentInstance.dialog;
    fixture.detectChanges();
  }));

  afterEach(() => {
    overlayContainerElement.innerHTML = '';
  });

  it('should close dialogs opened by a parent when calling closeAll on a child MatDialog',
    async(() => {
      parentDialog.open(PizzaMsg);
      fixture.detectChanges();

      expect(overlayContainerElement.textContent)
          .toContain('Pizza', 'Expected a dialog to be opened');

      childDialog.closeAll();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(overlayContainerElement.textContent!.trim())
            .toBe('', 'Expected closeAll on child MatDialog to close dialog opened by parent');
      });
    }));

  it('should close dialogs opened by a child when calling closeAll on a parent MatDialog',
    async(() => {
      childDialog.open(PizzaMsg);
      fixture.detectChanges();

      expect(overlayContainerElement.textContent)
          .toContain('Pizza', 'Expected a dialog to be opened');

      parentDialog.closeAll();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(overlayContainerElement.textContent!.trim())
            .toBe('', 'Expected closeAll on parent MatDialog to close dialog opened by child');
      });
    }));

  it('should close the top dialog via the escape key', async(() => {
    childDialog.open(PizzaMsg);

    dispatchKeyboardEvent(document, 'keydown', ESCAPE);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
    });
  }));
});


@Directive({selector: 'dir-with-view-container'})
class DirectiveWithViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: 'hello',
})
class ComponentWithOnPushViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
  selector: 'arbitrary-component',
  template: `<dir-with-view-container></dir-with-view-container>`,
})
class ComponentWithChildViewContainer {
  @ViewChild(DirectiveWithViewContainer) childWithViewContainer: DirectiveWithViewContainer;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

@Component({
  selector: 'arbitrary-component-with-template-ref',
  template: `<ng-template let-data let-dialogRef="dialogRef">
      Cheese {{localValue}} {{data?.value}}{{setDialogRef(dialogRef)}}</ng-template>`,
})
class ComponentWithTemplateRef {
  localValue: string;
  dialogRef: MatDialogRef<any>;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  setDialogRef(dialogRef: MatDialogRef<any>): string {
    this.dialogRef = dialogRef;
    return '';
  }
}

/** Simple component for testing ComponentPortal. */
@Component({template: '<p>Pizza</p> <input> <button>Close</button>'})
class PizzaMsg {
  constructor(public dialogRef: MatDialogRef<PizzaMsg>,
              public dialogInjector: Injector,
              public directionality: Directionality) {}
}

@Component({
  template: `
    <h1 mat-dialog-title>This is the title</h1>
    <mat-dialog-content>Lorem ipsum dolor sit amet.</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-dialog-close [aria-label]="closeButtonAriaLabel">Close</button>
      <button class="close-with-true" [mat-dialog-close]="true">Close and return true</button>
      <div mat-dialog-close>Should not close</div>
    </mat-dialog-actions>
  `
})
class ContentElementDialog {
  closeButtonAriaLabel: string;
}

@Component({
  template: '',
  providers: [MatDialog]
})
class ComponentThatProvidesMatDialog {
  constructor(public dialog: MatDialog) {}
}

/** Simple component for testing ComponentPortal. */
@Component({template: ''})
class DialogWithInjectedData {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}

@Component({template: '<p>Pasta</p>'})
class DialogWithoutFocusableElements {}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_DIRECTIVES = [
  ComponentWithChildViewContainer,
  ComponentWithTemplateRef,
  PizzaMsg,
  DirectiveWithViewContainer,
  ComponentWithOnPushViewContainer,
  ContentElementDialog,
  DialogWithInjectedData,
  DialogWithoutFocusableElements
];

@NgModule({
  imports: [MatDialogModule, NoopAnimationsModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    ComponentWithChildViewContainer,
    ComponentWithTemplateRef,
    PizzaMsg,
    ContentElementDialog,
    DialogWithInjectedData,
    DialogWithoutFocusableElements,
  ],
})
class DialogTestModule { }
