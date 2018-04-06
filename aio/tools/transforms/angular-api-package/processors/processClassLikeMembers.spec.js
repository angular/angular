const testPackage = require('../../helpers/test-package');
const processorFactory = require('./processClassLikeMembers');
const Dgeni = require('dgeni');

const property1 = { description: 'property 1' };
const property2 = { description: 'property 2' };
const getter1 = { parameters: [], isGetAccessor: true, description: 'getter 1' };
const setter1 = { parameters: [], isSetAccessor: true, description: 'setter 1' };
const method1 = { parameters: [] };
const method2 = { parameters: [] };
const method3 = { parameters: [] };

describe('angular-api-package: processClassLikeMembers processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('processClassLikeMembers');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toEqual(['filterContainedDocs']);
    expect(processor.$runBefore).toEqual(['rendering-docs']);
  });

  it('should copy instance members into properties and methods', () => {
    const processor = processorFactory();
    const docs = [
      { members: [ property1, method1, getter1] },
      { members: [ method2, property2, method3, setter1] },
      { }
    ];
    processor.$process(docs);

    expect(docs[0].properties).toEqual([property1, getter1]);
    expect(docs[0].methods).toEqual([method1]);

    expect(docs[1].properties).toEqual([property2, setter1]);
    expect(docs[1].methods).toEqual([method2, method3]);

    expect(docs[2].properties).toBeUndefined();
    expect(docs[2].methods).toBeUndefined();
  });

  it('should copy static members into properties and methods', () => {
    const processor = processorFactory();
    const docs = [
      { statics: [ property1, method1, getter1] },
      { statics: [ method2, property2, method3, setter1] },
      { }
    ];
    processor.$process(docs);

    expect(docs[0].staticProperties).toEqual([property1, getter1]);
    expect(docs[0].staticMethods).toEqual([method1]);

    expect(docs[1].staticProperties).toEqual([property2, setter1]);
    expect(docs[1].staticMethods).toEqual([method2, method3]);

    expect(docs[2].staticProperties).toBeUndefined();
    expect(docs[2].staticMethods).toBeUndefined();
  });

  it('should wire up properties that are declared as parameters on the constructor to its associated parameter doc', () => {
    const processor = processorFactory();
    const propertyDeclaration = {};
    const parameterDoc1 = { declaration: {} };
    const parameterDoc2 = { declaration: propertyDeclaration };
    const parameterDoc3 = { declaration: {} };
    const property = {
      declaration: propertyDeclaration,
      containerDoc: {
        constructorDoc: {
          parameterDocs: [ parameterDoc1, parameterDoc2, parameterDoc3 ]
        }
      }
    };
    const docs = [{ members: [ property] }];
    processor.$process(docs);

    expect(property.constructorParamDoc).toEqual(parameterDoc2);
  });
});
