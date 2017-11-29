import {async, fakeAsync, tick, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {Component, NgModule, ViewChild, ViewContainerRef} from '@angular/core';
import {
  ComponentPortal,
  PortalModule,
  TemplatePortal,
  CdkPortal
} from '@angular/cdk/portal';
import {
  Overlay,
  OverlayContainer,
  OverlayModule,
  OverlayRef,
  OverlayConfig,
  PositionStrategy,
  ScrollStrategy,
} from './index';


describe('Overlay', () => {
  let overlay: Overlay;
  let componentPortal: ComponentPortal<PizzaMsg>;
  let templatePortal: TemplatePortal<any>;
  let overlayContainerElement: HTMLElement;
  let overlayContainer: OverlayContainer;
  let viewContainerFixture: ComponentFixture<TestComponentWithTemplatePortals>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule, OverlayTestModule]
    }).compileComponents();
  }));

  beforeEach(inject([Overlay, OverlayContainer], (o: Overlay, oc: OverlayContainer) => {
    overlay = o;
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();

    let fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
    fixture.detectChanges();
    templatePortal = fixture.componentInstance.templatePortal;
    componentPortal = new ComponentPortal(PizzaMsg, fixture.componentInstance.viewContainerRef);
    viewContainerFixture = fixture;
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should load a component into an overlay', () => {
    let overlayRef = overlay.create();
    overlayRef.attach(componentPortal);

    expect(overlayContainerElement.textContent).toContain('Pizza');

    overlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(0);
    expect(overlayContainerElement.textContent).toBe('');
  });

  it('should load a template portal into an overlay', () => {
    let overlayRef = overlay.create();
    overlayRef.attach(templatePortal);

    expect(overlayContainerElement.textContent).toContain('Cake');

    overlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(0);
    expect(overlayContainerElement.textContent).toBe('');
  });

  it('should disable pointer events of the pane element if detached', () => {
    let overlayRef = overlay.create();
    let paneElement = overlayRef.overlayElement;

    overlayRef.attach(componentPortal);
    viewContainerFixture.detectChanges();

    expect(paneElement.childNodes.length).not.toBe(0);
    expect(paneElement.style.pointerEvents)
      .toBe('auto', 'Expected the overlay pane to enable pointerEvents when attached.');

    overlayRef.detach();

    expect(paneElement.childNodes.length).toBe(0);
    expect(paneElement.style.pointerEvents)
      .toBe('none', 'Expected the overlay pane to disable pointerEvents when detached.');
  });

  it('should open multiple overlays', () => {
    let pizzaOverlayRef = overlay.create();
    pizzaOverlayRef.attach(componentPortal);

    let cakeOverlayRef = overlay.create();
    cakeOverlayRef.attach(templatePortal);

    expect(overlayContainerElement.childNodes.length).toBe(2);
    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(overlayContainerElement.textContent).toContain('Cake');

    pizzaOverlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(1);
    expect(overlayContainerElement.textContent).toContain('Cake');

    cakeOverlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(0);
    expect(overlayContainerElement.textContent).toBe('');
  });

  it('should ensure that the most-recently-attached overlay is on top', (() => {
    let pizzaOverlayRef = overlay.create();
    let cakeOverlayRef = overlay.create();

    pizzaOverlayRef.attach(componentPortal);
    cakeOverlayRef.attach(templatePortal);

    expect(pizzaOverlayRef.overlayElement.nextSibling)
        .toBeTruthy('Expected pizza to be on the bottom.');
    expect(cakeOverlayRef.overlayElement.nextSibling)
        .toBeFalsy('Expected cake to be on top.');

    pizzaOverlayRef.dispose();
    cakeOverlayRef.detach();

    pizzaOverlayRef = overlay.create();
    pizzaOverlayRef.attach(componentPortal);
    cakeOverlayRef.attach(templatePortal);

    expect(pizzaOverlayRef.overlayElement.nextSibling)
        .toBeTruthy('Expected pizza to still be on the bottom.');
    expect(cakeOverlayRef.overlayElement.nextSibling)
        .toBeFalsy('Expected cake to still be on top.');
  }));

  it('should set the direction', () => {
    const config = new OverlayConfig({direction: 'rtl'});

    overlay.create(config).attach(componentPortal);

    const pane = overlayContainerElement.children[0] as HTMLElement;
    expect(pane.getAttribute('dir')).toEqual('rtl');
  });

  it('should emit when an overlay is attached', () => {
    let overlayRef = overlay.create();
    let spy = jasmine.createSpy('attachments spy');

    overlayRef.attachments().subscribe(spy);
    overlayRef.attach(componentPortal);

    expect(spy).toHaveBeenCalled();
  });

  it('should emit the attachment event after everything is added to the DOM', () => {
    let config = new OverlayConfig({hasBackdrop: true});
    let overlayRef = overlay.create(config);

    overlayRef.attachments().subscribe(() => {
      expect(overlayContainerElement.querySelector('pizza'))
          .toBeTruthy('Expected the overlay to have been attached.');

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop'))
          .toBeTruthy('Expected the backdrop to have been attached.');
    });

    overlayRef.attach(componentPortal);
  });

  it('should emit when an overlay is detached', () => {
    let overlayRef = overlay.create();
    let spy = jasmine.createSpy('detachments spy');

    overlayRef.detachments().subscribe(spy);
    overlayRef.attach(componentPortal);
    overlayRef.detach();

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit to the detach stream if the overlay has not been attached', () => {
    let overlayRef = overlay.create();
    let spy = jasmine.createSpy('detachments spy');

    overlayRef.detachments().subscribe(spy);
    overlayRef.detach();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit to the detach stream on dispose if the overlay was not attached', () => {
    let overlayRef = overlay.create();
    let spy = jasmine.createSpy('detachments spy');

    overlayRef.detachments().subscribe(spy);
    overlayRef.dispose();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit the detachment event after the overlay is removed from the DOM', () => {
    let overlayRef = overlay.create();

    overlayRef.detachments().subscribe(() => {
      expect(overlayContainerElement.querySelector('pizza'))
          .toBeFalsy('Expected the overlay to have been detached.');
    });

    overlayRef.attach(componentPortal);
    overlayRef.detach();
  });

  it('should emit and complete the observables when an overlay is disposed', () => {
    let overlayRef = overlay.create();
    let disposeSpy = jasmine.createSpy('dispose spy');
    let attachCompleteSpy = jasmine.createSpy('attachCompleteSpy spy');
    let detachCompleteSpy = jasmine.createSpy('detachCompleteSpy spy');

    overlayRef.attachments().subscribe(undefined, undefined, attachCompleteSpy);
    overlayRef.detachments().subscribe(disposeSpy, undefined, detachCompleteSpy);

    overlayRef.attach(componentPortal);
    overlayRef.dispose();

    expect(disposeSpy).toHaveBeenCalled();
    expect(attachCompleteSpy).toHaveBeenCalled();
    expect(detachCompleteSpy).toHaveBeenCalled();
  });

  it('should complete the attachment observable before the detachment one', () => {
    let overlayRef = overlay.create();
    let callbackOrder: string[] = [];

    overlayRef.attachments().subscribe(undefined, undefined, () => callbackOrder.push('attach'));
    overlayRef.detachments().subscribe(undefined, undefined, () => callbackOrder.push('detach'));

    overlayRef.attach(componentPortal);
    overlayRef.dispose();

    expect(callbackOrder).toEqual(['attach', 'detach']);
  });

  describe('positioning', () => {
    let config: OverlayConfig;

    beforeEach(() => {
      config = new OverlayConfig();
    });

    it('should apply the positioning strategy', fakeAsync(() => {
      config.positionStrategy = new FakePositionStrategy();

      overlay.create(config).attach(componentPortal);
      viewContainerFixture.detectChanges();
      tick();

      expect(overlayContainerElement.querySelectorAll('.fake-positioned').length).toBe(1);
    }));
  });

  describe('size', () => {
    let config: OverlayConfig;

    beforeEach(() => {
      config = new OverlayConfig();
    });

    it('should apply the width set in the config', () => {
      config.width = 500;

      overlay.create(config).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.width).toEqual('500px');
    });

    it('should support using other units if a string width is provided', () => {
      config.width = '200%';

      overlay.create(config).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.width).toEqual('200%');
    });

    it('should apply the height set in the config', () => {
      config.height = 500;

      overlay.create(config).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.height).toEqual('500px');
    });

    it('should support using other units if a string height is provided', () => {
      config.height = '100vh';

      overlay.create(config).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.height).toEqual('100vh');
    });

    it('should apply the min width set in the config', () => {
      config.minWidth = 200;

      overlay.create(config).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.minWidth).toEqual('200px');
    });


    it('should apply the min height set in the config', () => {
      config.minHeight = 500;

      overlay.create(config).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.minHeight).toEqual('500px');
    });

    it('should apply the max width set in the config', () => {
      config.maxWidth = 200;

      overlay.create(config).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.maxWidth).toEqual('200px');
    });


    it('should apply the max height set in the config', () => {
      config.maxHeight = 500;

      overlay.create(config).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.maxHeight).toEqual('500px');
    });

    it('should support zero widths and heights', () => {
      config.width = 0;
      config.height = 0;

      overlay.create(config).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.width).toEqual('0px');
      expect(pane.style.height).toEqual('0px');
    });
  });

  describe('backdrop', () => {
    let config: OverlayConfig;

    beforeEach(() => {
      config = new OverlayConfig();
      config.hasBackdrop = true;
    });

    it('should create and destroy an overlay backdrop', () => {
      let overlayRef = overlay.create(config);
      overlayRef.attach(componentPortal);

      viewContainerFixture.detectChanges();
      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      expect(backdrop).toBeTruthy();
      expect(backdrop.classList).not.toContain('cdk-overlay-backdrop-showing');

      let backdropClickHandler = jasmine.createSpy('backdropClickHander');
      overlayRef.backdropClick().subscribe(backdropClickHandler);

      backdrop.click();
      expect(backdropClickHandler).toHaveBeenCalled();
    });

    it('should complete the backdrop click stream once the overlay is destroyed', () => {
      let overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      viewContainerFixture.detectChanges();

      let completeHandler = jasmine.createSpy('backdrop complete handler');

      overlayRef.backdropClick().subscribe(undefined, undefined, completeHandler);
      overlayRef.dispose();

      expect(completeHandler).toHaveBeenCalled();
    });

    it('should apply the default overlay backdrop class', () => {
      let overlayRef = overlay.create(config);
      overlayRef.attach(componentPortal);
      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      expect(backdrop.classList).toContain('cdk-overlay-dark-backdrop');
    });

    it('should apply a custom overlay backdrop class', () => {
      config.backdropClass = 'cdk-overlay-transparent-backdrop';

      let overlayRef = overlay.create(config);
      overlayRef.attach(componentPortal);
      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      expect(backdrop.classList).toContain('cdk-overlay-transparent-backdrop');
    });

    it('should disable the pointer events of a backdrop that is being removed', () => {
      let overlayRef = overlay.create(config);
      overlayRef.attach(componentPortal);

      viewContainerFixture.detectChanges();
      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

      expect(backdrop.style.pointerEvents).toBeFalsy();

      overlayRef.detach();

      expect(backdrop.style.pointerEvents).toBe('none');
    });

    it('should insert the backdrop before the overlay pane in the DOM order', () => {
      let overlayRef = overlay.create(config);
      overlayRef.attach(componentPortal);

      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop');
      let pane = overlayContainerElement.querySelector('.cdk-overlay-pane');
      let children = Array.prototype.slice.call(overlayContainerElement.children);

      expect(children.indexOf(backdrop)).toBeGreaterThan(-1);
      expect(children.indexOf(pane)).toBeGreaterThan(-1);
      expect(children.indexOf(backdrop))
        .toBeLessThan(children.indexOf(pane), 'Expected backdrop to be before the pane in the DOM');
    });

  });

  describe('panelClass', () => {
    it('should apply a custom overlay pane class', () => {
      const config = new OverlayConfig({panelClass: 'custom-panel-class'});

      overlay.create(config).attach(componentPortal);
      viewContainerFixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(pane.classList).toContain('custom-panel-class');
    });

    it('should be able to apply multiple classes', () => {
      const config = new OverlayConfig({panelClass: ['custom-class-one', 'custom-class-two']});

      overlay.create(config).attach(componentPortal);
      viewContainerFixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

      expect(pane.classList).toContain('custom-class-one');
      expect(pane.classList).toContain('custom-class-two');
    });
  });

  describe('scroll strategy', () => {
    let fakeScrollStrategy: FakeScrollStrategy;
    let config: OverlayConfig;
    let overlayRef: OverlayRef;

    beforeEach(() => {
      fakeScrollStrategy = new FakeScrollStrategy();
      config = new OverlayConfig({scrollStrategy: fakeScrollStrategy});
      overlayRef = overlay.create(config);
    });

    it('should attach the overlay ref to the scroll strategy', () => {
      expect(fakeScrollStrategy.overlayRef).toBe(overlayRef,
          'Expected scroll strategy to have been attached to the current overlay ref.');
    });

    it('should enable the scroll strategy when the overlay is attached', () => {
      overlayRef.attach(componentPortal);
      expect(fakeScrollStrategy.isEnabled).toBe(true, 'Expected scroll strategy to be enabled.');
    });

    it('should disable the scroll strategy once the overlay is detached', () => {
      overlayRef.attach(componentPortal);
      expect(fakeScrollStrategy.isEnabled).toBe(true, 'Expected scroll strategy to be enabled.');

      overlayRef.detach();
      expect(fakeScrollStrategy.isEnabled).toBe(false, 'Expected scroll strategy to be disabled.');
    });

    it('should disable the scroll strategy when the overlay is destroyed', () => {
      overlayRef.dispose();
      expect(fakeScrollStrategy.isEnabled).toBe(false, 'Expected scroll strategy to be disabled.');
    });
  });
});

/** Simple component for testing ComponentPortal. */
@Component({
  selector: 'pizza',
  template: '<p>Pizza</p>'
})
class PizzaMsg { }


/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({template: `<ng-template cdk-portal>Cake</ng-template>`})
class TestComponentWithTemplatePortals {
  @ViewChild(CdkPortal) templatePortal: CdkPortal;

  constructor(public viewContainerRef: ViewContainerRef) { }
}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [PizzaMsg, TestComponentWithTemplatePortals];
@NgModule({
  imports: [OverlayModule, PortalModule],
  exports: TEST_COMPONENTS,
  declarations: TEST_COMPONENTS,
  entryComponents: TEST_COMPONENTS,
})
class OverlayTestModule { }

class FakePositionStrategy implements PositionStrategy {
  element: HTMLElement;

  apply(): void {
    this.element.classList.add('fake-positioned');
  }

  attach(overlayRef: OverlayRef) {
    this.element = overlayRef.overlayElement;
  }

  dispose() {}
}


class FakeScrollStrategy implements ScrollStrategy {
  isEnabled = false;
  overlayRef: OverlayRef;

  attach(overlayRef: OverlayRef) {
    this.overlayRef = overlayRef;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}
