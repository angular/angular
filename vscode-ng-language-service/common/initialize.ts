/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface ServerOptions {
  logFile?: string;
}

export interface OpenJsDocLinkCommand_Args {
  readonly file: string;
  readonly position?: {
    start: {character: number; line: number};
    end: {character: number; line: number};
  };
}

export const OpenJsDocLinkCommandId = 'angular.openJsDocLink';

export interface ShowReferencesCommand_Args {
  readonly file: string;
  readonly position: {line: number; character: number};
  readonly references: ReadonlyArray<{
    uri: string;
    range: {
      start: {line: number; character: number};
      end: {line: number; character: number};
    };
  }>;
}

export const ShowReferencesCommandId = 'angular.showReferences';
