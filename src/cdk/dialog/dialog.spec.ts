import {
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  tick,
  flush,
} from '@angular/core/testing';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  Inject,
  InjectionToken,
  Injector,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Location} from '@angular/common';
import {SpyLocation} from '@angular/common/testing';
import {Directionality} from '@angular/cdk/bidi';
import {Overlay, OverlayContainer} from '@angular/cdk/overlay';
import {A, ESCAPE} from '@angular/cdk/keycodes';
import {_supportsShadowDom} from '@angular/cdk/platform';
import {
  dispatchKeyboardEvent,
  createKeyboardEvent,
  dispatchEvent,
} from '@angular/cdk/testing/private';
import {DIALOG_DATA, Dialog, DialogModule, DialogRef} from './index';

describe('Dialog', () => {
  let dialog: Dialog;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;
  let mockLocation: SpyLocation;
  let overlay: Overlay;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [DialogModule],
      declarations: [
        ComponentWithChildViewContainer,
        ComponentWithTemplateRef,
        PizzaMsg,
        ContentElementDialog,
        DialogWithInjectedData,
        DialogWithoutFocusableElements,
        DirectiveWithViewContainer,
        TemplateInjectorParentComponent,
        TemplateInjectorInnerDirective,
      ],
      providers: [
        {provide: Location, useClass: SpyLocation},
        {provide: TEMPLATE_INJECTOR_TEST_TOKEN, useValue: 'hello from test module'},
      ],
    });

    TestBed.compileComponents();

    dialog = TestBed.inject(Dialog);
    mockLocation = TestBed.inject(Location) as SpyLocation;
    overlay = TestBed.inject(Overlay);
    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  }));

  it('should open a dialog with a component', () => {
    let dialogRef = dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
    });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(dialogRef.componentInstance instanceof PizzaMsg).toBe(true);
    expect(dialogRef.componentInstance!.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();
    viewContainerFixture.detectChanges();
    let dialogContainerElement = overlayContainerElement.querySelector('cdk-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
    expect(dialogContainerElement.getAttribute('aria-modal')).toBe('true');
  });

  it('should open a dialog with a template', () => {
    const templateRefFixture = TestBed.createComponent(ComponentWithTemplateRef);
    templateRefFixture.componentInstance.localValue = 'Bees';
    templateRefFixture.detectChanges();

    const data = {value: 'Knees'};

    let dialogRef = dialog.open(templateRefFixture.componentInstance.templateRef, {
      data,
    });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Cheese Bees Knees');
    expect(templateRefFixture.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('cdk-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
    expect(dialogContainerElement.getAttribute('aria-modal')).toBe('true');

    dialogRef.close();
  });

  it('should use injector from viewContainerRef for DialogInjector', () => {
    let dialogRef = dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
    });

    viewContainerFixture.detectChanges();

    let dialogInjector = dialogRef.componentInstance!.dialogInjector as Injector;

    expect(dialogRef.componentInstance!.dialogRef).toBe(dialogRef);
    expect(dialogInjector.get<DirectiveWithViewContainer>(DirectiveWithViewContainer)).toBeTruthy(
      'Expected the dialog component to be created with the injector from the viewContainerRef.',
    );
  });

  it('should use custom injector', () => {
    const token = new InjectionToken<string>('message');
    const injector = Injector.create({providers: [{provide: token, useValue: 'hello'}]});
    const dialogRef = dialog.open(PizzaMsg, {injector});
    viewContainerFixture.detectChanges();

    expect(dialogRef.componentInstance?.dialogInjector.get(token)).toBe('hello');
  });

  it('should open a dialog with a component and no ViewContainerRef', () => {
    let dialogRef = dialog.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(dialogRef.componentInstance instanceof PizzaMsg).toBe(true);
    expect(dialogRef.componentInstance!.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();
    let dialogContainerElement = overlayContainerElement.querySelector('cdk-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
  });

  it('should apply the configured role to the dialog element', () => {
    dialog.open(PizzaMsg, {role: 'alertdialog'});

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('cdk-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('alertdialog');
  });

  it('should apply the specified `aria-describedby`', () => {
    dialog.open(PizzaMsg, {ariaDescribedBy: 'description-element'});

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('cdk-dialog-container')!;
    expect(dialogContainerElement.getAttribute('aria-describedby')).toBe('description-element');
  });

  it('should close a dialog and get back a result', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    let afterCloseCallback = jasmine.createSpy('afterClose callback');

    viewContainerFixture.detectChanges();
    dialogRef.closed.subscribe(afterCloseCallback);
    dialogRef.close('Charmander');
    viewContainerFixture.detectChanges();
    flush();

    expect(afterCloseCallback).toHaveBeenCalledWith('Charmander');
    expect(overlayContainerElement.querySelector('cdk-dialog-container')).toBeNull();
  }));

  it('should only emit the afterCloseEvent once when closed', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    let afterCloseCallback = jasmine.createSpy('afterClose callback');

    viewContainerFixture.detectChanges();
    dialogRef.closed.subscribe(afterCloseCallback);
    dialogRef.close();
    viewContainerFixture.detectChanges();
    flush();

    expect(afterCloseCallback).toHaveBeenCalledTimes(1);
  }));

  it('should close a dialog via the escape key', fakeAsync(() => {
    dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();
    const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('cdk-dialog-container')).toBeNull();
    expect(event.defaultPrevented).toBe(true);
  }));

  it('should not close a dialog via the escape key if a modifier is pressed', fakeAsync(() => {
    dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();
    const event = createKeyboardEvent('keydown', ESCAPE, undefined, {alt: true});
    dispatchEvent(document.body, event);
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('cdk-dialog-container')).toBeTruthy();
    expect(event.defaultPrevented).toBe(false);
  }));

  it('should close from a ViewContainerRef with OnPush change detection', fakeAsync(() => {
    const onPushFixture = TestBed.createComponent(ComponentWithOnPushViewContainer);

    onPushFixture.detectChanges();

    const dialogRef = dialog.open(PizzaMsg, {
      viewContainerRef: onPushFixture.componentInstance.viewContainerRef,
    });

    flushMicrotasks();
    onPushFixture.detectChanges();
    flushMicrotasks();

    expect(overlayContainerElement.querySelectorAll('cdk-dialog-container').length)
      .withContext('Expected one open dialog.')
      .toBe(1);

    dialogRef.close();
    flushMicrotasks();
    onPushFixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.querySelectorAll('cdk-dialog-container').length)
      .withContext('Expected no open dialogs.')
      .toBe(0);
  }));

  it('should close when clicking on the overlay backdrop', fakeAsync(() => {
    dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    viewContainerFixture.detectChanges();

    const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

    backdrop.click();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('cdk-dialog-container')).toBeFalsy();
  }));

  it('should emit the backdropClick stream when clicking on the overlay backdrop', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
      // Disable closing so the backdrop doesn't go away immediately.
      disableClose: true,
    });
    const spy = jasmine.createSpy('backdropClick spy');
    dialogRef.backdropClick.subscribe(spy);
    viewContainerFixture.detectChanges();

    const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

    backdrop.click();
    viewContainerFixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);

    // Additional clicks after the dialog has closed should not be emitted
    dialogRef.disableClose = false;
    backdrop.click();
    viewContainerFixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should emit the keyboardEvent stream when key events target the overlay', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    const spy = jasmine.createSpy('keyboardEvent spy');
    dialogRef.keydownEvents.subscribe(spy);

    viewContainerFixture.detectChanges();

    let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
    let container = overlayContainerElement.querySelector('cdk-dialog-container') as HTMLElement;

    dispatchKeyboardEvent(document.body, 'keydown', A);
    dispatchKeyboardEvent(backdrop, 'keydown', A);
    dispatchKeyboardEvent(container, 'keydown', A);

    expect(spy).toHaveBeenCalledTimes(3);
  }));

  it('should notify the observers if a dialog has been opened', () => {
    dialog.afterOpened.subscribe(ref => {
      expect(
        dialog.open(PizzaMsg, {
          viewContainerRef: testViewContainerRef,
        }),
      ).toBe(ref);
    });
  });

  it('should notify the observers if all open dialogs have finished closing', fakeAsync(() => {
    const ref1 = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const ref2 = dialog.open(ContentElementDialog, {
      viewContainerRef: testViewContainerRef,
    });
    const spy = jasmine.createSpy('afterAllClosed spy');

    viewContainerFixture.detectChanges();
    dialog.afterAllClosed.subscribe(spy);

    ref1.close();
    viewContainerFixture.detectChanges();
    flush();

    expect(spy).not.toHaveBeenCalled();

    ref2.close();
    viewContainerFixture.detectChanges();
    flush();
    viewContainerFixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  }));

  it('should emit the afterAllClosed stream on subscribe if there are no open dialogs', () => {
    const spy = jasmine.createSpy('afterAllClosed spy');

    dialog.afterAllClosed.subscribe(spy);

    expect(spy).toHaveBeenCalled();
  });

  it('should override the width of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      width: '500px',
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.width).toBe('500px');
  });

  it('should override the height of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      height: '100px',
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.height).toBe('100px');
  });

  it('should override the min-width of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      minWidth: '500px',
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.minWidth).toBe('500px');
  });

  it('should override the max-width of the overlay pane', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.maxWidth).toBeFalsy();

    dialogRef.close();

    tick(500);
    viewContainerFixture.detectChanges();
    flushMicrotasks();

    dialogRef = dialog.open(PizzaMsg, {
      maxWidth: '100px',
    });

    tick(500);
    viewContainerFixture.detectChanges();
    flushMicrotasks();

    overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPane.style.maxWidth).toBe('100px');
  }));

  it('should override the min-height of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      minHeight: '300px',
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.minHeight).toBe('300px');
  });

  it('should override the max-height of the overlay pane', () => {
    dialog.open(PizzaMsg, {
      maxHeight: '100px',
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.maxHeight).toBe('100px');
  });

  it('should be able to customize the position strategy', () => {
    dialog.open(PizzaMsg, {
      positionStrategy: overlay.position().global().top('100px'),
    });

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginTop).toBe('100px');
  });

  it('should allow for the dimensions to be updated', () => {
    let dialogRef = dialog.open(PizzaMsg, {width: '100px'});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.width).toBe('100px');

    dialogRef.updateSize('200px');

    expect(overlayPane.style.width).toBe('200px');
  });

  it('should allow setting the layout direction', () => {
    dialog.open(PizzaMsg, {direction: 'rtl'});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-global-overlay-wrapper')!;

    expect(overlayPane.getAttribute('dir')).toBe('rtl');
  });

  it('should inject the correct layout direction in the component instance', () => {
    const dialogRef = dialog.open(PizzaMsg, {direction: 'rtl'});

    viewContainerFixture.detectChanges();

    expect(dialogRef.componentInstance!.directionality.value).toBe('rtl');
  });

  it('should fall back to injecting the global direction if none is passed by the config', () => {
    const dialogRef = dialog.open(PizzaMsg, {});

    viewContainerFixture.detectChanges();

    expect(dialogRef.componentInstance!.directionality.value).toBe('ltr');
  });

  it('should close all of the dialogs', fakeAsync(() => {
    dialog.open(PizzaMsg);
    viewContainerFixture.detectChanges();
    dialog.open(PizzaMsg);
    viewContainerFixture.detectChanges();
    dialog.open(PizzaMsg);
    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelectorAll('cdk-dialog-container').length).toBe(3);

    dialog.closeAll();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('cdk-dialog-container').length).toBe(0);
  }));

  it('should close all dialogs when the user goes forwards/backwards in history', fakeAsync(() => {
    dialog.open(PizzaMsg);
    viewContainerFixture.detectChanges();
    dialog.open(PizzaMsg);
    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelectorAll('cdk-dialog-container').length).toBe(2);

    mockLocation.simulateUrlPop('');
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('cdk-dialog-container').length).toBe(0);
  }));

  it('should close all open dialogs when the location hash changes', fakeAsync(() => {
    dialog.open(PizzaMsg);
    viewContainerFixture.detectChanges();
    dialog.open(PizzaMsg);
    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelectorAll('cdk-dialog-container').length).toBe(2);

    mockLocation.simulateHashChange('');
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('cdk-dialog-container').length).toBe(0);
  }));

  it('should have the componentInstance available in the afterClosed callback', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg);
    let spy = jasmine.createSpy('afterClosed spy');

    flushMicrotasks();
    viewContainerFixture.detectChanges();
    flushMicrotasks();

    dialogRef.closed.subscribe(() => {
      spy();
    });

    dialogRef.close();

    flushMicrotasks();
    viewContainerFixture.detectChanges();
    tick(500);

    // Ensure that the callback actually fires.
    expect(spy).toHaveBeenCalled();
  }));

  it('should close all open dialogs on destroy', fakeAsync(() => {
    dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.querySelectorAll('cdk-dialog-container').length).toBe(2);

    dialog.ngOnDestroy();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('cdk-dialog-container').length).toBe(0);
  }));

  it('should complete the closed stream on destroy', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    let closedCompleteSpy = jasmine.createSpy('closed complete spy');

    viewContainerFixture.detectChanges();
    dialogRef.closed.subscribe({complete: closedCompleteSpy});

    dialogRef.close('Charmander');
    viewContainerFixture.detectChanges();
    flush();

    expect(closedCompleteSpy).toHaveBeenCalled();
  }));

  describe('passing in data', () => {
    it('should be able to pass in data', () => {
      let config = {
        data: {
          stringParam: 'hello',
          dateParam: new Date(),
        },
      };

      let instance = dialog.open(DialogWithInjectedData, config).componentInstance!;

      expect(instance.data.stringParam).toBe(config.data.stringParam);
      expect(instance.data.dateParam).toBe(config.data.dateParam);
    });

    it('should default to null if no data is passed', () => {
      expect(() => {
        let dialogRef = dialog.open(DialogWithInjectedData);
        viewContainerFixture.detectChanges();
        expect(dialogRef.componentInstance!.data).toBeNull();
      }).not.toThrow();
    });
  });

  it('should not keep a reference to the component after the dialog is closed', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg);
    viewContainerFixture.detectChanges();

    expect(dialogRef.componentInstance).toBeTruthy();

    dialogRef.close();
    flush();
    viewContainerFixture.detectChanges();
    flush();

    expect(dialogRef.componentInstance)
      .withContext('Expected reference to have been cleared.')
      .toBeFalsy();
  }));

  it('should assign a unique id to each dialog', () => {
    const one = dialog.open(PizzaMsg);
    const two = dialog.open(PizzaMsg);

    expect(one.id).toBeTruthy();
    expect(two.id).toBeTruthy();
    expect(one.id).not.toBe(two.id);
  });

  it('should allow for the id to be overwritten', () => {
    const dialogRef = dialog.open(PizzaMsg, {id: 'pizza'});
    expect(dialogRef.id).toBe('pizza');
  });

  it('should throw when trying to open a dialog with the same id as another dialog', () => {
    dialog.open(PizzaMsg, {id: 'pizza'});
    expect(() => dialog.open(PizzaMsg, {id: 'pizza'})).toThrowError(/must be unique/g);
  });

  it('should be able to find a dialog by id', () => {
    const dialogRef = dialog.open(PizzaMsg, {id: 'pizza'});
    expect(dialog.getDialogById('pizza')).toBe(dialogRef);
  });

  describe('disableClose option', () => {
    it('should prevent closing via clicks on the backdrop', fakeAsync(() => {
      dialog.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelector('cdk-dialog-container')).toBeTruthy();
    }));

    it('should prevent closing via the escape key', fakeAsync(() => {
      dialog.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();
      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      viewContainerFixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelector('cdk-dialog-container')).toBeTruthy();
    }));

    it('should allow for the disableClose option to be updated while open', fakeAsync(() => {
      let dialogRef = dialog.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();

      expect(overlayContainerElement.querySelector('cdk-dialog-container')).toBeTruthy();

      dialogRef.disableClose = false;
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelector('cdk-dialog-container')).toBeFalsy();
    }));

    it('should work when opening from a template', fakeAsync(() => {
      const templateRefFixture = TestBed.createComponent(ComponentWithTemplateRef);
      templateRefFixture.detectChanges();

      dialog.open(templateRefFixture.componentInstance.templateRef, {
        disableClose: true,
      });

      templateRefFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();
      templateRefFixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelector('cdk-dialog-container')).toBeTruthy();
    }));

    it(
      'should fall back to node injector in template dialog if token does not exist in ' +
        'template injector',
      fakeAsync(() => {
        const templateInjectFixture = TestBed.createComponent(TemplateInjectorParentComponent);
        templateInjectFixture.detectChanges();

        dialog.open(templateInjectFixture.componentInstance.templateRef);
        templateInjectFixture.detectChanges();

        expect(templateInjectFixture.componentInstance.innerComponentValue).toBe(
          'hello from parent component',
        );
      }),
    );
  });

  describe('hasBackdrop option', () => {
    it('should have a backdrop', () => {
      dialog.open(PizzaMsg, {
        hasBackdrop: true,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();
    });

    it('should not have a backdrop', () => {
      dialog.open(PizzaMsg, {
        hasBackdrop: false,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
    });
  });

  describe('panelClass option', () => {
    it('should have custom panel class', () => {
      dialog.open(PizzaMsg, {
        panelClass: 'custom-panel-class',
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.custom-panel-class')).toBeTruthy();
    });
  });

  describe('backdropClass option', () => {
    it('should have default backdrop class', () => {
      dialog.open(PizzaMsg, {
        backdropClass: '',
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-dark-backdrop')).toBeTruthy();
    });

    it('should have custom backdrop class', () => {
      dialog.open(PizzaMsg, {
        backdropClass: 'custom-backdrop-class',
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.custom-backdrop-class')).toBeTruthy();
    });
  });

  describe('focus management', () => {
    // When testing focus, all of the elements must be in the DOM.
    beforeEach(() => document.body.appendChild(overlayContainerElement));
    afterEach(() => overlayContainerElement.remove());

    it('should focus the first tabbable element of the dialog on open (the default)', fakeAsync(() => {
      dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.tagName)
        .withContext('Expected first tabbable element (input) in the dialog to be focused.')
        .toBe('INPUT');
    }));

    it('should focus the dialog element on open', fakeAsync(() => {
      dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'dialog',
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      let container = overlayContainerElement.querySelector(
        'cdk-dialog-container',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected container to be focused on open')
        .toBe(container);
    }));

    it('should focus the first header element on open', fakeAsync(() => {
      dialog.open(ContentElementDialog, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'first-heading',
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      let firstHeader = overlayContainerElement.querySelector(
        'h1[tabindex="-1"]',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected first header to be focused on open')
        .toBe(firstHeader);
    }));

    it('should focus the first element that matches the css selector from autoFocus on open', fakeAsync(() => {
      dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'p',
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      let firstParagraph = overlayContainerElement.querySelector(
        'p[tabindex="-1"]',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected first paragraph to be focused on open')
        .toBe(firstParagraph);
    }));

    it('should re-focus trigger element when dialog closes', fakeAsync(() => {
      // Create a element that has focus before the dialog is opened.
      let button = document.createElement('button');
      button.id = 'dialog-trigger';
      document.body.appendChild(button);
      button.focus();

      let dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.id).not.toBe(
        'dialog-trigger',
        'Expected the focus to change when dialog was opened.',
      );

      dialogRef.close();
      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement!.id)
        .withContext('Expected that the trigger was refocused after the dialog is closed.')
        .toBe('dialog-trigger');

      button.remove();
    }));

    it('should re-focus trigger element inside the shadow DOM when dialog closes', fakeAsync(() => {
      if (!_supportsShadowDom()) {
        return;
      }

      viewContainerFixture.destroy();
      const fixture = TestBed.createComponent(ShadowDomComponent);
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button'))!.nativeElement;

      button.focus();

      const dialogRef = dialog.open(PizzaMsg);
      flushMicrotasks();
      fixture.detectChanges();
      flushMicrotasks();

      const spy = spyOn(button, 'focus').and.callThrough();
      dialogRef.close();
      flushMicrotasks();
      fixture.detectChanges();
      tick(500);

      expect(spy).toHaveBeenCalled();
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

      let dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

      tick(500);
      viewContainerFixture.detectChanges();

      dialogRef.closed.subscribe(() => input.focus());
      dialogRef.close();

      tick(500);
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.id)
        .withContext('Expected that the trigger was refocused after the dialog is closed.')
        .toBe('input-to-be-focused');

      button.remove();
      input.remove();
      flush();
    }));

    it('should move focus to the container if there are no focusable elements in the dialog', fakeAsync(() => {
      dialog.open(DialogWithoutFocusableElements);

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.tagName.toLowerCase())
        .withContext('Expected dialog container to be focused.')
        .toBe('cdk-dialog-container');
    }));

    it('should allow for focus restoration to be disabled', fakeAsync(() => {
      // Create a element that has focus before the dialog is opened.
      const button = document.createElement('button');
      button.id = 'dialog-trigger';
      document.body.appendChild(button);
      button.focus();

      const dialogRef = dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        restoreFocus: false,
      });

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.id).not.toBe('dialog-trigger');

      dialogRef.close();
      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement!.id).not.toBe('dialog-trigger');
      button.remove();
    }));

    it('should allow for focus to be restored to an element matching a selector', fakeAsync(() => {
      // Create a element that has focus before the dialog is opened.
      const button = document.createElement('button');
      button.id = 'dialog-trigger';
      document.body.appendChild(button);

      const dialogRef = dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        restoreFocus: `#${button.id}`,
      });

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.id).not.toBe('dialog-trigger');

      dialogRef.close();
      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement!.id).toBe('dialog-trigger');
      button.remove();
    }));

    it('should allow for focus to be restored to a specific DOM node', fakeAsync(() => {
      // Create a element that has focus before the dialog is opened.
      const button = document.createElement('button');
      button.id = 'dialog-trigger';
      document.body.appendChild(button);

      const dialogRef = dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        restoreFocus: button,
      });

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.id).not.toBe('dialog-trigger');

      dialogRef.close();
      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement!.id).toBe('dialog-trigger');
      button.remove();
    }));
  });

  describe('aria-label', () => {
    it('should be able to set a custom aria-label', () => {
      dialog.open(PizzaMsg, {
        ariaLabel: 'Hello there',
        viewContainerRef: testViewContainerRef,
      });
      viewContainerFixture.detectChanges();

      const container = overlayContainerElement.querySelector('cdk-dialog-container')!;
      expect(container.getAttribute('aria-label')).toBe('Hello there');
    });

    it('should not set the aria-labelledby automatically if it has an aria-label', fakeAsync(() => {
      dialog.open(ContentElementDialog, {
        ariaLabel: 'Hello there',
        viewContainerRef: testViewContainerRef,
      });
      viewContainerFixture.detectChanges();
      tick();
      viewContainerFixture.detectChanges();

      const container = overlayContainerElement.querySelector('cdk-dialog-container')!;
      expect(container.hasAttribute('aria-labelledby')).toBe(false);
    }));
  });
});

describe('Dialog with a parent Dialog', () => {
  let parentDialog: Dialog;
  let childDialog: Dialog;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ComponentThatProvidesMatDialog>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [DialogModule],
      declarations: [ComponentThatProvidesMatDialog],
      providers: [
        {
          provide: OverlayContainer,
          useFactory: () => {
            overlayContainerElement = document.createElement('div');
            return {getContainerElement: () => overlayContainerElement};
          },
        },
        {provide: Location, useClass: SpyLocation},
      ],
    });

    TestBed.compileComponents();
    parentDialog = TestBed.inject(Dialog);
    fixture = TestBed.createComponent(ComponentThatProvidesMatDialog);
    childDialog = fixture.componentInstance.dialog;
    fixture.detectChanges();
  }));

  afterEach(() => {
    overlayContainerElement.innerHTML = '';
  });

  it('should close dialogs opened by a parent when calling closeAll on a child Dialog', fakeAsync(() => {
    parentDialog.open(PizzaMsg);
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a dialog to be opened')
      .toContain('Pizza');

    childDialog.closeAll();
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent!.trim())
      .withContext('Expected closeAll on child Dialog to close dialog opened by parent')
      .toBe('');
  }));

  it('should close dialogs opened by a child when calling closeAll on a parent Dialog', fakeAsync(() => {
    childDialog.open(PizzaMsg);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a dialog to be opened')
      .toContain('Pizza');

    parentDialog.closeAll();
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent!.trim())
      .withContext('Expected closeAll on parent Dialog to close dialog opened by child')
      .toBe('');
  }));

  it('should not close the parent dialogs, when a child is destroyed', fakeAsync(() => {
    parentDialog.open(PizzaMsg);
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a dialog to be opened')
      .toContain('Pizza');

    childDialog.ngOnDestroy();
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a dialog to remain opened')
      .toContain('Pizza');
  }));

  it('should close the top dialog via the escape key', fakeAsync(() => {
    childDialog.open(PizzaMsg);
    fixture.detectChanges();

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('cdk-dialog-container')).toBeNull();
  }));
});

@Directive({selector: 'dir-with-view-container'})
class DirectiveWithViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: 'hello',
})
class ComponentWithOnPushViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) {}
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
  dialogRef: DialogRef<any>;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  setDialogRef(dialogRef: DialogRef<any>): string {
    this.dialogRef = dialogRef;
    return '';
  }
}

/** Simple component for testing ComponentPortal. */
@Component({template: '<p>Pizza</p> <input> <button>Close</button>'})
class PizzaMsg {
  constructor(
    public dialogRef: DialogRef<PizzaMsg>,
    public dialogInjector: Injector,
    public directionality: Directionality,
  ) {}
}

@Component({
  template: `
    <h1>This is the title</h1>
  `,
})
class ContentElementDialog {
  closeButtonAriaLabel: string;
}

@Component({
  template: '',
  providers: [Dialog],
})
class ComponentThatProvidesMatDialog {
  constructor(public dialog: Dialog) {}
}

/** Simple component for testing ComponentPortal. */
@Component({template: ''})
class DialogWithInjectedData {
  constructor(@Inject(DIALOG_DATA) public data: any) {}
}

@Component({template: '<p>Pasta</p>'})
class DialogWithoutFocusableElements {}

@Component({
  template: `<button>I'm a button</button>`,
  encapsulation: ViewEncapsulation.ShadowDom,
})
class ShadowDomComponent {}

const TEMPLATE_INJECTOR_TEST_TOKEN = new InjectionToken<string>('TEMPLATE_INJECTOR_TEST_TOKEN');

@Component({
  template: `<ng-template><template-injector-inner></template-injector-inner></ng-template>`,
  providers: [
    {
      provide: TEMPLATE_INJECTOR_TEST_TOKEN,
      useValue: 'hello from parent component',
    },
  ],
})
class TemplateInjectorParentComponent {
  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  innerComponentValue = '';
}

@Directive({
  selector: 'template-injector-inner',
})
class TemplateInjectorInnerDirective {
  constructor(parent: TemplateInjectorParentComponent) {
    parent.innerComponentValue = inject(TEMPLATE_INJECTOR_TEST_TOKEN);
  }
}
