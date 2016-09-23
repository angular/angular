import {
  inject,
  async,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  NgModule,
  Component,
  Directive,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {MdSnackBar, MdSnackBarModule} from './snack-bar';
import {OverlayContainer} from '../core';
import {MdSnackBarConfig} from './snack-bar-config';
import {SimpleSnackBar} from './simple-snack-bar';


describe('MdSnackBar', () => {
  let snackBar: MdSnackBar;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  let simpleMessage = 'Burritos are here!';
  let simpleActionLabel = 'pickup';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSnackBarModule.forRoot(), SnackBarTestModule],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ],
    });
    TestBed.compileComponents();
  }));

  beforeEach(inject([MdSnackBar], (sb: MdSnackBar) => {
    snackBar = sb;
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should have the role of alert', () => {
    let config = new MdSnackBarConfig(testViewContainerRef);
    snackBar.open(simpleMessage, simpleActionLabel, config);

    let containerElement = overlayContainerElement.querySelector('snack-bar-container');

    expect(containerElement.getAttribute('role'))
        .toBe('alert', 'Expected snack bar container to have role="alert"');
   });

  it('should open a simple message with a button', () => {
    let config = new MdSnackBarConfig(testViewContainerRef);
    let snackBarRef = snackBar.open(simpleMessage, simpleActionLabel, config);

    viewContainerFixture.detectChanges();

    expect(snackBarRef.instance)
      .toEqual(jasmine.any(SimpleSnackBar),
               'Expected the snack bar content component to be SimpleSnackBar');
    expect(snackBarRef.instance.snackBarRef)
      .toBe(snackBarRef, 'Expected the snack bar reference to be placed in the component instance');

    let messageElement = overlayContainerElement.querySelector('span.md-simple-snackbar-message');
    expect(messageElement.tagName).toBe('SPAN', 'Expected snack bar message element to be <span>');
    expect(messageElement.textContent)
        .toBe(simpleMessage, `Expected the snack bar message to be '${simpleMessage}''`);

    let buttonElement = overlayContainerElement.querySelector('button.md-simple-snackbar-action');
    expect(buttonElement.tagName)
        .toBe('BUTTON', 'Expected snack bar action label to be a <button>');
    expect(buttonElement.textContent)
        .toBe(simpleActionLabel,
              `Expected the snack bar action labe; to be '${simpleActionLabel}'`);
  });

  it('should open a simple message with no button', () => {
    let config = new MdSnackBarConfig(testViewContainerRef);
    let snackBarRef = snackBar.open(simpleMessage, null, config);

    viewContainerFixture.detectChanges();

    expect(snackBarRef.instance)
      .toEqual(jasmine.any(SimpleSnackBar),
               'Expected the snack bar content component to be SimpleSnackBar');
    expect(snackBarRef.instance.snackBarRef)
      .toBe(snackBarRef, 'Expected the snack bar reference to be placed in the component instance');

    let messageElement = overlayContainerElement.querySelector('span.md-simple-snackbar-message');
    expect(messageElement.tagName).toBe('SPAN', 'Expected snack bar message element to be <span>');
    expect(messageElement.textContent)
        .toBe(simpleMessage, `Expected the snack bar message to be '${simpleMessage}''`);

    expect(overlayContainerElement.querySelector('button.md-simple-snackbar-action'))
        .toBeNull('Expected the query selection for action label to be null');
  });

  it('should dismiss the snack bar and remove itself from the view', () => {
    let config = new MdSnackBarConfig(testViewContainerRef);
    let snackBarRef = snackBar.open(simpleMessage, null, config);
    let dismissed = true;
    snackBarRef.afterDismissed().subscribe(result => {
      dismissed = true;
    });

    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.childElementCount)
        .toBeGreaterThan(0, 'Expected overlay container element to have at least one child');

    snackBarRef.dismiss();

    expect(dismissed).toBeTruthy('Expected the snack bar to be dismissed');
    expect(overlayContainerElement.childElementCount)
        .toBe(0, 'Expected the overlay container element to have no child elements');
  });

  it('should open a custom component', () => {
    let config = new MdSnackBarConfig(testViewContainerRef);
    let snackBarRef = snackBar.openFromComponent(BurritosNotification, config);

    expect(snackBarRef.instance)
      .toEqual(jasmine.any(BurritosNotification),
               'Expected the snack bar content component to be BurritosNotification');
    expect(overlayContainerElement.textContent)
        .toBe('Burritos are on the way.',
              `Expected the overlay text content to be 'Burritos are on the way'`);

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
@Component({template: '<p>Burritos are on the way.</p>'})
class BurritosNotification {}


/** Simple component to open snack bars from.
 * Create a real (non-test) NgModule as a workaround forRoot
 * https://github.com/angular/angular/issues/10760
 */
const TEST_DIRECTIVES = [ComponentWithChildViewContainer,
                         BurritosNotification,
                         DirectiveWithViewContainer];
@NgModule({
  imports: [MdSnackBarModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [ComponentWithChildViewContainer, BurritosNotification],
})
class SnackBarTestModule { }
