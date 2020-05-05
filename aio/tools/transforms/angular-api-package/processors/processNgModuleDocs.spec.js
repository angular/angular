const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('processNgModuleDocs processor', () => {
  let processor;
  let injector;
  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('processNgModuleDocs');
  });

  it('should be available on the injector', () => {
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    expect(processor.$runBefore).toEqual(['createSitemap']);
  });

  it('should run after the correct processor', () => {
    expect(processor.$runAfter).toEqual(['extractDecoratedClassesProcessor', 'computeIdsProcessor']);
  });

  it('should non-arrayNgModule options to arrays', () => {
    const docs = [{
      docType: 'ngmodule',
      ngmoduleOptions: {
        a: ['AAA'],
        b: 'BBB',
        c: 42
      }
    }];
    processor.$process(docs);
    expect(docs[0].ngmoduleOptions.a).toEqual(['AAA']);
    expect(docs[0].ngmoduleOptions.b).toEqual(['BBB']);
    expect(docs[0].ngmoduleOptions.c).toEqual([42]);
  });

  it('should link directive/pipe docs with their NgModule docs (sorted by id)', () => {
    const aliasMap = injector.get('aliasMap');
    const directiveOptions = {selector: 'some-selector'};
    const ngModule1 = { docType: 'ngmodule', id: 'NgModule1', aliases: ['NgModule1'], ngmoduleOptions: {}};
    const ngModule2 = { docType: 'ngmodule', id: 'NgModule2', aliases: ['NgModule2'], ngmoduleOptions: {}};
    const directive1 = { docType: 'directive', id: 'Directive1', ngModules: ['NgModule1'], directiveOptions};
    const directive2 = { docType: 'directive', id: 'Directive2', ngModules: ['NgModule2'], directiveOptions};
    const directive3 = { docType: 'directive', id: 'Directive3', ngModules: ['NgModule1', 'NgModule2'], directiveOptions};
    const pipe1 = { docType: 'pipe', id: 'Pipe1', ngModules: ['NgModule1']};
    const pipe2 = { docType: 'pipe', id: 'Pipe2', ngModules: ['NgModule2']};
    const pipe3 = { docType: 'pipe', id: 'Pipe3', ngModules: ['NgModule1', 'NgModule2']};

    aliasMap.addDoc(ngModule1);
    aliasMap.addDoc(ngModule2);
    processor.$process([ngModule1, pipe2, directive2, directive3, pipe1, ngModule2, directive1, pipe3]);

    expect(ngModule1.directives).toEqual([directive1, directive3]);
    expect(ngModule1.pipes).toEqual([pipe1, pipe3]);
    expect(ngModule2.directives).toEqual([directive2, directive3]);
    expect(ngModule2.pipes).toEqual([pipe2, pipe3]);

    expect(directive1.ngModules).toEqual([ngModule1]);
    expect(directive2.ngModules).toEqual([ngModule2]);
    expect(directive3.ngModules).toEqual([ngModule1, ngModule2]);

    expect(pipe1.ngModules).toEqual([ngModule1]);
    expect(pipe2.ngModules).toEqual([ngModule2]);
    expect(pipe3.ngModules).toEqual([ngModule1, ngModule2]);
  });

  it('should not error if an abstract directove does not have a `@ngModule` tag', () => {
    expect(() => {
      processor.$process([{ docType: 'directive', id: 'AbstractDir', directiveOptions: {} }]);
    }).not.toThrow();

    expect(() => {
      processor.$process([{ docType: 'directive', id: 'AbstractDir',
        directiveOptions: {selector: undefined} }]);
    }).not.toThrow();
  });

  it('should error if a pipe/directive does not have a `@ngModule` tag', () => {
    const log = injector.get('log');
    expect(() => {
      processor.$process([{ docType: 'directive', id: 'Directive1',
        directiveOptions: {selector: 'dir1'} }]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      '"Directive1" has no @ngModule tag. Docs of type "directive" must have this tag. - doc "Directive1" (directive) ');

    expect(() => {
      processor.$process([{ docType: 'pipe', id: 'Pipe1' }]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      '"Pipe1" has no @ngModule tag. Docs of type "pipe" must have this tag. - doc "Pipe1" (pipe) ');
  });

  it('should error if a pipe/directive has an @ngModule tag that does not match an NgModule doc', () => {
    const log = injector.get('log');
    expect(() => {
      processor.$process([{ docType: 'directive', id: 'Directive1', ngModules: ['MissingNgModule'],
        directiveOptions: {selector: 'dir1'} }]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      '"@ngModule MissingNgModule" does not match a public NgModule - doc "Directive1" (directive) ');

    expect(() => {
      processor.$process([{ docType: 'pipe', id: 'Pipe1', ngModules: ['MissingNgModule'] }]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      '"@ngModule MissingNgModule" does not match a public NgModule - doc "Pipe1" (pipe) ');
  });

  it('should error if a pipe/directive has an @ngModule tag that matches more than one NgModule doc', () => {
    const aliasMap = injector.get('aliasMap');
    const log = injector.get('log');
    const ngModule1 = { docType: 'ngmodule', id: 'NgModule1', aliases: ['NgModuleAlias'], ngmoduleOptions: {}};
    const ngModule2 = { docType: 'ngmodule', id: 'NgModule2', aliases: ['NgModuleAlias'], ngmoduleOptions: {}};
    aliasMap.addDoc(ngModule1);
    aliasMap.addDoc(ngModule2);

    expect(() => {
      processor.$process([{
        docType: 'directive', id: 'Directive1', ngModules: ['NgModuleAlias'],
        directiveOptions: {selector: 'dir1'} }]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      '"@ngModule NgModuleAlias" is ambiguous. Matches: NgModule1, NgModule2 - doc "Directive1" (directive) ');

    expect(() => {
      processor.$process([{ docType: 'pipe', id: 'Pipe1', ngModules: ['NgModuleAlias'] }]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      '"@ngModule NgModuleAlias" is ambiguous. Matches: NgModule1, NgModule2 - doc "Pipe1" (pipe) ');
  });
});
