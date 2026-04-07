/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal} from '@angular/core';
import {
  Completion,
  CompletionContext,
  CompletionResult,
  autocompletion,
  closeCompletion,
  completeFromList,
  insertCompletionText,
} from '@codemirror/autocomplete';
import {EditorView} from '@codemirror/view';
import {Subject, filter, take} from 'rxjs';

import type {EditorFile} from '../code-mirror-editor.service';
import {TsVfsWorkerActions} from '../workers/enums/actions';
import {AutocompleteRequest} from '../workers/interfaces/autocomplete-request';
import {AutocompleteItem, AutocompleteResponse} from '../workers/interfaces/autocomplete-response';
import {ActionMessage} from '../workers/interfaces/message';
import {TransactionSpec} from '@codemirror/state';

// Factory method for autocomplete extension.
export const getAutocompleteExtension = (
  emitter: Subject<ActionMessage>,
  currentFile: Signal<EditorFile>,
  sendRequestToTsVfs: (request: ActionMessage<AutocompleteRequest>) => void,
) => {
  return autocompletion({
    activateOnTyping: true,
    override: [
      async (context: CompletionContext): Promise<CompletionResult | null> => {
        try {
          const contextPositions = context.state.wordAt(context.pos);

          sendRequestToTsVfs({
            action: TsVfsWorkerActions.AUTOCOMPLETE_REQUEST,
            data: {
              file: currentFile().filename,
              position: context.pos,
              from: contextPositions?.from,
              to: contextPositions?.to,
              content: context.state.doc.toString(),
            },
          });

          const completions = await new Promise<AutocompleteResponse | undefined>((resolve) => {
            emitter
              .pipe(
                filter((event) => event.action === TsVfsWorkerActions.AUTOCOMPLETE_RESPONSE),
                take(1),
              )
              .subscribe((message: ActionMessage<AutocompleteResponse>) => {
                resolve(message.data);
              });
          });

          if (!completions) {
            return null;
          }

          const completionSource = completeFromList(
            completions.map((completionItem) => {
              const suggestions: Completion = {
                type: completionItem.kind,
                label: completionItem.name,
                boost: 1 / Number(completionItem.sortText),
                detail: completionItem?.codeActions?.[0]?.description,
                apply: (view, completion, from, to) =>
                  applyWithCodeAction(view, {...completion, ...completionItem}, from, to),
              };

              return suggestions;
            }),
          );

          return completionSource(context);
        } catch (e) {
          return null;
        }
      },
    ],
  });
};

const applyWithCodeAction = (
  view: EditorView,
  completion: Completion & AutocompleteItem,
  from: number,
  to: number,
) => {
  const transactionSpecs: TransactionSpec[] = [
    insertCompletionText(view.state, completion.label, from, to),
  ];

  if (completion.codeActions?.length) {
    const {span, newText} = completion.codeActions[0].changes[0].textChanges[0];

    transactionSpecs.push(
      insertCompletionText(view.state, newText, span.start, span.start + span.length),
    );
  }

  view.dispatch(
    ...transactionSpecs,
    // avoid moving cursor to the autocompleted text
    {selection: view.state.selection},
  );

  // Manually close the autocomplete picker after applying the completion
  closeCompletion(view);
};
