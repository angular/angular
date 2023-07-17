// #docplaster
// #docregion
// #docregion no-docs, skeleton
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

// #enddocregion skeleton
/**
 * Add the template content to the DOM unless the condition is true.
// #enddocregion no-docs
 *
 * If the expression assigned to `appUnless` evaluates to a truthy value
 * then the templated elements are removed removed from the DOM,
 * the templated elements are (re)inserted into the DOM.
 *
 * <div *appUnless="errorCount" class="success">
 *   Congrats! Everything is great!
 * </div>
 *
 * ### Syntax
 *
 * - `<div *appUnless="condition">...</div>`
 * - `<ng-template [appUnless]="condition"><div>...</div></ng-template>`
 *
// #docregion no-docs
 */
// #docregion skeleton
@Directive({ selector: '[appUnless]'})
export class UnlessDirective {
  // #enddocregion skeleton
  private hasView = false;

  // #docregion ctor
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef) { }
  // #enddocregion ctor

  // #docregion set
  @Input() set appUnless(condition: boolean) {
    if (!condition && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (condition && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
  // #enddocregion set
  // #docregion skeleton
}
