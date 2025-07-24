/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AST,
  Call,
  ImplicitReceiver,
  ParseSourceSpan,
  PropertyRead,
  ThisReceiver,
  TmplAstBlockNode,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockError,
  TmplAstDeferredBlockLoading,
  TmplAstDeferredBlockPlaceholder,
  TmplAstDeferredTrigger,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstNode,
} from '@angular/compiler';
import ts from 'typescript';

import {DisplayInfoKind, SYMBOL_TEXT} from './utils/display_parts';
import {createQuickInfo, getTextSpanOfNode, isWithin, toTextSpan} from './utils';

export function isDollarAny(node: TmplAstNode | AST): node is Call {
  return (
    node instanceof Call &&
    node.receiver instanceof PropertyRead &&
    node.receiver.receiver instanceof ImplicitReceiver &&
    !(node.receiver.receiver instanceof ThisReceiver) &&
    node.receiver.name === '$any' &&
    node.args.length === 1
  );
}

export function createDollarAnyQuickInfo(node: Call): ts.QuickInfo {
  return createQuickInfo(
    '$any',
    DisplayInfoKind.METHOD,
    getTextSpanOfNode(node.receiver),
    /** containerName */ undefined,
    'any',
    [
      {
        kind: SYMBOL_TEXT,
        text: 'function to cast an expression to the `any` type',
      },
    ],
  );
}

// TODO(atscott): Create special `ts.QuickInfo` for `ng-template` and `ng-container` as well.
export function createNgTemplateQuickInfo(node: TmplAstNode | AST): ts.QuickInfo {
  return createQuickInfo(
    'ng-template',
    DisplayInfoKind.TEMPLATE,
    getTextSpanOfNode(node),
    /** containerName */ undefined,
    /** type */ undefined,
    [
      {
        kind: SYMBOL_TEXT,
        text: 'The `<ng-template>` is an Angular element for rendering HTML. It is never displayed directly.',
      },
    ],
  );
}

export function createQuickInfoForBuiltIn(
  node: TmplAstDeferredTrigger | TmplAstBlockNode,
  cursorPositionInTemplate: number,
): ts.QuickInfo | undefined {
  let partSpan: ParseSourceSpan;
  if (node instanceof TmplAstDeferredTrigger) {
    if (node.prefetchSpan !== null && isWithin(cursorPositionInTemplate, node.prefetchSpan)) {
      partSpan = node.prefetchSpan;
    } else if (node.hydrateSpan && isWithin(cursorPositionInTemplate, node.hydrateSpan)) {
      partSpan = node.hydrateSpan;
    } else if (
      node.whenOrOnSourceSpan !== null &&
      isWithin(cursorPositionInTemplate, node.whenOrOnSourceSpan)
    ) {
      partSpan = node.whenOrOnSourceSpan;
    } else if (node.nameSpan !== null && isWithin(cursorPositionInTemplate, node.nameSpan)) {
      partSpan = node.nameSpan;
    } else {
      return undefined;
    }
  } else {
    if (
      node instanceof TmplAstDeferredBlock ||
      node instanceof TmplAstDeferredBlockError ||
      node instanceof TmplAstDeferredBlockLoading ||
      node instanceof TmplAstDeferredBlockPlaceholder ||
      (node instanceof TmplAstForLoopBlockEmpty &&
        isWithin(cursorPositionInTemplate, node.nameSpan))
    ) {
      partSpan = node.nameSpan;
    } else if (
      node instanceof TmplAstForLoopBlock &&
      isWithin(cursorPositionInTemplate, node.trackKeywordSpan)
    ) {
      partSpan = node.trackKeywordSpan;
    } else {
      return undefined;
    }
  }

  const partName = partSpan.toString().trim();
  const partInfo = BUILT_IN_NAMES_TO_DOC_MAP[partName];
  const linkTags: ts.JSDocTagInfo[] = (partInfo?.links ?? []).map((text) => ({
    text: [{kind: SYMBOL_TEXT, text}],
    name: 'see',
  }));
  return createQuickInfo(
    partName,
    partInfo.displayInfoKind,
    toTextSpan(partSpan),
    /** containerName */ undefined,
    /** type */ undefined,
    [
      {
        kind: SYMBOL_TEXT,
        text: partInfo?.docString ?? '',
      },
    ],
    linkTags,
  );
}

const triggerDescriptionPreamble = 'A trigger to start loading the defer content after ';
const BUILT_IN_NAMES_TO_DOC_MAP: {
  [name: string]: {docString: string; links: string[]; displayInfoKind: DisplayInfoKind};
} = {
  '@defer': {
    docString: `A type of block that can be used to defer load the JavaScript for components, directives and pipes used inside a component template.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#defer)'],
    displayInfoKind: DisplayInfoKind.BLOCK,
  },
  '@placeholder': {
    docString: `A block for content shown prior to defer loading (Optional)`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#placeholder)'],
    displayInfoKind: DisplayInfoKind.BLOCK,
  },
  '@error': {
    docString: `A block for content shown when defer loading errors occur (Optional)`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#error)'],
    displayInfoKind: DisplayInfoKind.BLOCK,
  },
  '@loading': {
    docString: `A block for content shown during defer loading (Optional)`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#loading)'],
    displayInfoKind: DisplayInfoKind.BLOCK,
  },
  '@empty': {
    docString: `A block to display when the for loop variable is empty.`,
    links: [
      '[Reference](https://angular.dev/guide/templates/control-flow#providing-a-fallback-for-for-blocks-with-the-empty-block)',
    ],
    displayInfoKind: DisplayInfoKind.BLOCK,
  },
  'track': {
    docString: `Keyword to control how the for loop compares items in the list to compute updates.`,
    links: [
      '[Reference](https://angular.dev/guide/templates/control-flow#why-is-track-in-for-blocks-important)',
    ],
    displayInfoKind: DisplayInfoKind.KEYWORD,
  },
  'idle': {
    docString: triggerDescriptionPreamble + `the browser reports idle state (default).`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-idle)'],
    displayInfoKind: DisplayInfoKind.TRIGGER,
  },
  'immediate': {
    docString: triggerDescriptionPreamble + `the page finishes rendering.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-immediate)'],
    displayInfoKind: DisplayInfoKind.TRIGGER,
  },
  'hover': {
    docString: triggerDescriptionPreamble + `the element has been hovered.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-hover)'],
    displayInfoKind: DisplayInfoKind.TRIGGER,
  },
  'timer': {
    docString: triggerDescriptionPreamble + `a specific timeout.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-timer)'],
    displayInfoKind: DisplayInfoKind.TRIGGER,
  },
  'interaction': {
    docString: triggerDescriptionPreamble + `the element is clicked, touched, or focused.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-interaction)'],
    displayInfoKind: DisplayInfoKind.TRIGGER,
  },
  'viewport': {
    docString: triggerDescriptionPreamble + `the element enters the viewport.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-viewport)'],
    displayInfoKind: DisplayInfoKind.TRIGGER,
  },
  'prefetch': {
    docString:
      'Keyword that indicates that the trigger configures when prefetching the defer block contents should start. You can use `on` and `when` conditions as prefetch triggers.',
    links: ['[Reference](https://angular.dev/guide/templates/defer#prefetching)'],
    displayInfoKind: DisplayInfoKind.KEYWORD,
  },
  'hydrate': {
    docString:
      "Keyword that indicates when the block's content will be hydrated. You can use `on` and `when` conditions as hydration triggers, or `hydrate never` to disable hydration for this block.",
    // TODO(crisbeto): add link to partial hydration guide
    links: [],
    displayInfoKind: DisplayInfoKind.KEYWORD,
  },
  'when': {
    docString:
      'Keyword that starts the expression-based trigger section. Should be followed by an expression that returns a boolean.',
    links: ['[Reference](https://angular.dev/guide/templates/defer#triggers)'],
    displayInfoKind: DisplayInfoKind.KEYWORD,
  },
  'on': {
    docString:
      'Keyword that starts the event-based trigger section. Should be followed by one of the built-in triggers.',
    links: ['[Reference](https://angular.dev/guide/templates/defer#triggers)'],
    displayInfoKind: DisplayInfoKind.KEYWORD,
  },
};
