/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {MockService} from './mock_host';

export interface HumanizedDefinitionInfo {
  fileName: string;
  textSpan: string;
  contextSpan: string | undefined;
}

export function humanizeDefinitionInfo(
  def: ts.DefinitionInfo,
  service: MockService,
): HumanizedDefinitionInfo {
  const snapshot = service.getScriptInfo(def.fileName).getSnapshot();
  return {
    fileName: def.fileName,
    textSpan: snapshot.getText(def.textSpan.start, def.textSpan.start + def.textSpan.length),
    contextSpan: def.contextSpan
      ? snapshot.getText(def.contextSpan.start, def.contextSpan.start + def.contextSpan.length)
      : undefined,
  };
}
