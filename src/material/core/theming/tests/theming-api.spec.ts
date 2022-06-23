import {parse, Root, Rule} from 'postcss';
import {compileString} from 'sass';
import {runfiles} from '@bazel/runfiles';
import * as path from 'path';

import {compareNodes} from '../../../../../tools/postcss/compare-nodes';
import {createLocalAngularPackageImporter} from '../../../../../tools/sass/local-sass-importer';
import {pathToFileURL} from 'url';

// Note: For Windows compatibility, we need to resolve the directory paths through runfiles
// which are guaranteed to reside in the source tree.
const testDir = path.join(runfiles.resolvePackageRelative('../_all-theme.scss'), '../tests');
const packagesDir = path.join(runfiles.resolveWorkspaceRelative('src/cdk/_index.scss'), '../..');

const localPackageSassImporter = createLocalAngularPackageImporter(packagesDir);

const mdcSassImporter = {
  findFileUrl: (url: string) => {
    if (url.toString().startsWith('@material')) {
      return pathToFileURL(path.join(runfiles.resolveWorkspaceRelative('./node_modules'), url));
    }
    return null;
  },
};

describe('theming api', () => {
  /** Map of known selectors for density styles and their corresponding AST rule. */
  let knownDensitySelectors: Map<string, Rule>;

  // Before all tests, we collect all nodes specific to density styles. We can then
  // use this check how density styles are generated. i.e. if they are duplicated
  // for legacy themes, or if they are properly scoped to a given selector.
  beforeAll(() => {
    knownDensitySelectors = new Map();
    parse(transpile(`@include angular-material-density(0);`)).each(node => {
      if (node.type === 'rule') {
        node.selectors.forEach(s => knownDensitySelectors.set(s, node));
      }
    });
  });

  it('should warn if color styles are duplicated', () => {
    spyOn(process.stderr, 'write');

    transpile(`
      $theme: mat-light-theme((
        color: (
          primary: $mat-red,
          accent: $mat-red,
        )
      ));

      @include angular-material-theme($theme);

      .dark-theme {
        @include angular-material-theme($theme);
      }
    `);

    expectWarning(/The same color styles are generated multiple times/);
  });

  it('should not warn if color styles and density are not duplicated', () => {
    const parsed = parse(
      transpile(`
      $theme: mat-light-theme((
        color: (
          primary: $mat-red,
          accent: $mat-red,
        )
      ));
      $theme2: mat-light-theme((
        color: (
          primary: $mat-red,
          accent: $mat-blue,
        )
      ));

      @include angular-material-theme($theme);

      .dark-theme {
        @include angular-material-color($theme2);
      }
    `),
    );

    expect(hasDensityStyles(parsed, null)).toBe('all');
    expect(hasDensityStyles(parsed, '.dark-theme')).toBe('none');
    expectNoWarning(/The same color styles are generated multiple times/);
  });

  it('should warn if default density styles are duplicated', () => {
    spyOn(process.stderr, 'write');

    const parsed = parse(
      transpile(`
      @include angular-material-theme((color: null));

      .dark-theme {
        @include angular-material-theme((color: null));
      }
    `),
    );

    expect(hasDensityStyles(parsed, null)).toBe('all');
    expect(hasDensityStyles(parsed, '.dark-theme')).toBe('all');
    expectWarning(/The same density styles are generated multiple times/);
  });

  it('should warn if density styles are duplicated', () => {
    spyOn(process.stderr, 'write');

    transpile(`
      @include angular-material-theme((density: -1));

      .dark-theme {
        @include angular-material-theme((density: -1));
      }
    `);

    expectWarning(/The same density styles are generated multiple times/);
  });

  it('should not warn if density styles are not duplicated', () => {
    spyOn(process.stderr, 'write');

    transpile(`
      @include angular-material-theme((density: -1));

      .dark-theme {
        @include angular-material-theme((density: -2));
      }
    `);

    expect(process.stderr.write).toHaveBeenCalledTimes(0);
  });

  it('should warn if typography styles are duplicated', () => {
    spyOn(process.stderr, 'write');

    transpile(`
      $theme: (typography: mat-typography-config(), density: null);
      @include angular-material-theme($theme);

      .dark-theme {
        @include angular-material-theme($theme);
      }
    `);

    expectWarning(/The same typography styles are generated multiple times/);
  });

  it('should not warn if typography styles are not duplicated', () => {
    spyOn(process.stderr, 'write');

    transpile(`
      @include angular-material-theme((
        typography: mat-typography-config(),
        density: null,
      ));

      .dark-theme {
        @include angular-material-theme((
          typography: mat-typography-config($font-family: "sans-serif"),
          density: null,
        ));
      }
    `);

    expect(process.stderr.write).toHaveBeenCalledTimes(0);
  });

  describe('legacy API', () => {
    it('should warn if color styles are duplicated', () => {
      spyOn(process.stderr, 'write');

      transpile(`
        $theme: mat-light-theme($mat-red, $mat-blue);
        @include angular-material-theme($theme);
        .dark-theme {
          @include angular-material-theme($theme);
        }
      `);

      expectWarning(/The same color styles are generated multiple times/);
    });

    it('should only generate default density once', () => {
      const parsed = parse(
        transpile(`
        $light-theme: mat-light-theme($mat-red, $mat-blue);
        $dark-theme: mat-dark-theme($mat-red, $mat-blue);
        $third-theme: mat-dark-theme($mat-grey, $mat-blue);

        @include angular-material-theme($light-theme);

        .dark-theme {
          @include angular-material-theme($dark-theme);
        }

        .third-theme {
          @include angular-material-theme($third-theme);
        }
      `),
      );

      expect(hasDensityStyles(parsed, null)).toBe('all');
      expect(hasDensityStyles(parsed, '.dark-theme')).toBe('none');
      expect(hasDensityStyles(parsed, '.third-theme')).toBe('none');
    });

    it('should always generate default density at root', () => {
      const parsed = parse(
        transpile(`
        $light-theme: mat-light-theme($mat-red, $mat-blue);

        .my-app-theme {
          @include angular-material-theme($light-theme);
        }
      `),
      );

      expect(hasDensityStyles(parsed, null)).toBe('all');
      expect(hasDensityStyles(parsed, '.my-app-theme')).toBe('none');
    });

    it('not warn if default density would be generated multiple times', () => {
      transpile(`
        $light-theme: mat-light-theme($mat-red, $mat-blue);
        $dark-theme: mat-dark-theme($mat-red, $mat-blue);

        @include angular-material-theme($light-theme);
        .dark-theme {
          @include angular-material-theme($dark-theme);
        }
      `);

      expectNoWarning(/The same density styles are generated multiple times/);
    });

    it('should be possible to modify color configuration directly', () => {
      const result = transpile(`
        $theme: mat-light-theme($mat-red, $mat-blue);

        // Updates the "icon" foreground color to "canary".
        $theme: map-merge($theme,
          (foreground: map-merge(map-get($theme, foreground), (icon: "canary"))));

        @include angular-material-theme($theme);
      `);

      expect(result).toContain(': "canary"');
    });

    it('should be possible to specify palettes by keyword', () => {
      transpile(`
        $light-theme: mat-light-theme(
          $primary: $mat-red,
          $accent: $mat-blue,
          $warn: $mat-red,
        );
        $dark-theme: mat-dark-theme(
          $primary: $mat-red,
          $accent: $mat-blue,
          $warn: $mat-red,
        );
      `);
    });
  });

  /**
   * Checks whether the given parsed stylesheet contains density styles scoped to
   * a given selector. If the selector is `null`, then density is expected to be
   * generated at top-level.
   */
  function hasDensityStyles(parsed: Root, baseSelector: string | null): 'all' | 'partial' | 'none' {
    expect(parsed.nodes).withContext('Expected CSS to be not empty.').toBeDefined();
    expect(knownDensitySelectors.size).not.toBe(0);
    const missingDensitySelectors = new Set(knownDensitySelectors.keys());
    const baseSelectorRegex = new RegExp(`^${baseSelector} `, 'g');

    // Go through all rules in the stylesheet and check if they match with any
    // of the density style selectors. If so, we remove it from the copied set
    // of density selectors. If the set is empty at the end, we know that density
    // styles have been generated as expected.
    parsed.nodes!.forEach(node => {
      if (node.type !== 'rule') {
        return;
      }
      node.selectors.forEach(selector => {
        // Only check selectors that match the specified base selector.
        if (baseSelector && !baseSelectorRegex.test(selector)) {
          return;
        }
        selector = selector.replace(baseSelectorRegex, '');
        const matchingRule = knownDensitySelectors.get(selector);
        if (matchingRule && compareNodes(node, matchingRule)) {
          missingDensitySelectors.delete(selector);
        }
      });
    });

    // If there are no unmatched density selectors, then it's confirmed that
    // all density styles have been generated (scoped to the given selector).
    if (missingDensitySelectors.size === 0) {
      return 'all';
    }
    // If no density selector has been matched at all, then no density
    // styles have been generated.
    if (missingDensitySelectors.size === knownDensitySelectors.size) {
      return 'none';
    }
    return 'partial';
  }

  /** Transpiles given Sass content into CSS. */
  function transpile(content: string) {
    return compileString(
      `
        @import '../_all-theme.scss';
        @import '../../color/_all-color.scss';
        @import '../../density/private/_all-density.scss';
        @import '../../typography/_all-typography.scss';

        ${content}
      `,
      {
        loadPaths: [testDir],
        importers: [localPackageSassImporter, mdcSassImporter],
      },
    ).css.toString();
  }

  /** Expects the given warning to be reported in Sass. */
  function expectWarning(message: RegExp) {
    expect(getMatchingWarning(message))
      .withContext('Expected warning to be printed.')
      .toBeDefined();
  }

  /** Expects the given warning not to be reported in Sass. */
  function expectNoWarning(message: RegExp) {
    expect(getMatchingWarning(message))
      .withContext('Expected no warning to be printed.')
      .toBeUndefined();
  }

  /**
   * Gets first instance of the given warning reported in Sass. Dart sass directly writes
   * to the `process.stderr` stream, so we spy on the `stderr.write` method. We
   * cannot expect a specific amount of writes as Sass calls `stderr.write` multiple
   * times for a warning (e.g. spacing and stack trace)
   */
  function getMatchingWarning(message: RegExp) {
    const writeSpy = process.stderr.write as jasmine.Spy;
    return (writeSpy.calls?.all() ?? []).find(
      (s: jasmine.CallInfo<typeof process.stderr.write>) =>
        typeof s.args[0] === 'string' && message.test(s.args[0]),
    );
  }
});
