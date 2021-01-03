const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('processCliCommands processor', () => {

  let dgeni, injector, processor, createDocMessage;

  const navigationStub = {
    docType: 'navigation-json',
    data: {SideNav: [{children: [{'url': 'cli'}]}]}
  };

  beforeEach(() => {
    dgeni = new Dgeni([testPackage('cli-docs-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('processCliCommands');
    createDocMessage = injector.get('createDocMessage');
  });

  it('should be available on the injector', () => { expect(processor.$process).toBeDefined(); });

  it('should run after the correct processor',
     () => { expect(processor.$runAfter).toEqual(['extra-docs-added']); });

  it('should run before the correct processor',
     () => { expect(processor.$runBefore).toEqual(['rendering-docs']); });

  it('should collect the names (name + aliases)', () => {
    const doc = {
      docType: 'cli-command',
      name: 'name',
      commandAliases: ['alias1', 'alias2'],
      options: [],
    };
    processor.$process([doc, navigationStub]);
    expect(doc.names).toEqual(['name', 'alias1', 'alias2']);
  });

  describe('options', () => {
    it('should remove the hidden options', () => {
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [
          {name: 'option1'},
          {name: 'option2', hidden: true},
          {name: 'option3'},
          {name: 'option4', hidden: true},
        ],
      };
      processor.$process([doc, navigationStub]);
      expect(doc.namedOptions).toEqual([
        jasmine.objectContaining({name: 'option1'}),
        jasmine.objectContaining({name: 'option3'}),
      ]);
    });

    it('should collect the non-hidden positional and named options', () => {
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [
          {name: 'named1'},
          {name: 'positional1', positional: 0},
          {name: 'named2', hidden: true},
          {name: 'positional2', hidden: true, positional: 1},
        ],
      };
      processor.$process([doc, navigationStub]);
      expect(doc.positionalOptions).toEqual([
        jasmine.objectContaining({name: 'positional1', positional: 0}),
      ]);
      expect(doc.namedOptions).toEqual([
        jasmine.objectContaining({name: 'named1'}),
      ]);
    });

    it('should sort the named options into order by name', () => {
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [
          {name: 'c'},
          {name: 'a'},
          {name: 'b'},
        ],
      };
      processor.$process([doc, navigationStub]);
      expect(doc.namedOptions).toEqual([
        jasmine.objectContaining({name: 'a'}),
        jasmine.objectContaining({name: 'b'}),
        jasmine.objectContaining({name: 'c'}),
      ]);
    });

    it('should collect potential search terms from options for indexing', () => {
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [
          {name: 'named1'},
          {name: 'positional1', positional: 0},
          {name: 'named2', hidden: true},
          {name: 'positional2', hidden: true, positional: 1},
        ],
      };
      processor.$process([doc, navigationStub]);
      expect(doc.optionKeywords).toEqual('named1 positional1');
    });
  });

  describe('subcommands', () => {
    it('should convert subcommands hash into a collection', () => {
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [{
          name: 'supercommand',
          subcommands: {
            subcommand1: {
              name: 'subcommand1',
              options: [
                {name: 'subcommand1-option1'},
                {name: 'subcommand1-option2'},
              ],
            },
            subcommand2: {
              name: 'subcommand2',
              options: [
                {name: 'subcommand2-option1'},
                {name: 'subcommand2-option2'},
              ],
            }
          },
        }],
      };
      processor.$process([doc, navigationStub]);
      expect(doc.options[0].subcommands).toEqual([
        jasmine.objectContaining({name: 'subcommand1'}),
        jasmine.objectContaining({name: 'subcommand2'}),
      ]);
    });

    it('should remove the hidden subcommand options', () => {
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [{
          name: 'supercommand',
          subcommands: {
            subcommand1: {
              name: 'subcommand1',
              options: [
                {name: 'subcommand1-option1'},
                {name: 'subcommand1-option2', hidden: true},
              ],
            },
            subcommand2: {
              name: 'subcommand2',
              options: [
                {name: 'subcommand2-option1', hidden: true},
                {name: 'subcommand2-option2'},
              ],
            }
          },
        }],
      };
      processor.$process([doc, navigationStub]);
      expect(doc.options[0].subcommands[0].namedOptions).toEqual([
        jasmine.objectContaining({name: 'subcommand1-option1'}),
      ]);
      expect(doc.options[0].subcommands[1].namedOptions).toEqual([
        jasmine.objectContaining({name: 'subcommand2-option2'}),
      ]);
    });

    it('should collect the non-hidden positional arguments and named options', () => {
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [{
          name: 'supercommand',
          subcommands: {
            subcommand1: {
              name: 'subcommand1',
              options: [
                {name: 'subcommand1-option1'},
                {name: 'subcommand1-option2', positional: 0},
              ],
            },
            subcommand2: {
              name: 'subcommand2',
              options: [
                {name: 'subcommand2-option1', hidden: true},
                {name: 'subcommand2-option2', hidden: true, positional: 1},
              ],
            }
          },
        }],
      };
      processor.$process([doc, navigationStub]);
      expect(doc.options[0].subcommands[0].positionalOptions).toEqual([
        jasmine.objectContaining({name: 'subcommand1-option2', positional: 0}),
      ]);
      expect(doc.options[0].subcommands[0].namedOptions).toEqual([
        jasmine.objectContaining({name: 'subcommand1-option1'}),
      ]);

      expect(doc.options[0].subcommands[1].positionalOptions).toEqual([]);
      expect(doc.options[0].subcommands[1].namedOptions).toEqual([]);
    });

    it('should sort the named subcommand options into order by name', () => {
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [{
          name: 'supercommand',
          subcommands: {
            subcommand1: {
              name: 'subcommand1',
              options: [
                {name: 'c'},
                {name: 'a'},
                {name: 'b'},
              ]
            }
          }
        }],
      };
      processor.$process([doc, navigationStub]);
      expect(doc.options[0].subcommands[0].namedOptions).toEqual([
        jasmine.objectContaining({name: 'a'}),
        jasmine.objectContaining({name: 'b'}),
        jasmine.objectContaining({name: 'c'}),
      ]);
    });
  });

  it('should add the command to the CLI node in the navigation doc if there is a first child node with a `cli` url',
     () => {
       const command = {
         docType: 'cli-command',
         name: 'command1',
         commandAliases: ['alias1', 'alias2'],
         options: [],
         path: 'cli/command1',
       };
       const navigation = {
         docType: 'navigation-json',
         data: {
           SideNav: [
             {url: 'some/page', title: 'Some Page'},
             {
               title: 'CLI Commands',
               tooltip: 'Angular CLI command reference',
               children: [{'title': 'Overview', 'url': 'cli'}],
             },
             {url: 'other/page', title: 'Other Page'},
           ],
         },
       };
       processor.$process([command, navigation]);
       expect(navigation.data.SideNav[1].title).toEqual('CLI Commands');
       expect(navigation.data.SideNav[1].children).toEqual([
         {url: 'cli', title: 'Overview'},
         {url: 'cli/command1', title: 'ng command1'},
       ]);
     });

  it('should detect the CLI node if it is nested in another node (as long as there is a first child node with a `cli` url',
     () => {
       const command = {
         docType: 'cli-command',
         name: 'command1',
         commandAliases: ['alias1', 'alias2'],
         options: [],
         path: 'cli/command1',
       };
       const navigation = {
         docType: 'navigation-json',
         data: {
           SideNav: [
             {url: 'some/page', title: 'Some Page'},
             {
               title: 'CLI Commands Grandparent',
               children: [
                 {url: 'some/nested/page', title: 'Some Nested Page'},
                 {
                   title: 'CLI Commands Parent',
                   children: [
                     {url: 'some/more/nested/page', title: 'Some More Nested Page'},
                     {
                       title: 'CLI Commands',
                       tooltip: 'Angular CLI command reference',
                       children: [{'title': 'Overview', 'url': 'cli'}],
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

       processor.$process([command, navigation]);

       const cliCommandsNode = navigation.data.SideNav[1].children[1].children[1];
       expect(cliCommandsNode.title).toEqual('CLI Commands');
       expect(cliCommandsNode.children).toEqual([
         {url: 'cli', title: 'Overview'},
         {url: 'cli/command1', title: 'ng command1'},
       ]);
     });

  it('should complain if there is no child with `cli` url', () => {
    const command = {
      docType: 'cli-command',
      name: 'command1',
      commandAliases: ['alias1', 'alias2'],
      options: [],
      path: 'cli/command1',
    };
    const navigation = {
      docType: 'navigation-json',
      data: {
        SideNav: [
          {url: 'some/page', title: 'Some Page'}, {
            title: 'CLI Commands',
            tooltip: 'Angular CLI command reference',
            children: [{'title': 'Overview', 'url': 'client'}]
          },
          {url: 'other/page', title: 'Other Page'}
        ]
      }
    };
    expect(() => processor.$process([command, navigation]))
        .toThrowError(createDocMessage(
            'Missing `cli` url - CLI Commands must include a first child node with url set at `cli`',
            navigation));
  });

  it('should collect potential search terms from options and its subcommands for indexing', () => {
    const doc = {
      docType: 'cli-command',
      name: 'name',
      commandAliases: [],
      options: [{
        name: 'supercommand',
        subcommands: {
          subcommand1: {
            name: 'subcommand1',
            options: [
              {name: 'subcommand1-option1'},
              {name: 'subcommand1-option2'},
            ],
          },
          subcommand2: {
            name: 'subcommand2',
            options: [
              {name: 'subcommand2-option1'},
              {name: 'subcommand2-option2'},
            ],
          }
        },
      }],
    };
    processor.$process([doc, navigationStub]);
    expect(doc.optionKeywords)
        .toEqual(
            'supercommand subcommand1 subcommand1-option1 subcommand1-option2 subcommand2 subcommand2-option1 subcommand2-option2');
  });

});
