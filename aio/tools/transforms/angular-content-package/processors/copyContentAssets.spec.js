const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');
const factory = require('./copyContentAssets');

describe('extractDecoratedClasses processor', function() {
  let dgeni, injector, processor;

  beforeEach(function() {
    dgeni = new Dgeni([testPackage('angular-content-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('copyContentAssetsProcessor');
  });

  it('should exist', () => {
    expect(processor).toBeDefined();
  });

  it('should call copyFolder with each mapping', () => {
    const mockCopyFolder = jasmine.createSpy();
    processor = factory(mockCopyFolder);
    processor.assetMappings.push({ from: 'a/b/c', to: 'x/y/z' });
    processor.assetMappings.push({ from: '1/2/3', to: '4/5/6' });
    processor.$process();
    expect(mockCopyFolder).toHaveBeenCalledWith('a/b/c', 'x/y/z');
    expect(mockCopyFolder).toHaveBeenCalledWith('1/2/3', '4/5/6');
  });
});
