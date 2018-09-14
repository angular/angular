const testPackage = require('../../helpers/test-package');
const processorFactory = require('./processCliContainerDoc');
const Dgeni = require('dgeni');

describe('processCliContainerDoc processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('cli-docs-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('processCliContainerDoc');
    expect(processor.$process).toBeDefined();
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['extra-docs-added']);
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['rendering-docs']);
  });
});
