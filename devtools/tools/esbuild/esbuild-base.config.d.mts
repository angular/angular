/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export default function createConfig({
  enableLinker,
  optimize,
}: {
  enableLinker: boolean;
  optimize: boolean;
}): Promise<{
  resolveExtensions: string[];
  mainFields: string[];
  conditions: string[];
  define:
    | {
        [key: string]: string;
      }
    | undefined;
  plugins: any[];
}>;
