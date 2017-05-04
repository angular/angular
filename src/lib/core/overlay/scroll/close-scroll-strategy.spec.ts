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
  CloseScrollStrategy,
} from '../../core';


describe('CloseScrollStrategy', () => {
  let overlayRef: OverlayRef;
  let componentPortal: ComponentPortal<MozarellaMsg>;
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
    overlayState.scrollStrategy = new CloseScrollStrategy(scrollDispatcher);
    overlayRef = overlay.create(overlayState);
    componentPortal = new ComponentPortal(MozarellaMsg);
  }));

  afterEach(() => {
    overlayRef.dispose();
  });

  it('should detach the overlay as soon as the user scrolls', () => {
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'detach');

    scrolledSubject.next();
    expect(overlayRef.detach).toHaveBeenCalled();
  });

  it('should not attempt to detach the overlay after it has been detached', () => {
    overlayRef.attach(componentPortal);
    overlayRef.detach();

    spyOn(overlayRef, 'detach');
    scrolledSubject.next();

    expect(overlayRef.detach).not.toHaveBeenCalled();
  });

});


/** Simple component that we can attach to the overlay. */
@Component({template: '<p>Mozarella</p>'})
class MozarellaMsg { }


/** Test module to hold the component. */
@NgModule({
  imports: [OverlayModule, PortalModule],
  declarations: [MozarellaMsg],
  entryComponents: [MozarellaMsg],
})
class OverlayTestModule { }
