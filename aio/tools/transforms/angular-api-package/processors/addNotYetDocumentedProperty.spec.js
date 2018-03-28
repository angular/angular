const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('addNotYetDocumentedProperty', function() {
  let processor;

  beforeEach(function() {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    processor = injector.get('addNotYetDocumentedProperty');
    processor.docTypes = ['test'];
    processor.properties = ['description', 'name'];
  });

  it('should run at the right time', () => {
    expect(processor.$runAfter).toEqual(['tags-extracted']);
    expect(processor.$runBefore).toEqual(['processing-docs', 'splitDescription']);
  });

  it('should mark docs with no `description` property as "not yet documented"', () => {
    const docs = [
      {id: 'a', docType: 'test', description: 'some content' },
      {id: 'b', docType: 'test', description: '' },
      {id: 'c', docType: 'test' },
    ];

    processor.$process(docs);

    expect(docs[0].notYetDocumented).toBeFalsy();
    expect(docs[1].notYetDocumented).toBeTruthy();
    expect(docs[2].notYetDocumented).toBeTruthy();
  });

  it('should ignore docs that do not match the specified doc types', () => {
    const docs = [
      {id: 'a', docType: 'other', description: '' },
      {id: 'b', docType: 'other', shortDescription: '' },
      {id: 'c', docType: 'other' },
    ];

    processor.$process(docs);
    expect(docs[0].notYetDocumented).toBeFalsy();
    expect(docs[1].notYetDocumented).toBeFalsy();
    expect(docs[2].notYetDocumented).toBeFalsy();
  });


  it('should not mark documents explicitly tagged as `@noDescription`', function() {
    const docs = [
      {id: 'a', docType: 'other', description: '', noDescription: true },
      {id: 'b', docType: 'other', shortDescription: '', noDescription: true },
      {id: 'c', docType: 'other', noDescription: true },
    ];

    processor.$process(docs);
    expect(docs[0].notYetDocumented).toBeFalsy();
    expect(docs[1].notYetDocumented).toBeFalsy();
    expect(docs[2].notYetDocumented).toBeFalsy();
  });
});
