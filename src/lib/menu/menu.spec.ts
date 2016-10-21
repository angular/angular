import {TestBed, async} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {MdMenuModule, MdMenuTrigger} from './menu';
import {OverlayContainer} from '../core/overlay/overlay-container';


describe('MdMenu', () => {
  let overlayContainerElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdMenuModule.forRoot()],
      declarations: [SimpleMenu],
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

      expect(overlayContainerElement.textContent.trim()).toBe('Content');
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

});

@Component({
  template: `
    <button [md-menu-trigger-for]="menu">Toggle menu</button>
    <md-menu #menu="mdMenu">
      <button md-menu-item> Content </button>
    </md-menu>
  `
})
class SimpleMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
}
