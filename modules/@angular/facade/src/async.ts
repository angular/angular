/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs/Subject';

export {Observable} from 'rxjs/Observable';
export {Subject} from 'rxjs/Subject';

/**
 * Use by directives and components to emit custom Events.
 *
 * ### Examples
 *
 * In the following example, `Zippy` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * The events payload can be accessed by the parameter `$event` on the components output event
 * handler:
 *
 * ```
 * <zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>
 * ```
 *
 * Uses Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 * @stable
 */
export class EventEmitter<T> extends Subject<T> {
  // TODO: mark this as internal once all the facades are gone
  // we can't mark it as internal now because EventEmitter exported via @angular/core would not
  // contain this property making it incompatible with all the code that uses EventEmitter via
  // facades, which are local to the code and do not have this property stripped.
  // tslint:disable-next-line
  __isAsync: boolean;

  /**
   * Creates an instance of [EventEmitter], which depending on [isAsync],
   * delivers events synchronously or asynchronously.
   */
  constructor(isAsync: boolean = false) {
    super();
    this.__isAsync = isAsync;
  }

  emit(value?: T) { super.next(value); }

  subscribe(generatorOrNext?: any, error?: any, complete?: any): any {
    let schedulerFn: any /** TODO #9100 */;
    let errorFn = (err: any): any /** TODO #9100 */ => null;
    let completeFn = (): any /** TODO #9100 */ => null;

    if (generatorOrNext && typeof generatorOrNext === 'object') {
      schedulerFn = this.__isAsync ? (value: any /** TODO #9100 */) => {
        setTimeout(() => generatorOrNext.next(value));
      } : (value: any /** TODO #9100 */) => { generatorOrNext.next(value); };

      if (generatorOrNext.error) {
        errorFn = this.__isAsync ? (err) => { setTimeout(() => generatorOrNext.error(err)); } :
                                   (err) => { generatorOrNext.error(err); };
      }

      if (generatorOrNext.complete) {
        completeFn = this.__isAsync ? () => { setTimeout(() => generatorOrNext.complete()); } :
                                      () => { generatorOrNext.complete(); };
      }
    } else {
      schedulerFn = this.__isAsync ? (value: any /** TODO #9100 */) => {
        setTimeout(() => generatorOrNext(value));
      } : (value: any /** TODO #9100 */) => { generatorOrNext(value); };

      if (error) {
        errorFn =
            this.__isAsync ? (err) => { setTimeout(() => error(err)); } : (err) => { error(err); };
      }

      if (complete) {
        completeFn =
            this.__isAsync ? () => { setTimeout(() => complete()); } : () => { complete(); };
      }
    }

    return super.subscribe(schedulerFn, errorFn, completeFn);
  }
}
