/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, Directive, ErrorHandler, EventEmitter, HostListener, Input, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {onlyInIvy} from '@angular/private/testing';

function getNoOfNativeListeners(): number {
  return ngDevMode ? ngDevMode.rendererAddEventListener : 0;
}

describe('event listeners', () => {
  describe('coalescing', () => {
    @Component({
      selector: 'with-clicks-cmpt',
      template: `<button likes-clicks (click)="count()" md-button>Click me!</button>`
    })
    class WithClicksCmpt {
      counter = 0;
      count() {
        this.counter++;
      }
    }

    @Directive({selector: '[md-button]'})
    class MdButton {
      counter = 0;
      @HostListener('click')
      count() {
        this.counter++;
      }
    }

    @Directive({selector: '[likes-clicks]'})
    class LikesClicks {
      counter = 0;
      @HostListener('click')
      count() {
        this.counter++;
      }
    }

    @Directive({selector: '[returns-false]'})
    class ReturnsFalse {
      counter = 0;
      event!: Event;
      handlerShouldReturn: boolean|undefined = undefined;

      @HostListener('click', ['$event'])
      count(e: Event) {
        this.counter++;
        this.event = e;

        // stub preventDefault() to check whether it's called
        Object.defineProperty(
            this.event, 'preventDefault',
            {value: jasmine.createSpy('preventDefault'), writable: true});

        return this.handlerShouldReturn;
      }
    }

    onlyInIvy('ngDevMode.rendererAddEventListener counters are only available in ivy')
        .it('should coalesce multiple event listeners for the same event on the same element',
            () => {
              @Component({
                selector: 'test-cmpt',
                template:
                    `<with-clicks-cmpt></with-clicks-cmpt><with-clicks-cmpt></with-clicks-cmpt>`
              })
              class TestCmpt {
              }

              TestBed.configureTestingModule(
                  {declarations: [TestCmpt, WithClicksCmpt, LikesClicks, MdButton]});
              const noOfEventListenersRegisteredSoFar = getNoOfNativeListeners();
              const fixture = TestBed.createComponent(TestCmpt);
              fixture.detectChanges();
              const buttonDebugEls = fixture.debugElement.queryAll(By.css('button'));
              const withClicksEls = fixture.debugElement.queryAll(By.css('with-clicks-cmpt'));

              // We want to assert that only one native event handler was registered but still all
              // directives are notified when an event fires. This assertion can only be verified in
              // the ngDevMode (but the coalescing always happens!).
              ngDevMode &&
                  expect(getNoOfNativeListeners()).toBe(noOfEventListenersRegisteredSoFar + 2);

              buttonDebugEls[0].nativeElement.click();
              expect(withClicksEls[0].injector.get(WithClicksCmpt).counter).toBe(1);
              expect(buttonDebugEls[0].injector.get(LikesClicks).counter).toBe(1);
              expect(buttonDebugEls[0].injector.get(MdButton).counter).toBe(1);
              expect(withClicksEls[1].injector.get(WithClicksCmpt).counter).toBe(0);
              expect(buttonDebugEls[1].injector.get(LikesClicks).counter).toBe(0);
              expect(buttonDebugEls[1].injector.get(MdButton).counter).toBe(0);

              buttonDebugEls[1].nativeElement.click();
              expect(withClicksEls[0].injector.get(WithClicksCmpt).counter).toBe(1);
              expect(buttonDebugEls[0].injector.get(LikesClicks).counter).toBe(1);
              expect(buttonDebugEls[0].injector.get(MdButton).counter).toBe(1);
              expect(withClicksEls[1].injector.get(WithClicksCmpt).counter).toBe(1);
              expect(buttonDebugEls[1].injector.get(LikesClicks).counter).toBe(1);
              expect(buttonDebugEls[1].injector.get(MdButton).counter).toBe(1);
            });

    onlyInIvy('ngDevMode.rendererAddEventListener counters are only available in ivy')
        .it('should coalesce multiple event listeners in presence of queries', () => {
          @Component({
            selector: 'test-cmpt',
            template: `<button likes-clicks (click)="counter = counter+1">Click me!</button>`
          })
          class TestCmpt {
            counter = 0;

            @ViewChildren('nothing') nothing!: QueryList<any>;
          }

          TestBed.configureTestingModule({declarations: [TestCmpt, LikesClicks]});
          const noOfEventListenersRegisteredSoFar = getNoOfNativeListeners();
          const fixture = TestBed.createComponent(TestCmpt);
          fixture.detectChanges();
          const buttonDebugEl = fixture.debugElement.query(By.css('button'));

          // We want to assert that only one native event handler was registered but still all
          // directives are notified when an event fires. This assertion can only be verified in
          // the ngDevMode (but the coalescing always happens!).
          ngDevMode && expect(getNoOfNativeListeners()).toBe(noOfEventListenersRegisteredSoFar + 1);

          buttonDebugEl.nativeElement.click();
          expect(buttonDebugEl.injector.get(LikesClicks).counter).toBe(1);
          expect(fixture.componentInstance.counter).toBe(1);
        });


    it('should try to execute remaining coalesced listeners if one of the listeners throws', () => {
      @Directive({selector: '[throws-on-clicks]'})
      class ThrowsOnClicks {
        @HostListener('click')
        dontCount() {
          throw new Error('I was clicked and I don\'t like it!');
        }
      }

      @Component(
          {selector: 'test-cmpt', template: `<button throws-on-clicks likes-clicks><button>`})
      class TestCmpt {
      }

      let noOfErrors = 0;

      class CountingErrorHandler extends ErrorHandler {
        override handleError(error: any): void {
          noOfErrors++;
        }
      }

      TestBed.configureTestingModule({
        declarations: [TestCmpt, LikesClicks, ThrowsOnClicks],
        providers: [{provide: ErrorHandler, useClass: CountingErrorHandler}]
      });
      const fixture = TestBed.createComponent(TestCmpt);
      fixture.detectChanges();
      const buttonDebugEl = fixture.debugElement.query(By.css('button'));

      expect(buttonDebugEl.injector.get(LikesClicks).counter).toBe(0);

      buttonDebugEl.nativeElement.click();
      expect(noOfErrors).toBe(1);
      expect(buttonDebugEl.injector.get(LikesClicks).counter).toBe(1);
    });

    it('should prevent default if any of the listeners returns false', () => {
      @Component({
        selector: 'test-cmpt',
        template: `
          <button returns-false likes-clicks></button>
        `
      })
      class TestCmpt {
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, ReturnsFalse, LikesClicks]});
      const fixture = TestBed.createComponent(TestCmpt);
      fixture.detectChanges();

      const buttonDebugEl = fixture.debugElement.query(By.css('button'));
      const likesClicksDir = buttonDebugEl.injector.get(LikesClicks);
      const returnsFalseDir = buttonDebugEl.injector.get(ReturnsFalse);
      expect(likesClicksDir.counter).toBe(0);
      expect(returnsFalseDir.counter).toBe(0);

      buttonDebugEl.nativeElement.click();
      expect(likesClicksDir.counter).toBe(1);
      expect(returnsFalseDir.counter).toBe(1);
      expect(returnsFalseDir.event.preventDefault).not.toHaveBeenCalled();

      returnsFalseDir.handlerShouldReturn = true;
      buttonDebugEl.nativeElement.click();
      expect(returnsFalseDir.event.preventDefault).not.toHaveBeenCalled();

      returnsFalseDir.handlerShouldReturn = false;
      buttonDebugEl.nativeElement.click();
      expect(returnsFalseDir.event.preventDefault).toHaveBeenCalled();
    });

    it('should not subscribe twice to the output when there are 2 coalesced listeners', () => {
      @Directive({selector: '[foo]'})
      class FooDirective {
        @Input('foo') model: any;
        @Output('fooChange') update = new EventEmitter();

        updateValue(value: any) {
          this.update.emit(value);
        }
      }

      @Component({
        selector: 'test-component',
        template: `<div [(foo)]="someValue" (fooChange)="fooChange($event)"></div>`
      })
      class TestComponent {
        count = 0;
        someValue = -1;

        @ViewChild(FooDirective) fooDirective: FooDirective|null = null;

        fooChange() {
          this.count++;
        }

        triggerUpdate(value: any) {
          this.fooDirective!.updateValue(value);
        }
      }

      TestBed.configureTestingModule({declarations: [TestComponent, FooDirective]});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const componentInstance = fixture.componentInstance;
      componentInstance.triggerUpdate(42);
      fixture.detectChanges();

      expect(componentInstance.count).toEqual(1);
      expect(componentInstance.someValue).toEqual(42);
    });

    it('should maintain the order in which listeners are registered', () => {
      const log: string[] = [];
      @Component({
        selector: 'my-comp',
        template: '<button dirA dirB (click)="count()">Click me!</button>',
      })
      class MyComp {
        counter = 0;
        count() {
          log.push('component.click');
        }
      }

      @Directive({selector: '[dirA]'})
      class DirA {
        @HostListener('click')
        count() {
          log.push('dirA.click');
        }
      }

      @Directive({selector: '[dirB]'})
      class DirB {
        @HostListener('click')
        count() {
          log.push('dirB.click');
        }
      }

      TestBed.configureTestingModule({declarations: [MyComp, DirA, DirB]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const button = fixture.nativeElement.firstChild;
      button.click();

      expect(log).toEqual(['dirA.click', 'dirB.click', 'component.click']);
    });
  });

  it('should destroy listeners when view is removed', () => {
    @Component({
      selector: 'my-comp',
      template: `
        <button *ngIf="visible" (click)="count()">Click me!</button>
      `,
    })
    class MyComp {
      visible = true;
      counter = 0;
      count() {
        this.counter++;
      }
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(comp.counter).toBe(1);

    comp.visible = false;
    fixture.detectChanges();

    button.click();
    expect(comp.counter).toBe(1);
  });

  it('should destroy listeners when views generated using *ngFor are removed', () => {
    let counter = 0;
    @Component({
      selector: 'my-comp',
      template: `
        <button *ngFor="let button of buttons" (click)="count()">Click me!</button>
      `,
    })
    class MyComp {
      buttons = [1, 2];
      count() {
        counter++;
      }
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    buttons[1].click();
    expect(counter).toBe(2);

    comp.buttons = [];
    fixture.detectChanges();

    buttons[0].click();
    buttons[1].click();
    expect(counter).toBe(2);
  });

  it('should destroy listeners when nested view is removed', () => {
    @Component({
      selector: 'my-comp',
      template: `
        <ng-container *ngIf="isSectionVisible">
          Click to submit a form:
          <button *ngIf="isButtonVisible" (click)="count()">Click me!</button>
        </ng-container>
      `,
    })
    class MyComp {
      isSectionVisible = true;
      isButtonVisible = true;
      counter = 0;
      count() {
        this.counter++;
      }
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(comp.counter).toBe(1);

    comp.isButtonVisible = false;
    fixture.detectChanges();

    button.click();
    expect(comp.counter).toBe(1);

    comp.isSectionVisible = false;
    fixture.detectChanges();

    button.click();
    expect(comp.counter).toBe(1);
  });

  onlyInIvy('global event listeners on non-node host elements are supported only in Ivy')
      .it('should bind global event listeners on an ng-container directive host', () => {
        let clicks = 0;

        @Directive({selector: '[add-global-listener]'})
        class AddGlobalListener {
          @HostListener('document:click')
          handleClick() {
            clicks++;
          }
        }

        @Component({
          template: `
            <ng-container add-global-listener>
              <button>Click me!</button>
            </ng-container>
          `
        })
        class MyComp {
        }

        TestBed.configureTestingModule({declarations: [MyComp, AddGlobalListener]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button');
        button.click();
        fixture.detectChanges();
        expect(clicks).toBe(1);
      });

  onlyInIvy('global event listeners on non-node host elements are supported only in Ivy')
      .it('should bind global event listeners on an ng-template directive host', () => {
        let clicks = 0;

        @Directive({selector: '[add-global-listener]'})
        class AddGlobalListener {
          @HostListener('document:click')
          handleClick() {
            clicks++;
          }
        }

        @Component({
          template: `
            <ng-template #template add-global-listener>
              <button>Click me!</button>
            </ng-template>

            <ng-container [ngTemplateOutlet]="template"></ng-container>
          `
        })
        class MyComp {
        }

        TestBed.configureTestingModule(
            {declarations: [MyComp, AddGlobalListener], imports: [CommonModule]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button');
        button.click();
        fixture.detectChanges();
        expect(clicks).toBe(1);
      });

  onlyInIvy('global event listeners on non-node host elements are supported only in Ivy')
      .it('should bind global event listeners on a structural directive host', () => {
        let clicks = 0;

        @Directive({selector: '[add-global-listener]'})
        class AddGlobalListener implements OnInit {
          @HostListener('document:click')
          handleClick() {
            clicks++;
          }

          constructor(private _vcr: ViewContainerRef, private _templateRef: TemplateRef<any>) {}

          ngOnInit() {
            this._vcr.createEmbeddedView(this._templateRef);
          }
        }

        @Component({
          template: `
            <div *add-global-listener>
              <button>Click me!</button>
            </div>
          `
        })
        class MyComp {
        }

        TestBed.configureTestingModule({declarations: [MyComp, AddGlobalListener]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button');
        button.click();
        fixture.detectChanges();
        expect(clicks).toBe(1);
      });

  onlyInIvy('issue has only been resolved for Ivy')
      .it('should be able to access a property called $event using `this`', () => {
        let eventVariable: number|undefined;
        let eventObject: MouseEvent|undefined;

        @Component({
          template: `
        <button (click)="clicked(this.$event, $event)">Click me!</button>
      `,
        })
        class MyComp {
          $event = 10;

          clicked(value: number, event: MouseEvent) {
            eventVariable = value;
            eventObject = event;
          }
        }

        TestBed.configureTestingModule({declarations: [MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        fixture.nativeElement.querySelector('button').click();
        fixture.detectChanges();

        expect(eventVariable).toBe(10);
        expect(eventObject?.type).toBe('click');
      });

  it('should be able to use a keyed write on `this` from a listener inside an ng-template', () => {
    @Component({
      template: `
        <ng-template #template>
          <button (click)="this['mes' + 'sage'] = 'hello'">Click me</button>
        </ng-template>

        <ng-container [ngTemplateOutlet]="template"></ng-container>
      `
    })
    class MyComp {
      message = '';
    }

    TestBed.configureTestingModule({declarations: [MyComp], imports: [CommonModule]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.message).toBe('hello');
  });

  it('should reference the correct context object if it is swapped out', () => {
    @Component({
      template: `
        <ng-template let-obj #template>
          <button (click)="obj.value = obj.value + '!'">Change</button>
        </ng-template>

        <ng-container *ngTemplateOutlet="template; context: {$implicit: current}"></ng-container>
      `
    })
    class MyComp {
      one = {value: 'one'};
      two = {value: 'two'};
      current = this.one;
    }

    TestBed.configureTestingModule({declarations: [MyComp], imports: [CommonModule]});
    const fixture = TestBed.createComponent(MyComp);
    const instance = fixture.componentInstance;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');

    expect(instance.one.value).toBe('one');
    expect(instance.two.value).toBe('two');

    button.click();
    fixture.detectChanges();

    expect(instance.one.value).toBe('one!');
    expect(instance.two.value).toBe('two');

    instance.current = instance.two;
    fixture.detectChanges();

    button.click();
    fixture.detectChanges();

    expect(instance.one.value).toBe('one!');
    expect(instance.two.value).toBe('two!');
  });
});
