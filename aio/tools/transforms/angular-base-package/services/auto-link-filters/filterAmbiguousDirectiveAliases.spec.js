const filterAmbiguousDirectiveAliases = require('./filterAmbiguousDirectiveAliases')();

const words = ['Http', 'ngModel', 'NgModel', 'NgControlStatus'];

describe('filterAmbiguousDirectiveAliases(docs, words, index)', () => {
  it('should not try to filter the docs, if the docs are not all directives or components', () => {
    const docs = [
      { docType: 'class', name: 'Http' },
      { docType: 'directive', name: 'NgModel', directiveOptions: { selector: '[ngModel]' } },
      { docType: 'component', name: 'NgModel', componentOptions: { selector: '[ngModel]' } }
    ];
    // take a copy to prove `docs` was not modified
    const filteredDocs = docs.slice(0);
    expect(filterAmbiguousDirectiveAliases(docs, words, 1)).toEqual(filteredDocs);
    expect(filterAmbiguousDirectiveAliases(docs, words, 2)).toEqual(filteredDocs);
  });

  describe('(where all the docs are components or directives', () => {
    describe('and do not all contain the matching word in their selector)', () => {
      it('should not try to filter the docs', () => {
        const docs = [
          { docType: 'directive', name: 'NgModel', ['directiveOptions']: { selector: '[ngModel]' } },
          { docType: 'component', name: 'NgControlStatus', ['componentOptions']: { selector: '[ngControlStatus]' } }
        ];
        // take a copy to prove `docs` was not modified
        const filteredDocs = docs.slice(0);
        expect(filterAmbiguousDirectiveAliases(docs, words, 1)).toEqual(filteredDocs);
        expect(filterAmbiguousDirectiveAliases(docs, words, 2)).toEqual(filteredDocs);

        // Also test that the check is case-sensitive
        docs[1].componentOptions.selector = '[ngModel]';
        filteredDocs[1].componentOptions.selector = '[ngModel]';
        expect(filterAmbiguousDirectiveAliases(docs, words, 2)).toEqual(filteredDocs);
      });
    });

    describe('and do all contain the matching word in there selector)', () => {
      it('should filter out docs whose class name is not (case-insensitively) equal to the matching word', () => {
        const docs = [
          { docType: 'directive', name: 'NgModel', ['directiveOptions']: { selector: '[ngModel],[ngControlStatus]' } },
          { docType: 'component', name: 'NgControlStatus', ['componentOptions']: { selector: '[ngModel],[ngControlStatus]' } }
        ];
        const filteredDocs = [
          { docType: 'directive', name: 'NgModel', ['directiveOptions']: { selector: '[ngModel],[ngControlStatus]' } }
        ];
        expect(filterAmbiguousDirectiveAliases(docs, words, 1)).toEqual(filteredDocs);
      });
    });
  });
});
