/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  inject,
  ɵprovideGlobalEventDelegation,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

function configureTestingModule(components: unknown[]) {
  TestBed.configureTestingModule({
    imports: components,
    providers: [ɵprovideGlobalEventDelegation()],
  });
}

describe('event dispatch', () => {
  let fixture: ComponentFixture<unknown>;

  it(`executes an onclick handler`, async () => {
    const onClickSpy = jasmine.createSpy();
    @Component({
      selector: 'app',
      standalone: true,
      template: `
        <button id="btn" (click)="onClick()"></button>
      `,
    })
    class AppComponent {
      onClick = onClickSpy;
    }
    configureTestingModule([AppComponent]);
    const addEventListenerSpy = spyOn(
      HTMLButtonElement.prototype,
      'addEventListener',
    ).and.callThrough();
    fixture = TestBed.createComponent(AppComponent);
    const button = (fixture.debugElement.nativeElement as Element)
      .firstElementChild as HTMLButtonElement;
    button.click();
    expect(onClickSpy).toHaveBeenCalledTimes(1);
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should work for elements with local refs', async () => {
    const onClickSpy = jasmine.createSpy();

    @Component({
      selector: 'app',
      standalone: true,
      template: `
        <button id="btn" (click)="onClick()" #localRef></button>
      `,
    })
    class AppComponent {
      onClick = onClickSpy;
    }
    configureTestingModule([AppComponent]);
    fixture = TestBed.createComponent(AppComponent);
    fixture.debugElement.nativeElement.querySelector('#btn').click();
    expect(onClickSpy).toHaveBeenCalled();
  });
  it('should route to the appropriate component with content projection', async () => {
    const outerOnClickSpy = jasmine.createSpy();
    const innerOnClickSpy = jasmine.createSpy();
    @Component({
      selector: 'app-card',
      standalone: true,
      template: `
        <div class="card">
          <button id="inner-button" (click)="onClick()"></button>
          <ng-content></ng-content> 
        </div>
      `,
    })
    class CardComponent {
      onClick = innerOnClickSpy;
    }

    @Component({
      selector: 'app',
      imports: [CardComponent],
      standalone: true,
      template: `
        <app-card>
          <h2>Card Title</h2>
          <p>This is some card content.</p>
          <button id="outer-button" (click)="onClick()">Click Me</button>
        </app-card>
      `,
    })
    class AppComponent {
      onClick = outerOnClickSpy;
    }
    configureTestingModule([AppComponent]);
    fixture = TestBed.createComponent(AppComponent);
    const nativeElement = fixture.debugElement.nativeElement;
    const outer = nativeElement.querySelector('#outer-button')!;
    const inner = nativeElement.querySelector('#inner-button')!;
    outer.click();
    inner.click();
    expect(outerOnClickSpy).toHaveBeenCalledBefore(innerOnClickSpy);
  });
  it('should serialize event types to be listened to and jsaction cache entry', async () => {
    const clickSpy = jasmine.createSpy('onClick');
    const focusSpy = jasmine.createSpy('onFocus');
    @Component({
      standalone: true,
      selector: 'app',
      template: `
            <div (click)="onClick()" id="click-element">
              <div id="focus-container">
                <div id="focus-action-element" (focus)="onFocus()">
                  <button id="focus-target-element">Focus Button</button>
                </div>
              </div>
            </div>
          `,
    })
    class SimpleComponent {
      onClick = clickSpy;
      onFocus = focusSpy;
    }
    configureTestingModule([SimpleComponent]);
    fixture = TestBed.createComponent(SimpleComponent);
    const nativeElement = fixture.debugElement.nativeElement;
    const el = nativeElement.querySelector('#click-element')!;
    const button = nativeElement.querySelector('#focus-target-element')!;
    const clickEvent = new CustomEvent('click', {bubbles: true});
    el.dispatchEvent(clickEvent);
    const focusEvent = new CustomEvent('focus');
    button.dispatchEvent(focusEvent);
    expect(clickSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  describe('bubbling behavior', () => {
    it('should propagate events', async () => {
      const onClickSpy = jasmine.createSpy();
      @Component({
        standalone: true,
        selector: 'app',
        template: `
            <div id="top" (click)="onClick()">
                <div id="bottom" (click)="onClick()"></div>
            </div>
          `,
      })
      class SimpleComponent {
        onClick = onClickSpy;
      }
      configureTestingModule([SimpleComponent]);
      fixture = TestBed.createComponent(SimpleComponent);
      const nativeElement = fixture.debugElement.nativeElement;
      const bottomEl = nativeElement.querySelector('#bottom')!;
      bottomEl.click();
      expect(onClickSpy).toHaveBeenCalledTimes(2);
    });

    it('should not propagate events if stopPropagation is called', async () => {
      @Component({
        standalone: true,
        selector: 'app',
        template: `
            <div id="top" (click)="onClick($event)">
                <div id="bottom" (click)="onClick($event)"></div>
            </div>
          `,
      })
      class SimpleComponent {
        onClick(e: Event) {
          e.stopPropagation();
        }
      }
      const onClickSpy = spyOn(SimpleComponent.prototype, 'onClick').and.callThrough();
      configureTestingModule([SimpleComponent]);
      fixture = TestBed.createComponent(SimpleComponent);
      const nativeElement = fixture.debugElement.nativeElement;
      const bottomEl = nativeElement.querySelector('#bottom')!;
      bottomEl.click();
      expect(onClickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('manual listening', () => {
    it('should trigger events when manually registered', async () => {
      const onClickSpy = jasmine.createSpy();
      @Component({
        standalone: true,
        selector: 'app',
        template: `
            <div id="top">
                <div id="bottom"></div>
            </div>
          `,
      })
      class SimpleComponent {
        renderer = inject(Renderer2);
        destroy!: Function;
        listen(el: Element) {
          this.destroy = this.renderer.listen(el, 'click', onClickSpy);
        }
      }
      configureTestingModule([SimpleComponent]);
      fixture = TestBed.createComponent(SimpleComponent);
      const nativeElement = fixture.debugElement.nativeElement;
      (fixture.componentInstance as SimpleComponent).listen(nativeElement);
      const bottomEl = nativeElement.querySelector('#bottom')!;
      bottomEl.click();
      expect(onClickSpy).toHaveBeenCalledTimes(1);
      (fixture.componentInstance as SimpleComponent).destroy();
      bottomEl.click();
      expect(onClickSpy).toHaveBeenCalledTimes(1);
    });
  });
});
