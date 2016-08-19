import {inject, fakeAsync, async, ComponentFixture, TestBed} from '@angular/core/testing';
import {NgModule, Component, Directive, ViewChild, ViewContainerRef} from '@angular/core';
import {MdDialog, MdDialogModule} from './dialog';
import {OverlayContainer} from '@angular2-material/core/overlay/overlay-container';
import {MdDialogConfig} from './dialog-config';
import {MdDialogRef} from './dialog-ref';


describe('MdDialog', () => {
  let dialog: MdDialog;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDialogModule, DialogTestModule],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MdDialog], fakeAsync((d: MdDialog) => {
    dialog = d;
  })));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should open a dialog with a component', async(() => {
    let config = new MdDialogConfig();
    config.viewContainerRef = testViewContainerRef;

    dialog.open(PizzaMsg, config).then(dialogRef => {
      expect(overlayContainerElement.textContent).toContain('Pizza');
      expect(dialogRef.componentInstance).toEqual(jasmine.any(PizzaMsg));
      expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

      viewContainerFixture.detectChanges();
      let dialogContainerElement = overlayContainerElement.querySelector('md-dialog-container');
      expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
    });

    detectChangesForDialogOpen(viewContainerFixture);
  }));

  it('should apply the configured role to the dialog element', async(() => {
    let config = new MdDialogConfig();
    config.viewContainerRef = testViewContainerRef;
    config.role = 'alertdialog';

    dialog.open(PizzaMsg, config).then(dialogRef => {
      viewContainerFixture.detectChanges();

      let dialogContainerElement = overlayContainerElement.querySelector('md-dialog-container');
      expect(dialogContainerElement.getAttribute('role')).toBe('alertdialog');
    });

    detectChangesForDialogOpen(viewContainerFixture);
  }));

  it('should close a dialog and get back a result', async(() => {
    let config = new MdDialogConfig();
    config.viewContainerRef = testViewContainerRef;

    dialog.open(PizzaMsg, config).then(dialogRef => {
      viewContainerFixture.detectChanges();

      let afterCloseResult: string;
      dialogRef.afterClosed().subscribe(result => {
        afterCloseResult = result;
      });

      dialogRef.close('Charmander');

      viewContainerFixture.whenStable().then(() => {
        expect(afterCloseResult).toBe('Charmander');
        expect(overlayContainerElement.childNodes.length).toBe(0);
      });
    });

    detectChangesForDialogOpen(viewContainerFixture);
  }));
});


/** Runs the necessary detectChanges for a dialog to complete its opening. */
function detectChangesForDialogOpen(fixture: ComponentFixture<ComponentWithChildViewContainer>) {
  // TODO(jelbourn): figure out why the test zone is "stable" when there are still pending
  // tasks, such that we have to use `setTimeout` to run the second round of change detection.
  // Two rounds of change detection are necessary: one to *create* the dialog container, and
  // another to cause the lifecycle events of the container to run and load the dialog content.
  fixture.detectChanges();
  setTimeout(() => fixture.detectChanges(), 50);
}

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
@Component({
  selector: 'pizza-msg',
  template: '<p>Pizza</p>',
})
class PizzaMsg {
  constructor(public dialogRef: MdDialogRef<PizzaMsg>) { }
}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_DIRECTIVES = [ComponentWithChildViewContainer, PizzaMsg, DirectiveWithViewContainer];
@NgModule({
  imports: [MdDialogModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [ComponentWithChildViewContainer, PizzaMsg],
})
class DialogTestModule { }
