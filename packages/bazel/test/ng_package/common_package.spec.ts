import * as shx from 'shelljs';
import * as path from 'path';
shx.cd(path.join(process.env['TEST_SRCDIR'], 'angular', 'packages', 'common', 'npm_package'));

describe("ng_package", () => {
  it("should have right bundle files", () => {
    expect(shx.ls("-R", "bundles").stdout.split('\n').filter(n => !!n).sort()).toEqual([
      'common-http-testing.umd.js',
      'common-http-testing.umd.js.map',
      'common-http-testing.umd.min.js',
      'common-http-testing.umd.min.js.map',
      'common-http.umd.js',
      'common-http.umd.js.map',
      'common-http.umd.min.js',
      'common-http.umd.min.js.map',
      'common-testing.umd.js',
      'common-testing.umd.js.map',
      'common-testing.umd.min.js',
      'common-testing.umd.min.js.map',
      'common.umd.js',
      'common.umd.js.map',
      'common.umd.min.js',
      'common.umd.min.js.map',
    ]);
  });
  it("should have right fesm files", () => {
    const expected = [
      'common.js',
      'common.js.map',
      'http',
      'http.js',
      'http.js.map',
      'http/testing.js',
      'http/testing.js.map',
      'testing.js',
      'testing.js.map',
    ];
    expect(shx.ls("-R", "esm5").stdout.split('\n').filter(n => !!n).sort()).toEqual(expected);
    expect(shx.ls("-R", "esm2015").stdout.split('\n').filter(n => !!n).sort()).toEqual(expected);
  });
});
