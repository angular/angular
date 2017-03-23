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
});
