var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('getExampleRegion', () => {
  var dgeni, injector, getExampleRegion, collectExamples, exampleMap;

  beforeEach(function() {
    dgeni = new Dgeni([testPackage('examples-package', true)]);
    injector = dgeni.configureInjector();
    getExampleRegion = injector.get('getExampleRegion');
    collectExamples = injector.get('collectExamples');
    exampleMap = injector.get('exampleMap');
    collectExamples.exampleFolders = ['examples'];
    collectExamples.registerIgnoredExamples(['filtered/path'], 'some/gitignore');
    exampleMap['examples'] = {
      'test/url': { regions: {
        '': { renderedContent: 'whole file' },
        'region-1': { renderedContent: 'region 1 contents' }
      } }
    };
  });

  it('should contain the whole contents from the example file if no region is specified', () => {
    expect(getExampleRegion({}, 'test/url')).toEqual('whole file');
  });

  it('should contain the region contents from the example file if a region is specified', () => {
    expect(getExampleRegion({}, 'test/url', 'region-1')).toEqual('region 1 contents');
  });

  it('should throw an error if an example doesn\'t exist', () => {
    expect(() => {
      getExampleRegion({}, 'missing/file', 'region-1');
    }).toThrowError('Missing example file... relativePath: "missing/file". - doc\nExample files can be found in the following relative paths: "examples"');
    expect(() => {
      getExampleRegion({}, 'test/url', 'missing-region');
    }).toThrowError('Missing example region... relativePath: "test/url", region: "missing-region". - doc\nRegions available are: "", "region-1"');
  });

  it('should throw an error if an example has been filtered out', () => {
    expect(() => {
      getExampleRegion({}, 'filtered/path', 'any-region');
    }).toThrowError('Ignored example file... relativePath: "filtered/path" - doc\n' +
                    'This example file exists but has been ignored by a rule, in "some/gitignore".');
  });

  it('should mark the example as having been "used"', () => {
    const doc1 = {};
    const doc2 = {};
    expect(exampleMap['examples']['test/url'].regions['region-1'].usedInDoc).toBeUndefined();
    getExampleRegion(doc1, 'test/url', 'region-1');
    expect(exampleMap['examples']['test/url'].regions['region-1'].usedInDoc).toBe(doc1);
    expect(exampleMap['examples']['test/url'].regions[''].usedInDoc).toBeUndefined();
    getExampleRegion(doc2, 'test/url');
    expect(exampleMap['examples']['test/url'].regions[''].usedInDoc).toBe(doc2);
  });
});
