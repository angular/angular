const disambiguateByDeprecated = require('./disambiguateByDeprecated')();
const docs = [
  { id: 'doc1' },
  { id: 'doc2', deprecated: true },
  { id: 'doc3', deprecated: '' },
  { id: 'doc4' },
  { id: 'doc5', deprecated: 'Some text' },
];

describe('disambiguateByDeprecated', () => {
  it('should filter out docs whose `deprecated` property is defined', () => {
    expect(disambiguateByDeprecated('alias', {}, docs)).toEqual([
      { id: 'doc1' },
      { id: 'doc4' },
    ]);
  });
});