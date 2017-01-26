var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('cheatsheetItemParser', function() {
  var dgeni, injector, cheatsheetItemParser;

  beforeEach(function() {
    dgeni = new Dgeni([testPackage('cheatsheet-package')]);
    injector = dgeni.configureInjector();
    cheatsheetItemParser = injector.get('cheatsheetItemParser');
    var targetEnvironments = injector.get('targetEnvironments');
    targetEnvironments.addAllowed('js');
    targetEnvironments.addAllowed('ts', true);
  });

  describe('no language targets', function() {
    it('should extract the syntax', function() {
      expect(cheatsheetItemParser('syntax:\n`abc`'))
          .toEqual({syntax: 'abc', bold: [], description: ''});
    });

    it('should extract the bolds', function() {
      expect(cheatsheetItemParser('syntax:\n`abc`|`bold1`|`bold2`'))
          .toEqual({syntax: 'abc', bold: ['bold1', 'bold2'], description: ''});
    });

    it('should extract the description', function() {
      expect(cheatsheetItemParser('syntax:\n`abc`|`bold1`|`bold2`\ndescription:\nsome description'))
          .toEqual({syntax: 'abc', bold: ['bold1', 'bold2'], description: 'some description'});
    });

    it('should allow bold to be optional', function() {
      expect(cheatsheetItemParser('syntax:\n`abc`\ndescription:\nsome description'))
          .toEqual({syntax: 'abc', bold: [], description: 'some description'});
    });

    it('should allow whitespace between the parts', function() {
      expect(cheatsheetItemParser(
                 'syntax:\n`abc`|  `bold1`|  `bold2`\ndescription:\n\nsome description'))
          .toEqual({syntax: 'abc', bold: ['bold1', 'bold2'], description: 'some description'});
    });
  });

  describe('with language targets', function() {
    it('should extract the active language', function() {
      expect(cheatsheetItemParser(
                 'syntax(ts):\n`abc`|`bold1`|`bold2`\ndescription(ts):\nsome description'))
          .toEqual({syntax: 'abc', bold: ['bold1', 'bold2'], description: 'some description'});
    });

    it('should ignore the non-active language', function() {
      expect(cheatsheetItemParser(
                 'syntax(js):\n`abc`|`bold1`|`bold2`\ndescription(js):\nsome description'))
          .toEqual({syntax: '', bold: [], description: ''});
    });

    it('should select the active language and ignore non-active language', function() {
      expect(cheatsheetItemParser(
                 'syntax(js):\n`JS`|`boldJS``\n' +
                 'syntax(ts):\n`TS`|`boldTS`\n' +
                 'description(js):\nJS description\n' +
                 'description(ts):\nTS description'))
          .toEqual({syntax: 'TS', bold: ['boldTS'], description: 'TS description'});
    });

    it('should error if a language target is used that is not allowed', function() {
      expect(function() {
        cheatsheetItemParser(
            'syntax(dart):\n`abc`|`bold1`|`bold2`\ndescription(ts):\nsome description');
      })
          .toThrowError(
              'Error accessing target "dart". It is not in the list of allowed targets: js,ts');
    });
  });
});