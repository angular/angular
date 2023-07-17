const testPackage = require('../../helpers/test-package');
const processorFactory = require('./processPseudoClasses');
const Dgeni = require('dgeni');

describe('processPseudoClasses processor', () => {
  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('processPseudoClasses');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toEqual(['readTypeScriptModules']);
    expect(processor.$runBefore).toEqual(['parsing-tags']);
  });

  it('should convert "interface+const" docs to "class" docs', () => {
    const processor = processorFactory(jasmine.createSpyObj(['getContent']));
    const docs = [
      {docType: 'module', id: 'a'},
      {docType: 'class', id: 'b'},
      {docType: 'interface', id: 'c'},
      {docType: 'interface', id: 'd', additionalDeclarations: []},
      {docType: 'interface', id: 'e', additionalDeclarations: [{}]},
      {docType: 'const', id: 'f'},
      {docType: 'const', id: 'g', additionalDeclarations: []},
      {docType: 'const', id: 'h', additionalDeclarations: [{}]},
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      jasmine.objectContaining({docType: 'module', id: 'a'}),
      jasmine.objectContaining({docType: 'class', id: 'b'}),
      jasmine.objectContaining({docType: 'interface', id: 'c'}),
      jasmine.objectContaining({docType: 'interface', id: 'd'}),

      // This is the only one that changes
      jasmine.objectContaining({docType: 'class', id: 'e', isPseudoClass: true}),

      jasmine.objectContaining({docType: 'const', id: 'f'}),
      jasmine.objectContaining({docType: 'const', id: 'g'}),
      jasmine.objectContaining({docType: 'const', id: 'h'}),
    ]);
  });

  it('should grab the content from the first additional declaration if there is no "real" content already',
     () => {
       const getContent = jasmine.createSpy('getContent').and.returnValue('additional content');
       const additionalDeclaration1 = {};
       const additionalDeclaration2 = {};
       const additionalDeclaration3 = {};
       const processor = processorFactory({getContent});
       const docs = [
         {
           docType: 'interface',
           id: 'a',
           content: 'original content',
           additionalDeclarations: [additionalDeclaration1]
         },
         {
           docType: 'interface',
           id: 'b',
           content: '@publicApi',  // this does not count as "real" content
           additionalDeclarations: [additionalDeclaration2]
         },
         {docType: 'interface', id: 'c', additionalDeclarations: [additionalDeclaration3]},
       ];
       processor.$process(docs);
       expect(docs[0].content).toEqual('original content');
       expect(docs[1].content).toEqual('additional content');
       expect(docs[2].content).toEqual('additional content');
       expect(getContent).toHaveBeenCalledWith(additionalDeclaration1);
       expect(getContent).toHaveBeenCalledWith(additionalDeclaration2);
       expect(getContent).toHaveBeenCalledWith(additionalDeclaration3);
     });

  it('should extract any __new member from the interface members', () => {
    const getContent = jasmine.createSpy('getContent').and.returnValue('additional content');
    const processor = processorFactory({getContent});
    const docs = [
      {docType: 'interface', id: 'a', additionalDeclarations: [{}]},
      {docType: 'interface', id: 'b', additionalDeclarations: [{}], members: []},
      {docType: 'interface', id: 'c', additionalDeclarations: [{}], members: [{name: 'member1'}]},
      {
        docType: 'interface',
        id: 'd',
        additionalDeclarations: [{}],
        members: [{name: 'member1', isNewMember: true}]
      },
    ];
    processor.$process(docs);

    expect(docs[0].members).toEqual(undefined);
    expect(docs[1].members).toEqual([]);
    expect(docs[2].members).toEqual([{name: 'member1'}]);

    expect(docs[3].members).toEqual([]);
    expect(docs[3].constructorDoc).toEqual({name: 'constructor', isNewMember: true});
  });
});
