const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('disambiguateDocPaths processor', () => {
  let dgeni, injector, processor, docs;

  beforeEach(() => {
    dgeni = new Dgeni([testPackage('angular-base-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('disambiguateDocPathsProcessor');
    docs = [
      { docType: 'test-doc', id: 'test-doc', path: 'test/doc', outputPath: 'test/doc.json' },
      { docType: 'test-doc', id: 'TEST-DOC', path: 'TEST/DOC', outputPath: 'TEST/DOC.json' },
      { docType: 'test-doc', id: 'test-Doc', path: 'test/Doc', outputPath: 'test/Doc.xml' },
      { docType: 'test-doc', id: 'unique-doc', path: 'unique/doc', outputPath: 'unique/doc.json' },
      { docType: 'test-doc', id: 'other-doc', path: 'other/doc', outputPath: 'other/doc.json' },
      { docType: 'test-doc', id: 'other-DOC', path: 'other/DOC', outputPath: 'other/DOC.json' },
      { docType: 'test-doc', id: 'has_underscore', path: 'has_underscore', outputPath: 'has_underscore.json' },
      { docType: 'test-doc', id: 'HAS_UNDERSCORE', path: 'HAS_UNDERSCORE', outputPath: 'HAS_UNDERSCORE.json' },
    ];
  });

  it('should be part of the dgeni package', () => {
    expect(processor).toBeDefined();
  });

  it('should be run before creating the sitemap', () => {
    expect(processor.$runBefore).toContain('createSitemap');
  });

  it('should update the path and outputPath properties of each doc to be unambiguous on case-insensitive file-systems', () => {
    processor.$process(docs);
    expect(docs[0].path).toEqual('test/doc');
    expect(docs[0].outputPath).toEqual('test/doc.json');
    expect(docs[1].path).toEqual('TEST/DOC');
    expect(docs[1].outputPath).toEqual('t_e_s_t_/d_o_c_.json');
    expect(docs[2].path).toEqual('test/Doc');
    expect(docs[2].outputPath).toEqual('test/d_oc.xml');
    expect(docs[3].path).toEqual('unique/doc');
    expect(docs[3].outputPath).toEqual('unique/doc.json');
    expect(docs[4].path).toEqual('other/doc');
    expect(docs[4].outputPath).toEqual('other/doc.json');
    expect(docs[5].path).toEqual('other/DOC');
    expect(docs[5].outputPath).toEqual('other/d_o_c_.json');
    expect(docs[6].path).toEqual('has_underscore');
    expect(docs[6].outputPath).toEqual('has__underscore.json');
    expect(docs[7].path).toEqual('HAS_UNDERSCORE');
    expect(docs[7].outputPath).toEqual('h_a_s___u_n_d_e_r_s_c_o_r_e_.json');
  });
});
