var createTestPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('addImageDimensions post-processor', () => {
  let processor, getImageDimensionsSpy, addImageDimensions, log;

  beforeEach(() => {
    const testPackage = createTestPackage('angular-base-package')
        .factory('getImageDimensions', mockGetImageDimensions);
    const dgeni = new Dgeni([testPackage]);
    const injector = dgeni.configureInjector();
    log = injector.get('log');
    addImageDimensions = injector.get('addImageDimensions');
    addImageDimensions.basePaths = ['base/path'];
    getImageDimensionsSpy = injector.get('getImageDimensions');
    processor = injector.get('postProcessHtml');
    processor.docTypes = ['a'];
    processor.plugins = [addImageDimensions];
  });

  it('should add the image dimensions into <img> tags', () => {
    const docs = [{
      docType: 'a',
      renderedContent: `
        <p>xxx</p>
        <img src="a/b.jpg">
        <p>yyy</p>
        <img src="c/d.png">
        <p>zzz</p>
      `
    }];
    processor.$process(docs);
    expect(getImageDimensionsSpy).toHaveBeenCalledWith(['base/path'], 'a/b.jpg');
    expect(getImageDimensionsSpy).toHaveBeenCalledWith(['base/path'], 'c/d.png');
    expect(docs).toEqual([jasmine.objectContaining({
      docType: 'a',
      renderedContent: `
        <p>xxx</p>
        <img src="a/b.jpg" width="10" height="20">
        <p>yyy</p>
        <img src="c/d.png" width="30" height="40">
        <p>zzz</p>
      `
    })]);
  });

  it('should log a warning for images with no src attribute', () => {
    const docs = [{
      docType: 'a',
      renderedContent: '<img attr="value">'
    }];
    processor.$process(docs);
    expect(getImageDimensionsSpy).not.toHaveBeenCalled();
    expect(docs).toEqual([jasmine.objectContaining({
      docType: 'a',
      renderedContent: '<img attr="value">'
    })]);
    expect(log.warn).toHaveBeenCalledWith('Missing src in image tag `<img attr="value">` - doc (a) ');
  });

  it('should fail for images whose source cannot be loaded', () => {
    getImageDimensionsSpy.and.callFake(() => {
      const error = new Error('no such file or directory');
      error.code = 'ENOENT';
      throw error;
    });
    const docs = [{
      docType: 'a',
      renderedContent: '<img src="missing">'
    }];
    expect(() => processor.$process(docs)).toThrowError('Unable to load src in image tag `<img src="missing">` - doc (a) ');
    expect(getImageDimensionsSpy).toHaveBeenCalledWith(['base/path'], 'missing');
  });

  it('should ignore images with width or height attributes', () => {
    const docs = [{
      docType: 'a',
      renderedContent: `
        <img src="a/b.jpg" width="10">
        <img src="c/d.jpg" height="10">
        <img src="e/f.jpg" width="10" height="10">
      `
    }];
    processor.$process(docs);
    expect(docs).toEqual([jasmine.objectContaining({
      docType: 'a',
      renderedContent: `
        <img src="a/b.jpg" width="10">
        <img src="c/d.jpg" height="10">
        <img src="e/f.jpg" width="10" height="10">
      `
    })]);
  });

  function mockGetImageDimensions() {
    const imageInfo = {
      'a/b.jpg': { width: 10, height: 20 },
      'c/d.png': { width: 30, height: 40 },
    };
    // eslint-disable-next-line jasmine/no-unsafe-spy
    return jasmine.createSpy('getImageDimensions')
      .and.callFake((basePaths, url) => imageInfo[url]);
  }
});
