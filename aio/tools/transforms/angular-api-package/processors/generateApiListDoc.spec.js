const testPackage = require('../../helpers/test-package');
const processorFactory = require('./generateApiListDoc');
const Dgeni = require('dgeni');

describe('generateApiListDoc processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('generateApiListDoc');
    expect(processor.$process).toBeDefined();
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['extra-docs-added', 'computeStability']);
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['rendering-docs']);
  });

  it('should create a new api list doc', () => {
    const processor = processorFactory();
    const docs = [];
    processor.outputFolder = 'test/path';
    processor.$process(docs);
    expect(docs[0]).toEqual({
      docType: 'api-list-data',
      template: 'json-doc.template.json',
      path: 'test/path/api-list.json',
      outputPath: 'test/path/api-list.json',
      data: []
    });
  });

  it('should add an info object to the doc for each module doc', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'package', id: '@angular/common/index', exports: [], path: 'common' },
      { docType: 'package', id: '@angular/core/index', exports: [], path: 'core' },
    ];
    processor.$process(docs);
    expect(docs[2].data).toEqual([
      { name: '@angular/common', title: '@angular/common', items: [], path: 'common' },
      { name: '@angular/core', title: '@angular/core', items: [], path: 'core' },
    ]);
  });

  it('should add info about each export on each module', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'package', id: '@angular/common/index', exports: [
        { docType: 'directive', name: 'AaaAaa', path: 'aaa' },
        { docType: 'pipe', name: 'BbbBbb', path: 'bbb' },
        { docType: 'decorator', name: 'CccCcc', path: 'ccc' },
        { docType: 'class', name: 'DddDdd', path: 'ddd' }
      ] },
      { docType: 'package', id: '@angular/core/index', exports: [
        { docType: 'interface', name: 'EeeEee', path: 'eee' },
        { docType: 'function', name: 'FffFff', path: 'fff' },
        { docType: 'enum', name: 'GggGgg', path: 'ggg' },
        { docType: 'type-alias', name: 'HhhHhh', path: 'hhh' },
        { docType: 'const', name: 'IiiIii', path: 'iii' },
      ] },
    ];
    processor.$process(docs);
    expect(docs[2].data[0].items).toEqual([
      { docType: 'directive', title: 'AaaAaa', name: 'aaaaaa', path: 'aaa', stability: '', securityRisk: false },
      { docType: 'pipe', title: 'BbbBbb', name: 'bbbbbb', path: 'bbb', stability: '', securityRisk: false },
      { docType: 'decorator', title: 'CccCcc', name: 'cccccc', path: 'ccc', stability: '', securityRisk: false },
      { docType: 'class', title: 'DddDdd', name: 'dddddd', path: 'ddd', stability: '', securityRisk: false }
    ]);
    expect(docs[2].data[1].items).toEqual([
      { docType: 'interface', title: 'EeeEee', name: 'eeeeee', path: 'eee', stability: '', securityRisk: false },
      { docType: 'function', title: 'FffFff', name: 'ffffff', path: 'fff', stability: '', securityRisk: false },
      { docType: 'enum', title: 'GggGgg', name: 'gggggg', path: 'ggg', stability: '', securityRisk: false },
      { docType: 'type-alias', title: 'HhhHhh', name: 'hhhhhh', path: 'hhh', stability: '', securityRisk: false },
      { docType: 'const', title: 'IiiIii', name: 'iiiiii', path: 'iii', stability: '', securityRisk: false },
    ]);
  });

  it('should ignore internal and private exports', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'package', id: '@angular/common/index', exports: [
        { docType: 'directive', name: 'AaaAaa', path: 'aaa', internal: true },
        { docType: 'class', name: 'XxxXxx', path: 'xxx', privateExport: true },
        { docType: 'pipe', name: 'BbbBbb', path: 'bbb' }
      ]}
    ];
    processor.$process(docs);
    expect(docs[1].data[0].items).toEqual([
      { docType: 'pipe', title: 'BbbBbb', name: 'bbbbbb', path: 'bbb', stability: '', securityRisk: false },
    ]);
  });

  it('should convert `let` and `var` docTypes to `const`', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'package', id: '@angular/common/index', exports: [
        { docType: 'var', name: 'AaaAaa', path: 'aaa' },
        { docType: 'let', name: 'BbbBbb', path: 'bbb' },
      ]}
    ];
    processor.$process(docs);
    expect(docs[1].data[0].items).toEqual([
      { docType: 'const', title: 'AaaAaa', name: 'aaaaaa', path: 'aaa', stability: '', securityRisk: false },
      { docType: 'const', title: 'BbbBbb', name: 'bbbbbb', path: 'bbb', stability: '', securityRisk: false },
    ]);
  });

  it('should convert security to a boolean securityRisk', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'package', id: '@angular/common/index', exports: [
        { docType: 'class', name: 'AaaAaa', path: 'aaa', security: 'This is a security risk' },
        { docType: 'class', name: 'BbbBbb', path: 'bbb', security: '' },
      ]}
    ];
    processor.$process(docs);
    expect(docs[1].data[0].items).toEqual([
      { docType: 'class', title: 'AaaAaa', name: 'aaaaaa', path: 'aaa', stability: '', securityRisk: true },
      { docType: 'class', title: 'BbbBbb', name: 'bbbbbb', path: 'bbb', stability: '', securityRisk: false },
    ]);
  });

  it('should convert stability tags to the stable string property', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'package', id: '@angular/common/index', exports: [
        { docType: 'class', name: 'AaaAaa', path: 'aaa', stable: undefined },
        { docType: 'class', name: 'BbbBbb', path: 'bbb', experimental: 'Some message' },
        { docType: 'class', name: 'CccCcc', path: 'ccc', deprecated: null },
        { docType: 'class', name: 'DddDdd', path: 'ddd' },
      ]}
    ];
    processor.$process(docs);
    expect(docs[1].data[0].items).toEqual([
      { docType: 'class', title: 'AaaAaa', name: 'aaaaaa', path: 'aaa', stability: 'stable', securityRisk: false },
      { docType: 'class', title: 'BbbBbb', name: 'bbbbbb', path: 'bbb', stability: 'experimental', securityRisk: false },
      { docType: 'class', title: 'CccCcc', name: 'cccccc', path: 'ccc', stability: 'deprecated', securityRisk: false },
      { docType: 'class', title: 'DddDdd', name: 'dddddd', path: 'ddd', stability: '', securityRisk: false },
    ]);
  });

  it('should sort items in each group alphabetically', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'package', id: '@angular/common/index', exports: [
        { docType: 'class', name: 'DddDdd', path: 'uuu' },
        { docType: 'class', name: 'BbbBbb', path: 'vvv' },
        { docType: 'class', name: 'AaaAaa', path: 'xxx' },
        { docType: 'class', name: 'CccCcc', path: 'yyy' },
      ]}
    ];
    processor.$process(docs);
    expect(docs[1].data[0].items).toEqual([
      { docType: 'class', title: 'AaaAaa', name: 'aaaaaa', path: 'xxx', stability: '', securityRisk: false },
      { docType: 'class', title: 'BbbBbb', name: 'bbbbbb', path: 'vvv', stability: '', securityRisk: false },
      { docType: 'class', title: 'CccCcc', name: 'cccccc', path: 'yyy', stability: '', securityRisk: false },
      { docType: 'class', title: 'DddDdd', name: 'dddddd', path: 'uuu', stability: '', securityRisk: false },
    ]);
  });
});

