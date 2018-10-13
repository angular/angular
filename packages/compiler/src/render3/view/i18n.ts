/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** I18n separators for metadata **/
const I18N_MEANING_SEPARATOR = '|';
const I18N_ID_SEPARATOR = '@@';

/** Name of the i18n attributes **/
export const I18N_ATTR = 'i18n';
export const I18N_ATTR_PREFIX = 'i18n-';

/** Placeholder wrapper for i18n expressions **/
export const I18N_PLACEHOLDER_SYMBOL = '�';

// Parse i18n metas like:
// - "@@id",
// - "description[@@id]",
// - "meaning|description[@@id]"
export function parseI18nMeta(i18n?: string):
    {description?: string, id?: string, meaning?: string} {
  let meaning: string|undefined;
  let description: string|undefined;
  let id: string|undefined;

  if (i18n) {
    // TODO(vicb): figure out how to force a message ID with closure ?
    const idIndex = i18n.indexOf(I18N_ID_SEPARATOR);

    const descIndex = i18n.indexOf(I18N_MEANING_SEPARATOR);
    let meaningAndDesc: string;
    [meaningAndDesc, id] =
        (idIndex > -1) ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''];
    [meaning, description] = (descIndex > -1) ?
        [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
        ['', meaningAndDesc];
  }

  return {description, id, meaning};
}

export function isI18NAttribute(name: string): boolean {
  return name === I18N_ATTR || name.startsWith(I18N_ATTR_PREFIX);
}

export function wrapI18nPlaceholder(content: string | number): string {
  return `${I18N_PLACEHOLDER_SYMBOL}${content}${I18N_PLACEHOLDER_SYMBOL}`;
}

export function assembleI18nTemplate(strings: Array<string>): string {
  if (!strings.length) return '';
  let acc = '';
  const lastIdx = strings.length - 1;
  for (let i = 0; i < lastIdx; i++) {
    acc += `${strings[i]}${wrapI18nPlaceholder(i)}`;
  }
  acc += strings[lastIdx];
  return acc;
}

function getSeqNubmerGenerator(startsAt: number = 0): () => number {
  let current = startsAt;
  return () => current++;
}
export class I18nContext {
  private content: string = '';
  private id: number;
  private _uniqueIdGen: () => number;

  constructor(
      private index: number, private ref: any, private level: number = 0,
      private uniqueIdGen: (() => number) | null) {
    this._uniqueIdGen = uniqueIdGen || getSeqNubmerGenerator();
    this.id = this._uniqueIdGen();
  }

  private wrap(symbol: string, elementIndex: number, contextIdx: number, closed?: boolean) {
    const state = closed ? '/' : '';
    const blockIndex = contextIdx > 0 ? `:${contextIdx}` : '';
    return wrapI18nPlaceholder(`${state}${symbol}${elementIndex}${blockIndex}`);
  }
  private append(content: string) { this.content += content; }

  getIndex() { return this.index; }
  getRef() { return this.ref; }
  getLevel() { return this.level; }
  getContent() { return this.content; }
  getId() { return this.id; }
  getUniqueIdGen() { return this._uniqueIdGen; }
  appendText(content: string) { this.append(content); }
  appendElement(elementIndex: number, closed?: boolean) {
    this.append(this.wrap('#', elementIndex, this.id, closed));
  }
  appendTemplate(index: number) { this.append(`[tmpl:${this.id}:${index}]`); }
  resolved() {
    // TODO: WIP, define more precise regexp
    return !/tmpl/g.test(this.content);
  }
  reconcileTemplate(templateIndex: number, fromContext: I18nContext|null) {
    if (!fromContext) return;
    const id = fromContext.getId();
    const content = fromContext.getContent();
    const pattern = new RegExp(`\\[tmpl\\:${this.id}\\:${templateIndex}\\]`);
    const replacement =
        `${this.wrap('*', templateIndex, id)}${content}${this.wrap('*', templateIndex, id, true)}`;
    this.content = this.content.replace(pattern, replacement);
  }
}