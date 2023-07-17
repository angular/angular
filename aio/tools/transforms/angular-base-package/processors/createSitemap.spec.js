var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('createSitemap processor', () => {
  var injector, processor;

  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('angular-base-package')]);

    injector = dgeni.configureInjector();
    processor = injector.get('createSitemap');
  });

  it('should be available from the injector', () => {
    expect(processor).toBeDefined();
  });

  it('should run after "paths-computed"', () => {
    expect(processor.$runAfter).toEqual(['paths-computed']);
  });

  it('should run before "rendering-docs"', () => {
    expect(processor.$runBefore).toEqual(['rendering-docs']);
  });

  describe('$process', () => {
    describe('should add a sitemap doc', () => {

      it('with the correct id, path, outputPath and template properties', () => {
        const docs = [];
        processor.$process(docs);
        expect(docs.pop()).toEqual(jasmine.objectContaining({
          id: 'sitemap.xml',
          path: 'sitemap.xml',
          outputPath: '../sitemap.xml',
          template: 'sitemap.template.xml'
        }));
      });

      it('with an array of urls for each doc that has an outputPath', () => {
        const docs = [
          { path: 'abc', outputPath: 'abc' },
          { path: 'cde' },
          { path: 'fgh', outputPath: 'fgh' },
        ];
        processor.$process(docs);
        expect(docs.pop().urls).toEqual(['abc', 'fgh']);
      });

      it('ignoring excluded doc types', () => {
        const docs = [
          { path: 'abc', outputPath: 'abc', docType: 'good' },
          { path: 'cde', outputPath: 'cde', docType: 'bad' },
          { path: 'fgh', outputPath: 'fgh', docType: 'good' },
        ];
        processor.ignoredDocTypes = ['bad'];
        processor.$process(docs);
        expect(docs.pop().urls).toEqual(['abc', 'fgh']);
      });

      it('ignoring excluded paths', () => {
        const docs = [
          { path: 'abc', outputPath: 'abc' },
          { path: 'cde', outputPath: 'cde' },
          { path: 'fgh', outputPath: 'fgh' },
        ];
        processor.ignoredPaths = ['cde'];
        processor.$process(docs);
        expect(docs.pop().urls).toEqual(['abc', 'fgh']);
      });

      it('mapping the home page\'s path to `/`', () => {
        const docs = [
          { path: 'abc', outputPath: 'abc' },
          { path: 'index', outputPath: 'index.json' },
          { path: 'fgh', outputPath: 'fgh' },
        ];
        processor.$process(docs);
        expect(docs.pop().urls).toEqual(['abc', '', 'fgh']);
      });
    });
  });
});
