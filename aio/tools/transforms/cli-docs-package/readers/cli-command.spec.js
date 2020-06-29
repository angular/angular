const cliCommandReaderFactory = require('./cli-command');
const reader = cliCommandReaderFactory();

const content = `
{
  "name": "add",
  "description": "Add support for a library to your project.",
  "longDescription": "Add support for a library in your project, for example adding \`@angular/pwa\` which would configure\\nyour project for PWA support.\\n",
  "hidden": false,
  "type": "custom",
  "options": [
    {
      "name": "collection",
      "description": "The package to be added.",
      "type": "string",
      "required": false,
      "aliases": [],
      "hidden": false,
      "positional": 0
    },
    {
      "name": "help",
      "description": "Shows a help message.",
      "type": "boolean",
      "required": false,
      "aliases": [],
      "hidden": false
    },
    {
      "name": "helpJson",
      "description": "Shows the metadata associated with each flags, in JSON format.",
      "type": "boolean",
      "required": false,
      "aliases": [],
      "hidden": false
    }
  ],
  "aliases": ['a'],
  "scope": "in"
}
`;

const fileInfo = {
  content,
  baseName: 'add',
  relativePath: 'add.json',
  basePath: __dirname + '/mocks/help',
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
          .toEqual(
              'Add support for a library in your project, for example adding `@angular/pwa` which would configure\nyour project for PWA support.\n');
    });

    it('should extract the command type', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].type).toEqual('custom');
    });

    it('should extract the command scope', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].scope).toEqual('in');
    });

    it('should extract the command aliases', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].commandAliases).toEqual(['a']);
    });

    it('should extract the options', () => {
      const docs = reader.getDocs(fileInfo);
      expect(docs[0].options).toEqual([
        jasmine.objectContaining({name: 'collection'}),
        jasmine.objectContaining({name: 'help'}),
        jasmine.objectContaining({name: 'helpJson'}),
      ]);
    });

    it('should extract file info for the long description', () => {
      const [doc] = reader.getDocs(fileInfo);
      expect(doc.longDescriptionDoc).toEqual({
        docType: 'content',
        startingLine: 0,
        fileInfo: {realProjectRelativePath: 'packages/angular/cli/commands/add-long.md'}
      });
    });
  });
});
