var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('convertToJson processor', () => {
  var dgeni, injector, processor, log;

  beforeAll(function() {
    dgeni = new Dgeni([testPackage('angular-base-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('convertToJsonProcessor');
    log = injector.get('log');
    processor.docTypes = ['test-doc'];
  });

  it('should be part of the dgeni package', () => {
    expect(processor).toBeDefined();
  });

  it('should convert the renderedContent to JSON', () => {
    const docs = [{
      docType: 'test-doc',
      title: 'The Title',
      name: 'The Name',
      path: 'test/doc',
      renderedContent: 'Some Content'
    }];
    processor.$process(docs);
    expect(JSON.parse(docs[0].renderedContent).id).toEqual('test/doc');
    expect(JSON.parse(docs[0].renderedContent).title).toEqual('The Title');
    expect(JSON.parse(docs[0].renderedContent).contents).toEqual('Some Content');
  });

  it('should get the title from name if no title is specified', () => {
    const docs = [{ docType: 'test-doc', name: 'The Name' }];
    processor.$process(docs);
    expect(JSON.parse(docs[0].renderedContent).title).toEqual('The Name');
  });

  it('should accept an empty title', () => {
    const docs = [{ docType: 'test-doc', title: '' }];
    processor.$process(docs);
    expect(JSON.parse(docs[0].renderedContent).title).toEqual('');
    expect(log.warn).not.toHaveBeenCalled();
  });

  it('should accept an empty name if title is not provided', () => {
    const docs = [{ docType: 'test-doc', name: '' }];
    processor.$process(docs);
    expect(JSON.parse(docs[0].renderedContent).title).toEqual('');
    expect(log.warn).not.toHaveBeenCalled();
  });

  it('should get the title from the title extracted from the h1 in the rendered content if no title property is specified', () => {
    const docs = [{
      docType: 'test-doc',
      vFile: { title: 'Some title' },
      renderedContent: '<div><h1 class="title">Some title</h1><article><h1>Article 1</h1></article></div>'
    }];
    processor.$process(docs);
    expect(JSON.parse(docs[0].renderedContent).contents).toEqual('<div><h1 class="title">Some title</h1><article><h1>Article 1</h1></article></div>');
    expect(JSON.parse(docs[0].renderedContent).title).toEqual('Some title');
  });

  it('should set missing titles to empty', () => {
    const docs = [{ docType: 'test-doc' }];
    processor.$process(docs);
    expect(JSON.parse(docs[0].renderedContent).title).toBe('');
  });

  it('should log a warning', () => {
    const docs = [{ docType: 'test-doc' }];
    processor.$process(docs);
    expect(log.warn).toHaveBeenCalledWith('Title property expected - doc (test-doc) ');
  });
});