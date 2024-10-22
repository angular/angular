// tslint:disable

import {
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  Renderer2,
} from '@angular/core';

import {SplitComponent} from '../component/split.component';

import {getInputPositiveNumber} from './utils';

@Directive({
  selector: 'as-split-area, [as-split-area]',
  exportAs: 'asSplitArea',
  standalone: true,
  host: {
    class: 'as-split-area',
    '[class.as-hidden]': '!visible()',
  },
})
export class SplitAreaDirective implements OnDestroy {
  readonly order = input(null, {transform: (v) => getInputPositiveNumber(v, null)});
  readonly size = input(null, {transform: (v) => getInputPositiveNumber(v, null)});
  readonly minSize = input(null, {transform: (v) => getInputPositiveNumber(v, null)});
  readonly maxSize = input(null, {transform: (v) => getInputPositiveNumber(v, null)});
  readonly lockSize = input(false, {transform: booleanAttribute});
  readonly visible = input(true, {transform: booleanAttribute});
  ////

  private transitionListener!: Function;
  private readonly lockListeners: Array<Function> = [];

  private ngZone = inject(NgZone);
  public elRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private split = inject(SplitComponent);

  constructor() {
    effect(() => {
      const _ = this.order();
      this.split.updateArea(this, true, false);
    });

    effect(() => {
      const _ = this.lockSize();
      const _1 = this.maxSize();
      const _2 = this.minSize();
      const _3 = this.size();
      this.split.updateArea(this, false, true);
    });

    effect(() => {
      if (this.visible()) {
        this.split.showArea(this);
      } else {
        this.split.hideArea(this);
      }
    });

    this.split.addArea(this);

    this.ngZone.runOutsideAngular(() => {
      this.transitionListener = this.renderer.listen(
        this.elRef.nativeElement,
        'transitionend',
        (event: TransitionEvent) => {
          // Limit only flex-basis transition to trigger the event
          if (event.propertyName === 'flex-basis') {
            this.split.notify('transitionEnd', -1);
          }
        },
      );
    });
  }

  public setStyleOrder(value: number): void {
    this.renderer.setStyle(this.elRef.nativeElement, 'order', value);
  }

  public setStyleFlex(
    grow: number,
    shrink: number,
    basis: string,
    isMin: boolean,
    isMax: boolean,
  ): void {
    // Need 3 separated properties to work on IE11
    // (https://github.com/angular/flex-layout/issues/323)
    this.renderer.setStyle(this.elRef.nativeElement, 'flex-grow', grow);
    this.renderer.setStyle(this.elRef.nativeElement, 'flex-shrink', shrink);
    this.renderer.setStyle(this.elRef.nativeElement, 'flex-basis', basis);

    if (isMin === true) this.renderer.addClass(this.elRef.nativeElement, 'as-min');
    else this.renderer.removeClass(this.elRef.nativeElement, 'as-min');

    if (isMax === true) this.renderer.addClass(this.elRef.nativeElement, 'as-max');
    else this.renderer.removeClass(this.elRef.nativeElement, 'as-max');
  }

  public lockEvents(): void {
    this.ngZone.runOutsideAngular(() => {
      this.lockListeners.push(
        this.renderer.listen(this.elRef.nativeElement, 'selectstart', (e: Event) => false),
      );
      this.lockListeners.push(
        this.renderer.listen(this.elRef.nativeElement, 'dragstart', (e: Event) => false),
      );
    });
  }

  public unlockEvents(): void {
    while (this.lockListeners.length > 0) {
      const fct = this.lockListeners.pop();
      if (fct) fct();
    }
  }

  public ngOnDestroy(): void {
    this.unlockEvents();

    this.transitionListener();

    this.split.removeArea(this);
  }
}
