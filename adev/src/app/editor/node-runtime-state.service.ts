/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, signal} from '@angular/core';
import {isIos} from '@angular/docs';

import {LoadingStep} from './enums/loading-steps';
import {OUT_OF_MEMORY_MSG} from './node-runtime-errors';

export const MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES = 3;
export const WEBCONTAINERS_COUNTER_KEY = 'numberOfWebcontainers';

export type NodeRuntimeError = {
  message: string | undefined;
  type: ErrorType | undefined;
};

export enum ErrorType {
  UNKNOWN,
  COOKIES,
  OUT_OF_MEMORY,
  UNSUPPORTED_BROWSER_ENVIRONMENT,
}

@Injectable({providedIn: 'root'})
export class NodeRuntimeState {
  private readonly _loadingStep = signal<number>(LoadingStep.NOT_STARTED);
  loadingStep = this._loadingStep.asReadonly();

  private readonly _isResetting = signal(false);
  readonly isResetting = this._isResetting.asReadonly();

  private readonly _error = signal<NodeRuntimeError | undefined>(undefined);
  readonly error = this._error.asReadonly();

  constructor() {
    this.checkUnsupportedEnvironment();
  }

  setLoadingStep(step: LoadingStep): void {
    this._loadingStep.set(step);
  }

  setIsResetting(isResetting: boolean): void {
    this._isResetting.set(isResetting);
  }

  setError({message, type}: NodeRuntimeError) {
    type ??= this.getErrorType(message);
    this._error.set({message, type});
    this.setLoadingStep(LoadingStep.ERROR);
  }

  private getErrorType(message: NodeRuntimeError['message']) {
    if (message?.includes(OUT_OF_MEMORY_MSG)) {
      return ErrorType.OUT_OF_MEMORY;
    }

    if (message?.toLowerCase().includes('service worker')) {
      return ErrorType.COOKIES;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * This method defines whether the current environment is compatible
   * with the NodeRuntimeSandbox. The embedded editor requires significant
   * CPU and memory resources and can not be ran in all browsers/devices. More
   * specifically, mobile devices are affected by this, so for the best user
   * experience (to avoid crashes), we disable the NodeRuntimeSandbox and
   * recommend using desktop.
   */
  private checkUnsupportedEnvironment(): void {
    if (isIos) {
      this.setError({
        message: 'Unsupported environment',
        type: ErrorType.UNSUPPORTED_BROWSER_ENVIRONMENT,
      });
    }
  }
}
