import {DOCUMENT} from '@angular/common';
import {waitForAsync, inject, TestBed} from '@angular/core/testing';
import {Component, NgModule, ViewChild, ViewContainerRef} from '@angular/core';
import {PortalModule, CdkPortal} from '@angular/cdk/portal';
import {Overlay, OverlayContainer, OverlayModule, FullscreenOverlayContainer} from './index';

describe('FullscreenOverlayContainer', () => {
  let overlay: Overlay;
  let fullscreenListeners: Set<Function>;
  let fakeDocument: any;

  beforeEach(waitForAsync(() => {
    fullscreenListeners = new Set();

    TestBed.configureTestingModule({
      imports: [OverlayTestModule],
      providers: [
        {
          provide: DOCUMENT,
          useFactory: () => {
            // Provide a (very limited) stub for the document. This is the most practical solution for
            // now since we only hit a handful of Document APIs. If we end up having to add more
            // stubs here, we should reconsider whether to use a Proxy instead. Avoiding a proxy for
            // now since it isn't supported on IE. See:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
            fakeDocument = {
              body: document.body,
              fullscreenElement: document.createElement('div'),
              fullscreenEnabled: true,
              addEventListener: function (eventName: string, listener: EventListener) {
                if (eventName === 'fullscreenchange') {
                  fullscreenListeners.add(listener);
                } else {
                  document.addEventListener(eventName, listener);
                }
              },
              removeEventListener: function (eventName: string, listener: EventListener) {
                if (eventName === 'fullscreenchange') {
                  fullscreenListeners.delete(listener);
                } else {
                  document.addEventListener(eventName, listener);
                }
              },
              querySelectorAll: function (...args: [string]) {
                return document.querySelectorAll(...args);
              },
              createElement: function (...args: [string, (ElementCreationOptions | undefined)?]) {
                return document.createElement(...args);
              },
              getElementsByClassName: function (...args: [string]) {
                return document.getElementsByClassName(...args);
              },
            };

            return fakeDocument;
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(inject([Overlay], (o: Overlay) => {
    overlay = o;
  }));

  afterEach(() => {
    fakeDocument = null;
  });

  it('should open an overlay inside a fullscreen element and move it to the body', () => {
    const fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
    fixture.detectChanges();
    const overlayRef = overlay.create();
    const fullscreenElement = fakeDocument.fullscreenElement;

    overlayRef.attach(fixture.componentInstance.templatePortal);
    fixture.detectChanges();

    expect(fullscreenElement.contains(overlayRef.overlayElement)).toBe(true);

    fakeDocument.fullscreenElement = null;
    fullscreenListeners.forEach(listener => listener());
    fixture.detectChanges();

    expect(fullscreenElement.contains(overlayRef.overlayElement)).toBe(false);
    expect(document.body.contains(overlayRef.overlayElement)).toBe(true);
  });

  it('should open an overlay inside the body and move it to a fullscreen element', () => {
    const fullscreenElement = fakeDocument.fullscreenElement;
    fakeDocument.fullscreenElement = null;

    const fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
    fixture.detectChanges();
    const overlayRef = overlay.create();

    overlayRef.attach(fixture.componentInstance.templatePortal);
    fixture.detectChanges();

    expect(fullscreenElement.contains(overlayRef.overlayElement)).toBe(false);
    expect(document.body.contains(overlayRef.overlayElement)).toBe(true);

    fakeDocument.fullscreenElement = fullscreenElement;
    fullscreenListeners.forEach(listener => listener());
    fixture.detectChanges();

    expect(fullscreenElement.contains(overlayRef.overlayElement)).toBe(true);
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
  providers: [
    {
      provide: OverlayContainer,
      useClass: FullscreenOverlayContainer,
    },
  ],
})
class OverlayTestModule {}
