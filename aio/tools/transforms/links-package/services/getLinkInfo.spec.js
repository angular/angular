const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

let getLinkInfo, aliasMap;

describe('getLinkInfo', () => {
  beforeEach(function() {
    var dgeni = new Dgeni([testPackage('links-package', true)]);
    var injector = dgeni.configureInjector();
    aliasMap = injector.get('aliasMap');
    getLinkInfo = injector.get('getLinkInfo');
  });

  it('should use the title if specified', () => {
    aliasMap.addDoc({ docType: 'guide', title: 'Browser Support', name: 'browser-support', id: 'guide/browser-support', aliases: ['guide/browser-support', 'browser-support'], path: 'guide/browser-support' });
    const currentDoc = { };
    const linkInfo = getLinkInfo('browser-support', '"Browser Support Guide"', currentDoc);
    expect(linkInfo.title).toBe('"Browser Support Guide"');
  });

  it('should set the link to invalid if the title is `undefined`', () => {
    aliasMap.addDoc({ docType: 'guide', id: 'guide/browser-support', aliases: ['guide/browser-support', 'browser-support'], path: 'guide/browser-support' });
    const currentDoc = { };
    const linkInfo = getLinkInfo('browser-support', undefined, currentDoc);
    expect(linkInfo.valid).toBe(false);
    expect(linkInfo.errorType).toEqual('no-title');
    expect(linkInfo.error).toEqual('The link is missing a title');
  });

  it('should use the target document title if available and no title is specified', () => {
    aliasMap.addDoc({ docType: 'guide', title: 'Browser Support', id: 'guide/browser-support', aliases: ['guide/browser-support', 'browser-support'], path: 'guide/browser-support' });
    const currentDoc = { };
    const linkInfo = getLinkInfo('browser-support', undefined, currentDoc);
    expect(linkInfo.valid).toBe(true);
    expect(linkInfo.title).toEqual('Browser Support');
  });

  it('should prefer the target doc title over name if available and no title is specified', () => {
    aliasMap.addDoc({ docType: 'guide', title: 'Browser Support', name: 'browser-support', id: 'guide/browser-support', aliases: ['guide/browser-support', 'browser-support'], path: 'guide/browser-support' });
    const currentDoc = { };
    const linkInfo = getLinkInfo('browser-support', undefined, currentDoc);
    expect(linkInfo.valid).toBe(true);
    expect(linkInfo.title).toEqual('Browser Support');
  });

  it('should use the target document name as a code block if available and no title is specified', () => {
    aliasMap.addDoc({ docType: 'api', name: 'CurrencyPipe', id: 'common/CurrencyPipe', aliases: ['common/CurrencyPipe', 'CurrencyPipe'], path: 'api/common/CurrencyPipe' });
    const currentDoc = { };
    const linkInfo = getLinkInfo('CurrencyPipe', undefined, currentDoc);
    expect(linkInfo.valid).toBe(true);
    expect(linkInfo.title).toEqual('<code>CurrencyPipe</code>');
  });
});