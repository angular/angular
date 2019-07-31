/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as tss from 'typescript/lib/tsserverlibrary';

import {TemplateInfo} from './common';
import {locateSymbol} from './locate_symbol';
import {Location} from './types';

export function getDefinition(info: TemplateInfo): Location[]|undefined {
  const result = locateSymbol(info);
  return result && result.symbol.definition;
}

export function ngLocationToTsDefinitionInfo(loc: Location): tss.DefinitionInfo {
  return {
    fileName: loc.fileName,
    textSpan: {
      start: loc.span.start,
      length: loc.span.end - loc.span.start,
    },
    // TODO(kyliau): Provide more useful info for name, kind and containerKind
    name: '',  // should be name of symbol but we don't have enough information here.
    kind: tss.ScriptElementKind.unknown,
    containerName: loc.fileName,
    containerKind: tss.ScriptElementKind.unknown,
  };
}
