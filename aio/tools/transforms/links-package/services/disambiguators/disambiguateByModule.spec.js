const disambiguateByModule = require('./disambiguateByModule')();
const moduleA = { name: 'a' };
const moduleB = { name: 'b' };
const docs = [
  { id: 'doc1', moduleDoc: moduleA },
  { id: 'doc2', moduleDoc: moduleA },
  { id: 'doc3', moduleDoc: moduleB },
];

describe('disambiguateByModule', () => {
  it('should return all docs if the originating doc has no moduleDoc', () => {
    expect(disambiguateByModule('alias', { }, docs)).toEqual(docs);
  });

  it('should return all docs if no docs match the originating doc moduleDoc', () => {
    expect(disambiguateByModule('alias', { moduleDoc: { name: 'c' } }, docs)).toEqual(docs);
  });

  it('should return only docs that match the moduleDoc of the originating doc', () => {
    expect(disambiguateByModule('alias', { moduleDoc: moduleA }, docs)).toEqual([
      { id: 'doc1', moduleDoc: moduleA },
      { id: 'doc2', moduleDoc: moduleA },
    ]);

    expect(disambiguateByModule('alias', { moduleDoc: moduleB }, docs)).toEqual([
      { id: 'doc3', moduleDoc: moduleB },
    ]);
  });
});