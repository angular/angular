/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs/Subject';
import {isDevMode} from './application_ref';
import {NgZone} from './zone/ng_zone';

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
  /**
   * Creates an instance of [EventEmitter], which depending on [isAsync],
   * delivers events synchronously or asynchronously.
   */
  constructor(private isAsync: boolean = false) { super(); }

  emit(value?: T): void { this.next(value); }

  next(value?: T): void {
    if (isDevMode() && !NgZone.isInAngularZone() && console && <any>console.warn) {
      console.warn('Expected to be in Angular Zone, but it is not!');
    }
    super.next(value);
  }

  subscribe(generatorOrNext?: any, error?: any, complete?: any): any {
    let schedulerFn: (t: any) => any;
    let errorFn = (err: any): any => null;
    let completeFn = (): any => null;

    if (generatorOrNext && typeof generatorOrNext === 'object') {
      schedulerFn = this.isAsync ? (value: any) => {
        setTimeout(() => generatorOrNext.next(value));
      } : (value: any) => { generatorOrNext.next(value); };

      if (generatorOrNext.error) {
        errorFn = this.isAsync ? (err) => { setTimeout(() => generatorOrNext.error(err)); } :
                                 (err) => { generatorOrNext.error(err); };
      }

      if (generatorOrNext.complete) {
        completeFn = this.isAsync ? () => { setTimeout(() => generatorOrNext.complete()); } :
                                    () => { generatorOrNext.complete(); };
      }
    } else {
      schedulerFn = this.isAsync ? (value: any) => { setTimeout(() => generatorOrNext(value)); } :
                                   (value: any) => { generatorOrNext(value); };

      if (error) {
        errorFn =
            this.isAsync ? (err) => { setTimeout(() => error(err)); } : (err) => { error(err); };
      }

      if (complete) {
        completeFn = this.isAsync ? () => { setTimeout(() => complete()); } : () => { complete(); };
      }
    }

    return super.subscribe(schedulerFn, errorFn, completeFn);
  }
}
