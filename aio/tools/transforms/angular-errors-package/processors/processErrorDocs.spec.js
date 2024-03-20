const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('processErrorDocs processor', () => {
  let dgeni, injector, processor, createDocMessage;

  beforeEach(() => {
    dgeni = new Dgeni([testPackage('angular-errors-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('processErrorDocs');
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

  it('should add the error to the `errors` node in the navigation doc if there is a top level node with a `errors` url',
     () => {
       const errorDoc = {
         docType: 'error',
         name: 'error1',
         code: '888',
         path: 'errors/error1',
       };
       const navigation = {
         docType: 'navigation-json',
         data: {
           SideNav: [
             {url: 'some/page', title: 'Some Page'},
             {
               title: 'Errors',
               children: [{'title': 'Overview', 'url': 'errors'}],
             },
             {url: 'other/page', title: 'Other Page'},
           ],
         },
       };
       processor.$process([errorDoc, navigation]);
       expect(navigation.data.SideNav[1].title).toEqual('Errors');
       expect(navigation.data.SideNav[1].children).toEqual([
         {url: 'errors', title: 'Overview'},
         {url: 'errors/error1', title: '888: error1', tooltip: 'error1'},
       ]);
     });

  it('should detect the `errors` node if it is nested in another node', () => {
    const errorDoc = {
      docType: 'error',
      name: 'error1',
      code: '888',
      path: 'errors/error1',
    };
    const navigation = {
      docType: 'navigation-json',
      data: {
        SideNav: [
          {url: 'some/page', title: 'Some Page'},
          {
            title: 'Errors Grandparent',
            children: [
              {url: 'some/nested/page', title: 'Some Nested Page'},
              {
                title: 'Errors Parent',
                children: [
                  {url: 'some/more/nested/page', title: 'Some More Nested Page'},
                  {
                    title: 'Errors',
                    children: [{'title': 'Overview', 'url': 'errors'}],
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

    processor.$process([errorDoc, navigation]);

    const errorsContainerNode = navigation.data.SideNav[1].children[1].children[1];
    expect(errorsContainerNode.title).toEqual('Errors');
    expect(errorsContainerNode.children).toEqual([
      {url: 'errors', title: 'Overview'},
      {url: 'errors/error1', title: '888: error1', tooltip: 'error1'},
    ]);
  });

  it('should complain if there is no child with `errors` url', () => {
    const errorDoc = {
      docType: 'error',
      name: 'error1',
      code: '888',
      path: 'errors/error1',
    };
    const navigation = {
      docType: 'navigation-json',
      data: {
        SideNav: [
          {url: 'some/page', title: 'Some Page'}, {
            title: 'Errors',
            tooltip: 'Angular Error reference',
            children: [{'title': 'Overview', 'url': 'not-errors'}]
          },
          {url: 'other/page', title: 'Other Page'}
        ]
      }
    };
    expect(() => processor.$process([errorDoc, navigation]))
        .toThrowError(createDocMessage(
            'Missing `errors` url - This node is needed as a place to insert the generated errors docs.',
            navigation));
  });
});
