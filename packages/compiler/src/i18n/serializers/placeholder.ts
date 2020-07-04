/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const TAG_TO_PLACEHOLDER_NAMES: {[k: string]: string} = {
  'A': 'LINK',
  'B': 'BOLD_TEXT',
  'BR': 'LINE_BREAK',
  'EM': 'EMPHASISED_TEXT',
  'H1': 'HEADING_LEVEL1',
  'H2': 'HEADING_LEVEL2',
  'H3': 'HEADING_LEVEL3',
  'H4': 'HEADING_LEVEL4',
  'H5': 'HEADING_LEVEL5',
  'H6': 'HEADING_LEVEL6',
  'HR': 'HORIZONTAL_RULE',
  'I': 'ITALIC_TEXT',
  'LI': 'LIST_ITEM',
  'LINK': 'MEDIA_LINK',
  'OL': 'ORDERED_LIST',
  'P': 'PARAGRAPH',
  'Q': 'QUOTATION',
  'S': 'STRIKETHROUGH_TEXT',
  'SMALL': 'SMALL_TEXT',
  'SUB': 'SUBSTRIPT',
  'SUP': 'SUPERSCRIPT',
  'TBODY': 'TABLE_BODY',
  'TD': 'TABLE_CELL',
  'TFOOT': 'TABLE_FOOTER',
  'TH': 'TABLE_HEADER_CELL',
  'THEAD': 'TABLE_HEADER',
  'TR': 'TABLE_ROW',
  'TT': 'MONOSPACED_TEXT',
  'U': 'UNDERLINED_TEXT',
  'UL': 'UNORDERED_LIST',
};

/**
 * Creates unique names for placeholder with different content.
 *
 * Returns the same placeholder name when the content is identical.
 */
export class PlaceholderRegistry {
  // Count the occurrence of the base name top generate a unique name
  private _placeHolderNameCounts: {[k: string]: number} = {};
  // Maps signature to placeholder names
  private _signatureToName: {[k: string]: string} = {};

  getStartTagPlaceholderName(tag: string, attrs: {[k: string]: string}, isVoid: boolean): string {
    const signature = this._hashTag(tag, attrs, isVoid);
    if (this._signatureToName[signature]) {
      return this._signatureToName[signature];
    }

    const upperTag = tag.toUpperCase();
    const baseName = TAG_TO_PLACEHOLDER_NAMES[upperTag] || `TAG_${upperTag}`;
    const name = this._generateUniqueName(isVoid ? baseName : `START_${baseName}`);

    this._signatureToName[signature] = name;

    return name;
  }

  getCloseTagPlaceholderName(tag: string): string {
    const signature = this._hashClosingTag(tag);
    if (this._signatureToName[signature]) {
      return this._signatureToName[signature];
    }

    const upperTag = tag.toUpperCase();
    const baseName = TAG_TO_PLACEHOLDER_NAMES[upperTag] || `TAG_${upperTag}`;
    const name = this._generateUniqueName(`CLOSE_${baseName}`);

    this._signatureToName[signature] = name;

    return name;
  }

  getPlaceholderName(name: string, content: string): string {
    const upperName = name.toUpperCase();
    const signature = `PH: ${upperName}=${content}`;
    if (this._signatureToName[signature]) {
      return this._signatureToName[signature];
    }

    const uniqueName = this._generateUniqueName(upperName);
    this._signatureToName[signature] = uniqueName;

    return uniqueName;
  }

  getUniquePlaceholder(name: string): string {
    return this._generateUniqueName(name.toUpperCase());
  }

  // Generate a hash for a tag - does not take attribute order into account
  private _hashTag(tag: string, attrs: {[k: string]: string}, isVoid: boolean): string {
    const start = `<${tag}`;
    const strAttrs = Object.keys(attrs).sort().map((name) => ` ${name}=${attrs[name]}`).join('');
    const end = isVoid ? '/>' : `></${tag}>`;

    return start + strAttrs + end;
  }

  private _hashClosingTag(tag: string): string {
    return this._hashTag(`/${tag}`, {}, false);
  }

  private _generateUniqueName(base: string): string {
    const seen = this._placeHolderNameCounts.hasOwnProperty(base);
    if (!seen) {
      this._placeHolderNameCounts[base] = 1;
      return base;
    }

    const id = this._placeHolderNameCounts[base];
    this._placeHolderNameCounts[base] = id + 1;
    return `${base}_${id}`;
  }
}
