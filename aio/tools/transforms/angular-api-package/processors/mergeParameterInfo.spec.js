const Dgeni = require('dgeni');
const path = require('canonical-path');
const testPackage = require('../../helpers/test-package');

describe('mergeParameterInfo', () => {
  let injector;
  let tsProcessor;
  let mergeParameterInfoProcessor;
  let parseTagsProcessor;
  let extractTagsProcessor;

  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    injector = dgeni.configureInjector();

    tsProcessor = injector.get('readTypeScriptModules');
    parseTagsProcessor = injector.get('parseTagsProcessor');
    extractTagsProcessor = injector.get('extractTagsProcessor');
    mergeParameterInfoProcessor = injector.get('mergeParameterInfo');
    tsProcessor.basePath = path.resolve(__dirname, '../mocks');
    tsProcessor.sourceFiles = ['methodParameters.ts'];
  });

  it('should merge the param tags into the parameter docs', () => {
    const docsArray = [];

    tsProcessor.$process(docsArray);
    parseTagsProcessor.$process(docsArray);
    extractTagsProcessor.$process(docsArray);
    mergeParameterInfoProcessor.$process(docsArray);

    const param5 = docsArray.find(doc => doc.name === 'param5' && doc.container.name === 'method2');
    expect(param5.id).toEqual('methodParameters/TestClass.method2()~param5');
    expect(param5.description).toEqual('description of param5');
    expect(param5.type).toEqual('string');

    const param6 = docsArray.find(doc => doc.name === 'param6' && doc.container.name === 'method2');
    expect(param6.id).toEqual('methodParameters/TestClass.method2()~param6');
    expect(param6.description).toEqual('description of param6');
    expect(param6.type).toEqual('number');

    const param7 = docsArray.find(doc => doc.name === 'param7' && doc.container.name === 'method2');
    expect(param7.id).toEqual('methodParameters/TestClass.method2()~param7');
    expect(param7.description).toEqual('description of param7');
    expect(param7.type).toEqual('number');
    expect(param7.defaultValue).toEqual('42');
  });
});
