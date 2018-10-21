const testPackage = require('../../helpers/test-package');
const processorFactory = require('./processCliCommands');
const Dgeni = require('dgeni');

describe('processCliCommands processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('cli-docs-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('processCliCommands');
    expect(processor.$process).toBeDefined();
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['extra-docs-added']);
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['rendering-docs']);
  });

  it('should collect the names (name + aliases)', () => {
    const processor = processorFactory();
    const doc = {
      docType: 'cli-command',
      name: 'name',
      commandAliases: ['alias1', 'alias2'],
      options: [],
    };
    processor.$process([doc]);
    expect(doc.names).toEqual(['name', 'alias1', 'alias2']);
  });

  describe('options', () => {
    it('should remove the hidden options', () => {
      const processor = processorFactory();
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [
          { name: 'option1' },
          { name: 'option2', hidden: true },
          { name: 'option3' },
          { name: 'option4', hidden: true },
        ],
      };
      processor.$process([doc]);
      expect(doc.namedOptions).toEqual([
        jasmine.objectContaining({ name: 'option1' }),
        jasmine.objectContaining({ name: 'option3' }),
      ]);
    });

    it('should collect the non-hidden positional and named options', () => {
      const processor = processorFactory();
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [
          { name: 'named1' },
          { name: 'positional1', positional: 0},
          { name: 'named2', hidden: true },
          { name: 'positional2', hidden: true, positional: 1},
        ],
      };
      processor.$process([doc]);
      expect(doc.positionalOptions).toEqual([
        jasmine.objectContaining({ name: 'positional1', positional: 0}),
      ]);
      expect(doc.namedOptions).toEqual([
        jasmine.objectContaining({ name: 'named1' }),
      ]);
    });

    it('should sort the named options into order by name', () => {
      const processor = processorFactory();
      const doc = {
        docType: 'cli-command',
        name: 'name',
        commandAliases: [],
        options: [
          { name: 'c' },
          { name: 'a' },
          { name: 'b' },
        ],
      };
      processor.$process([doc]);
      expect(doc.namedOptions).toEqual([
        jasmine.objectContaining({ name: 'a' }),
        jasmine.objectContaining({ name: 'b' }),
        jasmine.objectContaining({ name: 'c' }),
      ]);
    });
  });

  describe('subcommands', () => {
    it('should convert subcommands hash into a collection', () => {
      const processor = processorFactory();
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
                { name: 'subcommand1-option1' },
                { name: 'subcommand1-option2' },
              ],
            },
            subcommand2: {
              name: 'subcommand2',
              options: [
                { name: 'subcommand2-option1' },
                { name: 'subcommand2-option2' },
              ],
            }
          },
        }],
      };
      processor.$process([doc]);
      expect(doc.options[0].subcommands).toEqual([
        jasmine.objectContaining({ name: 'subcommand1' }),
        jasmine.objectContaining({ name: 'subcommand2' }),
      ]);
    });

    it('should remove the hidden subcommand options', () => {
      const processor = processorFactory();
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
                { name: 'subcommand1-option1' },
                { name: 'subcommand1-option2', hidden: true },
              ],
            },
            subcommand2: {
              name: 'subcommand2',
              options: [
                { name: 'subcommand2-option1', hidden: true },
                { name: 'subcommand2-option2' },
              ],
            }
          },
        }],
      };
      processor.$process([doc]);
      expect(doc.options[0].subcommands[0].namedOptions).toEqual([
        jasmine.objectContaining({ name: 'subcommand1-option1' }),
      ]);
      expect(doc.options[0].subcommands[1].namedOptions).toEqual([
        jasmine.objectContaining({ name: 'subcommand2-option2' }),
      ]);
    });

    it('should collect the non-hidden positional arguments and named options', () => {
      const processor = processorFactory();
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
                { name: 'subcommand1-option1' },
                { name: 'subcommand1-option2', positional: 0 },
              ],
            },
            subcommand2: {
              name: 'subcommand2',
              options: [
                { name: 'subcommand2-option1', hidden: true },
                { name: 'subcommand2-option2', hidden: true, positional: 1 },
              ],
            }
          },
        }],
      };
      processor.$process([doc]);
      expect(doc.options[0].subcommands[0].positionalOptions).toEqual([
        jasmine.objectContaining({ name: 'subcommand1-option2', positional: 0}),
      ]);
      expect(doc.options[0].subcommands[0].namedOptions).toEqual([
        jasmine.objectContaining({ name: 'subcommand1-option1' }),
      ]);

      expect(doc.options[0].subcommands[1].positionalOptions).toEqual([]);
      expect(doc.options[0].subcommands[1].namedOptions).toEqual([]);
    });

    it('should sort the named subcommand options into order by name', () => {
      const processor = processorFactory();
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
                { name: 'c' },
                { name: 'a' },
                { name: 'b' },
              ]
            }
          }
        }],
      };
      processor.$process([doc]);
      expect(doc.options[0].subcommands[0].namedOptions).toEqual([
        jasmine.objectContaining({ name: 'a' }),
        jasmine.objectContaining({ name: 'b' }),
        jasmine.objectContaining({ name: 'c' }),
      ]);
    });
  });

  it('should add the command to the CLI node in the navigation doc', () => {
    const processor = processorFactory();
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
          { url: 'some/page', title: 'Some Page' },
          { url: 'cli', title: 'CLI Commands', children: [
            { url: 'cli', title: 'Using the CLI' },
          ]},
          { url: 'other/page', title: 'Other Page' },
        ]
      }
    };
    processor.$process([command, navigation]);
    expect(navigation.data.SideNav[1].title).toEqual('CLI Commands');
    expect(navigation.data.SideNav[1].children).toEqual([
      { url: 'cli', title: 'Using the CLI' },
      { url: 'cli/command1', title: 'ng command1' },
    ]);
  });
});
