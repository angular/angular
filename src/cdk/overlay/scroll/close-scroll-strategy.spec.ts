import {inject, TestBed, fakeAsync} from '@angular/core/testing';
import {NgModule, Component, NgZone} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {ScrollDispatcher, ViewportRuler} from '@angular/cdk/scrolling';
import {
  Overlay,
  OverlayConfig,
  OverlayRef,
  OverlayModule,
  OverlayContainer,
} from '../index';


describe('CloseScrollStrategy', () => {
  let overlayRef: OverlayRef;
  let componentPortal: ComponentPortal<MozarellaMsg>;
  let scrolledSubject = new Subject();
  let scrollPosition: number;

  beforeEach(fakeAsync(() => {
    scrollPosition = 0;

    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule, OverlayTestModule],
      providers: [
        {provide: ScrollDispatcher, useFactory: () => ({
          scrolled: () => scrolledSubject.asObservable()
        })},
        {provide: ViewportRuler, useFactory: () => ({
          getViewportScrollPosition: () => ({top: scrollPosition})
        })}
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([Overlay], (overlay: Overlay) => {
    let overlayConfig = new OverlayConfig({scrollStrategy: overlay.scrollStrategies.close()});
    overlayRef = overlay.create(overlayConfig);
    componentPortal = new ComponentPortal(MozarellaMsg);
  }));

  afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
    overlayRef.dispose();
    container.getContainerElement().parentNode!.removeChild(container.getContainerElement());
  }));

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

  it('should detach inside the NgZone', () => {
    const spy = jasmine.createSpy('detachment spy');
    const subscription = overlayRef.detachments().subscribe(() => spy(NgZone.isInAngularZone()));

    overlayRef.attach(componentPortal);
    scrolledSubject.next();

    expect(spy).toHaveBeenCalledWith(true);
    subscription.unsubscribe();
  });

  it('should be able to reposition the overlay up to a certain threshold before closing',
    inject([Overlay], (overlay: Overlay) => {
      overlayRef.dispose();

      overlayRef = overlay.create({
        scrollStrategy: overlay.scrollStrategies.close({threshold: 50})
      });

      overlayRef.attach(componentPortal);
      spyOn(overlayRef, 'updatePosition');
      spyOn(overlayRef, 'detach');

      for (let i = 0; i < 50; i++) {
        scrollPosition++;
        scrolledSubject.next();
      }

      expect(overlayRef.updatePosition).toHaveBeenCalledTimes(50);
      expect(overlayRef.detach).not.toHaveBeenCalled();

      scrollPosition++;
      scrolledSubject.next();

      expect(overlayRef.detach).toHaveBeenCalledTimes(1);
    }));

    it('should not close if the user starts scrolling away and comes back',
      inject([Overlay], (overlay: Overlay) => {
        overlayRef.dispose();
        scrollPosition = 100;

        overlayRef = overlay.create({
          scrollStrategy: overlay.scrollStrategies.close({threshold: 50})
        });

        overlayRef.attach(componentPortal);
        spyOn(overlayRef, 'updatePosition');
        spyOn(overlayRef, 'detach');

        // Scroll down 30px.
        for (let i = 0; i < 30; i++) {
          scrollPosition++;
          scrolledSubject.next();
        }

        // Scroll back up 30px.
        for (let i = 0; i < 30; i++) {
          scrollPosition--;
          scrolledSubject.next();
        }

        expect(overlayRef.updatePosition).toHaveBeenCalledTimes(60);
        expect(overlayRef.detach).not.toHaveBeenCalled();
      }));
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
