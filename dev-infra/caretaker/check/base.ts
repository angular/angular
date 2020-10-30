/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgDevConfig} from '../../utils/config';
import {GitClient} from '../../utils/git/index';
import {CaretakerConfig} from '../config';

/** The BaseModule to extend modules for caretaker checks from. */
export abstract class BaseModule<Data> {
  /** A method to resole the promise with data for the module. */
  protected resolve!: (data: Data) => void;

  /** The data for the module. */
  readonly data = (new Promise<Data>((resolve) => {
    this.resolve = resolve;
  }));

  constructor(
      protected git: GitClient, protected config: NgDevConfig<{caretaker: CaretakerConfig}>) {
    this.retrieveData();
  }

  /** Asyncronously retrieve data for the module. */
  abstract async retrieveData(): Promise<void>;

  /** Print the information discovered for the module to the terminal. */
  abstract async printToTerminal(): Promise<void>;
}
