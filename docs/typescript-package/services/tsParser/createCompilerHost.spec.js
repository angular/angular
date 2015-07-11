var mockPackage = require('../../mocks/mockPackage');
var Dgeni = require('dgeni');
var path = require('canonical-path');
var ts = require('typescript');

describe('createCompilerHost', function() {
  var dgeni, injector, options, host, baseDir, extensions;

  beforeEach(function() {
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    var createCompilerHost = injector.get('createCompilerHost');

    options = { charset: 'utf8' };
    baseDir = path.resolve(__dirname, '../../mocks/tsParser');
    extensions = ['.ts', '.js'];

    host = createCompilerHost(options, baseDir, extensions);
  });

  describe('getSourceFile', function() {
    it('should return a SourceFile object for a given path, with fileName relative to baseDir', function() {
      var sourceFile = host.getSourceFile('testSrc.ts');
      expect(sourceFile.fileName).toEqual('testSrc.ts');
      expect(sourceFile.pos).toEqual(0);
      expect(sourceFile.text).toEqual(jasmine.any(String));
    });

    it('should try each of the configured extensions and update the filename to the correct extension', function() {
      var sourceFile = host.getSourceFile('testSrc.js');
      expect(sourceFile.fileName).toEqual('testSrc.ts');

      sourceFile = host.getSourceFile('../mockPackage.ts');
      expect(sourceFile.fileName).toEqual('../mockPackage.js');
    });
  });


  describe('getDefaultLibFileName', function() {
    it('should return a path to the default library', function() {
      expect(host.getDefaultLibFileName(options)).toContain('typescript/bin/lib.d.ts');
    });
  });


  describe('writeFile', function() {
    it('should do nothing', function() {
      host.writeFile();
    });
  });


  describe('getCurrentDirectory', function() {
    it('should return the baseDir', function() {
      expect(host.getCurrentDirectory()).toEqual(baseDir);
    });
  });


  describe('useCaseSensitiveFileNames', function() {
    it('should return true if the OS is case sensitive', function() {
      expect(host.useCaseSensitiveFileNames()).toBe(ts.sys.useCaseSensitiveFileNames);
    });
  });


  describe('getCanonicalFileName', function() {
    it('should lower case the filename', function() {
      var expectedFilePath = host.useCaseSensitiveFileNames() ? 'SomeFile.ts' : 'somefile.ts';
      expect(host.getCanonicalFileName('SomeFile.ts')).toEqual(expectedFilePath);
    });
  });


  describe('getNewLine', function() {
    it('should return the newline character for the OS', function() {
      expect(host.getNewLine()).toEqual(require('os').EOL);
    });
  });
});