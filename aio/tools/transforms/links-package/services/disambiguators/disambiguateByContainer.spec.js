const disambiguateByContainer = require('./disambiguateByContainer')();
const containerA = { name: 'a' };
const containerB = { name: 'b' };
const docs = [
  { id: 'doc1', containerDoc: containerA },
  { id: 'doc2', containerDoc: containerA },
  { id: 'doc3', containerDoc: containerB },
];

describe('disambiguateByContainer', () => {
  it('should return all docs if the originating doc has no containerDoc', () => {
    expect(disambiguateByContainer('alias', { }, docs)).toEqual(docs);
  });

  it('should return all docs if no docs match the originating doc containerDoc', () => {
    expect(disambiguateByContainer('alias', { containerDoc: { name: 'c' } }, docs)).toEqual(docs);
  });

  it('should return only docs that are contained by the originating doc or its containers', () => {
    expect(disambiguateByContainer('alias', containerB, docs)).toEqual([
      { id: 'doc3', containerDoc: containerB },
    ]);

    expect(disambiguateByContainer('alias', { containerDoc: containerA }, docs)).toEqual([
      { id: 'doc1', containerDoc: containerA },
      { id: 'doc2', containerDoc: containerA },
    ]);

    expect(disambiguateByContainer('alias', { containerDoc: containerB }, docs)).toEqual([
      { id: 'doc3', containerDoc: containerB },
    ]);

  });
});