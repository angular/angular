var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('extractDecoratedClasses processor', function() {
  var dgeni, injector, processor;

  beforeEach(function() {
    dgeni = new Dgeni([testPackage('angular-api-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('extractDecoratedClassesProcessor');
  });

  it('should extract specified decorator arguments', function() {
    var doc1 = {
      id: '@angular/common/ngFor',
      name: 'ngFor',
      docType: 'class',
      decorators: [{
        name: 'Directive',
        arguments: ['{selector: \'[ng-for][ng-for-of]\', properties: [\'ngForOf\']}'],
        argumentInfo: [{selector: '[ng-for][ng-for-of]', properties: ['ngForOf']}]
      }]
    };
    var doc2 = {
      id: '@angular/core/DecimalPipe',
      name: 'DecimalPipe',
      docType: 'class',
      decorators:
          [{name: 'Pipe', arguments: ['{name: \'number\'}'], argumentInfo: [{name: 'number'}]}]
    };

    processor.$process([doc1, doc2]);

    expect(doc1).toEqual(jasmine.objectContaining({
      id: '@angular/common/ngFor',
      name: 'ngFor',
      docType: 'directive',
      directiveOptions: {selector: '[ng-for][ng-for-of]', properties: ['ngForOf']}
    }));

    expect(doc2).toEqual(jasmine.objectContaining({
      id: '@angular/core/DecimalPipe',
      name: 'DecimalPipe',
      docType: 'pipe',
      pipeOptions: {name: 'number'}
    }));
  });
});