/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs/Subject';

import {SimpleChanges} from '../change_detection/change_detection';


/**
 * An accessor to a component's lifecycle events as observables.
 *
 * ```
 * @Component({
 *   selector: 'some-cmp',
 *   template: `
 *   <div *ngIf="init$ | async">...</div>
 *   `})
 * export class SomeCmp {
 *   init$: Observable<void>;
 *   constructor(private lifecycle: ComponentLifecycle, private someService: any) {
 *     // Get an observable that emits an event when the component is created.
 *     this.init$ = this.lifecycle.onInit;
 *   }
 *
 *   ngOnInit() {
 *     this.someService.events$
 *      .pipe(
 *        // Unsubscribe the observable automatically when the component is destroyed.
 *        takeUntil(this.lifecycle.onDestroy),
 *      )
 *      .subscribe(event => {});
 *   }
 * }
 * ```
 *
 * @experimental
 */
export class ComponentLifecycle {
  /**
   * An observable form of ngOnInit lifecycle event
   * @experimental
   */
  readonly onInit = new Subject<void>();
  /**
   * An observable form of ngOnChanges lifecycle event
   * @experimental
   */
  readonly onChanges = new Subject<SimpleChanges>();
  /**
   * An observable form of ngAfterContentInit lifecycle event
   * @experimental
   */
  readonly afterContentInit = new Subject<void>();
  /**
   * An observable form of ngAfterContentChecked lifecycle event
   * @experimental
   */
  readonly afterContentChecked = new Subject<void>();
  /**
   * An observable form of ngAfterViewInit lifecycle event
   * @experimental
   */
  readonly afterViewInit = new Subject<void>();
  /**
   * An observable form of ngAfterViewChecked lifecycle event
   * @experimental
   */
  readonly afterViewChecked = new Subject<void>();
  /**
   * An observable form of ngOnDestroy lifecycle event
   * @experimental
   */
  readonly onDestroy = new Subject<void>();
}
