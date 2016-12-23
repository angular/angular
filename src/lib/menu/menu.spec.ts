import {TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  MdMenuModule,
  MdMenuTrigger,
  MdMenuPanel,
  MenuPositionX,
  MenuPositionY
} from './menu';
import {OverlayContainer} from '../core/overlay/overlay-container';
import {ViewportRuler} from '../core/overlay/position/viewport-ruler';
import {Dir, LayoutDirection} from '../core/rtl/dir';

describe('MdMenu', () => {
  let overlayContainerElement: HTMLElement;
  let dir: LayoutDirection = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdMenuModule.forRoot()],
      declarations: [SimpleMenu, PositionedMenu, CustomMenuPanel, CustomMenu],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          overlayContainerElement.style.position = 'fixed';
          overlayContainerElement.style.top = '0';
          overlayContainerElement.style.left = '0';
          document.body.appendChild(overlayContainerElement);

          // remove body padding to keep consistent cross-browser
          document.body.style.padding = '0';
          document.body.style.margin = '0';
          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Dir, useFactory: () => {
          return {value: dir};
        }},
        {provide: ViewportRuler, useClass: FakeViewportRuler}
      ]
    });

    TestBed.compileComponents();
  }));

  afterEach(() => {
    document.body.removeChild(overlayContainerElement);
  });

  it('should open the menu as an idempotent operation', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.componentInstance.trigger.openMenu();

      expect(overlayContainerElement.textContent).toContain('Item');
      expect(overlayContainerElement.textContent).toContain('Disabled');
    }).not.toThrowError();
  });

  it('should close the menu when a click occurs outside the menu', async(() => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const backdrop = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-backdrop');
    backdrop.click();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(overlayContainerElement.textContent).toBe('');
    });
  }));

  it('should open a custom menu', () => {
    const fixture = TestBed.createComponent(CustomMenu);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.componentInstance.trigger.openMenu();

      expect(overlayContainerElement.textContent).toContain('Custom Menu header');
      expect(overlayContainerElement.textContent).toContain('Custom Content');
    }).not.toThrowError();
  });

  it('should set the panel direction based on the trigger direction', () => {
    dir = 'rtl';
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane');
    expect(overlayPane.getAttribute('dir')).toEqual('rtl');
  });

  describe('positions', () => {

    beforeEach(() => {
      const fixture = TestBed.createComponent(PositionedMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the bottom edge of viewport,so it has space to open "above"
      trigger.style.position = 'relative';
      trigger.style.top = '600px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
    });

    it('should append md-menu-before if x position is changed', () => {
      const panel = overlayContainerElement.querySelector('.md-menu-panel');
      expect(panel.classList).toContain('md-menu-before');
      expect(panel.classList).not.toContain('md-menu-after');
    });

    it('should append md-menu-above if y position is changed', () => {
      const panel = overlayContainerElement.querySelector('.md-menu-panel');
      expect(panel.classList).toContain('md-menu-above');
      expect(panel.classList).not.toContain('md-menu-below');
    });

  });

  describe('fallback positions', () => {

    it('should fall back to "before" mode if "after" mode would not fit on screen', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the right side of viewport, so it doesn't have space to open
      // in its default "after" position on the right side.
      trigger.style.position = 'relative';
      trigger.style.left = '900px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // In "before" position, the right sides of the overlay and the origin are aligned.
      // To find the overlay left, subtract the menu width from the origin's right side.
      const expectedLeft = triggerRect.right - overlayRect.width;
      expect(Math.round(overlayRect.left))
          .toBe(Math.round(expectedLeft),
              `Expected menu to open in "before" position if "after" position wouldn't fit.`);

      // The y-position of the overlay should be unaffected, as it can already fit vertically
      expect(Math.round(overlayRect.top))
          .toBe(Math.round(triggerRect.top),
              `Expected menu top position to be unchanged if it can fit in the viewport.`);
    });

    it('should fall back to "above" mode if "below" mode would not fit on screen', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the bottom part of viewport, so it doesn't have space to open
      // in its default "below" position below the trigger.
      trigger.style.position = 'relative';
      trigger.style.top = '600px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // In "above" position, the bottom edges of the overlay and the origin are aligned.
      // To find the overlay top, subtract the menu height from the origin's bottom edge.
      const expectedTop = triggerRect.bottom - overlayRect.height;
      expect(Math.round(overlayRect.top))
          .toBe(Math.round(expectedTop),
              `Expected menu to open in "above" position if "below" position wouldn't fit.`);

      // The x-position of the overlay should be unaffected, as it can already fit horizontally
      expect(Math.round(overlayRect.left))
          .toBe(Math.round(triggerRect.left),
              `Expected menu x position to be unchanged if it can fit in the viewport.`);
    });

    it('should re-position menu on both axes if both defaults would not fit', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // push trigger to the bottom, right part of viewport, so it doesn't have space to open
      // in its default "after below" position.
      trigger.style.position = 'relative';
      trigger.style.left = '900px';
      trigger.style.top = '600px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      const expectedLeft = triggerRect.right - overlayRect.width;
      const expectedTop = triggerRect.bottom - overlayRect.height;

      expect(Math.round(overlayRect.left))
          .toBe(Math.round(expectedLeft),
              `Expected menu to open in "before" position if "after" position wouldn't fit.`);

      expect(Math.round(overlayRect.top))
          .toBe(Math.round(expectedTop),
              `Expected menu to open in "above" position if "below" position wouldn't fit.`);
    });

    it('should re-position a menu with custom position set', () => {
      const fixture = TestBed.createComponent(PositionedMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // As designated "before" position won't fit on screen, the menu should fall back
      // to "after" mode, where the left sides of the overlay and trigger are aligned.
      expect(Math.round(overlayRect.left))
          .toBe(Math.round(triggerRect.left),
              `Expected menu to open in "after" position if "before" position wouldn't fit.`);

      // As designated "above" position won't fit on screen, the menu should fall back
      // to "below" mode, where the top edges of the overlay and trigger are aligned.
      expect(Math.round(overlayRect.top))
          .toBe(Math.round(triggerRect.top),
              `Expected menu to open in "below" position if "above" position wouldn't fit.`);
    });

    function getOverlayPane(): HTMLElement {
      return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    }
  });

  describe('animations', () => {
    it('should include the ripple on items by default', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      const item = fixture.debugElement.query(By.css('[md-menu-item]'));
      const ripple = item.query(By.css('[md-ripple]'));

      expect(ripple).not.toBeNull();
    });

    it('should remove the ripple on disabled items', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      const items = fixture.debugElement.queryAll(By.css('[md-menu-item]'));

      // items[1] is disabled, so the ripple should not be present
      const ripple = items[1].query(By.css('[md-ripple]'));
      expect(ripple).toBeNull();
    });

  });

});

@Component({
  template: `
    <button [mdMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <md-menu #menu="mdMenu">
      <button md-menu-item> Item </button>
      <button md-menu-item disabled> Disabled </button>
    </md-menu>
  `
})
class SimpleMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
}

@Component({
  template: `
    <button [mdMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <md-menu x-position="before" y-position="above" #menu="mdMenu">
      <button md-menu-item> Positioned Content </button>
    </md-menu>
  `
})
class PositionedMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
}


@Component({
  selector: 'custom-menu',
  template: `
    <template>
      Custom Menu header
      <ng-content></ng-content>
    </template>
  `,
  exportAs: 'mdCustomMenu'
})
class CustomMenuPanel implements MdMenuPanel {
  positionX: MenuPositionX = 'after';
  positionY: MenuPositionY = 'below';

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  @Output() close = new EventEmitter<void>();
  focusFirstItem = () => {};
  setPositionClasses = () => {};
}

@Component({
  template: `
    <button [mdMenuTriggerFor]="menu">Toggle menu</button>
    <custom-menu #menu="mdCustomMenu">
      <button md-menu-item> Custom Content </button>
    </custom-menu>
  `
})
class CustomMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
}

class FakeViewportRuler {
  getViewportRect() {
    return {
      left: 0, top: 0, width: 1014, height: 686, bottom: 686, right: 1014
    };
  }

  getViewportScrollPosition() {
    return {top: 0, left: 0};
  }
}
