import {inject, async, ComponentFixture, TestBed} from '@angular/core/testing';
import {NgModule, Component, Directive, ViewChild, ViewContainerRef} from '@angular/core';
import {MdDialog, MdDialogModule} from './dialog';
import {OverlayContainer} from '@angular2-material/core';
import {MdDialogConfig} from './dialog-config';
import {MdDialogRef} from './dialog-ref';


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
    let config = new MdDialogConfig();
    config.viewContainerRef = testViewContainerRef;

    let dialogRef = dialog.open(PizzaMsg, config);

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(dialogRef.componentInstance).toEqual(jasmine.any(PizzaMsg));
    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();
    let dialogContainerElement = overlayContainerElement.querySelector('md-dialog-container');
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
  });

  it('should apply the configured role to the dialog element', () => {
    let config = new MdDialogConfig();
    config.viewContainerRef = testViewContainerRef;
    config.role = 'alertdialog';

    dialog.open(PizzaMsg, config);

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('md-dialog-container');
    expect(dialogContainerElement.getAttribute('role')).toBe('alertdialog');
  });

  it('should close a dialog and get back a result', () => {
    let config = new MdDialogConfig();
    config.viewContainerRef = testViewContainerRef;

    let dialogRef = dialog.open(PizzaMsg, config);

    viewContainerFixture.detectChanges();

    let afterCloseResult: string;
    dialogRef.afterClosed().subscribe(result => {
      afterCloseResult = result;
    });

    dialogRef.close('Charmander');

    expect(afterCloseResult).toBe('Charmander');
    expect(overlayContainerElement.querySelector('md-dialog-container')).toBeNull();
  });

  it('should close when clicking on the overlay backdrop', () => {
    let config = new MdDialogConfig();
    config.viewContainerRef = testViewContainerRef;

    dialog.open(PizzaMsg, config);

    viewContainerFixture.detectChanges();

    let backdrop = <HTMLElement> overlayContainerElement.querySelector('.md-overlay-backdrop');
    backdrop.click();

    expect(overlayContainerElement.querySelector('md-dialog-container')).toBeFalsy();
  });
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
@Component({template: '<p>Pizza</p>'})
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
