const path = require('canonical-path');
const Dgeni = require('dgeni');

const testPackage = require('../../helpers/test-package');
const mockLogger = require('dgeni/lib/mocks/log')(false);
const processorFactory = require('./generateKeywords');

const mockReadFilesProcessor = {
  basePath: 'base/path'
};

const ignoreWords = require(path.resolve(__dirname, '../ignore-words'))['en'];

function createProcessor() {
  const processor = processorFactory(mockLogger, mockReadFilesProcessor);
  processor.ignoreWords = ignoreWords;
  return processor;
}

describe('generateKeywords processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-base-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('generateKeywordsProcessor');
    expect(processor.$process).toBeDefined();
  });

  it('should run after the correct processor', () => {
    const processor = createProcessor();
    expect(processor.$runAfter).toEqual(['postProcessHtml']);
  });

  it('should run before the correct processor', () => {
    const processor = createProcessor();
    expect(processor.$runBefore).toEqual(['writing-files']);
  });

  it('should ignore internal and private exports', async () => {
    const processor = createProcessor();
    const docs = await processor.$process([
      { docType: 'class', name: 'PublicExport' },
      { docType: 'class', name: 'PrivateExport', privateExport: true },
      { docType: 'class', name: 'InternalExport', internal: true }
    ]);
    expect(docs[docs.length - 1].data.pages).toEqual([
      jasmine.objectContaining({ title: 'PublicExport', type: 'class' })
    ]);
  });

  it('should ignore docs that are in the `docTypesToIgnore` list', async () => {
    const processor = createProcessor();
    processor.docTypesToIgnore = ['interface'];
    const docs = await processor.$process([
      { docType: 'class', name: 'Class' },
      { docType: 'interface', name: 'Interface' },
      { docType: 'content', name: 'Guide' },
    ]);
    expect(docs[docs.length - 1].data.pages).toEqual([
      jasmine.objectContaining({ title: 'Class', type: 'class' }),
      jasmine.objectContaining({ title: 'Guide', type: 'content' }),
    ]);
  });

  it('should not collect keywords from properties that are in the `propertiesToIgnore` list', async () => {
    const processor = createProcessor();
    processor.propertiesToIgnore = ['docType', 'ignore'];
    const docs = await processor.$process([
      { docType: 'class', name: 'FooClass', ignore: 'ignore this content' },
      { docType: 'interface', name: 'BarInterface', capture: 'capture this content' },
    ]);
    expect(docs[docs.length - 1].data).toEqual({
      dictionary: 'fooclass barinterfac captur content',
      pages: [
        jasmine.objectContaining({ title: 'FooClass', type: 'class', keywords: [0] }),
        jasmine.objectContaining({ title: 'BarInterface', type: 'interface', keywords: [1, 2, 3] }),
      ],
    });
  });

  it('should not collect keywords that look like HTML tags', async () => {
    const processor = createProcessor();
    const docs = await processor.$process([
      { docType: 'class', name: 'FooClass', content: `
      <table id="foo">
        <tr class="moo" id="bar">
          <td>Content inside a table</td>
        </tr>
      </table>` },
    ]);
    expect(docs[docs.length - 1].data).toEqual({
      dictionary: 'class fooclass content insid tabl',
      pages: [
        jasmine.objectContaining({keywords: [0, 1, 2, 3, 4] })
      ],
    });
  });

  it('should compute `doc.searchTitle` from the doc properties if not already provided', async () => {
    const processor = createProcessor();
    const docs = await processor.$process([
      { docType: 'class', name: 'A', searchTitle: 'searchTitle A', title: 'title A', vFile: { headings: { h1: ['vFile A'] } } },
      { docType: 'class', name: 'B', title: 'title B', vFile: { headings: { h1: ['vFile B'] } } },
      { docType: 'class', name: 'C', vFile: { title: 'vFile C', headings: { h1: ['vFile C'] } } },
      { docType: 'class', name: 'D' },
    ]);
    expect(docs[docs.length - 1].data.pages).toEqual([
      jasmine.objectContaining({ title: 'searchTitle A' }),
      jasmine.objectContaining({ title: 'title B' }),
      jasmine.objectContaining({ title: 'vFile C' }),
      jasmine.objectContaining({ title: 'D' }),
    ]);
  });

  it('should use `doc.searchTitle` as the title in the search index', async () => {
    const processor = createProcessor();
    const docs = await processor.$process([
      { docType: 'class', name: 'PublicExport', searchTitle: 'class PublicExport' },
    ]);
    const keywordsDoc = docs[docs.length - 1];
    expect(keywordsDoc.data.pages).toEqual([
      jasmine.objectContaining({ title: 'class PublicExport', type: 'class' })
    ]);
  });

  it('should add heading words to the search terms', async () => {
    const processor = createProcessor();
    const docs = await processor.$process([
      {
        docType: 'class',
        name: 'PublicExport',
        searchTitle: 'class PublicExport',
        vFile: { headings: { h2: ['Important heading', 'Secondary heading'] } }
      },
    ]);
    const keywordsDoc = docs[docs.length - 1];
    expect(keywordsDoc.data).toEqual({
      dictionary: 'class publicexport head secondari',
      pages: [
        jasmine.objectContaining({ headings: [2, 3, 2] })
      ]
    });
  });

  it('should add member doc properties to the search terms', async () => {
    const processor = createProcessor();
    const docs = await processor.$process([
      {
        docType: 'class',
        name: 'PublicExport',
        searchTitle: 'class PublicExport',
        vFile: { headings: { h2: ['heading A'] } },
        content: 'Some content with ngClass in it.',
        members: [
          { name: 'instanceMethodA' },
          { name: 'instancePropertyA' },
          { name: 'instanceMethodB' },
          { name: 'instancePropertyB' },
        ],
        statics: [
          { name: 'staticMethodA' },
          { name: 'staticPropertyA' },
          { name: 'staticMethodB' },
          { name: 'staticPropertyB' },
        ],
      },
    ]);
    const keywordsDoc = docs[docs.length - 1];
    expect(keywordsDoc.data).toEqual({
      dictionary: 'class publicexport content ngclass instancemethoda instancepropertya instancemethodb instancepropertyb staticmethoda staticpropertya staticmethodb staticpropertyb head',
      pages: [
        jasmine.objectContaining({
          members: [4, 5, 6, 7, 8, 9, 10, 11]
        })
      ]
    });
  });

  it('should add inherited member doc properties to the search terms', async () => {
    const processor = createProcessor();
    const parentClass =       {
      docType: 'class',
      name: 'ParentClass',
      members: [
        { name: 'parentMember1' },
      ],
      statics: [
        { name: 'parentMember2' },
      ],
    };
    const parentInterface = {
      docType: 'interface',
      name: 'ParentInterface',
      members: [
        { name: 'parentMember3' },
      ]
    };

    const childClass = {
      docType: 'class',
      name: 'Child',
      members: [
        { name: 'childMember1' }
      ],
      statics: [
        { name: 'childMember2' }
      ],
      extendsClauses: [{ doc: parentClass }],
      implementsClauses: [{ doc: parentInterface }]
    };
    const docs = await processor.$process([childClass, parentClass, parentInterface]);
    const keywordsDoc = docs[docs.length - 1];
    expect(keywordsDoc.data).toEqual({
      dictionary: 'class child childmember1 childmember2 parentmember1 parentmember2 parentmember3 parentclass interfac parentinterfac',
      pages: [
        jasmine.objectContaining({
          title: 'Child',
          members: [2, 3, 4, 5, 6]
        }),
        jasmine.objectContaining({
          title: 'ParentClass',
          members: [4, 5]
        }),
        jasmine.objectContaining({
          title: 'ParentInterface',
          members: [6]
        })
      ]
    });
  });

  it('should include both stripped and unstripped "ng" prefixed tokens', async () => {
    const processor = createProcessor();
    const docs = await processor.$process([
      {
        docType: 'class',
        name: 'PublicExport',
        searchTitle: 'ngController',
        vFile: { headings: { h2: ['ngModel'] } },
        content: 'Some content with ngClass in it.'
      },
    ]);
    const keywordsDoc = docs[docs.length - 1];
    expect(keywordsDoc.data).toEqual({
      dictionary: 'class publicexport ngcontrol control content ngclass ngmodel model',
      pages: [
        jasmine.objectContaining({
          headings: [6, 7],
          keywords: [0, 1, 2, 3, 4, 5, 0],
        })
      ],
    });
  });

  it('should generate compressed encoded renderedContent property', async () => {
    const processor = createProcessor();
    const docs = await processor.$process([
      {
        docType: 'class',
        name: 'SomeClass',
        description: 'The is the documentation for the SomeClass API.',
        vFile: { headings: { h1: ['SomeClass'], h2: ['Some heading'] } }
      },
      {
        docType: 'class',
        name: 'SomeClass2',
        description: 'description',
        members: [
          { name: 'member1' },
        ],
        deprecated: true
      },
    ]);
    const keywordsDoc = docs[docs.length - 1];
    expect(JSON.parse(keywordsDoc.renderedContent)).toEqual({
      dictionary: 'class someclass document api head someclass2 descript member1',
      pages: [{
        'title':'SomeClass',
        'type':'class',
        'headings': [1, 4],
        'keywords': [0, 1, 2, 1, 3],
      },
      {
        'title':'SomeClass2',
        'type':'class',
        'keywords': [0, 5, 6],
        'members': [7],
        'deprecated': true,
      }]
    });
  });
});
