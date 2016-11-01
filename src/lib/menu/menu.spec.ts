import {TestBed, async} from '@angular/core/testing';
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


describe('MdMenu', () => {
  let overlayContainerElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdMenuModule.forRoot()],
      declarations: [CustomMenuPanel, CustomMenu, SimpleMenu],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
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

      expect(overlayContainerElement.textContent.trim()).toBe('Simple Content');
    }).not.toThrowError();
  });

  it('should close the menu when a click occurs outside the menu', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const backdrop = <HTMLElement>overlayContainerElement.querySelector('.md-overlay-backdrop');
    backdrop.click();
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toBe('');
  });

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

});

@Component({
  template: `
    <button [md-menu-trigger-for]="menu">Toggle menu</button>
    <md-menu #menu="mdMenu">
      <button md-menu-item> Simple Content </button>
    </md-menu>
  `
})
class SimpleMenu {
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
  focusFirstItem: () => void;
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
