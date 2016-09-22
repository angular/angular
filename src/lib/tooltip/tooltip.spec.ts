import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {TooltipPosition, MdTooltip} from './tooltip';
import {OverlayContainer} from '../core';
import {MdTooltipModule} from './tooltip';


describe('MdTooltip', () => {
  let overlayContainerElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTooltipModule.forRoot()],
      declarations: [BasicTooltipDemo],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic usage', () => {
    let fixture: ComponentFixture<BasicTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MdTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get(MdTooltip);
    });

    it('should show/hide on mouse enter/leave', () => {
      expect(tooltipDirective.visible).toBeFalsy();

      tooltipDirective._handleMouseEnter(null);
      expect(tooltipDirective.visible).toBeTruthy();

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toBe('some message');

      tooltipDirective._handleMouseLeave(null);
      expect(overlayContainerElement.textContent).toBe('');
    });
  });
});

@Component({
  selector: 'app',
  template: `<button md-tooltip="some message" [tooltip-position]="position">Button</button>`
})
class BasicTooltipDemo {
  position: TooltipPosition = 'below';
}
