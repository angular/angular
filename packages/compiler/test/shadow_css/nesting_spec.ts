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
});
