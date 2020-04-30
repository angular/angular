/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getAngularDevConfig} from '../../utils/config';
import {FormatConfig} from '../config';

export type CallbackFunc = (file: string, code: number, stdout: string, stderr: string) => boolean;

type FormatterActions = 'check'|'format';

interface FormatterActionMetadata {
  commandFlags: string;
  callback: CallbackFunc;
}

export abstract class Formatter {
  abstract name: string;
  abstract binaryFilePath: string;

  abstract actions: {check: FormatterActionMetadata; format: FormatterActionMetadata;};

  defaultFileMatcher = [];



  constructor(private config: FormatConfig) {}

  commandFor(action: FormatterActions) {
    switch (action) {
      case 'check':
        return `${this.binaryFilePath} ${this.actions.check.commandFlags}`;
      case 'format':
        return `${this.binaryFilePath} ${this.actions.format.commandFlags}`;
      default:
        throw Error('Unknown action type');
    }
  }

  callbackFor(action: FormatterActions) {
    switch (action) {
      case 'check':
        return this.actions.check.callback;
      case 'format':
        return this.actions.format.callback;
      default:
        throw Error('Unknown action type');
    }
  }

  isEnabled() {
    return !!this.config[this.name];
  }

  getFileMatcher() {
    return this.getFileMatcherFromConfig() || this.defaultFileMatcher;
  }

  private getFileMatcherFromConfig() {
    const formatterConfig = this.config[this.name];
    if (typeof formatterConfig === 'boolean') {
      return undefined;
    }
    return formatterConfig.matchers;
  }
}
