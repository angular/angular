const testPackage = require('../../helpers/test-package');
const processorFactory = require('./addMetadataAliases');
const Dgeni = require('dgeni');

describe('addSelectorsAsAliases processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('addMetadataAliasesProcessor');
    expect(processor.$process).toBeDefined();
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['extractDecoratedClassesProcessor']);
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['computing-ids']);
  });

  it('should add new aliases for directives, components and pipes', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'class', name: 'MyClass', aliases: ['MyClass'] },
      { docType: 'interface', name: 'MyInterface', aliases: ['MyInterface'] },
      { docType: 'enum', name: 'MyEnum', aliases: ['MyEnum'] },
      { docType: 'function', name: 'myFunction', aliases: ['myFunction'] },
      { docType: 'pipe', name: 'MyPipe', aliases: ['MyPipe'], pipeOptions: { name: '\'myPipe\'' } },
      { docType: 'directive', name: 'MyDirective', aliases: ['MyDirective'], directiveOptions: { selector: '\'my-directive,[myDirective],[my-directive]\'' } },
      { docType: 'directive', name: 'NgModel', aliases: ['NgModel'], directiveOptions: { selector: '\'[ngModel]:not([formControlName]):not([formControl])\'' } },
      { docType: 'component', name: 'MyComponent', aliases: ['MyComponent'], componentOptions: { selector: '\'my-component\'' } },
      { docType: 'decorator', name: 'MyDecorator', aliases: ['MyDecorator'] },
      { docType: 'module', name: 'myModule', aliases: ['myModule'], id: 'some/myModule' },
      { docType: 'var', name: 'myVar', aliases: ['myVar'] },
      { docType: 'let', name: 'myLet', aliases: ['myLet'] },
      { docType: 'const', name: 'myConst', aliases: ['myConst'] },
      { docType: 'type-alias', name: 'myType', aliases: ['myType'] },
    ];
    processor.$process(docs);
    expect(docs[0].aliases).toEqual([docs[0].name]);
    expect(docs[1].aliases).toEqual([docs[1].name]);
    expect(docs[2].aliases).toEqual([docs[2].name]);
    expect(docs[3].aliases).toEqual([docs[3].name]);
    expect(docs[4].aliases).toEqual([docs[4].name, 'myPipe']);
    expect(docs[5].aliases).toEqual([docs[5].name, 'my-directive', 'myDirective']);
    expect(docs[6].aliases).toEqual([docs[6].name, 'ngModel']);
    expect(docs[7].aliases).toEqual([docs[7].name, 'my-component']);
    expect(docs[8].aliases).toEqual([docs[8].name]);
    expect(docs[9].aliases).toEqual([docs[9].name]);
    expect(docs[10].aliases).toEqual([docs[10].name]);
    expect(docs[11].aliases).toEqual([docs[11].name]);
    expect(docs[12].aliases).toEqual([docs[12].name]);
  });
});
