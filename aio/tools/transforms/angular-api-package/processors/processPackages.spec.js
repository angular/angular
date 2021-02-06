const testPackage = require('../../helpers/test-package');
const processorFactory = require('./processPackages');
const Dgeni = require('dgeni');

describe('processPackages processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('processPackages');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toEqual(['processAliasDocs', 'collectPackageContentDocsProcessor']);
    expect(processor.$runBefore).toEqual(['rendering-docs', 'checkContentRules']);
  });

  it('should change `module` docs to `package` docs', () => {
    const processor = processorFactory({ packageContentFiles: {} });
    const docs = [
      { fileInfo: { filePath: 'some/a' }, docType: 'module', id: 'a' },
      { fileInfo: { filePath: 'some/b' }, docType: 'module', id: 'b' },
      { docType: 'other', id: 'c' },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      jasmine.objectContaining({ docType: 'package', id: 'a' }),
      jasmine.objectContaining({ docType: 'package', id: 'b' }),
      jasmine.objectContaining({ docType: 'other', id: 'c' }),
    ]);
  });

  it('should attach the relevant package contents to the package doc', () => {
    const docs = [
      {
        fileInfo: { filePath: 'some/package-1/index' },
        docType: 'module',
        id: 'package-1',
        someProp: 'foo',
      },
      {
        fileInfo: { filePath: 'some/package-2/index' },
        docType: 'module',
        id: 'package-2',
      },
    ];
    const packageContentFiles = {
      'some/package-1': {
        fileInfo: { filePath: 'some/package-1/PACKAGE.md' },
        docType: 'package-content',
        id: 'package-1/PACKAGE.md',
        shortDescription: 'some short description',
        description: 'some description',
        see: [ 'a', 'b' ],
      }
    };
    const processor = processorFactory({ packageContentFiles });
    processor.$process(docs);

    const package1 = jasmine.objectContaining({
      fileInfo: { filePath: 'some/package-1/PACKAGE.md' },
      docType: 'package',
      name: '@angular/package-1',
      id: 'package-1',
      someProp: 'foo',
      shortDescription: 'some short description',
      description: 'some description',
      see: [ 'a', 'b' ],
      isPrimaryPackage: true,
    });

    const package2 = jasmine.objectContaining({
      fileInfo: { filePath: 'some/package-2/index' },
      docType: 'package',
      name: '@angular/package-2',
      id: 'package-2',
      isPrimaryPackage: true,
    });

    expect(docs).toEqual([package1, package2]);
  });

  it('should compute primary and second package info', () => {
    const docs = [
      {
        fileInfo: { filePath: 'some/package-1/index' },
        docType: 'module',
        id: 'package-1',
      },
      {
        fileInfo: { filePath: 'some/package-1/sub-1index' },
        docType: 'module',
        id: 'package-1/sub-1',
      },
      {
        fileInfo: { filePath: 'some/package-1/sub-2index' },
        docType: 'module',
        id: 'package-1/sub-2',
      },
    ];
    const processor = processorFactory({ packageContentFiles: {} });
    processor.$process(docs);

    expect(docs[0].isPrimaryPackage).toBe(true);
    expect(docs[1].isPrimaryPackage).toBe(false);
    expect(docs[2].isPrimaryPackage).toBe(false);

    expect(docs[0].packageInfo.primary).toBe(docs[0]);
    expect(docs[1].packageInfo.primary).toBe(docs[0]);
    expect(docs[2].packageInfo.primary).toBe(docs[0]);

    expect(docs[0].packageInfo.secondary).toEqual([docs[1], docs[2]]);
    expect(docs[1].packageInfo.secondary).toEqual([docs[1], docs[2]]);
    expect(docs[2].packageInfo.secondary).toEqual([docs[1], docs[2]]);
  });

  it('should partition the exports of packages into groups, sorted by id', () => {
    const docs = [
      {
        fileInfo: { filePath: 'some/x' },
        docType: 'module',
        id: 'x',
        exports: [
          { docType: 'function', id: 'function-1' },
          { docType: 'directive', id: 'directive-2' },
          { docType: 'decorator', id: 'decorator-1' },
          { docType: 'class', id: 'class-1' },
          { docType: 'directive', id: 'directive-1' },
          { docType: 'type-alias', id: 'type-alias-1' },
          { docType: 'class', id: 'class-2' },
          { docType: 'pipe', id: 'pipe-1' },
          { docType: 'const', id: 'const-1' },
          { docType: 'interface', id: 'interface-2' },
          { docType: 'const', id: 'const-2' },
          { docType: 'enum', id: 'enum-1' },
          { docType: 'interface', id: 'interface-1' },
        ]
      },
    ];
    const processor = processorFactory({ packageContentFiles: {} });
    processor.$process(docs);

    expect(docs[0].decorators).toEqual([
      { docType: 'decorator', id: 'decorator-1' },
    ]);
    expect(docs[0].functions).toEqual([
      { docType: 'function', id: 'function-1' },
    ]);
    expect(docs[0].structures).toEqual([
      { docType: 'enum', id: 'enum-1' },
      { docType: 'interface', id: 'interface-1' },
      { docType: 'interface', id: 'interface-2' },
    ]);
    expect(docs[0].directives).toEqual([
      { docType: 'directive', id: 'directive-1' },
      { docType: 'directive', id: 'directive-2' },
    ]);
    expect(docs[0].pipes).toEqual([
      { docType: 'pipe', id: 'pipe-1' },
    ]);
    expect(docs[0].types).toEqual([
      { docType: 'const', id: 'const-1' },
      { docType: 'const', id: 'const-2' },
      { docType: 'type-alias', id: 'type-alias-1' },
    ]);
  });

  it('should compute whether the entry point has public exports', () => {
    const docs = [
      {
        fileInfo: { filePath: 'some/package-1/index' },
        docType: 'module',
        id: 'package-1',
        exports: [
          { docType: 'class', id: 'class-1' },
        ]
      },
      {
        fileInfo: { filePath: 'some/package-1/sub-1index' },
        docType: 'module',
        id: 'package-1/sub-1',
        exports: [],
      },
      {
        fileInfo: { filePath: 'some/package-2/index' },
        docType: 'module',
        id: 'package-2',
        exports: [],
      },
      {
        fileInfo: { filePath: 'some/package-1/sub-1index' },
        docType: 'module',
        id: 'package-1/sub-1',
        exports: [
          { docType: 'const', id: 'const-2' },
          { docType: 'enum', id: 'enum-3' },
        ],
      },
    ];
    const processor = processorFactory({ packageContentFiles: {} });
    processor.$process(docs);

    expect(docs[0].hasPublicExports).toBeTrue();
    expect(docs[1].hasPublicExports).toBeFalse();
    expect(docs[2].hasPublicExports).toBeFalse();
    expect(docs[3].hasPublicExports).toBeTrue();
  });

  it('should compute the deprecated status of each entry point', () => {
    const docs = [
      {
        fileInfo: { filePath: 'some/package-1/index' },
        docType: 'module',
        id: 'package-1',
        exports: [
          { docType: 'class', id: 'class-1', deprecated: true },
        ]
      },
      {
        fileInfo: { filePath: 'some/package-1/sub-1index' },
        docType: 'module',
        id: 'package-1/sub-1',
        exports: [
          { docType: 'class', id: 'class-2', deprecated: true },
        ]
      },
      {
        fileInfo: { filePath: 'some/package-2/index' },
        docType: 'module',
        id: 'package-2',
        exports: [
          { docType: 'class', id: 'class-3' },
          { docType: 'class', id: 'class-4', deprecated: true },
        ]
      },
      {
        fileInfo: { filePath: 'some/package-3/index' },
        docType: 'module',
        id: 'package-3',
        exports: [
          { docType: 'class', id: 'class-5' },
          { docType: 'class', id: 'class-6' },
        ]
      },
      {
        fileInfo: { filePath: 'some/package-4/index' },
        docType: 'module',
        id: 'package-4',
        exports: []
      },
    ];
    const processor = processorFactory({ packageContentFiles: {} });
    processor.$process(docs);

    expect(docs[0].deprecated).toBeTruthy();
    expect(docs[1].deprecated).toBeTruthy();
    expect(docs[2].deprecated).toBeUndefined();
    expect(docs[3].deprecated).toBeUndefined();
    expect(docs[4].deprecated).toBeUndefined();
  });

  it('should compute the deprecated status of packages', () => {
    const docs = [
      {
        fileInfo: { filePath: 'some/package-1/index' },
        docType: 'module',
        id: 'package-1',
        exports: [
          { docType: 'class', id: 'class-1', deprecated: true },
        ]
      },
      {
        fileInfo: { filePath: 'some/package-1/sub-1index' },
        docType: 'module',
        id: 'package-1/sub-1',
        exports: [
          { docType: 'class', id: 'class-2', deprecated: true },
        ]
      },
      {
        fileInfo: { filePath: 'some/package-2/index' },
        docType: 'module',
        id: 'package-2',
        exports: [
          { docType: 'class', id: 'class-3', deprecated: true },
        ]
      },
      {
        fileInfo: { filePath: 'some/package-2/sub-1index' },
        docType: 'module',
        id: 'package-2/sub-1',
        exports: [
          { docType: 'class', id: 'class-4', deprecated: false },
        ]
      },
      {
        fileInfo: { filePath: 'some/package-3/index' },
        docType: 'module',
        id: 'package-3',
        exports: [
          { docType: 'class', id: 'class-5', deprecated: false },
        ]
      },
      {
        fileInfo: { filePath: 'some/package-3/sub-1index' },
        docType: 'module',
        id: 'package-3/sub-1',
        exports: [
          { docType: 'class', id: 'class-6', deprecated: true },
        ]
      },
    ];
    const processor = processorFactory({ packageContentFiles: {} });
    processor.$process(docs);
    expect(docs[0].packageDeprecated).toBe(true);
    expect(docs[1].packageDeprecated).toBeUndefined();
    expect(docs[2].packageDeprecated).toBe(false);
    expect(docs[3].packageDeprecated).toBeUndefined();
    expect(docs[4].packageDeprecated).toBe(false);
  });
});
