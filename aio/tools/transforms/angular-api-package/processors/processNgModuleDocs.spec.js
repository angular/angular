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

  it('should convert non-array NgModule options to arrays', () => {
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
    const directiveOptions = { selector: 'some-selector' };
    const ngModule1 = { docType: 'ngmodule', id: 'NgModule1', aliases: ['NgModule1'], ngmoduleOptions: {} };
    const ngModule2 = { docType: 'ngmodule', id: 'NgModule2', aliases: ['NgModule2'], ngmoduleOptions: {} };
    const directive1 = { docType: 'directive', id: 'Directive1', ngModules: ['NgModule1'], directiveOptions };
    const directive2 = { docType: 'directive', id: 'Directive2', ngModules: ['NgModule2'], directiveOptions };
    const directive3 = { docType: 'directive', id: 'Directive3', ngModules: ['NgModule1', 'NgModule2'], directiveOptions };
    const pipe1 = { docType: 'pipe', id: 'Pipe1', ngModules: ['NgModule1'] };
    const pipe2 = { docType: 'pipe', id: 'Pipe2', ngModules: ['NgModule2'] };
    const pipe3 = { docType: 'pipe', id: 'Pipe3', ngModules: ['NgModule1', 'NgModule2'] };

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

  it('should link classes that have a `providedIn` property on an @Injectable decorator that references a known NgModule doc', () => {
    const ngModule1 = { docType: 'ngmodule', id: 'NgModule1', aliases: ['NgModule1'], ngmoduleOptions: {} };
    const ngModule2 = { docType: 'ngmodule', id: 'NgModule2', aliases: ['NgModule2'], ngmoduleOptions: {} };
    const injectable1 = { docType: 'class', name: 'Injectable1', decorators: [{ name: 'Injectable', argumentInfo: [{ providedIn: '\'root\'' }] }] };
    const injectable2 = { docType: 'class', name: 'Injectable2', decorators: [{ name: 'Injectable', argumentInfo: [{ providedIn: '\'platform\'' }] }] };
    const injectable3 = { docType: 'class', name: 'Injectable3', decorators: [{ name: 'Injectable', argumentInfo: [{ providedIn: '"root"' }] }] };
    const injectable4 = { docType: 'class', name: 'Injectable4', decorators: [{ name: 'Injectable', argumentInfo: [{ providedIn: '"platform"' }] }] };
    const injectable5 = { docType: 'class', name: 'Injectable5', decorators: [{ name: 'Injectable', argumentInfo: [{ providedIn: 'NgModule1' }] }] };
    const injectable6 = { docType: 'class', name: 'Injectable6', decorators: [{ name: 'Injectable', argumentInfo: [{ providedIn: 'NgModule2' }] }] };
    const injectable7 = { docType: 'class', name: 'Injectable7' };
    const nonInjectable = { docType: 'class', name: 'nonInjectable' };

    const aliasMap = injector.get('aliasMap');
    aliasMap.addDoc(ngModule1);
    aliasMap.addDoc(ngModule2);
    processor.$process([ngModule1, ngModule2, injectable1, injectable2, injectable3, injectable4, injectable5, injectable6, injectable7, nonInjectable]);

    expect(ngModule1.providers).toEqual(['{ provide: Injectable5, useClass: Injectable5 }']);
    expect(ngModule2.providers).toEqual(['{ provide: Injectable6, useClass: Injectable6 }']);

    expect(injectable1.ngModules).toEqual(['root']);
    expect(injectable2.ngModules).toEqual(['platform']);
    expect(injectable3.ngModules).toEqual(['root']);
    expect(injectable4.ngModules).toEqual(['platform']);
    expect(injectable5.ngModules).toEqual([ngModule1]);
    expect(injectable6.ngModules).toEqual([ngModule2]);
    expect(injectable7.ngModules).toBeUndefined();
    expect(nonInjectable.ngModules).toBeUndefined();
  });

  it('should link classes that have a `providedIn` property on a ɵprov static that references a known NgModule doc', () => {
    const ngModule1 = { docType: 'ngmodule', id: 'NgModule1', aliases: ['NgModule1'], ngmoduleOptions: {} };
    const ngModule2 = { docType: 'ngmodule', id: 'NgModule2', aliases: ['NgModule2'], ngmoduleOptions: {} };
    const injectable1 = { docType: 'class', name: 'Injectable1', symbol: createSymbolWithProvider('\'root\'') };
    const injectable2 = { docType: 'class', name: 'Injectable2', symbol: createSymbolWithProvider('\'platform\'') };
    const injectable3 = { docType: 'class', name: 'Injectable3', symbol: createSymbolWithProvider('"root"') };
    const injectable4 = { docType: 'class', name: 'Injectable4', symbol: createSymbolWithProvider('"platform"') };
    const injectable5 = { docType: 'class', name: 'Injectable5', symbol: createSymbolWithProvider('NgModule1') };
    const injectable6 = { docType: 'class', name: 'Injectable6', symbol: createSymbolWithProvider('NgModule2') };
    const injectable7 = { docType: 'class', name: 'Injectable7' };
    const nonInjectable = { docType: 'class', name: 'nonInjectable' };

    const aliasMap = injector.get('aliasMap');
    aliasMap.addDoc(ngModule1);
    aliasMap.addDoc(ngModule2);
    processor.$process([ngModule1, ngModule2, injectable1, injectable2, injectable3, injectable4, injectable5, injectable6, injectable7, nonInjectable]);

    expect(ngModule1.providers).toEqual(['{ provide: Injectable5, useClass: Injectable5 }']);
    expect(ngModule2.providers).toEqual(['{ provide: Injectable6, useClass: Injectable6 }']);

    expect(injectable1.ngModules).toEqual(['root']);
    expect(injectable2.ngModules).toEqual(['platform']);
    expect(injectable3.ngModules).toEqual(['root']);
    expect(injectable4.ngModules).toEqual(['platform']);
    expect(injectable5.ngModules).toEqual([ngModule1]);
    expect(injectable6.ngModules).toEqual([ngModule2]);
    expect(injectable7.ngModules).toBeUndefined();
    expect(nonInjectable.ngModules).toBeUndefined();
  });

  it('should link injectables that are marked with `@ngModule` JSDOC tags', () => {
    const ngModule1 = { docType: 'ngmodule', id: 'NgModule1', aliases: ['NgModule1'], ngmoduleOptions: {} };
    const ngModule2 = { docType: 'ngmodule', id: 'NgModule2', aliases: ['NgModule2'], ngmoduleOptions: { providers: ['PROVIDER'] } };
    const injectable1 = { docType: 'class', name: 'Injectable1', ngModules: ['NgModule1'] };
    const injectable2 = { docType: 'class', name: 'Injectable2', ngModules: ['NgModule2'] };
    const injectable3 = { docType: 'class', name: 'Injectable3' };
    const nonInjectable = { docType: 'class', name: 'nonInjectable' };

    const aliasMap = injector.get('aliasMap');
    aliasMap.addDoc(ngModule1);
    aliasMap.addDoc(ngModule2);
    processor.$process([ngModule1, ngModule2, injectable1, injectable2, injectable3, nonInjectable]);

    // Should not update the NgModule docs in this case.
    expect(ngModule1.providers).toBeUndefined();
    expect(ngModule2.providers).toEqual(['PROVIDER']);

    expect(injectable1.ngModules).toEqual([ngModule1]);
    expect(injectable2.ngModules).toEqual([ngModule2]);
    expect(injectable3.ngModules).toBeUndefined();
    expect(nonInjectable.ngModules).toBeUndefined();
  });

  it('should link injectables that are parsed out of `@NgModule` decorators', () => {
    const ngModule1 = { docType: 'ngmodule', id: 'NgModule1', ngmoduleOptions: { providers: ['Injectable1', '{ provide: Injectable2, useClass: Injectable2 }'] } };
    const ngModule2 = { docType: 'ngmodule', id: 'NgModule2', ngmoduleOptions: { providers: ['{ provide: Injectable3, useValue: {} }'] } };
    const injectable1 = { docType: 'class', name: 'Injectable1', aliases: ['Injectable1'] };
    const injectable2 = { docType: 'class', name: 'Injectable2', aliases: ['Injectable2'] };
    const injectable3 = { docType: 'class', name: 'Injectable3', aliases: ['Injectable3'] };

    const aliasMap = injector.get('aliasMap');
    aliasMap.addDoc(injectable1);
    aliasMap.addDoc(injectable2);
    aliasMap.addDoc(injectable3);
    processor.$process([ngModule1, ngModule2, injectable1, injectable2, injectable3]);

    expect(injectable1.ngModules).toEqual([ngModule1]);
    expect(injectable2.ngModules).toEqual([ngModule1]);
    expect(injectable3.ngModules).toEqual([ngModule2]);
  });

  it('should error if an injectable that has a `providedIn` property that references an unknown NgModule doc', () => {
    const log = injector.get('log');
    const injectable = { docType: 'class', name: 'Injectable1', decorators: [{ name: 'Injectable', argumentInfo: [{ providedIn: 'NgModuleRef' }] }] };

    expect(() => {
      processor.$process([injectable]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      'The referenced "NgModuleRef" does not match a public NgModule - doc "Injectable1" (class) ');
  });

  it('should error if an injectable that has a `providedIn` property that references an ambiguous NgModule doc', () => {
    const log = injector.get('log');

    const ngModule1 = { docType: 'ngmodule', id: 'NgModule1', aliases: ['NgModuleRef'], ngmoduleOptions: {} };
    const ngModule2 = { docType: 'ngmodule', id: 'NgModule2', aliases: ['NgModuleRef'], ngmoduleOptions: {} };
    const injectable = { docType: 'class', name: 'Injectable1', decorators: [{ name: 'Injectable', argumentInfo: [{ providedIn: 'NgModuleRef' }] }] };

    const aliasMap = injector.get('aliasMap');
    aliasMap.addDoc(ngModule1);
    aliasMap.addDoc(ngModule2);

    expect(() => {
      processor.$process([injectable]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      'The referenced "NgModuleRef" is ambiguous. Matches: NgModule1, NgModule2 - doc "Injectable1" (class) ');
  });

  it('should not error if an abstract directive does not have a `@ngModule` tag', () => {
    expect(() => {
      processor.$process([{ docType: 'directive', id: 'AbstractDir', directiveOptions: {} }]);
    }).not.toThrow();

    expect(() => {
      processor.$process([{
        docType: 'directive', id: 'AbstractDir',
        directiveOptions: { selector: undefined }
      }]);
    }).not.toThrow();
  });

  it('should error if a pipe/directive does not have a `@ngModule` tag', () => {
    const log = injector.get('log');
    expect(() => {
      processor.$process([{
        docType: 'directive', id: 'Directive1',
        directiveOptions: { selector: 'dir1' }
      }]);
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
      processor.$process([{
        docType: 'directive', id: 'Directive1', ngModules: ['MissingNgModule'],
        directiveOptions: { selector: 'dir1' }
      }]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      'The referenced "MissingNgModule" does not match a public NgModule - doc "Directive1" (directive) ');

    expect(() => {
      processor.$process([{ docType: 'pipe', id: 'Pipe1', ngModules: ['MissingNgModule'] }]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      'The referenced "MissingNgModule" does not match a public NgModule - doc "Pipe1" (pipe) ');
  });

  it('should error if a pipe/directive has an @ngModule tag that matches more than one NgModule doc', () => {
    const aliasMap = injector.get('aliasMap');
    const log = injector.get('log');
    const ngModule1 = { docType: 'ngmodule', id: 'NgModule1', aliases: ['NgModuleAlias'], ngmoduleOptions: {} };
    const ngModule2 = { docType: 'ngmodule', id: 'NgModule2', aliases: ['NgModuleAlias'], ngmoduleOptions: {} };
    aliasMap.addDoc(ngModule1);
    aliasMap.addDoc(ngModule2);

    expect(() => {
      processor.$process([{
        docType: 'directive', id: 'Directive1', ngModules: ['NgModuleAlias'],
        directiveOptions: { selector: 'dir1' }
      }]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      'The referenced "NgModuleAlias" is ambiguous. Matches: NgModule1, NgModule2 - doc "Directive1" (directive) ');

    expect(() => {
      processor.$process([{ docType: 'pipe', id: 'Pipe1', ngModules: ['NgModuleAlias'] }]);
    }).toThrowError('Failed to process NgModule relationships.');
    expect(log.error).toHaveBeenCalledWith(
      'The referenced "NgModuleAlias" is ambiguous. Matches: NgModule1, NgModule2 - doc "Pipe1" (pipe) ');
  });
});

/**
 * This function simulates a TypeScript AST node for the code:
 *
 * ```
 * static ɵprov = ɵɵdefineInjectable({
 *   providedIn: 'xxxx',
 * });
 * ```
 */
function createSymbolWithProvider(providedIn) {
  const initializer = {
    pos: 0,
    end: providedIn.length,
    getSourceFile() {
      return { text: providedIn };
    }
  };
  const valueDeclaration = { initializer: { arguments: [{ properties: [{ name: { text: 'providedIn' }, initializer }] }] } };
  const exportMap = new Map();
  exportMap.set('ɵprov', { valueDeclaration });
  return { exports: exportMap };
}