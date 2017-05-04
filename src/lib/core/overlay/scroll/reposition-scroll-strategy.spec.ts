import {inject, TestBed, async} from '@angular/core/testing';
import {NgModule, Component} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {
  PortalModule,
  ComponentPortal,
  Overlay,
  OverlayState,
  OverlayRef,
  OverlayModule,
  ScrollStrategy,
  ScrollDispatcher,
  RepositionScrollStrategy,
} from '../../core';


describe('RepositionScrollStrategy', () => {
  let overlayRef: OverlayRef;
  let componentPortal: ComponentPortal<PastaMsg>;
  let scrolledSubject = new Subject();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule, OverlayTestModule],
      providers: [
        {provide: ScrollDispatcher, useFactory: () => {
          return {scrolled: (delay: number, callback: () => any) => {
            return scrolledSubject.asObservable().subscribe(callback);
          }};
        }}
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([Overlay, ScrollDispatcher], (overlay: Overlay,
    scrollDispatcher: ScrollDispatcher) => {

    let overlayState = new OverlayState();
    overlayState.scrollStrategy = new RepositionScrollStrategy(scrollDispatcher);
    overlayRef = overlay.create(overlayState);
    componentPortal = new ComponentPortal(PastaMsg);
  }));

  afterEach(() => {
    overlayRef.dispose();
  });

  it('should update the overlay position when the page is scrolled', () => {
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');

    scrolledSubject.next();
    expect(overlayRef.updatePosition).toHaveBeenCalledTimes(1);

    scrolledSubject.next();
    expect(overlayRef.updatePosition).toHaveBeenCalledTimes(2);
  });

  it('should not be updating the position after the overlay is detached', () => {
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');

    overlayRef.detach();
    scrolledSubject.next();

    expect(overlayRef.updatePosition).not.toHaveBeenCalled();
  });

  it('should not be updating the position after the overlay is destroyed', () => {
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');

    overlayRef.dispose();
    scrolledSubject.next();

    expect(overlayRef.updatePosition).not.toHaveBeenCalled();
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
