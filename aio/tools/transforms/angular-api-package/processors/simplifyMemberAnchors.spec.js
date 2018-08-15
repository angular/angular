const testPackage = require('../../helpers/test-package');
const processorFactory = require('./simplifyMemberAnchors');
const Dgeni = require('dgeni');

describe('simplifyMemberAnchors processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('simplifyMemberAnchors');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toEqual(['paths-computed']);
    expect(processor.$runBefore).toEqual(['rendering-docs']);
  });

  describe('$process', () => {
    describe('docs without members', () => {
      it('should ignore the docs', () => {
        const processor = processorFactory();
        const docs = [
          { id: 'some-doc' },
          { id: 'some-other' }
        ];
        processor.$process(docs);
        expect(docs).toEqual([
          { id: 'some-doc' },
          { id: 'some-other' }
        ]);
      });
    });

    describe('docs with members', () => {
      it('should compute an anchor for each instance member', () => {
        const processor = processorFactory();
        const docs = [
          { id: 'some-doc', members: [ { name: 'foo' }, { name: 'new' }, { name: '' } ] }
        ];
        processor.$process(docs);
        expect(docs[0].members.map(member => member.anchor)).toEqual(['foo', 'new', 'call']);
      });

      it('should compute a path for each instance member', () => {
        const processor = processorFactory();
        const docs = [
          { id: 'some-doc', path: 'a/b/c', members: [ { name: 'foo' }, { name: 'new' }, { name: '' } ] }
        ];
        processor.$process(docs);
        expect(docs[0].members.map(member => member.path)).toEqual(['a/b/c#foo', 'a/b/c#new', 'a/b/c#call']);
      });
    });

    describe('docs with static members', () => {
      it('should compute an anchor for each static member', () => {
        const processor = processorFactory();
        const docs = [
          { id: 'some-doc', statics: [ { name: 'foo' }, { name: 'new' }, { name: '' } ] }
        ];
        processor.$process(docs);
        expect(docs[0].statics.map(member => member.anchor)).toEqual(['foo', 'new', 'call']);
      });

      it('should compute a path for each static member', () => {
        const processor = processorFactory();
        const docs = [
          { id: 'some-doc', path: 'a/b/c', statics: [ { name: 'foo' }, { name: 'new' }, { name: '' } ] }
        ];
        processor.$process(docs);
        expect(docs[0].statics.map(member => member.path)).toEqual(['a/b/c#foo', 'a/b/c#new', 'a/b/c#call']);
      });
    });
  });
});
