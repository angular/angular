/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Injector} from '@angular/core';
import {Observable} from 'rxjs';

/**
 * Interface for the events emitted through the NgElementStrategy.
 *
 * @publicApi
 */
export interface NgElementStrategyEvent {
  name: string;
  value: any;
}

/**
 * Underlying strategy used by the NgElement to create/destroy the component and react to input
 * changes.
 *
 * @publicApi
 */
export interface NgElementStrategy {
  events: Observable<NgElementStrategyEvent>;

  connect(element: HTMLElement): void;
  disconnect(): void;
  getInputValue(propName: string): any;
  setInputValue(propName: string, value: string, transform?: (value: any) => any): void;
  applyMethod?(methodName: keyof any, args: any[]): any;
}

/**
 * Factory used to create new strategies for each NgElement instance.
 *
 * @publicApi
 */
export interface NgElementStrategyFactory {
  /** Creates a new instance to be used for an NgElement. */
  create(injector: Injector): NgElementStrategy;
}
