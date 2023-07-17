const Dgeni = require('dgeni');
const testPackage = require('../../helpers/test-package');

describe('processExtendedDiagnosticDocs processor', () => {
  let dgeni, injector, processor, createDocMessage;

  beforeEach(() => {
    dgeni = new Dgeni([testPackage('angular-extended-diagnostics-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('processExtendedDiagnosticDocs');
    createDocMessage = injector.get('createDocMessage');
  });

  it('should be available on the injector', () => {
    expect(processor.$process).toBeDefined();
  });

  it('should run after the correct processor', () => {
    expect(processor.$runAfter).toEqual(['extra-docs-added']);
  });

  it('should run before the correct processor', () => {
    expect(processor.$runBefore).toEqual(['rendering-docs']);
  });

  it(
    'should add the extended diagnostic to the `extended-diagnostics` node in the navigation doc ' +
    'if there is a top level node with an `extended-diagnostics` url',
     () => {
       const diagnosticDoc = {
         docType: 'extended-diagnostic',
         code: '1337',
         name: 'diagnostic1',
         path: 'extended-diagnostics/diagnostic1',
       };
       const navigation = {
         docType: 'navigation-json',
         data: {
           SideNav: [
             {url: 'some/page', title: 'Some Page'},
             {
               title: 'Extended diagnostics',
               children: [{title: 'Overview', url: 'extended-diagnostics'}],
             },
             {url: 'other/page', title: 'Other Page'},
           ],
         },
       };
       processor.$process([diagnosticDoc, navigation]);
       expect(navigation.data.SideNav[1].title).toBe('Extended diagnostics');
       expect(navigation.data.SideNav[1].children).toEqual([
         {url: 'extended-diagnostics', title: 'Overview'},
         {
           url: 'extended-diagnostics/diagnostic1',
           title: '1337: diagnostic1',
           tooltip: 'diagnostic1',
         },
       ]);
     });

  it('should detect the `extended-diagnostics` node if it is nested in another node', () => {
    const diagnosticDoc = {
      docType: 'extended-diagnostic',
      code: '1337',
      name: 'diagnostic1',
      path: 'extended-diagnostics/diagnostic1',
    };
    const navigation = {
      docType: 'navigation-json',
      data: {
        SideNav: [
          {url: 'some/page', title: 'Some Page'},
          {
            title: 'Extended diagnostics grandparent',
            children: [
              {url: 'some/nested/page', title: 'Some Nested Page'},
              {
                title: 'Extended diagnostics parent',
                children: [
                  {url: 'some/more/nested/page', title: 'Some More Nested Page'},
                  {
                    title: 'Extended diagnostics',
                    children: [{title: 'Overview', url: 'extended-diagnostics'}],
                  },
                  {url: 'other/more/nested/page', title: 'Other More Nested Page'},
                ],
              },
              {url: 'other/nested/page', title: 'Other Nested Page'},
            ],
          },
          {url: 'other/page', title: 'Other Page'},
        ],
      },
    };

    processor.$process([diagnosticDoc, navigation]);

    const diagnosticsContainerNode = navigation.data.SideNav[1].children[1].children[1];
    expect(diagnosticsContainerNode.title).toBe('Extended diagnostics');
    expect(diagnosticsContainerNode.children).toEqual([
      {url: 'extended-diagnostics', title: 'Overview'},
      {url: 'extended-diagnostics/diagnostic1', title: '1337: diagnostic1', tooltip: 'diagnostic1'},
    ]);
  });

  it('should complain if there is no child with `extended-diagnostics` url', () => {
    const diagnosticDoc = {
      docType: 'extended-diagnostic',
      code: '1337',
      name: 'diagnostic1',
      path: 'extended-diagnostics/diagnostic1',
    };
    const navigation = {
      docType: 'navigation-json',
      data: {
        SideNav: [
          {url: 'some/page', title: 'Some Page'}, {
            title: 'Extended diagnostics',
            tooltip: 'Angular extended diagnostic reference',
            children: [{title: 'Overview', url: 'not-extended-diagnostics'}],
          },
          {url: 'other/page', title: 'Other Page'},
        ]
      }
    };
    expect(() => processor.$process([diagnosticDoc, navigation]))
        .toThrowError(createDocMessage(
            'Missing `extended-diagnostics` url - This node is needed as a place to insert the ' +
            'generated extended diagnostics docs.',
            navigation));
  });
});
