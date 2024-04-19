var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

const testRegionMatcher = {
  regionStartMatcher: /^\s*\/\*\s*#docregion\s+(.*)\s*\*\/\s*$/,
  regionEndMatcher: /^\s*\/\*\s*#enddocregion\s+(.*)\s*\*\/\s*$/,
  plasterMatcher: /^\s*\/\*\s*#docplaster\s+(.*)\s*\*\/\s*$/,
  createPlasterComment: plaster => `/* ${plaster} */`
};

describe('regionParser service', () => {
  var dgeni, injector, regionParser;

  beforeEach(function() {
    dgeni = new Dgeni([testPackage('examples-package', true)]);
    injector = dgeni.configureInjector();
    regionParser = injector.get('regionParser');
    regionParser.regionMatchers = {'test-type': testRegionMatcher};
  });

  it('should return just the contents if there is no region-matcher for the file type', () => {
    const output = regionParser('some contents', 'unknown');
    expect(output).toEqual({contents: 'some contents', regions: {}});
  });

  it('should return just the contents if there is a region-matcher but no regions', () => {
    const output = regionParser('some contents', 'test-type');
    expect(output).toEqual({contents: 'some contents', regions: { '': 'some contents' }});
  });

  it('should remove start region annotations from the contents', () => {
    const output = regionParser(
        t('/* #docregion */', 'abc', '/* #docregion X */', 'def', '/* #docregion Y */', 'ghi'),
        'test-type');
    expect(output.contents).toEqual(t('abc', 'def', 'ghi'));
  });

  it('should remove end region annotations from the contents', () => {
    const output = regionParser(
        t('/* #docregion */', 'abc', '/* #docregion X */', 'def', '/* #enddocregion X */',
          '/* #docregion Y */', 'ghi', '/* #enddocregion Y */', '/* #enddocregion */'),
        'test-type');
    expect(output.contents).toEqual(t('abc', 'def', 'ghi'));
  });

  it('should left align the text of the region', () => {
    const output = regionParser(
      t(
        '/* #docregion X */', '  all', '    indented', '    by', '  two', '  spaces', '/* #enddocregion X */',
        '/* #docregion Y */', '    first', '  line', '  indented', '    more', '  than', '  later', '  lines', '/* #enddocregion Y */',
        '/* #docregion Z */', '  ignore', '  ', '  empty', '', '  lines', '/* #enddocregion Z */'
      ), 'test-type');
    expect(output.regions['X']).toEqual(t('all', '  indented', '  by', 'two', 'spaces'));
    expect(output.regions['Y']).toEqual(t('  first', 'line', 'indented', '  more', 'than', 'later', 'lines'));
    expect(output.regions['Z']).toEqual(t('ignore', '', 'empty', '', 'lines'));
  });

  it('should remove doc plaster annotations from the contents', () => {
    const output =
        regionParser(t('/* #docplaster ... elided ... */', 'abc', 'def', 'ghi'), 'test-type');
    expect(output.contents).toEqual(t('abc', 'def', 'ghi'));
  });

  it('should capture the rest of the contents for a region with no end region annotation', () => {
    const output = regionParser(
        t('/* #docregion */', 'abc', '/* #docregion X */', 'def', '/* #docregion Y */', 'ghi'),
        'test-type');
    expect(output.regions['']).toEqual(t('abc', 'def', 'ghi'));
    expect(output.regions['X']).toEqual(t('def', 'ghi'));
    expect(output.regions['Y']).toEqual(t('ghi'));
  });


  it('should capture the contents for a region up to the end region annotation', () => {
    const output = regionParser(
        t('/* #docregion */', 'abc', '/* #enddocregion */', '/* #docregion X */', 'def',
          '/* #enddocregion X */', '/* #docregion Y */', 'ghi', '/* #enddocregion Y */'),
        'test-type');
    expect(output.regions['']).toEqual(t('abc'));
    expect(output.regions['X']).toEqual(t('def'));
    expect(output.regions['Y']).toEqual(t('ghi'));
  });

  it('should open a region with a null name if there is no region name', () => {
    const output = regionParser(t('/* #docregion */', 'abc', '/* #enddocregion */'), 'test-type');
    expect(output.regions['']).toEqual('abc');
  });

  it('should close the most recently opened region if there is no region name', () => {
    const output = regionParser(
        t('/* #docregion X*/', 'abc', '/* #docregion Y */', 'def', '/* #enddocregion */', 'ghi',
          '/* #enddocregion */'),
        'test-type');
    expect(output.regions['X']).toEqual(t('abc', 'def', 'ghi'));
    expect(output.regions['Y']).toEqual(t('def'));
  });

  it('should handle overlapping regions', () => {
    const output = regionParser(
        t('/* #docregion X*/', 'abc', '/* #docregion Y */', 'def', '/* #enddocregion X */', 'ghi',
          '/* #enddocregion Y */'),
        'test-type');
    expect(output.regions['X']).toEqual(t('abc', 'def'));
    expect(output.regions['Y']).toEqual(t('def', 'ghi'));
  });

  it('should error if we attempt to open an already open region', () => {
    expect(() => regionParser(t('/* #docregion */', 'abc', '/* #docregion */', 'def'), 'test-type'))
        .toThrowError(
            'regionParser: Tried to open a region, named "", that is already open (at line 3).');

    expect(
        () =>
            regionParser(t('/* #docregion X */', 'abc', '/* #docregion X */', 'def'), 'test-type'))
        .toThrowError(
            'regionParser: Tried to open a region, named "X", that is already open (at line 3).');
  });

  it('should error if we attempt to close an already closed region', () => {
    expect(() => regionParser(t('abc', '/* #enddocregion */', 'def'), 'test-type'))
        .toThrowError('regionParser: Tried to close a region when none are open (at line 2).');

    expect(
        () =>
            regionParser(t('/* #docregion */', 'abc', '/* #enddocregion X */', 'def'), 'test-type'))
        .toThrowError(
            'regionParser: Tried to close a region, named "X", that is not open (at line 3).');
  });

  it('should handle whitespace in region names on single annotation', () => {
    const output =
        regionParser(t('/* #docregion A B*/', 'abc', '/* #docregion A C */', 'def'), 'test-type');
    expect(output.regions['A B']).toEqual(t('abc', 'def'));
    expect(output.regions['A C']).toEqual(t('def'));
  });

  it('should join multiple regions with the default plaster string (". . .")', () => {
    const output = regionParser(
        t('/* #docregion */', 'abc', '/* #enddocregion */', 'def', '/* #docregion */', 'ghi',
          '/* #enddocregion */'),
        'test-type');
    expect(output.regions['']).toEqual(t('abc', '/* . . . */', 'ghi'));
  });

  it('should join multiple regions with the current plaster string', () => {
    const output = regionParser(
        t('/* #docregion */', 'abc', '/* #enddocregion */', 'def', '/* #docregion */', 'ghi',
          '/* #enddocregion */', '/* #docplaster ... elided ... */', '/* #docregion A */', 'jkl',
          '/* #enddocregion A */', 'mno', '/* #docregion A */', 'pqr', '/* #enddocregion A */'),
        'test-type');
    expect(output.regions['']).toEqual(t('abc', '/* . . . */', 'ghi'));
    expect(output.regions['A']).toEqual(t('jkl', '/* ... elided ... */', 'pqr'));
  });

  it('should remove the plaster altogether if the current plaster string is ""', () => {
    const output = regionParser(
        t('/* #docregion */', 'abc', '/* #enddocregion */', 'def', '/* #docregion */', 'ghi',
          '/* #enddocregion */', '/* #docplaster */', '/* #docregion A */', 'jkl',
          '/* #enddocregion A */', 'mno', '/* #docregion A */', 'pqr', '/* #enddocregion A */'),
        'test-type');
    expect(output.regions['']).toEqual(t('abc', '/* . . . */', 'ghi'));
    expect(output.regions['A']).toEqual(t('jkl', 'pqr'));
  });

  it('should indent the plaster string to the level of the docregion marker', () => {
    const output = regionParser(
        t(
          '/* #docregion */',
          'abc',
          '/* #enddocregion */',
          '  def',
          '    /* #docregion */',
          '    ghi',
          '    /* #enddocregion */',
          'jkl',
        ),
        'test-type');
    expect(output.regions['']).toEqual(t(
      'abc',
      '    /* . . . */',
      '    ghi'
      ));
  });

  it('should parse multiple region names separated by commas', () => {
    const output = regionParser(
        t('/* #docregion , A, B */', 'abc', '/* #enddocregion B */', '/* #docregion C */', 'xyz',
          '/* #enddocregion A, C */', '123', '/* #enddocregion */'),
        'test-type');
    expect(output.regions['']).toEqual(t('abc', 'xyz', '123'));
    expect(output.regions['A']).toEqual(t('abc', 'xyz'));
    expect(output.regions['B']).toEqual(t('abc'));
    expect(output.regions['C']).toEqual(t('xyz'));
  });
});

function t() {
  return Array.prototype.join.call(arguments, '\n');
}
