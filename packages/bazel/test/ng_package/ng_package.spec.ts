import * as shx from 'shelljs';
import * as path from 'path';

const corePackagePath = path.join(process.env['RUNFILES'], 'angular', 'packages', 'core', 'package');
shx.cd(corePackagePath);

/**
 * Utility functions that allows me to create regular expressions for string containing paths as
 *   r`/some/long/path` rather than as /\/some\/long\/path/ or RegExp('/some/long/path')
 */
function r(templateStringArray: TemplateStringsArray) {
  return new RegExp(templateStringArray.join(''));
}

/**
 * Utility functions that allows me to create fs paths
 *   p`${foo}/some/${{bar}}/path` rather than path.join(foo, 'some',
 */
function p(templateStringArray: TemplateStringsArray) {
  const segments = [];
  for (const entry of templateStringArray) {
    segments.push(...entry.split("/").filter(s => s != ''))
  }
  return path.join(...segments);
}


describe("ng_package", () => {

  describe("misc root files", () => {

    describe("README.md", () => {

      it("should have a README.md file with basic info", () => {
        expect(shx.cat('README.md')).toMatch(r`Angular`);
        expect(shx.cat('README.md')).toMatch(r`https://github.com/angular/angular`);
      });
    });
  });


  describe("primary entry-point", () => {

    describe("package.json", () => {

      const packageJson = 'package.json';

      it("should have a package.json file", () => {
        expect(shx.grep('"name":', packageJson)).toMatch(r`@angular/core`);
      });


      it("should contain correct version number with the PLACEHOLDER string replaced", () => {
        expect(shx.grep('"version":', packageJson)).toMatch(/\d+\.\d+\.\d+(?!-PLACEHOLDER)/);
      });

      it("should contain module resolution mappings", () => {
        const packageJson = 'package.json';
        expect(shx.grep('"main":', packageJson)).toMatch(r`./bundles/core.umd.js`);
        expect(shx.grep('"module":', packageJson)).toMatch(r`./esm5/core.js`);
        expect(shx.grep('"es2015":', packageJson)).toMatch(r`./esm2015/core.js`);
        expect(shx.grep('"typings":', packageJson)).toMatch(r`./core.d.ts`);
      });
    });


    describe("typescript support", () => {
      it("should have an index.d.ts file", () => {
        expect(shx.cat('index.d.ts')).toMatch(r`export *`);
      });
    });
  });

  describe("secondary entry-point", () => {
    describe("package.json", () => {

      const packageJson = p`testing/package.json`;

      it("should have a package.json file", () => {
        expect(shx.grep('"name":', packageJson)).toMatch(r`@angular/core/testing`);
      });

      // TODO(i): generate package.json for secondary-entry point
      it("should have its module resolution mappings defined in the nested package.json", () => {
        const packageJson = p`testing/package.json`;
        expect(shx.grep('"main":', packageJson)).toMatch(r`./bundles/core.umd.js`);
        expect(shx.grep('"module":', packageJson)).toMatch(r`./esm5/core.js`);
        expect(shx.grep('"es2015":', packageJson)).toMatch(r`./esm2015/core.js`);
        expect(shx.grep('"typings":', packageJson)).toMatch(r`./core.d.ts`);
      });
    });
  });
});