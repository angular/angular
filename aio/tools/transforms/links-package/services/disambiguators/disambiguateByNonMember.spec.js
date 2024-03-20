const disambiguateByNonMember = require('./disambiguateByNonMember')();
const doc1 = { id: 'doc1', docType: 'function', containerDoc: {} };
const doc2 = { id: 'doc2', docType: 'member', containerDoc: {} };
const doc3 = { id: 'doc3', docType: 'member', containerDoc: {} };
const doc4 = { id: 'doc4', docType: 'class', containerDoc: {} };
const doc5 = { id: 'doc5', docType: 'member', containerDoc: {} };

describe('disambiguateByNonMember', () => {
  it('should filter out docs that are not members', () => {
    const docs = [doc1, doc2, doc3, doc4, doc5];
    expect(disambiguateByNonMember('alias', {}, docs)).toEqual([doc1, doc4]);
  });

  it('should return all docs if there are no members', () => {
    const docs = [doc1, doc4];
    expect(disambiguateByNonMember('alias', {}, docs)).toEqual([doc1, doc4]);
  });

  it('should return all docs if there are only members', () => {
    const docs = [doc2, doc3, doc5];
    expect(disambiguateByNonMember('alias', {}, docs)).toEqual([doc2, doc3, doc5]);
  });
});