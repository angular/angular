/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {shim} from './utils';

describe('ShadowCss nesting', () => {
  it('should shim simple nested selector', () => {
    const css = `
      .parent {
        color: blue;
        background: red;

        .child {
          color: red;
          background: blue;
        }
      }
    `;

    const expected = `
      .parent[contenta] {
        color: blue;
        background: red;

        .child[contenta] {
          color: red;
          background: blue;
        }
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should shim nested selector with ampersand', () => {
    const css = `
      .parent {
        color: blue;
        background: red;

        & .child {
          color: red;
          background: blue;
        }
      }
    `;

    const expected = `
      .parent[contenta] {
        color: blue;
        background: red;

        & .child[contenta] {
          color: red;
          background: blue;
        }
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should shim selector with modifier applying to ampersand', () => {
    const css = `
      .parent {
        color: blue;

        &.modifier {
          color: red;
        }
      }
    `;

    const expected = `
      .parent[contenta] {
        color: blue;

        &.modifier[contenta] {
          color: red;
        }
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should shim selector with multiple ampersands', () => {
    const css = `
      .parent {
        color: blue;

        & ~ & {
          color: red;
        }
      }
    `;

    const expected = `
      .parent[contenta] {
        color: blue;

        & ~ & {
          color: red;
        }
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should shim nested selector with multiple child selectors', () => {
    const css = `
      .parent {
        color: blue;
        background: red;

        .child {
          color: red;
          background: blue;
        }

        .other-child {
          color: green;
          background: yellow;
        }
      }
    `;

    const expected = `
      .parent[contenta] {
        color: blue;
        background: red;

        .child[contenta] {
          color: red;
          background: blue;
        }

        .other-child[contenta] {
          color: green;
          background: yellow;
        }
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should shim nested selector followed by declarations', () => {
    const css = `
      .parent {
        color: blue;

        .child {
          color: red;
          background: blue;
        }

        background: red;

        .other-child {
          color: green;
          background: yellow;
        }

        font-family: sans-serif;
      }
    `;

    const expected = `
      .parent[contenta] {
        color: blue;

        .child[contenta] {
          color: red;
          background: blue;
        }

        background: red;

        .other-child[contenta] {
          color: green;
          background: yellow;
        }

        font-family: sans-serif;
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should shim nested selector with comma-separated child selectors', () => {
    const css = `
      .parent {
        color: blue;
        background: red;

        .child, .other-child {
          color: red;
          background: blue;
        }
      }
    `;

    const expected = `
      .parent[contenta] {
        color: blue;
        background: red;

        .child[contenta], .other-child[contenta] {
          color: red;
          background: blue;
        }
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should shim nested selector targeting a direct descendant', () => {
    const css = `
      .parent {
        color: blue;
        background: red;

        > .child {
          color: red;
          background: blue;
        }
      }
    `;

    const expected = `
      .parent[contenta] {
        color: blue;
        background: red;

        > .child[contenta] {
          color: red;
          background: blue;
        }
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should shim multiple levels of nested selectors', () => {
    const css = `
      .parent {
        color: blue;
        background: red;

        > .child {
          color: red;
          background: blue;

          > .grand-child {
            color: green;
            background: orange;

            .great-grand-child {
              color: orange;
              background: green;
            }
          }
        }
      }
    `;

    const expected = `
      .parent[contenta] {
        color: blue;
        background: red;

        > .child[contenta] {
          color: red;
          background: blue;

          > .grand-child[contenta] {
            color: green;
            background: orange;

            .great-grand-child[contenta] {
              color: orange;
              background: green;
            }
          }
        }
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should shim selectors nested in :host', () => {
    const css = `
      :host(.foo) {
        color: blue;
        background: red;

        .child {
          color: red;
          background: blue;
        }
      }
    `;

    const expected = `
      .foo[a-host] {
        color: blue;
        background: red;

        .child[contenta] {
          color: red;
          background: blue;
        }
      }
    `;

    const result = shim(css, 'contenta', 'a-host');
    expect(result).toEqualCss(expected);
  });

  it('should shim selectors nested in :host-context', () => {
    const css = `
      :host-context(.foo) {
        color: blue;
        background: red;

        .child {
          color: red;
          background: blue;
        }
      }
    `;

    const expected = `
      .foo[a-host], .foo [a-host] {
        color: blue;
        background: red;

        .child[contenta] {
          color: red;
          background: blue;
        }
      }
    `;

    const result = shim(css, 'contenta', 'a-host');
    expect(result).toEqualCss(expected);
  });

  it('should shim a selector with a nested media query', () => {
    const css = `
      .parent {
        color: red;

        @media (width >= 1024px) {
          color: blue;
        }
      }
    `;

    const expected = `
      .parent[contenta] {
        color: red;

        @media (width >= 1024px) {
          color: blue;
        }
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should shim a selector with a nested media query and an ampersand', () => {
    const css = `
      .parent {
        color: red;

        @media (width >= 1024px) {
          &.modifier {
            color: blue;
          }
        }
      }
    `;

    const expected = `
      .parent[contenta] {
        color: red;

        @media (width >= 1024px) {
          &.modifier[contenta] {
            color: blue;
          }
        }
      }
    `;

    const result = shim(css, 'contenta');
    expect(result).toEqualCss(expected);
  });

  it('should disable encapsulation of nested selectors if the parent selector ends with ::ng-deep', () => {
    expect(shim('.foo ::ng-deep { .bar { color: red; } }', 'contenta')).toEqualCss(
      '.foo[contenta] { .bar { color: red; } }',
    );

    expect(shim('.foo ::ng-deep { .bar { .baz { color: red; } } }', 'contenta')).toEqualCss(
      '.foo[contenta] { .bar { .baz { color: red; } } }',
    );

    // TODO: decide how we want to support this.
    // More context: https://github.com/angular/angular/pull/69885/changes#r3708540973
    // expect(shim('.foo ::ng-deep, .baz { .bar { color: red; } }', 'contenta')).toEqualCss(
    //   '.foo[contenta] , .baz[contenta] { .bar { color: red; } }',
    // );

    expect(shim('.foo { .bar ::ng-deep { .baz { color: red; } } }', 'contenta')).toEqualCss(
      '.foo[contenta] { .bar[contenta] { .baz { color: red; } } }',
    );
  });

  it('should disable encapsulation of nested selectors if the parent selector starts with ::ng-deep', () => {
    expect(shim('::ng-deep .foo { .bar { color: red; } }', 'contenta')).toEqualCss(
      '.foo { .bar { color: red; } }',
    );

    expect(shim('::ng-deep .foo { .bar { .baz { color: red; } } }', 'contenta')).toEqualCss(
      '.foo { .bar { .baz { color: red; } } }',
    );

    // TODO: decide how we want to support this.
    // More context: https://github.com/angular/angular/pull/69885/changes#r3708540973
    // expect(shim('::ng-deep .foo, .baz { .bar { color: red; } }', 'contenta')).toEqualCss(
    //   '.foo, .baz[contenta] { .bar { color: red; } }',
    // );

    expect(shim('.foo { ::ng-deep .bar { .baz { color: red; } } }', 'contenta')).toEqualCss(
      '.foo[contenta] { .bar { .baz { color: red; } } }',
    );
  });

  it('should disable encapsulation of nested selectors if the parent selector contains ::ng-deep in the middle of the selector', () => {
    expect(shim('.foo ::ng-deep .bar { .baz { color: red; } }', 'contenta')).toEqualCss(
      '.foo[contenta] .bar { .baz { color: red; } }',
    );
  });

  // Native CSS nesting, as written in plain CSS files. Sass flattens nested rules before the
  // compiler sees them, so Sass-based styles don't exercise these paths.
  describe(':host-context inside nested style rules', () => {
    it('should convert :host-context nested directly in a style rule', () => {
      const css = `
        .card {
          background: white;

          :host-context(.dark-theme) & {
            background: black;
          }
        }
      `;

      const expected = `
        .card[contenta] {
          background: white;

          .dark-theme[a-host] &, .dark-theme [a-host] & {
            background: black;
          }
        }
      `;

      expect(shim(css, 'contenta', 'a-host')).toEqualCss(expected);
    });

    it('should convert :host-context prefixed with & in a rule nested in :host', () => {
      // Inside `:host`, `&` is the host, so `&:host-context()` is what styles the host.
      // `:host-context() &` would only match an instance nested inside another instance.
      const css = `
        :host {
          background: white;

          &:host-context(.dark-theme) {
            background: black;
          }
        }
      `;

      const expected = `
        [a-host] {
          background: white;

          &.dark-theme[a-host], .dark-theme &[a-host] {
            background: black;
          }
        }
      `;

      expect(shim(css, 'contenta', 'a-host')).toEqualCss(expected);
    });

    it('should convert :host-context nested two levels deep', () => {
      const css = `
        .toolbar {
          .icon {
            margin-right: 8px;

            :host-context([dir=rtl]) & {
              margin-right: 0;
              margin-left: 8px;
            }
          }
        }
      `;

      const expected = `
        .toolbar[contenta] {
          .icon[contenta] {
            margin-right: 8px;

            [dir=rtl][a-host] &, [dir=rtl] [a-host] & {
              margin-right: 0;
              margin-left: 8px;
            }
          }
        }
      `;

      expect(shim(css, 'contenta', 'a-host')).toEqualCss(expected);
    });

    it('should convert :host-context in a media query nested in a style rule', () => {
      const css = `
        .sidebar {
          width: 240px;

          @media (max-width: 600px) {
            :host-context(.compact) & {
              width: 56px;
            }
          }
        }
      `;

      const expected = `
        .sidebar[contenta] {
          width: 240px;

          @media (max-width: 600px) {
            .compact[a-host] &, .compact [a-host] & {
              width: 56px;
            }
          }
        }
      `;

      expect(shim(css, 'contenta', 'a-host')).toEqualCss(expected);
    });

    it('should convert :host-context in a nested selector list', () => {
      // If the :host-context selector is left invalid, the browser drops the whole rule,
      // including the valid `&:focus-visible` selector next to it.
      const css = `
        .tab {
          &:focus-visible,
          :host-context(.keyboard-mode) &:focus {
            outline: 2px solid blue;
          }
        }
      `;

      const expected = `
        .tab[contenta] {
          &[contenta]:focus-visible,
          .keyboard-mode[a-host] &[contenta]:focus,
          .keyboard-mode [a-host] &[contenta]:focus {
            outline: 2px solid blue;
          }
        }
      `;

      expect(shim(css, 'contenta', 'a-host')).toEqualCss(expected);
    });
  });
});
