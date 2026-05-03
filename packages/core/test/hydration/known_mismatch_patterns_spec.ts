/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getKnownMismatchPatternHint} from '../../src/hydration/known_mismatch_patterns';

describe('getKnownMismatchPatternHint', () => {
  const ELEMENT_NODE = 1;

  function el(tagName: string): any {
    return {nodeType: ELEMENT_NODE, tagName: tagName.toUpperCase()};
  }

  describe('tableMissingTbody', () => {
    const TABLE_BODY_CHILD_TAGS = ['tr'];

    for (const childTag of TABLE_BODY_CHILD_TAGS) {
      it(`emits hint when <${childTag}> is a direct child of <table> and the actual node is missing`, () => {
        const hint = getKnownMismatchPatternHint(
          ELEMENT_NODE,
          childTag,
          /* actualNode */ null,
          /* parentRNode */ el('table'),
          /* expectedParentTagName */ 'table',
        );
        expect(hint).toContain('known browser HTML normalization issue');
        expect(hint).toContain(`<${childTag}>`);
        expect(hint).toContain('<tbody>');
      });

      it(`emits hint when the browser inserted a <tbody> in place of the expected <${childTag}>`, () => {
        const hint = getKnownMismatchPatternHint(
          ELEMENT_NODE,
          childTag,
          /* actualNode */ el('tbody'),
          /* parentRNode */ el('table'),
          /* expectedParentTagName */ 'table',
        );
        expect(hint).toContain('<tbody>');
      });
    }

    it('stays silent when the parent is not a <table>', () => {
      const hint = getKnownMismatchPatternHint(ELEMENT_NODE, 'tr', null, el('div'), 'div');
      expect(hint).toBe('');
    });

    it('stays silent when the actual node is a non-tbody element', () => {
      const hint = getKnownMismatchPatternHint(ELEMENT_NODE, 'tr', el('div'), el('table'), 'table');
      expect(hint).toBe('');
    });
  });

  describe('tableMissingColgroup', () => {
    it('emits hint when <col> is a direct child of <table> and the actual node is missing', () => {
      const hint = getKnownMismatchPatternHint(
        ELEMENT_NODE,
        'col',
        /* actualNode */ null,
        /* parentRNode */ el('table'),
        /* expectedParentTagName */ 'table',
      );
      expect(hint).toContain('known browser HTML normalization issue');
      expect(hint).toContain('<col>');
      expect(hint).toContain('<colgroup>');
      expect(hint).toContain('explicit <colgroup>');
    });

    it('emits hint when the browser inserted a <colgroup> in place of the expected <col>', () => {
      const hint = getKnownMismatchPatternHint(
        ELEMENT_NODE,
        'col',
        /* actualNode */ el('colgroup'),
        /* parentRNode */ el('table'),
        /* expectedParentTagName */ 'table',
      );
      expect(hint).toContain('<colgroup>');
    });

    it('stays silent when the expected parent is not a <table>', () => {
      const hint = getKnownMismatchPatternHint(ELEMENT_NODE, 'col', null, el('div'), 'div');
      expect(hint).toBe('');
    });

    it('stays silent when the actual node is a non-colgroup element', () => {
      const hint = getKnownMismatchPatternHint(
        ELEMENT_NODE,
        'col',
        /* actualNode */ el('div'),
        /* parentRNode */ el('table'),
        /* expectedParentTagName */ 'table',
      );
      expect(hint).toBe('');
    });
  });

  describe('nestedAnchor', () => {
    it('emits hint for <a> nested inside <a>', () => {
      const hint = getKnownMismatchPatternHint(ELEMENT_NODE, 'a', null, el('a'), 'a');
      expect(hint).toContain('<a> element cannot be nested inside another <a>');
    });

    it('stays silent for <a> with a non-<a> parent', () => {
      const hint = getKnownMismatchPatternHint(ELEMENT_NODE, 'a', null, el('div'), 'div');
      expect(hint).toBe('');
    });

    it('stays silent for non-<a> child of <a>', () => {
      const hint = getKnownMismatchPatternHint(ELEMENT_NODE, 'span', null, el('a'), 'a');
      // Note: 'span' is not in P_AUTO_CLOSING_CHILDREN and parent isn't <p>,
      // so pBlockChild also stays silen
      expect(hint).toBe('');
    });
  });

  describe('nestedButton', () => {
    it('emits hint for <button> nested inside <button>', () => {
      const hint = getKnownMismatchPatternHint(
        ELEMENT_NODE,
        'button',
        null,
        el('button'),
        'button',
      );
      expect(hint).toContain('<button> element cannot be nested inside another <button> element');
      expect(hint).toContain('implicitly closes the outer <button>');
      expect(hint).toContain('parent-child structure into siblings');
    });

    it('stays silent for <button> with a non-<button> parent', () => {
      const hint = getKnownMismatchPatternHint(ELEMENT_NODE, 'button', null, el('div'), 'div');
      expect(hint).toBe('');
    });

    it('stays silent for non-<button> child of <button>', () => {
      const hint = getKnownMismatchPatternHint(ELEMENT_NODE, 'span', null, el('button'), 'button');
      expect(hint).toBe('');
    });
  });

  describe('pBlockChild', () => {
    const P_AUTO_CLOSING_CHILDREN = [
      'address',
      'article',
      'aside',
      'blockquote',
      'div',
      'dl',
      'fieldset',
      'figure',
      'footer',
      'form',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'header',
      'hr',
      'main',
      'nav',
      'ol',
      'p',
      'pre',
      'section',
      'table',
      'ul',
    ];

    for (const childTag of P_AUTO_CLOSING_CHILDREN) {
      it(`emits hint for <${childTag}> as a direct child of <p>`, () => {
        const hint = getKnownMismatchPatternHint(
          ELEMENT_NODE,
          childTag,
          /* actualNode */ null,
          /* parentRNode */ el('p'),
          /* expectedParentTagName */ 'p',
        );
        expect(hint).toContain('known browser HTML normalization issue');
        expect(hint).toContain(`The <${childTag}> element is not allowed inside a <p> element`);
      });
    }

    it('emits the generic-block hint when the expected node under <p> is missing and tag is not in the known set', () => {
      const hint = getKnownMismatchPatternHint(
        ELEMENT_NODE,
        'inner-p',
        /* actualNode */ null,
        /* parentRNode */ el('p'),
        /* expectedParentTagName */ 'p',
      );
      expect(hint).toContain('A block-level descendant is not allowed inside a <p> element');
    });

    it('stays silent when the expected parent is not <p>', () => {
      const hint = getKnownMismatchPatternHint(ELEMENT_NODE, 'div', null, el('div'), 'div');
      expect(hint).toBe('');
    });

    it('stays silent when the actual node is present and the expected tag is not a known block child', () => {
      const hint = getKnownMismatchPatternHint(
        ELEMENT_NODE,
        'span',
        /* actualNode */ el('span'),
        /* parentRNode */ el('p'),
        /* expectedParentTagName */ 'p',
      );
      expect(hint).toBe('');
    });
  });
});
