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
  /** The data for the module. */
  readonly data = this.retrieveData();

  constructor(
      protected git: GitClient, protected config: NgDevConfig<{caretaker: CaretakerConfig}>) {}

  /** Asyncronously retrieve data for the module. */
  protected abstract retrieveData(): Promise<Data>;

  /** Print the information discovered for the module to the terminal. */
  abstract printToTerminal(): Promise<void>;
}
