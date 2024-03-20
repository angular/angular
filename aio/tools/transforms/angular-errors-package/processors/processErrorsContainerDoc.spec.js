const testPackage = require('../../helpers/test-package');
const processorFactory = require('./processErrorsContainerDoc');
const Dgeni = require('dgeni');

describe('processErrorsContainerDoc processor', () => {
  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-errors-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('processErrorsContainerDoc');
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
