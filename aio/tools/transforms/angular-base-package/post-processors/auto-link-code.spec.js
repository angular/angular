var createTestPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('autoLinkCode post-processor', () => {
  let processor, autoLinkCode, aliasMap;

  beforeEach(() => {
    const testPackage = createTestPackage('angular-base-package');
    const dgeni = new Dgeni([testPackage]);
    const injector = dgeni.configureInjector();
    autoLinkCode = injector.get('autoLinkCode');
    autoLinkCode.docTypes = ['class', 'pipe'];
    aliasMap = injector.get('aliasMap');
    processor = injector.get('postProcessHtml');
    processor.docTypes = ['test-doc'];
    processor.plugins = [autoLinkCode];
  });

  it('should insert an anchor into every code item that matches the id of an API doc', () => {
    aliasMap.addDoc({ docType: 'class', id: 'MyClass', aliases: ['MyClass'], path: 'a/b/myclass' });
    const doc = { docType: 'test-doc', renderedContent: '<code>MyClass</code>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<code><a href="a/b/myclass">MyClass</a></code>');
  });

  it('should insert an anchor into every code item that matches an alias of an API doc', () => {
    aliasMap.addDoc({ docType: 'class', id: 'MyClass', aliases: ['MyClass', 'foo.MyClass'], path: 'a/b/myclass' });
    const doc = { docType: 'test-doc', renderedContent: '<code>foo.MyClass</code>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<code><a href="a/b/myclass">foo.MyClass</a></code>');
  });

  it('should ignore code items that do not match a link to an API doc', () => {
    aliasMap.addDoc({ docType: 'guide', id: 'MyClass', aliases: ['MyClass'], path: 'a/b/myclass' });
    const doc = { docType: 'test-doc', renderedContent: '<code>MyClass</code>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<code>MyClass</code>');
  });
});
