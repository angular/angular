var testPackageFactory = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('link inline-tag-def', function() {
  let injector, tag, getLinkInfo, log;

  beforeEach(() => {
    getLinkInfo = jasmine.createSpy('getLinkInfo');
    const testPackage = testPackageFactory('links-package', true)
      .factory('getLinkInfo', function() { return getLinkInfo; });
    getLinkInfo.disambiguators = [];

    const dgeni = new Dgeni([testPackage]);
    injector = dgeni.configureInjector();
    tag = injector.get('linkInlineTagDef');
    log = injector.get('log');
  });

  it('should be available as a service', () => {
    expect(tag).toBeDefined();
    expect(tag.name).toEqual('link');
  });

  it('should call getLinkInfo', () => {
    const doc = {};
    const tagName = 'link';
    const tagDescription = 'doc-id link text';
    getLinkInfo.and.returnValue({ url: 'url/to/doc', title: 'link text', valid: true });
    tag.handler(doc, tagName, tagDescription);
    expect(getLinkInfo).toHaveBeenCalledWith('doc-id', 'link text', doc);
  });

  it('should return an HTML anchor tag', () => {
    const doc = {};
    const tagName = 'link';
    const tagDescription = 'doc-id link text';
    getLinkInfo.and.returnValue({ url: 'url/to/doc', title: 'link text', valid: true });
    const result = tag.handler(doc, tagName, tagDescription);
    expect(result).toEqual('<a href=\'url/to/doc\'>link text</a>');
  });

  it('should log a warning if not failOnBadLink and the link is "bad"', () => {
    const doc = {};
    const tagName = 'link';
    const tagDescription = 'doc-id link text';
    tag.failOnBadLink = false;
    getLinkInfo.and.returnValue({ valid: false, error: 'Error message', errorType: 'error' });
    expect(() => tag.handler(doc, tagName, tagDescription)).not.toThrow();
    expect(log.warn).toHaveBeenCalledWith('Error in {@link doc-id link text} - Error message - doc');
  });

  it('should throw an error if failOnBadLink and the link is "bad"', () => {
    const doc = {};
    const tagName = 'link';
    const tagDescription = 'doc-id link text';
    getLinkInfo.and.returnValue({ valid: false, error: 'Error message', errorType: 'error' });
    tag.failOnBadLink = true;
    expect(() => tag.handler(doc, tagName, tagDescription)).toThrowError('Error in {@link doc-id link text} - Error message - doc');
  });
});

