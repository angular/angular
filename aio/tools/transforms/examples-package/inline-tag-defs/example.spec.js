var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('example inline-tag-def', function() {
  let tag;

  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('examples-package', true)]);
    const injector = dgeni.configureInjector();
    tag = injector.get('exampleInlineTagDef');
  });

  it('should be available as a service', () => {
    expect(tag).toBeDefined();
    expect(tag.name).toEqual('example');
  });

  describe('handler', () => {
    let handler;

    beforeEach(() => handler = tag.handler);

    it('should throw if no path is specified add the specified path', () => {
      expect(() => handler({}, 'example', '')).toThrowError(
        'Missing required "path" on @example inline tag "{@example }".\n' +
        'Usage: {@example some/path [some-region [Some header [linenums="true|false"]]]} - doc');

      const tagDescription = 'region=\'region-1\' header="Some Header" linenums="true"';
      expect(() => handler({}, 'example', tagDescription)).toThrowError(
        `Missing required "path" on @example inline tag "{@example ${tagDescription}}".\n` +
        'Usage: {@example some/path [some-region [Some header [linenums="true|false"]]]} - doc');
    });

    it('should add a region if specified', () => {
      expect(handler({}, 'example', 'test/url region-1')).toEqual(
        '<code-example path="test/url" region="region-1"></code-example>');

      expect(handler({}, 'example', 'test/url -region=\'region-1\'')).toEqual(
        '<code-example path="test/url" region="region-1"></code-example>');

      expect(handler({}, 'example', 'test/url region="region-1"')).toEqual(
        '<code-example path="test/url" region="region-1"></code-example>');
    });

    it('should add no region if an empty (\'\'/"") region is specified', () => {
      expect(handler({}, 'example', 'test/url \'\'')).toEqual(
        '<code-example path="test/url"></code-example>');

      expect(handler({}, 'example', 'test/url ""')).toEqual(
        '<code-example path="test/url"></code-example>');

      expect(handler({}, 'example', 'test/url \'\' Some Header')).toEqual(
        '<code-example path="test/url" header="Some Header"></code-example>');

      expect(handler({}, 'example', 'test/url "" Some Header')).toEqual(
        '<code-example path="test/url" header="Some Header"></code-example>');
    });

    it('should add a header if specified', () => {
      expect(handler({}, 'example', 'test/url region-1 \'Some Header\'')).toEqual(
        '<code-example path="test/url" region="region-1" header="Some Header"></code-example>');

      expect(handler({}, 'example', 'test/url region-1 Some Header')).toEqual(
        '<code-example path="test/url" region="region-1" header="Some Header"></code-example>');

      expect(handler({}, 'example', 'test/url header="Some Header"')).toEqual(
        '<code-example path="test/url" header="Some Header"></code-example>');
    });

    it('should add a linenum attribute if specified', () => {
      expect(handler({}, 'example', 'test/url --linenums=\'false\'')).toEqual(
        '<code-example path="test/url" linenums="false"></code-example>');

      expect(handler({}, 'example', 'test/url -linenums=\'true\'')).toEqual(
        '<code-example path="test/url" linenums="true"></code-example>');

      expect(handler({}, 'example', 'test/url linenums=\'15\'')).toEqual(
        '<code-example path="test/url" linenums="15"></code-example>');
    });

    it('should preserve the title if specified', () => {
      expect(handler({}, 'example', 'test/url title="Some Title"')).toEqual(
        '<code-example path="test/url" title="Some Title"></code-example>');
    });
  });
});

