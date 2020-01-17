const ignoreGenericWords = require('./ignoreGenericWords')();

describe('ignoreGenericWords', () => {
  it('should ignore generic words in all docs', () => {
    const docs = [{docType: 'package', name: 'create'}, {docType: 'class', name: 'Foo'}];
    const words = ['create', 'a', 'thing'];
    expect(ignoreGenericWords(docs, words, 0)).toEqual([]);
    expect(ignoreGenericWords(docs, words, 1)).toEqual([]);
    expect(ignoreGenericWords(docs, words, 2)).toEqual(docs);
  });

  it('should ignore generic words with mixed case in all docs', () => {
    const docs = [{docType: 'package', name: 'create'}, {docType: 'class', name: 'Foo'}];
    const words = ['Create', 'eRrOr', 'STUFF'];
    expect(ignoreGenericWords(docs, words, 0)).toEqual([]);
    expect(ignoreGenericWords(docs, words, 1)).toEqual([]);
    expect(ignoreGenericWords(docs, words, 2)).toEqual(docs);
  });
});


