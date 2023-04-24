/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgFor, NgIf} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, signal, ViewChild, WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

xdescribe('change detection for signal views', () => {
  it('executes template only when signal is updated', () => {
    @Component({
      selector: 'signal-component',
      signals: true,
      standalone: true,
      template: `{{value()}}{{incrementTemplateExecutions()}}`,
    } as any)
    class SignalComponent {
      templateExecutions = 0;
      value = signal('initial');
      incrementTemplateExecutions() {
        this.templateExecutions++;
        return '';
      }
    }

    const fixture = TestBed.createComponent(SignalComponent);
    fixture.detectChanges();
    expect(trim(fixture.nativeElement.textContent)).toEqual('initial');
    expect(fixture.componentInstance.templateExecutions).toEqual(1);

    fixture.detectChanges();
    // We didn't change a signal. It shouldn't execute template again
    expect(fixture.componentInstance.templateExecutions).toEqual(1);

    fixture.componentInstance.value.set('new');
    fixture.detectChanges();
    expect(trim(fixture.nativeElement.textContent)).toEqual('new');
    expect(fixture.componentInstance.templateExecutions).toEqual(2);
  });

  it('re-dirties parent after initial change detection (No more ExpressionChangedAfterChecked for signal views)',
     () => {
       @Component({
         selector: 'child-component',
         standalone: true,
         template: ``,
       })
       class ChildComponentA {
         @Input() signalFromParent!: WritableSignal<string>;

         ngAfterViewInit() {
           this.signalFromParent.set('new');
         }
       }
       @Component({
         selector: 'parent-component',
         signals: true,
         standalone: true,
         template: `{{parentSignal()}}<child-component [signalFromParent]="parentSignal"/>`,
         imports: [ChildComponentA],
       } as any)
       class ParentComponent {
         parentSignal = signal('initial');
       }

       const fixture = TestBed.createComponent(ParentComponent);
       fixture.detectChanges();
       expect(trim(fixture.nativeElement.textContent)).toEqual('new');
     });

  it('doesn\'t change detect infinitely', () => {
    @Component({
      selector: 'child-component',
      standalone: true,
      template: `{{updateParentSignal()}}`,
    })
    class ChildComponentA {
      @Input() signalFromParent!: WritableSignal<string>;

      updateParentSignal() {
        this.signalFromParent.set(this.signalFromParent() + 1);
      }
    }
    @Component({
      selector: 'parent-component',
      signals: true,
      standalone: true,
      template: `{{parentSignal()}}<child-component [signalFromParent]="parentSignal"/>`,
      imports: [ChildComponentA],
    } as any)
    class ParentComponent {
      parentSignal = signal(1);
    }

    const fixture = TestBed.createComponent(ParentComponent);
    expect(() => {
      fixture.detectChanges();
    }).toThrowError(/Infinite change detections./);
  });

  it('Can re-enter change detection if a sibling view needs another refresh', () => {
    @Component({
      selector: 'parent-component',
      signals: true,
      standalone: true,
      template: `
      {{incrementParentViewExecutions()}}
      <div *ngIf="true">
        {{value()}}
      </div>
      <div *ngIf="true">
        {{updateParentSignal()}}
      </div>`,
      imports: [NgIf],
    } as any)
    class ParentComponent {
      value = signal(1);
      parentViewExecutions = 0;
      updateParentSignal() {
        this.value.set(2);
        return '';
      }
      incrementParentViewExecutions() {
        this.parentViewExecutions++;
      }
    }

    const fixture = TestBed.createComponent(ParentComponent);
    fixture.detectChanges(false);
    expect(trim(fixture.nativeElement.textContent)).toEqual('2');
    expect(fixture.componentInstance.parentViewExecutions).toEqual(1);
  });

  describe('in embedded views', () => {
    it('with a single signal, single view', () => {
      @Component({
        selector: 'signal-component',
        signals: true,
        standalone: true,
        imports: [NgIf],
        template: `<div *ngIf="true"> {{value()}} </div>`,
      } as any)
      class SignalComponent {
        value = signal('initial');
      }

      const fixture = TestBed.createComponent(SignalComponent);
      fixture.detectChanges();
      fixture.componentInstance.value.set('new');
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new');
    });

    it('with a single signal, multiple views', () => {
      @Component({
        selector: 'signal-component',
        signals: true,
        standalone: true,
        imports: [NgFor],
        template: `<div *ngFor="let i of [1,2,3]"> {{value()}} </div>`,
      } as any)
      class SignalComponent {
        value = signal('initial');
      }

      const fixture = TestBed.createComponent(SignalComponent);
      fixture.detectChanges();
      fixture.componentInstance.value.set('new');
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new new new');
    });

    it('does not execute view template if signal not updated', () => {
      @Component({
        selector: 'signal-component',
        signals: true,
        standalone: true,
        imports: [NgIf],
        template: `
          {{componentSignal()}}
          <div *ngIf="true"> {{incrementExecutions()}} </div>
        `,
      } as any)
      class SignalComponent {
        embeddedViewExecutions = 0;
        componentSignal = signal('initial');
        incrementExecutions() {
          this.embeddedViewExecutions++;
          return '';
        }
      }

      const fixture = TestBed.createComponent(SignalComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.embeddedViewExecutions).toEqual(1);

      fixture.componentInstance.componentSignal.set('new');
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new');
      // We updated the only the component view, not the embedded view
      expect(fixture.componentInstance.embeddedViewExecutions).toEqual(1);
    });

    it('re-executes deep embedded template if signal updates', () => {
      @Component({
        selector: 'signal-component',
        signals: true,
        standalone: true,
        imports: [NgIf],
        template: `
          {{value()}}
          <div *ngIf="true"> 
            <div *ngIf="true"> 
              <div *ngIf="true"> 
                {{value()}} 
              </div>
            </div>
          </div>
        `,
      } as any)
      class SignalComponent {
        value = signal('initial');
      }

      const fixture = TestBed.createComponent(SignalComponent);
      fixture.detectChanges();

      fixture.componentInstance.value.set('new');
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new new');
    });
  });

  describe('shielded by OnPush', () => {
    @Component({
      selector: 'signal-component',
      signals: true,
      standalone: true,
      template: `{{value()}}`,
    } as any)
    class SignalComponent {
      value = signal('initial');
      constructor(readonly cdr: ChangeDetectorRef) {}
    }

    @Component({
      selector: 'on-push-parent',
      template: `<signal-component></signal-component>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true,
      imports: [SignalComponent],
    })
    class OnPushParent {
      @ViewChild(SignalComponent) signalChild!: SignalComponent;

      constructor(readonly cdr: ChangeDetectorRef) {}
    }

    it('refreshes when signal changes', () => {
      const fixture = TestBed.createComponent(OnPushParent);
      fixture.detectChanges();
      fixture.componentInstance.signalChild.value.set('new');
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new');
    });

    it('does not refresh when detached', () => {
      const fixture = TestBed.createComponent(OnPushParent);
      fixture.detectChanges();
      fixture.componentInstance.signalChild.value.set('new');
      fixture.componentInstance.signalChild.cdr.detach();
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('initial');
    });
  });

  it('runs change detection for dirty OnPush child', () => {
    let onPushChild!: OnPushChild;

    @Component({
      selector: 'on-push-child',
      template: `{{value}}`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true,
    })
    class OnPushChild {
      value = 'initial';
      constructor(readonly cdr: ChangeDetectorRef) {
        onPushChild = this;
      }

      updateValue(newValue: string) {
        this.value = newValue;
        this.cdr.markForCheck();
      }
    }

    @Component({
      selector: 'signal-parent',
      signals: true,
      standalone: true,
      imports: [OnPushChild],
      template: `<on-push-child/>`,
    } as any)
    class SignalParent {
    }
    const fixture = TestBed.createComponent(SignalParent);
    fixture.detectChanges();
    expect(trim(fixture.nativeElement.textContent)).toEqual('initial');
    onPushChild.updateValue('new');
    fixture.detectChanges();
    expect(trim(fixture.nativeElement.textContent)).toEqual('new');
  });

  it('can get a viewChild for an OnPush child component', () => {
    @Component({
      selector: 'on-push-child',
      template: ``,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true,
    })
    class OnPushChild {
    }

    @Component({
      selector: 'signal-parent',
      signals: true,
      standalone: true,
      imports: [OnPushChild],
      template: `<on-push-child/>`,
    } as any)
    class SignalParent {
      @ViewChild(OnPushChild) onPushChild?: OnPushChild;
    }
    const fixture = TestBed.createComponent(SignalParent);
    fixture.detectChanges();
    expect(fixture.componentInstance.onPushChild).toBeInstanceOf(OnPushChild);
  });

  it('always refreshes CheckAlways children', () => {
    let checkAlwaysTemplateExecutions = 0;
    let signalTemplateExecutions = 0;
    @Component({
      template: '{{incrementTemplateExecutions()}}',
      standalone: true,
      selector: 'check-always',
    })
    class CheckAlwaysComponent {
      incrementTemplateExecutions() {
        checkAlwaysTemplateExecutions++;
        return '';
      }
    }
    @Component({
      selector: 'signal-component',
      signals: true,
      standalone: true,
      imports: [CheckAlwaysComponent],
      template: `{{incrementTemplateExecutions()}}<check-always />`,
    } as any)
    class SignalComponent {
      incrementTemplateExecutions() {
        signalTemplateExecutions++;
        return '';
      }
    }


    const fixture = TestBed.createComponent(SignalComponent);
    fixture.detectChanges();
    expect(signalTemplateExecutions).toEqual(1);
    expect(checkAlwaysTemplateExecutions).toEqual(1);
    fixture.detectChanges();
    expect(checkAlwaysTemplateExecutions).toEqual(2);
  });
});

function trim(text: string|null): string {
  return text ? text.replace(/[\s\n]+/gm, ' ').trim() : '';
}
