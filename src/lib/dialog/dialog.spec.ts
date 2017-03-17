import {
  inject,
  async,
  fakeAsync,
  flushMicrotasks,
  ComponentFixture,
  TestBed,
  tick,
} from '@angular/core/testing';
import {NgModule,
  Component,
  Directive,
  ViewChild,
  ViewContainerRef,
  Injector,
  Inject,
} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdDialogModule} from './index';
import {MdDialog} from './dialog';
import {MdDialogContainer} from './dialog-container';
import {OverlayContainer, ESCAPE} from '../core';
import {MdDialogRef} from './dialog-ref';
import {MD_DIALOG_DATA} from './dialog-injector';
import {dispatchKeyboardEvent} from '../core/testing/dispatch-events';


describe('MdDialog', () => {
  let dialog: MdDialog;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDialogModule.forRoot(), DialogTestModule],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MdDialog], (d: MdDialog) => {
    dialog = d;
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
    expect(dialogRef.componentInstance).toEqual(jasmine.any(PizzaMsg));
    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();
    let dialogContainerElement = overlayContainerElement.querySelector('md-dialog-container');
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
  });

  it('should use injector from viewContainerRef for DialogInjector', () => {
    let dialogRef = dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef
    });

    viewContainerFixture.detectChanges();

    let dialogInjector = dialogRef.componentInstance.dialogInjector;

    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);
    expect(dialogInjector.get(DirectiveWithViewContainer)).toBeTruthy(
      'Expected the dialog component to be created with the injector from the viewContainerRef.'
    );
  });

  it('should open a dialog with a component and no ViewContainerRef', () => {
    let dialogRef = dialog.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(dialogRef.componentInstance).toEqual(jasmine.any(PizzaMsg));
    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();
    let dialogContainerElement = overlayContainerElement.querySelector('md-dialog-container');
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
  });

  it('should apply the configured role to the dialog element', () => {
    dialog.open(PizzaMsg, { role: 'alertdialog' });

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('md-dialog-container');
    expect(dialogContainerElement.getAttribute('role')).toBe('alertdialog');
  });

  it('should close a dialog and get back a result', async(() => {
    let dialogRef = dialog.open(PizzaMsg, { viewContainerRef: testViewContainerRef });
    let afterCloseCallback = jasmine.createSpy('afterClose callback');

    dialogRef.afterClosed().subscribe(afterCloseCallback);
    dialogRef.close('Charmander');
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(afterCloseCallback).toHaveBeenCalledWith('Charmander');
      expect(overlayContainerElement.querySelector('md-dialog-container')).toBeNull();
    });
  }));


  it('should close a dialog via the escape key', async(() => {
    dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef
    });

    dispatchKeyboardEvent(document, 'keydown', ESCAPE);
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelector('md-dialog-container')).toBeNull();
    });
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
      expect(overlayContainerElement.querySelector('md-dialog-container')).toBeFalsy();
    });
  }));

  it('should notify the observers if a dialog has been opened', () => {
    let ref: MdDialogRef<PizzaMsg>;
    dialog.afterOpen.subscribe(r => {
      ref = r;
    });
    expect(dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef
    })).toBe(ref);
  });

  it('should notify the observers if all open dialogs have finished closing', async(() => {
    const ref1 = dialog.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef
    });
    const ref2 = dialog.open(ContentElementDialog, {
      viewContainerRef: testViewContainerRef
    });
    let allClosed = false;

    dialog.afterAllClosed.subscribe(() => {
      allClosed = true;
    });

    ref1.close();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(allClosed).toBeFalsy();

      ref2.close();
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        expect(allClosed).toBeTruthy();
      });
    });
  }));

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

  it('should close all of the dialogs', async(() => {
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);

    expect(overlayContainerElement.querySelectorAll('md-dialog-container').length).toBe(3);

    dialog.closeAll();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelectorAll('md-dialog-container').length).toBe(0);
    });
  }));

  it('should set the proper animation states', () => {
    let dialogRef = dialog.open(PizzaMsg, { viewContainerRef: testViewContainerRef });
    let dialogContainer: MdDialogContainer =
        viewContainerFixture.debugElement.query(By.directive(MdDialogContainer)).componentInstance;

    expect(dialogContainer._state).toBe('enter');

    dialogRef.close();

    expect(dialogContainer._state).toBe('exit');
  });

  it('should emit an event with the proper animation state', async(() => {
    let dialogRef = dialog.open(PizzaMsg, { viewContainerRef: testViewContainerRef });
    let dialogContainer: MdDialogContainer =
        viewContainerFixture.debugElement.query(By.directive(MdDialogContainer)).componentInstance;
    let spy = jasmine.createSpy('animation state callback');

    dialogContainer._onAnimationStateChange.subscribe(spy);
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledWith('enter');

      dialogRef.close();
      viewContainerFixture.detectChanges();
      expect(spy).toHaveBeenCalledWith('exit-start');

      viewContainerFixture.whenStable().then(() => {
        expect(spy).toHaveBeenCalledWith('exit');
      });
    });
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

    it('should throw if injected data is expected but none is passed', () => {
      expect(() => {
        dialog.open(DialogWithInjectedData);
      }).toThrow();
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

  describe('disableClose option', () => {
    it('should prevent closing via clicks on the backdrop', () => {
      dialog.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();

      expect(overlayContainerElement.querySelector('md-dialog-container')).toBeTruthy();
    });

    it('should prevent closing via the escape key', () => {
      dialog.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();
      dispatchKeyboardEvent(document, 'keydown', ESCAPE);

      expect(overlayContainerElement.querySelector('md-dialog-container')).toBeTruthy();
    });
  });

  describe('focus management', () => {

    // When testing focus, all of the elements must be in the DOM.
    beforeEach(() => {
      document.body.appendChild(overlayContainerElement);
    });

    afterEach(() => {
      document.body.removeChild(overlayContainerElement);
    });

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

      let dialogRef = dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement.id)
          .not.toBe('dialog-trigger', 'Expected the focus to change when dialog was opened.');

      dialogRef.close();
      tick(500);
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement.id)
          .toBe('dialog-trigger', 'Expected that the trigger was refocused after dialog close');

      document.body.removeChild(button);
    }));
  });

  describe('dialog content elements', () => {
    let dialogRef: MdDialogRef<ContentElementDialog>;

    beforeEach(() => {
      dialogRef = dialog.open(ContentElementDialog);
      viewContainerFixture.detectChanges();
    });

    it('should close the dialog when clicking on the close button', async(() => {
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);

      (overlayContainerElement.querySelector('button[md-dialog-close]') as HTMLElement).click();

      viewContainerFixture.whenStable().then(() => {
        expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
      });
    }));

    it('should not close the dialog if [md-dialog-close] is applied on a non-button node', () => {
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);

      (overlayContainerElement.querySelector('div[md-dialog-close]') as HTMLElement).click();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
    });

    it('should allow for a user-specified aria-label on the close button', async(() => {
      let button = overlayContainerElement.querySelector('button[md-dialog-close]');

      dialogRef.componentInstance.closeButtonAriaLabel = 'Best close button ever';
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        expect(button.getAttribute('aria-label')).toBe('Best close button ever');
      });
    }));

    it('should override the "type" attribute of the close button', () => {
      let button = overlayContainerElement.querySelector('button[md-dialog-close]');

      expect(button.getAttribute('type')).toBe('button');
    });

  });
});

describe('MdDialog with a parent MdDialog', () => {
  let parentDialog: MdDialog;
  let childDialog: MdDialog;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ComponentThatProvidesMdDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDialogModule.forRoot(), DialogTestModule],
      declarations: [ComponentThatProvidesMdDialog],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MdDialog], (d: MdDialog) => {
    parentDialog = d;

    fixture = TestBed.createComponent(ComponentThatProvidesMdDialog);
    childDialog = fixture.componentInstance.dialog;
    fixture.detectChanges();
  }));

  afterEach(() => {
    overlayContainerElement.innerHTML = '';
  });

  it('should close dialogs opened by a parent when calling closeAll on a child MdDialog',
    async(() => {
      parentDialog.open(PizzaMsg);
      fixture.detectChanges();

      expect(overlayContainerElement.textContent)
          .toContain('Pizza', 'Expected a dialog to be opened');

      childDialog.closeAll();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(overlayContainerElement.textContent.trim())
            .toBe('', 'Expected closeAll on child MdDialog to close dialog opened by parent');
      });
    }));

  it('should close dialogs opened by a child when calling closeAll on a parent MdDialog',
    async(() => {
      childDialog.open(PizzaMsg);
      fixture.detectChanges();

      expect(overlayContainerElement.textContent)
          .toContain('Pizza', 'Expected a dialog to be opened');

      parentDialog.closeAll();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(overlayContainerElement.textContent.trim())
            .toBe('', 'Expected closeAll on parent MdDialog to close dialog opened by child');
      });
    }));
});


@Directive({selector: 'dir-with-view-container'})
class DirectiveWithViewContainer {
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

/** Simple component for testing ComponentPortal. */
@Component({template: '<p>Pizza</p> <input> <button>Close</button>'})
class PizzaMsg {
  constructor(public dialogRef: MdDialogRef<PizzaMsg>,
              public dialogInjector: Injector) {}
}

@Component({
  template: `
    <h1 md-dialog-title>This is the title</h1>
    <md-dialog-content>Lorem ipsum dolor sit amet.</md-dialog-content>
    <md-dialog-actions>
      <button md-dialog-close [aria-label]="closeButtonAriaLabel">Close</button>
      <div md-dialog-close>Should not close</div>
    </md-dialog-actions>
  `
})
class ContentElementDialog {
  closeButtonAriaLabel: string;
}

@Component({
  template: '',
  providers: [MdDialog]
})
class ComponentThatProvidesMdDialog {
  constructor(public dialog: MdDialog) {}
}

/** Simple component for testing ComponentPortal. */
@Component({template: ''})
class DialogWithInjectedData {
  constructor(@Inject(MD_DIALOG_DATA) public data: any) { }
}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_DIRECTIVES = [
  ComponentWithChildViewContainer,
  PizzaMsg,
  DirectiveWithViewContainer,
  ContentElementDialog,
  DialogWithInjectedData
];

@NgModule({
  imports: [MdDialogModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    ComponentWithChildViewContainer,
    PizzaMsg,
    ContentElementDialog,
    DialogWithInjectedData
  ],
})
class DialogTestModule { }
