const testPackage = require('../../helpers/test-package');
const processorFactory = require('./fixInternalDocumentLinks');
const Dgeni = require('dgeni');

describe('fixInternalDocumentLinks processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-base-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('fixInternalDocumentLinks');
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['convertToJsonProcessor']);
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['inlineTagProcessor']);
  });

  it('should prefix internal hash links with the current doc path', () => {
    const processor = processorFactory();
    const docs = [
      {
        path: 'some/doc',
        renderedContent: `
          <a href="https://google.com#q=angular">Google</a>
          <a href="some/relative/path#some-id">Some Id</a>
          <a href="#some-internal-id">Link to heading</a>
          <a class="important" href="#some-internal-id">Link to heading</a>
          <a href="#some-internal-id" target="_blank">Link to heading</a>
        `
      },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      {
        path: 'some/doc',
        renderedContent: `
          <a href="https://google.com#q=angular">Google</a>
          <a href="some/relative/path#some-id">Some Id</a>
          <a href="some/doc#some-internal-id">Link to heading</a>
          <a class="important" href="some/doc#some-internal-id">Link to heading</a>
          <a href="some/doc#some-internal-id" target="_blank">Link to heading</a>
        `
      },
    ]);
  });
});
