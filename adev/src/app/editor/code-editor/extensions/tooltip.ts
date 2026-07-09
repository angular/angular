/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext, Signal} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

import {Tooltip, hoverTooltip} from '@codemirror/view';
import {marked} from 'marked';
import {Subject, filter, take} from 'rxjs';

import ts from 'typescript';

import type {EditorFile} from '../code-mirror-editor.service';
import {TsVfsWorkerActions} from '../workers/enums/actions';
import {DisplayTooltipRequest} from '../workers/interfaces/display-tooltip-request';
import {DisplayTooltipResponse} from '../workers/interfaces/display-tooltip-response';
import {ActionMessage} from '../workers/interfaces/message';

export const getTooltipExtension = (
  emitter: Subject<ActionMessage<DisplayTooltipResponse>>,
  currentFile: Signal<EditorFile>,
  sendRequestToTsVfs: (request: ActionMessage<DisplayTooltipRequest>) => void,
  domSanitizer: DomSanitizer,
) => {
  return hoverTooltip(
    async (_, pos: number): Promise<Tooltip | null> => {
      sendRequestToTsVfs({
        action: TsVfsWorkerActions.DISPLAY_TOOLTIP_REQUEST,
        data: {
          file: currentFile().filename,
          position: pos,
        },
      });

      const response = await new Promise<DisplayTooltipResponse>((resolve) => {
        emitter
          .pipe(
            filter((event) => event.action === TsVfsWorkerActions.DISPLAY_TOOLTIP_RESPONSE),
            take(1),
          )
          .subscribe((message) => {
            resolve(message.data!);
          });
      });

      if (!response?.displayParts) return null;

      const {displayParts, tags, documentation} = response;

      return {
        pos,
        create() {
          const tooltip = document.createElement('div');

          tooltip.appendChild(getHtmlFromDisplayParts(displayParts));

          // use documentation if available as it's more informative than tags
          if (documentation?.[0]?.text) {
            tooltip.appendChild(getMarkedHtmlFromString(documentation[0]?.text, domSanitizer));
          } else if (tags?.length) {
            tooltip.appendChild(getTagsHtml(tags, domSanitizer));
          }

          return {
            dom: tooltip,

            // Note: force the tooltip to scroll to the top on mount and on position change
            // because depending on the position of the mouse and the size of the tooltip content,
            // the tooltip might render with its initial scroll position on the bottom
            mount: (_) => forceTooltipScrollTop(),
            positioned: (_) => forceTooltipScrollTop(),
          };
        },
        above: true, // always show the tooltip above the cursor
      };
    },
    {
      hideOnChange: true,
    },
  );
};

function forceTooltipScrollTop() {
  const activeTooltip = document.querySelector('.cm-tooltip');

  // only scroll if the tooltip is scrollable
  if (activeTooltip && activeTooltip.scrollHeight > activeTooltip.clientHeight) {
    activeTooltip.scroll(0, -activeTooltip.scrollHeight);
  }
}

export function getMarkedHtmlFromString(
  content: string,
  domSanitizer: DomSanitizer,
): HTMLDivElement {
  const wrapper = document.createElement('div');
  const sanitizedHtml = renderAndSanitizeMarkdownToHtml(content, domSanitizer);
  wrapper.innerHTML = sanitizedHtml;

  return wrapper;
}

function getHtmlFromDisplayParts(displayParts: ts.SymbolDisplayPart[]): HTMLDivElement {
  const wrapper = document.createElement('div');

  let displayPartWrapper = document.createElement('div');

  for (const part of displayParts) {
    const span = document.createElement('span');
    span.classList.add(part.kind);
    span.textContent = part.text;

    // create new div to separate lines when a line break is found
    if (part.kind === 'lineBreak') {
      wrapper.appendChild(displayPartWrapper);

      displayPartWrapper = document.createElement('div');
    } else {
      displayPartWrapper.appendChild(span);
    }
  }

  wrapper.appendChild(displayPartWrapper);

  return wrapper;
}

export function getTagsHtml(tags: ts.JSDocTagInfo[], domSanitizer: DomSanitizer): HTMLDivElement {
  const tagsWrapper = document.createElement('div');

  let contentString = '';

  for (let tag of tags) {
    contentString += `\n@${tag.name}\n`;

    if (tag.text) {
      for (const {text} of tag.text) {
        contentString += text;
      }
    }
  }

  const sanitizedHtml = renderAndSanitizeMarkdownToHtml(contentString, domSanitizer);
  tagsWrapper.innerHTML = sanitizedHtml;

  return tagsWrapper;
}

function renderAndSanitizeMarkdownToHtml(content: string, domSanitizer: DomSanitizer): string {
  const markedHtml = marked(content) as string;
  const sanitizedHtml = domSanitizer.sanitize(SecurityContext.HTML, markedHtml) ?? '';
  return sanitizedHtml;
}
