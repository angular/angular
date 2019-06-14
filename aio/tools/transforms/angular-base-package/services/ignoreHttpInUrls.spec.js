const ignoreHttpInUrls = require('./ignoreHttpInUrls')();

describe('ignoreHttpInUrls', () => {
  it('should ignore all docs when matching `http` in `http://...`', () => {
    const docs = [{ docType: 'package', name: 'http' }, { docType: 'class', name: 'Foo' }];
    const filteredDocs = [];

    const words1 = ['http', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words1, 0)).toEqual(filteredDocs);

    const words2 = ['URL', ': ', 'http', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words2, 2)).toEqual(filteredDocs);
  });

  it('should keep all docs when not matching `http`', () => {
    const docs = [{ docType: 'package', name: 'http' }, { docType: 'class', name: 'Foo' }];
    const filteredDocs = [...docs];

    const words1 = ['http', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words1, 2)).toEqual(filteredDocs);

    const words2 = ['URL', ': ', 'http', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words2, 0)).toEqual(filteredDocs);

    const words3 = ['https', '://', 'example', '.', 'com', '/'];
    expect(ignoreHttpInUrls(docs, words3, 0)).toEqual(filteredDocs);
  });

  it('should keep all docs when not matching `http` at the beginning of a URL', () => {
    const docs = [{ docType: 'package', name: 'http' }, { docType: 'class', name: 'Foo' }];
    const filteredDocs = [...docs];

    const words1 = ['http', ' ', 'is', ' ', 'cool'];
    expect(ignoreHttpInUrls(docs, words1, 0)).toEqual(filteredDocs);

    const words2 = ['http', '://', 'http', '.', 'com'];
    expect(ignoreHttpInUrls(docs, words2, 2)).toEqual(filteredDocs);
  });
});
