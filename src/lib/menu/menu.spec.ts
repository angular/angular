import {TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  Component,
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
          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Dir, useFactory: () => {
          return {value: dir};
        }}
      ]
    });

    TestBed.compileComponents();
  }));

  it('should open the menu as an idempotent operation', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.componentInstance.trigger.openMenu();

      expect(overlayContainerElement.textContent).toContain('Simple Content');
      expect(overlayContainerElement.textContent).toContain('Disabled Content');
    }).not.toThrowError();
  });

  it('should close the menu when a click occurs outside the menu', async(() => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const backdrop = <HTMLElement>overlayContainerElement.querySelector('.md-overlay-backdrop');
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

    const overlayPane = overlayContainerElement.children[0];
    expect(overlayPane.getAttribute('dir')).toEqual('rtl');
  });

  describe('positions', () => {
    it('should append md-menu-after and md-menu-below classes by default', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const panel = overlayContainerElement.querySelector('.md-menu-panel');
      expect(panel.classList).toContain('md-menu-after');
      expect(panel.classList).toContain('md-menu-below');
      expect(panel.classList).not.toContain('md-menu-before');
      expect(panel.classList).not.toContain('md-menu-above');
    });

    it('should append md-menu-before if x position is changed', () => {
      const fixture = TestBed.createComponent(PositionedMenu);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const panel = overlayContainerElement.querySelector('.md-menu-panel');
      expect(panel.classList).toContain('md-menu-before');
      expect(panel.classList).not.toContain('md-menu-after');
    });

    it('should append md-menu-above if y position is changed', () => {
      const fixture = TestBed.createComponent(PositionedMenu);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const panel = overlayContainerElement.querySelector('.md-menu-panel');
      expect(panel.classList).toContain('md-menu-above');
      expect(panel.classList).not.toContain('md-menu-below');
    });

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
    <button [md-menu-trigger-for]="menu">Toggle menu</button>
    <md-menu #menu="mdMenu">
      <button md-menu-item> Simple Content </button>
      <button md-menu-item disabled> Disabled Content </button>
    </md-menu>
  `
})
class SimpleMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
}

@Component({
  template: `
    <button [md-menu-trigger-for]="menu">Toggle menu</button>
    <md-menu x-position="before" y-position="above" #menu="mdMenu">
      <button md-menu-item> Positioned Content </button>
    </md-menu>
  `
})
class PositionedMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
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
}

@Component({
  template: `
    <button [md-menu-trigger-for]="menu">Toggle menu</button>
    <custom-menu #menu="mdCustomMenu">
      <button md-menu-item> Custom Content </button>
    </custom-menu>
  `
})
class CustomMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
}
