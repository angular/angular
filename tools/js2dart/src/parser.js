import {Parser as TraceurParser} from 'traceur/src/syntax/Parser';
import {SyntaxErrorReporter} from 'traceur/src/util/SyntaxErrorReporter';
import {TypeName, ImportSpecifier, ImportedBinding, BindingIdentifier} from 'traceur/src/syntax/trees/ParseTrees';
import {PERIOD, IMPORT, STAR, AS, FROM, CLOSE_ANGLE, OPEN_ANGLE, COMMA, OPEN_CURLY, CLOSE_CURLY, COLON} from 'traceur/src/syntax/TokenType';

var WRAPS = 'wraps';

export class Parser extends TraceurParser {
  constructor(file, errorReporter = new SyntaxErrorReporter()) {
    super(file, errorReporter);
  }
  parseTypeName_() {
    // Copy of original implementation
    var start = this.getTreeStartLocation_();
    var typeName = new TypeName(this.getTreeLocation_(start), null, this.eatId_());
    while (this.eatIf_(PERIOD)) {
      var memberName = this.eatIdName_();
      typeName = new TypeName(this.getTreeLocation_(start), typeName, memberName);
    }
    var next = this.peekType_();
    // Generics support
    if (this.eatIf_(OPEN_ANGLE)) {
      var generics = [];
      do {
        generics.push(this.eatId_());
      } while(this.eatIf_(COMMA));
      this.eat_(CLOSE_ANGLE);
      // TODO: save the generics into the typeName and use them e.g. for assertions, ...
    }
    return typeName;
  }
  parseImportSpecifier_() {
    // Copy of original implementation
    var start = this.getTreeStartLocation_();
    var token = this.peekToken_();
    var isKeyword = token.isKeyword();
    var binding;
    var name = this.eatIdName_();
    // Support for wraps keywoard
    if (this.peekToken_().value === WRAPS) {
      var token = this.nextToken_();
      var wrappedIdentifier = this.eatId_();
      // TODO: Save the fact that this is a wrapper type and
      // also the wrapped type
    }
    // Copy of original implementation
    if (isKeyword || this.peekPredefinedString_(AS)) {
      this.eatId_(AS);
      binding = this.parseImportedBinding_();
    } else {
      binding = new ImportedBinding(name.location, new BindingIdentifier(name.location, name));
      name = null;
    }
    return new ImportSpecifier(this.getTreeLocation_(start), binding, name);
  }
  parseObjectType_() {
   //TODO(misko): save the type information
   this.eat_(OPEN_CURLY)
   do {
     var identifier = this.eatId_();
     this.eat_(COLON);
     var type = this.parseNamedOrPredefinedType_();
   } while (this.eatIf_(COMMA));
   this.eat_(CLOSE_CURLY);
 }
}