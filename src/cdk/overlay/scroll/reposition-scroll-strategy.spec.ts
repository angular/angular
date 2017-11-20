import {async, inject, TestBed} from '@angular/core/testing';
import {Component, NgModule} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {
  Overlay,
  OverlayContainer,
  OverlayModule,
  OverlayRef,
  OverlayConfig,
  ScrollDispatcher,
} from '../index';


describe('RepositionScrollStrategy', () => {
  let overlayRef: OverlayRef;
  let overlay: Overlay;
  let componentPortal: ComponentPortal<PastaMsg>;
  let scrolledSubject = new Subject();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule, OverlayTestModule],
      providers: [
        {provide: ScrollDispatcher, useFactory: () => ({
          scrolled: () => scrolledSubject.asObservable()
        })}
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([Overlay], (o: Overlay) => {
    overlay = o;
    componentPortal = new ComponentPortal(PastaMsg);
  }));

  afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
    overlayRef.dispose();
    container.getContainerElement().parentNode!.removeChild(container.getContainerElement());
  }));

  it('should update the overlay position when the page is scrolled', () => {
    const overlayConfig = new OverlayConfig({
      scrollStrategy: overlay.scrollStrategies.reposition()
    });

    overlayRef = overlay.create(overlayConfig);
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');

    scrolledSubject.next();
    expect(overlayRef.updatePosition).toHaveBeenCalledTimes(1);

    scrolledSubject.next();
    expect(overlayRef.updatePosition).toHaveBeenCalledTimes(2);
  });

  it('should not be updating the position after the overlay is detached', () => {
    const overlayConfig = new OverlayConfig({
      scrollStrategy: overlay.scrollStrategies.reposition()
    });

    overlayRef = overlay.create(overlayConfig);
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');

    overlayRef.detach();
    scrolledSubject.next();

    expect(overlayRef.updatePosition).not.toHaveBeenCalled();
  });

  it('should not be updating the position after the overlay is destroyed', () => {
    const overlayConfig = new OverlayConfig({
      scrollStrategy: overlay.scrollStrategies.reposition()
    });

    overlayRef = overlay.create(overlayConfig);
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');

    overlayRef.dispose();
    scrolledSubject.next();

    expect(overlayRef.updatePosition).not.toHaveBeenCalled();
  });

  it('should be able to close the overlay once it is out of view', () => {
    const overlayConfig = new OverlayConfig({
      scrollStrategy: overlay.scrollStrategies.reposition({
        autoClose: true
      })
    });

    overlayRef = overlay.create(overlayConfig);
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');
    spyOn(overlayRef, 'detach');
    spyOn(overlayRef.overlayElement, 'getBoundingClientRect').and.returnValue({
      top: -1000,
      bottom: -900,
      left: 0,
      right: 100,
      width: 100,
      height: 100
    });

    scrolledSubject.next();
    expect(overlayRef.detach).toHaveBeenCalledTimes(1);
  });

});


/** Simple component that we can attach to the overlay. */
@Component({template: '<p>Pasta</p>'})
class PastaMsg { }


/** Test module to hold the component. */
@NgModule({
  imports: [OverlayModule, PortalModule],
  declarations: [PastaMsg],
  entryComponents: [PastaMsg],
})
class OverlayTestModule { }
