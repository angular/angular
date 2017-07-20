var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('addNotYetDocumentedProperty', function() {
  var dgeni, injector, processor;

  beforeEach(function() {
    dgeni = new Dgeni([testPackage('angular-api-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('addNotYetDocumentedProperty');
  });

  it('should mark export docs with no description as "not yet documented"', function() {
    var a, b, c, d, a1, b1, c1, d1;
    var docs = [
      a = {id: 'a', docType: 'interface', description: 'some content'},
      b = {id: 'b', docType: 'class', description: 'some content'},
      c = {id: 'c', docType: 'var', description: 'some content'},
      d = {id: 'd', docType: 'function', description: 'some content'},
      a1 = {id: 'a1', docType: 'interface', description: ''},
      b1 = {id: 'b1', docType: 'class', description: ''},
      c1 = {id: 'c1', docType: 'var', description: ''},
      d1 = {id: 'd1', docType: 'function', description: ''}
    ];

    processor.$process(docs);

    expect(a.notYetDocumented).toBeFalsy();
    expect(b.notYetDocumented).toBeFalsy();
    expect(c.notYetDocumented).toBeFalsy();
    expect(d.notYetDocumented).toBeFalsy();

    expect(a1.notYetDocumented).toBeTruthy();
    expect(b1.notYetDocumented).toBeTruthy();
    expect(c1.notYetDocumented).toBeTruthy();
    expect(d1.notYetDocumented).toBeTruthy();
  });

  it('should mark member docs with no description as "not yet documented"', function() {
    var a, a1, a2, b, b1, b2, c, c1, c2;
    var docs = [
      a = {
        id: 'a',
        docType: 'interface',
        description: 'some content',
        members: [a1 = {id: 'a1', description: 'some content'}, a2 = {id: 'a2', description: ''}]
      },
      b = {
        id: 'b',
        docType: 'class',
        description: '',
        members: [b1 = {id: 'b1', description: 'some content'}, b2 = {id: 'b2', description: ''}]
      },
      c = {
        id: 'c',
        docType: 'class',
        description: '',
        members: [c1 = {id: 'c1', description: ''}, c2 = {id: 'c2', description: ''}]
      },
    ];

    processor.$process(docs);

    expect(a.notYetDocumented).toBeFalsy();
    expect(b.notYetDocumented).toBeFalsy();
    expect(c.notYetDocumented).toBeTruthy();

    expect(a1.notYetDocumented).toBeFalsy();
    expect(a2.notYetDocumented).toBeTruthy();
    expect(b1.notYetDocumented).toBeFalsy();
    expect(b2.notYetDocumented).toBeTruthy();
    expect(c1.notYetDocumented).toBeTruthy();
    expect(c2.notYetDocumented).toBeTruthy();
  });


  it('should mark constructor doc with no description as "not yet documented"', function() {
    var a, a1, b, b1;
    var docs = [
      a = {
        id: 'a',
        docType: 'interface',
        description: '',
        constructorDoc: a1 = {id: 'a1', description: 'some content'}
      },
      b = {
        id: 'b',
        docType: 'interface',
        description: '',
        constructorDoc: b1 = {id: 'b1', description: ''}
      }
    ];

    processor.$process(docs);

    expect(a.notYetDocumented).toBeFalsy();
    expect(b.notYetDocumented).toBeTruthy();

    expect(a1.notYetDocumented).toBeFalsy();
    expect(b1.notYetDocumented).toBeTruthy();
  });


  it('should not mark documents explicity tagged as `@noDescription`', function() {
    var a, a1, a2, b, b1, b2, c, c1, c2;
    var docs = [
      a = {
        id: 'a',
        docType: 'interface',
        description: 'some content',
        members: [
          a1 = {id: 'a1', description: 'some content'},
          a2 = {id: 'a2', description: '', noDescription: true}
        ]
      },
      b = {
        id: 'b',
        docType: 'class',
        description: '',
        members: [
          b1 = {id: 'b1', description: 'some content'},
          b2 = {id: 'b2', description: '', noDescription: true}
        ]
      },
      c = {
        id: 'c',
        docType: 'class',
        description: '',
        noDescription: true,
        members: [c1 = {id: 'c1', description: ''}, c2 = {id: 'c2', description: ''}]
      },
    ];

    processor.$process(docs);

    expect(a.notYetDocumented).toBeFalsy();
    expect(b.notYetDocumented).toBeFalsy();
    expect(c.notYetDocumented).toBeFalsy();

    expect(a1.notYetDocumented).toBeFalsy();
    expect(a2.notYetDocumented).toBeFalsy();
    expect(b1.notYetDocumented).toBeFalsy();
    expect(b2.notYetDocumented).toBeFalsy();
    expect(c1.notYetDocumented).toBeTruthy();
    expect(c2.notYetDocumented).toBeTruthy();
  });
});
