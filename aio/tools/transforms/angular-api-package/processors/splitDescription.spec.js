const testPackage = require('../../helpers/test-package');
const processorFactory = require('./splitDescription');
const Dgeni = require('dgeni');

describe('splitDescription processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('splitDescription');
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['processing-docs']);
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['tags-extracted', 'migrateLegacyJSDocTags']);
  });

  it('should split the `description` property into the first paragraph and other paragraphs', () => {
    const processor = processorFactory();
    processor.docTypes = ['test'];
    const docs = [
      { docType: 'test' },
      { docType: 'test', description: '' },
      { docType: 'test', description: 'abc' },
      { docType: 'test', description: 'abc\n' },
      { docType: 'test', description: 'abc\n\n' },
      { docType: 'test', description: 'abc\ncde' },
      { docType: 'test', description: 'abc\ncde\n' },
      { docType: 'test', description: 'abc\n\ncde' },
      { docType: 'test', description: 'abc\n  \ncde' },
      { docType: 'test', description: 'abc\n\n\ncde' },
      { docType: 'test', description: 'abc\n\ncde\nfgh' },
      { docType: 'test', description: 'abc\n\ncde\n\nfgh' },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      { docType: 'test' },
      { docType: 'test', shortDescription: '', description: '' },
      { docType: 'test', shortDescription: 'abc', description: '' },
      { docType: 'test', shortDescription: 'abc', description: '' },
      { docType: 'test', shortDescription: 'abc', description: '' },
      { docType: 'test', shortDescription: 'abc\ncde', description: '' },
      { docType: 'test', shortDescription: 'abc\ncde', description: '' },
      { docType: 'test', shortDescription: 'abc', description: 'cde' },
      { docType: 'test', shortDescription: 'abc', description: 'cde' },
      { docType: 'test', shortDescription: 'abc', description: 'cde' },
      { docType: 'test', shortDescription: 'abc', description: 'cde\nfgh' },
      { docType: 'test', shortDescription: 'abc', description: 'cde\n\nfgh' },
    ]);
  });

  it('should ignore docs that do not match the specified doc types', () => {
    const processor = processorFactory();
    processor.docTypes = ['test'];
    const docs = [
      { docType: 'test', description: 'abc\n\ncde' },
      { docType: 'other', description: 'abc\n\ncde' }
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      { docType: 'test', shortDescription: 'abc', description: 'cde' },
      { docType: 'other', description: 'abc\n\ncde' }
    ]);
  });
});