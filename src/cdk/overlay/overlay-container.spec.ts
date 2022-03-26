import {waitForAsync, inject, TestBed} from '@angular/core/testing';
import {Component, NgModule, ViewChild, ViewContainerRef} from '@angular/core';
import {PortalModule, CdkPortal} from '@angular/cdk/portal';
import {Overlay, OverlayContainer, OverlayModule} from './index';

describe('OverlayContainer', () => {
  let overlay: Overlay;
  let overlayContainer: OverlayContainer;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OverlayTestModule],
    }).compileComponents();
  }));

  beforeEach(inject([Overlay, OverlayContainer], (o: Overlay, oc: OverlayContainer) => {
    overlay = o;
    overlayContainer = oc;
  }));

  it('should remove the overlay container element from the DOM on destruction', () => {
    const fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
    fixture.detectChanges();
    const overlayRef = overlay.create();
    overlayRef.attach(fixture.componentInstance.templatePortal);
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-container'))
      .not.withContext('Expected the overlay container to be in the DOM after opening an overlay')
      .toBeNull();

    // Manually call `ngOnDestroy` because there is no way to force Angular to destroy an
    // injectable in a unit test.
    overlayContainer.ngOnDestroy();

    expect(document.querySelector('.cdk-overlay-container'))
      .withContext('Expected the overlay container *not* to be in the DOM after destruction')
      .toBeNull();
  });

  it('should add and remove css classes from the container element', () => {
    overlayContainer.getContainerElement().classList.add('commander-shepard');

    const containerElement = document.querySelector('.cdk-overlay-container')!;
    expect(containerElement.classList.contains('commander-shepard'))
      .withContext('Expected the overlay container to have class "commander-shepard"')
      .toBe(true);

    overlayContainer.getContainerElement().classList.remove('commander-shepard');

    expect(containerElement.classList.contains('commander-shepard'))
      .withContext('Expected the overlay container not to have class "commander-shepard"')
      .toBe(false);
  });

  it('should remove overlay containers from the server when on the browser', () => {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-overlay-container');
    extraContainer.setAttribute('platform', 'server');
    document.body.appendChild(extraContainer);

    overlayContainer.getContainerElement();
    expect(document.querySelectorAll('.cdk-overlay-container').length).toBe(1);
    extraContainer.remove();
  });

  it('should remove overlay containers from other unit tests', () => {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-overlay-container');
    extraContainer.setAttribute('platform', 'test');
    document.body.appendChild(extraContainer);

    overlayContainer.getContainerElement();
    expect(document.querySelectorAll('.cdk-overlay-container').length).toBe(1);
    extraContainer.remove();
  });

  it('should not remove extra containers that were created on the browser', () => {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-overlay-container');
    document.body.appendChild(extraContainer);

    overlayContainer.getContainerElement();

    expect(document.querySelectorAll('.cdk-overlay-container').length).toBe(2);
    extraContainer.remove();
  });
});

/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({
  template: `<ng-template cdk-portal>Cake</ng-template>`,
  providers: [Overlay],
})
class TestComponentWithTemplatePortals {
  @ViewChild(CdkPortal) templatePortal: CdkPortal;

  constructor(public viewContainerRef: ViewContainerRef) {}
}

@NgModule({
  imports: [OverlayModule, PortalModule],
  declarations: [TestComponentWithTemplatePortals],
})
class OverlayTestModule {}
