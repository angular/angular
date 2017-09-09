var createTestPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('autoLinkCode post-processor', () => {
  let processor, autoLinkCode, aliasMap;

  beforeEach(() => {
    const testPackage = createTestPackage('angular-base-package');
    const dgeni = new Dgeni([testPackage]);
    const injector = dgeni.configureInjector();
    autoLinkCode = injector.get('autoLinkCode');
    autoLinkCode.docTypes = ['class', 'pipe', 'function', 'const'];
    aliasMap = injector.get('aliasMap');
    processor = injector.get('postProcessHtml');
    processor.docTypes = ['test-doc'];
    processor.plugins = [autoLinkCode];
  });

  it('should insert an anchor into every code item that matches the id of an API doc', () => {
    aliasMap.addDoc({ docType: 'class', id: 'MyClass', aliases: ['MyClass'], path: 'a/b/myclass' });
    const doc = { docType: 'test-doc', renderedContent: '<code>MyClass</code>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<code><a href="a/b/myclass" class="code-anchor">MyClass</a></code>');
  });

  it('should insert an anchor into every code item that matches an alias of an API doc', () => {
    aliasMap.addDoc({ docType: 'class', id: 'MyClass', aliases: ['MyClass', 'foo.MyClass'], path: 'a/b/myclass' });
    const doc = { docType: 'test-doc', renderedContent: '<code>foo.MyClass</code>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<code><a href="a/b/myclass" class="code-anchor">foo.MyClass</a></code>');
  });

  it('should ignore code items that do not match a link to an API doc', () => {
    aliasMap.addDoc({ docType: 'guide', id: 'MyClass', aliases: ['MyClass'], path: 'a/b/myclass' });
    const doc = { docType: 'test-doc', renderedContent: '<code>MyClass</code>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<code>MyClass</code>');
  });

  it('should ignore code items that are already inside a link', () => {
    aliasMap.addDoc({ docType: 'class', id: 'MyClass', aliases: ['MyClass'], path: 'a/b/myclass' });
    const doc = { docType: 'test-doc', renderedContent: '<a href="..."><div><code>MyClass</code></div></a>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<a href="..."><div><code>MyClass</code></div></a>');
  });

  it('should ignore code items match an API doc but are not in the list of acceptable docTypes', () => {
    aliasMap.addDoc({ docType: 'directive', id: 'MyClass', aliases: ['MyClass'], path: 'a/b/myclass' });
    const doc = { docType: 'test-doc', renderedContent: '<code>MyClass</code>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<code>MyClass</code>');
  });

  it('should insert anchors for individual text nodes within a code block', () => {
    aliasMap.addDoc({ docType: 'class', id: 'MyClass', aliases: ['MyClass'], path: 'a/b/myclass' });
    const doc = { docType: 'test-doc', renderedContent: '<code><span>MyClass</span><span>MyClass</span></code>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<code><span><a href="a/b/myclass" class="code-anchor">MyClass</a></span><span><a href="a/b/myclass" class="code-anchor">MyClass</a></span></code>');
  });

  it('should insert anchors for words that match within text nodes in a code block', () => {
    aliasMap.addDoc({ docType: 'class', id: 'MyClass', aliases: ['MyClass'], path: 'a/b/myclass' });
    aliasMap.addDoc({ docType: 'function', id: 'myFunc', aliases: ['myFunc'], path: 'ng/myfunc' });
    aliasMap.addDoc({ docType: 'const', id: 'MY_CONST', aliases: ['MY_CONST'], path: 'ng/my_const' });
    const doc = { docType: 'test-doc', renderedContent: '<code>myFunc() {\n  return new MyClass(MY_CONST);\n}</code>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<code><a href="ng/myfunc" class="code-anchor">myFunc</a>() {\n  return new <a href="a/b/myclass" class="code-anchor">MyClass</a>(<a href="ng/my_const" class="code-anchor">MY_CONST</a>);\n}</code>');
  });

  it('should work with custom elements', () => {
    autoLinkCode.codeElements = ['code-example'];
    aliasMap.addDoc({ docType: 'class', id: 'MyClass', aliases: ['MyClass'], path: 'a/b/myclass' });
    const doc = { docType: 'test-doc', renderedContent: '<code-example>MyClass</code-example>' };
    processor.$process([doc]);
    expect(doc.renderedContent).toEqual('<code-example><a href="a/b/myclass" class="code-anchor">MyClass</a></code-example>');
  });
});
