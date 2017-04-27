const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('postProcessHtml', function() {
  let dgeni, injector, processor;

  beforeEach(function() {
    dgeni = new Dgeni([testPackage('post-process-package', true)]);
    injector = dgeni.configureInjector();
    processor = injector.get('postProcessHtml');
    processor.docTypes = ['a', 'b'];
  });

  it('should be available from the injector', () => {
    expect(processor).toBeDefined();
  });

  it('should only process docs that match the specified docTypes', () => {
    const elements = [];
    const captureFirstElement = ast => {
      elements.push(ast.children[0].tagName);
    };
    processor.plugins = [() => captureFirstElement];

    const docs = [
      { docType: 'a', renderedContent: '<a></a>' },
      { docType: 'b', renderedContent: '<b></b>' },
      { docType: 'c', renderedContent: '<c></c>' },
      { docType: 'd', renderedContent: '<d></d>' },
    ];
    processor.$process(docs);
    expect(elements).toEqual(['a', 'b']);
  });

  it('should run all the plugins on each doc', () => {
    const capitalizeFirstElement = ast => {
      ast.children[0].tagName = ast.children[0].tagName.toUpperCase();
    };
    const addOneToFirstElement = ast => {
      ast.children[0].tagName = ast.children[0].tagName + '1';
    };
    const elements = [];
    const captureFirstElement = ast => {
      elements.push(ast.children[0].tagName);
    };

    const docs = [
      { docType: 'a', renderedContent: '<a></a>' },
      { docType: 'b', renderedContent: '<b></b>' },
      { docType: 'c', renderedContent: '<c></c>' },
      { docType: 'd', renderedContent: '<d></d>' },
    ];

    processor.plugins = [
      () => capitalizeFirstElement,
      () => addOneToFirstElement,
      () => captureFirstElement
    ];
    processor.$process(docs);
    expect(elements).toEqual(['A1', 'B1']);
  });
});
