/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** The JSON data file format for CLI reference info. */
export interface CliCommand {
  name: string;
  command: string;
  parentCommand?: CliCommand;
  shortDescription: string;
  longDescription: string;
  deprecated: boolean;
  aliases: string[];
  options: CliOption[];
  subcommands?: CliCommand[];
}

/** The CLI item option info. */
export interface CliOption {
  name: string;
  type: 'boolean' | 'string' | 'number';
  default: string;
  description: string;
  positional?: number;
  aliases?: string[];
  deprecated: {version: string | undefined} | undefined;
}
