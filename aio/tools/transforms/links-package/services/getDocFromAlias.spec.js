var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

var getDocFromAlias, aliasMap;

describe('getDocFromAlias', () => {
  beforeEach(() => {
    var dgeni = new Dgeni([testPackage('links-package', true)]);
    var injector = dgeni.configureInjector();
    aliasMap = injector.get('aliasMap');
    getDocFromAlias = injector.get('getDocFromAlias');
  });

  it('should return an array of docs that match the alias', () => {
    var doc1 = {aliases: ['a', 'b', 'c']};
    var doc2 = {aliases: ['a', 'b']};
    var doc3 = {aliases: ['a']};
    aliasMap.addDoc(doc1);
    aliasMap.addDoc(doc2);
    aliasMap.addDoc(doc3);

    expect(getDocFromAlias('a')).toEqual([doc1, doc2, doc3]);
    expect(getDocFromAlias('b')).toEqual([doc1, doc2]);
    expect(getDocFromAlias('c')).toEqual([doc1]);
  });

  it('should filter ambiguous docs by calling each disambiguator', () => {
    getDocFromAlias.disambiguators = [
      (alias, originatingDoc, docs) => docs.filter(doc => doc.name.indexOf('X') !== -1), // only if X appears in name
      (alias, originatingDoc, docs) => docs.filter(doc => doc.name.indexOf('Y') !== -1)  // only if Y appears in name
    ];

    var doc1 = {name: 'X', aliases: ['a', 'b', 'c']};
    var doc2 = {name: 'Y', aliases: ['a', 'b']};
    var doc3 = {name: 'XY', aliases: ['a', 'c']};
    aliasMap.addDoc(doc1);
    aliasMap.addDoc(doc2);
    aliasMap.addDoc(doc3);

    // doc1 and doc2 get removed as they don't both have X and Y in name
    expect(getDocFromAlias('a')).toEqual([doc3]);
    // doc2 gets removed as it has no X; then we have only one doc left so second disambiguator never runs
    expect(getDocFromAlias('b')).toEqual([doc1]);
    // doc1 gets removed as it has no Y; then we have only one doc left (which would anyway pass 2nd disambiguator)
    expect(getDocFromAlias('c')).toEqual([doc3]);
  });
});