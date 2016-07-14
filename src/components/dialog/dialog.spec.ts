import {
  inject,
  fakeAsync,
  async,
  addProviders,
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {
  Component,
  Directive,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
} from '@angular/core';
import {MdDialog} from './dialog';
import {OVERLAY_PROVIDERS, OVERLAY_CONTAINER_TOKEN} from '@angular2-material/core/overlay/overlay';
import {MdDialogConfig} from './dialog-config';
import {MdDialogRef} from './dialog-ref';



describe('MdDialog', () => {
  let builder: TestComponentBuilder;
  let dialog: MdDialog;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  beforeEach(() => {
    addProviders([
      OVERLAY_PROVIDERS,
      MdDialog,
      {provide: OVERLAY_CONTAINER_TOKEN, useFactory: () => {
        overlayContainerElement = document.createElement('div');
        return overlayContainerElement;
      }}
    ]);
  });

  let deps = [TestComponentBuilder, MdDialog];
  beforeEach(inject(deps, fakeAsync((tcb: TestComponentBuilder, d: MdDialog) => {
    builder = tcb;
    dialog = d;
  })));

  beforeEach(async(() => {
    builder.createAsync(ComponentWithChildViewContainer).then(fixture => {
      viewContainerFixture = fixture;

      viewContainerFixture.detectChanges();
      testViewContainerRef = fixture.componentInstance.childViewContainer;
    });
  }));

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
  directives: [DirectiveWithViewContainer],
})
class ComponentWithChildViewContainer {
  @ViewChild(DirectiveWithViewContainer) childWithViewContainer: DirectiveWithViewContainer;

  constructor(public changeDetectorRef: ChangeDetectorRef) { }

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
