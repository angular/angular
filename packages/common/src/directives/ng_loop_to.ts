import {Directive, EmbeddedViewRef, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef, isDevMode} from '@angular/core';

export interface NgLoopToContext { $implicit: number; }

/**
 * The `NgLoopTo` directive instantiates a template multiple times following the pattern of a common
 * loop.
 * It iterates starting at `from` until `to` incrementing each iteration by `by`. Both `from` and
 * `to` are inclusive.
 *
 * ### Inputs
 *
 * - `from`: (optional, default 0) starting value
 * - `to`: (mandatory) end value
 * - `by`: (optional, default 1) incremental value
 * - `precision`: (optional, default 2) precision define the number of decimal to use to round
 * values. A precision of 2 will round 1.4499 into 1.45.
 * This is only used internally for boundary checks, returned value are not rounded.
 *
 * ### Local Variables
 *
 * `NgLoopTo` export the current value as `$implicit` and can be aliased to a local variable using
 * `let-*`.
 *
 *
 * ### Change Propagation
 *
 * When inputs changes, `NgLoopTo` makes the corresponding changes to the DOM:
 *
 * * When new range stay the same (size & vaue), DOM elements will remain the same.
 * * When new range has the same size, DOM elements will be reused and new value propagated.
 * * When new range is bigger, existing DOM elements are reused and new ones are added.
 * * When new range is smaller, superfluous DOM elements are removed.
 *
 *
 * ### Syntax
 *
 * - `<li *ngLoop="let i from 0 to 5 by 1; precision: 1">...</li>`
 *
 * With `<ng-template>` element:
 *
 * ```
 * <ng-template ngLoop let-i [ngLoopFrom]="0" [ngLoopTo]="5" [ngLoopBy]="1" [ngLoopPrecision]="1">
 *   <li>...</li>
 * </ng-template>
 * ```
 *
 * ### Example
 *
 * TODO
 *
 * @experimental
 */
@Directive({selector: '[ngLoop][ngLoopTo]'})

export class NgLoopTo implements OnChanges {
  @Input() ngLoopFrom = 0;
  @Input() ngLoopTo: number;
  @Input() ngLoopBy = 1;

  @Input() ngLoopPrecision = 2;

  constructor(
      private templateRef: TemplateRef<NgLoopToContext>, private viewContainer: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges) {
    let viewIdx = 0;

    // avoid infinite loop
    if (this.checkInputs()) {
      const length =
          decimalRound((this.ngLoopTo - this.ngLoopFrom) / this.ngLoopBy, this.ngLoopPrecision);

      for (let i = 0; i <= length; i++, viewIdx++) {
        const value = this.ngLoopFrom + i * this.ngLoopBy;

        if (viewIdx < this.viewContainer.length) {
          const viewRef = <EmbeddedViewRef<NgLoopToContext>>this.viewContainer.get(viewIdx);
          viewRef.context.$implicit = value;
        } else
          this.viewContainer.createEmbeddedView(this.templateRef, {$implicit: value});
      }
    } else if (isDevMode()) {
      throw `Infinite loop detected : from ${this.ngLoopFrom} to ${this.ngLoopTo} by ${this.ngLoopBy}. Loop aborted.`
    }

    for (let i = this.viewContainer.length - 1; i >= viewIdx; i--) this.viewContainer.remove(i);
  }



  checkInputs(): boolean {
    if (!Number.isInteger(this.ngLoopPrecision) || this.ngLoopPrecision <= 0)
      throw 'Precision must be a positive integer';

    const length = this.ngLoopTo - this.ngLoopFrom;

    return this.ngLoopBy !== 0 &&
        (length === 0 || (length > 0 ? this.ngLoopBy > 0 : this.ngLoopBy < 0))
  }
}

// from http://stackoverflow.com/a/19722641
// which is a derivation of
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round#Decimal_rounding
function decimalRound(value: number, precision: number): number {
  return +(Math.round(+(value + 'e+' + precision)) + 'e-' + precision);
}