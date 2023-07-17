const ignoreHttpInUrls = require('./ignoreHttpInUrls')();

describe('ignoreHttpInUrls', () => {
  it('should ignore all docs when matching `http` in `http://...`', () => {
    const docs = [{ docType: 'package', name: 'http' }, { docType: 'class', name: 'Foo' }];

    const words1 = ['http', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words1, 0)).toEqual([]);

    const words2 = ['URL', ': ', 'http', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words2, 2)).toEqual([]);
  });

  it('should ignore all docs when matching `https` in `https://...`', () => {
    const docs = [{ docType: 'package', name: 'https' }, { docType: 'class', name: 'Foo' }];

    const words1 = ['https', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words1, 0)).toEqual([]);

    const words2 = ['URL', ': ', 'https', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words2, 2)).toEqual([]);
  });

  it('should keep all docs when not matching `http(s)`', () => {
    const docs = [{ docType: 'package', name: 'http' }, { docType: 'class', name: 'Foo' }];

    const words1 = ['http', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words1, 2)).toEqual(docs);

    const words2 = ['URL', ': ', 'https', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words2, 0)).toEqual(docs);

    const words3 = ['file', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words3, 0)).toEqual(docs);
  });

  it('should keep all docs when not matching `http(s)` at the beginning of a URL', () => {
    const docs = [{ docType: 'package', name: 'http' }, { docType: 'class', name: 'Foo' }];

    const words1 = ['http', ' ', 'is', ' ', 'cool'];
    expect(ignoreHttpInUrls(docs, words1, 0)).toEqual(docs);

    const words2 = ['https', ' ', 'is', ' ', 'cooler'];
    expect(ignoreHttpInUrls(docs, words2, 0)).toEqual(docs);

    const words3 = ['http', '://', 'http', '.', 'com'];
    expect(ignoreHttpInUrls(docs, words3, 2)).toEqual(docs);
  });
});
