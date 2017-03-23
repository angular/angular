import {inject, TestBed, async, ComponentFixture} from '@angular/core/testing';
import {NgModule, Component, ViewChild, ViewContainerRef} from '@angular/core';
import {TemplatePortalDirective, PortalModule} from '../portal/portal-directives';
import {TemplatePortal, ComponentPortal} from '../portal/portal';
import {Overlay} from './overlay';
import {OverlayContainer} from './overlay-container';
import {OverlayState} from './overlay-state';
import {PositionStrategy} from './position/position-strategy';
import {OverlayModule} from './overlay-directives';


describe('Overlay', () => {
  let overlay: Overlay;
  let componentPortal: ComponentPortal<PizzaMsg>;
  let templatePortal: TemplatePortal;
  let overlayContainerElement: HTMLElement;
  let viewContainerFixture: ComponentFixture<TestComponentWithTemplatePortals>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule.forRoot(), PortalModule, OverlayTestModule],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([Overlay], (o: Overlay) => {
    overlay = o;

    let fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
    fixture.detectChanges();
    templatePortal = fixture.componentInstance.templatePortal;
    componentPortal = new ComponentPortal(PizzaMsg, fixture.componentInstance.viewContainerRef);
    viewContainerFixture = fixture;
  }));

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

  it('should set the direction', () => {
    const state = new OverlayState();
    state.direction = 'rtl';

    overlay.create(state).attach(componentPortal);

    const pane = overlayContainerElement.children[0] as HTMLElement;
    expect(pane.getAttribute('dir')).toEqual('rtl');
  });

  describe('positioning', () => {
    let state: OverlayState;

    beforeEach(() => {
      state = new OverlayState();
    });

    it('should apply the positioning strategy', () => {
      state.positionStrategy = new FakePositionStrategy();

      overlay.create(state).attach(componentPortal);

      expect(overlayContainerElement.querySelectorAll('.fake-positioned').length).toBe(1);
    });
  });

  describe('size', () => {
    let state: OverlayState;

    beforeEach(() => {
      state = new OverlayState();
    });

    it('should apply the width set in the config', () => {
      state.width = 500;

      overlay.create(state).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.width).toEqual('500px');
    });

    it('should support using other units if a string width is provided', () => {
      state.width = '200%';

      overlay.create(state).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.width).toEqual('200%');
    });

    it('should apply the height set in the config', () => {
      state.height = 500;

      overlay.create(state).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.height).toEqual('500px');
    });

    it('should support using other units if a string height is provided', () => {
      state.height = '100vh';

      overlay.create(state).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.height).toEqual('100vh');
    });

    it('should apply the min width set in the config', () => {
      state.minWidth = 200;

      overlay.create(state).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.minWidth).toEqual('200px');
    });


    it('should apply the min height set in the config', () => {
      state.minHeight = 500;

      overlay.create(state).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.minHeight).toEqual('500px');
    });


    it('should support zero widths and heights', () => {
      state.width = 0;
      state.height = 0;

      overlay.create(state).attach(componentPortal);
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.width).toEqual('0px');
      expect(pane.style.height).toEqual('0px');
    });

  });

  describe('backdrop', () => {
    let config: OverlayState;

    beforeEach(() => {
      config = new OverlayState();
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
});

describe('OverlayContainer theming', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ imports: [OverlayContainerThemingTestModule] });
    TestBed.compileComponents();
  }));

  beforeEach(inject([OverlayContainer], (o: OverlayContainer) => {
    overlayContainer = o;
    overlayContainerElement = overlayContainer.getContainerElement();
  }));

  it('should be able to set a theme on the overlay container', () => {
    overlayContainer.themeClass = 'my-theme';
    expect(overlayContainerElement.classList).toContain('my-theme');
  });

  it('should clear any previously-set themes when a new theme is set', () => {
    overlayContainer.themeClass = 'initial-theme';
    expect(overlayContainerElement.classList).toContain('initial-theme');

    overlayContainer.themeClass = 'new-theme';
    expect(overlayContainerElement.classList).not.toContain('initial-theme');
    expect(overlayContainerElement.classList).toContain('new-theme');
  });
});

/** Simple component for testing ComponentPortal. */
@Component({template: '<p>Pizza</p>'})
class PizzaMsg { }


/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({template: `<ng-template cdk-portal>Cake</ng-template>`})
class TestComponentWithTemplatePortals {
  @ViewChild(TemplatePortalDirective) templatePortal: TemplatePortalDirective;

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

/** Component for testing the overlay container theming. */
@NgModule({
  imports: [OverlayModule, PortalModule],
})
class OverlayContainerThemingTestModule { }

class FakePositionStrategy implements PositionStrategy {
  apply(element: Element): Promise<void> {
    element.classList.add('fake-positioned');
    return Promise.resolve();
  }

  dispose() {}
}

