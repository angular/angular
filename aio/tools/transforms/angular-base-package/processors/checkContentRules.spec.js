var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('checkContentRules processor', function() {
  let processor, logger;

  beforeEach(function() {
    const dgeni = new Dgeni([testPackage('angular-base-package')]);
    const injector = dgeni.configureInjector();
    processor = injector.get('checkContentRules');
    logger = injector.get('log');
  });

  it('should exist on the injector', () => {
    expect(processor).toBeDefined();
    expect(processor.$process).toEqual(jasmine.any(Function));
  });

  it('shpuld run at the right time', () => {
    expect(processor.$runAfter).toEqual(['tags-extracted']);
    expect(processor.$runBefore).toEqual([]);
  });

  it('should do nothing if not configured', () => {
    const docs = [{ docType: 'test', description: '## heading 2' }];
    processor.$process(docs);
    expect(docs).toEqual([{ docType: 'test', description: '## heading 2' }]);

    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should run configured rules against matching docs', () => {
    const nameSpy1 = jasmine.createSpy('name 1');
    const nameSpy2 = jasmine.createSpy('name 2');
    const nameSpy3 = jasmine.createSpy('name 3');
    const descriptionSpy1 = jasmine.createSpy('description 1');
    const descriptionSpy2 = jasmine.createSpy('description 2');
    const descriptionSpy3 = jasmine.createSpy('description 3');

    processor.docTypeRules = {
      'test1': {
        name: [nameSpy1, nameSpy3],
        description: [descriptionSpy1, descriptionSpy3]
      },
      'test2': {
        name: [nameSpy2],
        description: [descriptionSpy2]
      }
    };

    const docs = [
      { docType: 'test1', description: 'test doc 1', name: 'test-1' },
      { docType: 'test2', description: 'test doc 2', name: 'test-2' },
    ];
    processor.$process(docs);
    expect(nameSpy1).toHaveBeenCalledTimes(1);
    expect(nameSpy1).toHaveBeenCalledWith(docs[0], 'name', 'test-1');
    expect(nameSpy2).toHaveBeenCalledTimes(1);
    expect(nameSpy2).toHaveBeenCalledWith(docs[1], 'name', 'test-2');
    expect(nameSpy3).toHaveBeenCalledTimes(1);
    expect(nameSpy3).toHaveBeenCalledWith(docs[0], 'name', 'test-1');
    expect(descriptionSpy1).toHaveBeenCalledTimes(1);
    expect(descriptionSpy1).toHaveBeenCalledWith(docs[0], 'description', 'test doc 1');
    expect(descriptionSpy2).toHaveBeenCalledTimes(1);
    expect(descriptionSpy2).toHaveBeenCalledWith(docs[1], 'description', 'test doc 2');
    expect(descriptionSpy3).toHaveBeenCalledTimes(1);
    expect(descriptionSpy3).toHaveBeenCalledWith(docs[0], 'description', 'test doc 1');
  });

  it('should log warnings if the rule returns error messages and `failOnContentErrors` is false', () => {
    const nameSpy1 = jasmine.createSpy('name 1').and.returnValue('name error message');
    const descriptionSpy1 = jasmine.createSpy('description 1').and.returnValue('description error message');

    processor.failOnContentErrors = false;
    processor.docTypeRules = {
      'test1': {
        name: [nameSpy1],
        description: [descriptionSpy1]
      }
    };

    const docs = [
      { docType: 'test1', description: 'test doc 1', name: 'test-1' },
      { docType: 'test2', description: 'test doc 2', name: 'test-2' }
    ];

    processor.$process(docs);

    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenCalledWith('Content contains errors');
    expect(logger.warn).toHaveBeenCalledWith(`name error message
        description error message
         - doc "test-1" (test1) `);
  });

  it('should log errors and then throw if `failOnContentErrors` is true and errors are found', () => {
    const nameSpy1 = jasmine.createSpy('name 1').and.returnValue('name error message');
    const descriptionSpy1 = jasmine.createSpy('description 1').and.returnValue('description error message');

    processor.failOnContentErrors = true;
    processor.docTypeRules = {
      'test1': {
        name: [nameSpy1],
        description: [descriptionSpy1]
      }
    };

    const docs = [
      { docType: 'test1', description: 'test doc 1', name: 'test-1' },
      { docType: 'test2', description: 'test doc 2', name: 'test-2' }
    ];

    expect(() => processor.$process(docs)).toThrowError('Stopping due to content errors.');

    expect(logger.error).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledWith('Content contains errors');
    expect(logger.error).toHaveBeenCalledWith(`name error message
        description error message
         - doc "test-1" (test1) `);
  });

  it('should ignore docs whose id contains a barred-o', () => {
    const nameSpy1 = jasmine.createSpy('name 1');
    processor.docTypeRules = { 'doc-type': { name: [nameSpy1] } };
    const docs = [
      { docType: 'doc-type', id: 'package/class/property/param', name: 'name-1' },
      { docType: 'doc-type', id: 'package/class/property/ɵparam', name: 'name-2' },
      { docType: 'doc-type', id: 'package/class/ɵproperty/param', name: 'name-3' },
      { docType: 'doc-type', id: 'package/ɵclass/property/param', name: 'name-4' },
    ];
    processor.$process(docs);
    expect(nameSpy1).toHaveBeenCalledTimes(1);
    expect(nameSpy1).toHaveBeenCalledWith(docs[0], 'name', 'name-1');
  });
});
