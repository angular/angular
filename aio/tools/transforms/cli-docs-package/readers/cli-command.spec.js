const cliCommandReaderFactory = require('./cli-command');
const reader = cliCommandReaderFactory();

const content =  {
  'name': 'add',
  'command': 'ng add <collection>',
  'description': 'Add support for a library to your project.',
  'aliases': ['a'],
  'deprecated': false,
  'longDescriptionRelativePath': '@angular/cli/src/commands/add/long-description.md',
  'longDescription': 'Adds the npm package for a published library to your workspace.',
  'options': [
    {
      'name': 'collection',
      'type': 'string',
      'description': 'The package to be added.',
      'positional': 0
    },
    {
      'name': 'defaults',
      'type': 'boolean',
      'default': false,
      'description': 'Disable interactive input prompts for options with a default.'
    },
    {
      'name': 'help',
      'type': 'boolean',
      'description': 'Shows a help message for this command in the console.'
    }
  ]
};

const fileInfo = {
  content: JSON.stringify(content),
  baseName: 'add',
  relativePath: 'add.json',
};

describe('cli-command reader', () => {
  describe('getDocs', () => {
    it('should return an array containing a single doc', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs.length).toEqual(1);
    });

    it('should return a cli-command doc', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0]).toEqual(jasmine.objectContaining({
        id: 'cli-add',
        docType: 'cli-command',
      }));
    });

    it('should extract the name from the fileInfo', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].name).toEqual('add');
    });

    it('should compute the id and aliases', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].id).toEqual('cli-add');
      expect(docs[0].aliases).toEqual(['cli-add', 'cli-a']);
    });

    it('should compute the path and outputPath', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].path).toEqual('cli/add');
      expect(docs[0].outputPath).toEqual('cli/add.json');
    });

    it('should compute the bread crumbs', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].breadCrumbs).toEqual([
        {text: 'CLI', path: 'cli'},
        {text: 'add', path: 'cli/add'},
      ]);
    });

    it('should extract the short description into the content', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].content).toEqual('Add support for a library to your project.');
    });

    it('should extract the long description', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].longDescription)
          .toEqual('Adds the npm package for a published library to your workspace.');
    });

    it('should extract the command aliases', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].commandAliases).toEqual(['a']);
    });

    it('should extract the options', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].options).toEqual([
        jasmine.objectContaining({name: 'collection'}),
        jasmine.objectContaining({name: 'defaults'}),
        jasmine.objectContaining({name: 'help'}),
      ]);
    });

    it('should extract file info for the long description', () => {
      const [doc] = reader.getDocs(fileInfo);
      expect(doc.longDescriptionDoc).toEqual({
        docType: 'content',
        startingLine: 0,
        fileInfo: {projectRelativePath: 'packages/angular/cli/src/commands/add/long-description.md'}
      });
    });
  });
});
