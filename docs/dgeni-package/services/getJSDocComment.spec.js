var mockPackage = require('../mocks/mockPackage');
var Dgeni = require('dgeni');

describe('getJSDocComment service', function() {

  var dgeni, injector, getJSDocComment;

  function createComment(commentString, start, end, codeTree) {
    return {
      range: {
        toString: function() { return commentString; },
        start: { line: start },
        end: { line: end },
      },
      treeAfter: codeTree
    };
  }

  beforeEach(function() {
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    getJSDocComment = injector.get('getJSDocComment');
  });

  it('should only return an object if the comment starts with /** and ends with */', function() {
    var result = getJSDocComment(createComment('/** this is a jsdoc comment */'));
    expect(result).toBeDefined();

    result = getJSDocComment(createComment('/* this is a normal comment */'));
    expect(result).toBeUndefined();

    result = getJSDocComment(createComment('this is not a valid comment */'));
    expect(result).toBeUndefined();

    result = getJSDocComment(createComment('nor is this'));
    expect(result).toBeUndefined();

    result = getJSDocComment(createComment('/* or even this'));
    expect(result).toBeUndefined();

    result = getJSDocComment(createComment('/** and this'));
    expect(result).toBeUndefined();
  });


  it('should return a result that contains info about the comment', function() {
    var codeTree = {};
    var result = getJSDocComment(createComment('/** this is a comment */', 10, 20, codeTree));
    expect(result.startingLine).toEqual(10);
    expect(result.endingLine).toEqual(20);
    expect(result.codeTree).toBe(codeTree);
  });

  it('should strip off leading stars from each line', function() {
    var result = getJSDocComment(createComment(
      '/** this is a jsdoc comment */\n' +
      ' *\n' +
      ' * some content\n' +
      ' */'
    ));
    expect(result.content).toEqual(
      'this is a jsdoc comment */\n' +
      '\n' +
      'some content'
    );
  });
});