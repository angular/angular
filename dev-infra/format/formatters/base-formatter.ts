/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FormatConfig} from '../config';

// A callback to determine if the formatter run found a failure in formatting.
export type CallbackFunc = (file: string, code: number, stdout: string, stderr: string) => boolean;

// The actions a formatter can take.
export type FormatterAction = 'check'|'format';

// The metadata needed for running one of the `FormatterAction`s on a file.
interface FormatterActionMetadata {
  commandFlags: string;
  callback: CallbackFunc;
}

/**
 * The base class for formatters to run against provided files.
 */
export abstract class Formatter {
  /**
   * The name of the formatter, this is used for identification in logging and for enabling and
   * configuring the formatter in the config.
   */
  abstract name: string;

  /** The full path file location of the formatter binary. */
  abstract binaryFilePath: string;

  /** Metadata for each `FormatterAction` available to the formatter. */
  abstract actions: {
    // An action performing a check of format without making any changes.
    check: FormatterActionMetadata;
    // An action to format files in place.
    format: FormatterActionMetadata;
  };

  /** The default matchers for the formatter for filtering files to be formatted. */
  abstract defaultFileMatcher: string[];

  constructor(private config: FormatConfig) {}

  /**
   * Retrieve the command to execute the provided action, including both the binary
   * and command line flags.
   */
  commandFor(action: FormatterAction) {
    switch (action) {
      case 'check':
        return `${this.binaryFilePath} ${this.actions.check.commandFlags}`;
      case 'format':
        return `${this.binaryFilePath} ${this.actions.format.commandFlags}`;
      default:
        throw Error('Unknown action type');
    }
  }

  /**
   * Retrieve the callback for the provided action to determine if an action
   * failed in formatting.
   */
  callbackFor(action: FormatterAction) {
    switch (action) {
      case 'check':
        return this.actions.check.callback;
      case 'format':
        return this.actions.format.callback;
      default:
        throw Error('Unknown action type');
    }
  }

  /** Whether the formatter is enabled in the provided config. */
  isEnabled() {
    return !!this.config[this.name];
  }

  /** Retrieve the active file matcher for the formatter. */
  getFileMatcher() {
    return this.getFileMatcherFromConfig() || this.defaultFileMatcher;
  }

  /**
   * Retrieves the file matcher from the config provided to the constructor if provided.
   */
  private getFileMatcherFromConfig(): string[]|undefined {
    const formatterConfig = this.config[this.name];
    if (typeof formatterConfig === 'boolean') {
      return undefined;
    }
    return formatterConfig.matchers;
  }
}
