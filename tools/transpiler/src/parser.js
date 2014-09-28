import {Parser as TraceurParser} from 'traceur/src/syntax/Parser';
import {SyntaxErrorReporter} from 'traceur/src/util/SyntaxErrorReporter';
import {TypeName, ImportSpecifier, ImportedBinding, BindingIdentifier} from 'traceur/src/syntax/trees/ParseTrees';
import {PERIOD, IMPORT, STAR, AS, FROM, CLOSE_ANGLE, OPEN_ANGLE, COMMA, OPEN_CURLY, CLOSE_CURLY, COLON} from 'traceur/src/syntax/TokenType';

export class Parser extends TraceurParser {
  constructor(file, errorReporter = new SyntaxErrorReporter()) {
    super(file, errorReporter);
  }

  parseTypeName_() {
    // Copy of original implementation
    var typeName = super.parseTypeName_();
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

  parseObjectType_() {
   //TODO(misko): save the type information
   this.eat_(OPEN_CURLY);
   do {
     var identifier = this.eatId_();
     this.eat_(COLON);
     var type = this.parseNamedOrPredefinedType_();
   } while (this.eatIf_(COMMA));
   this.eat_(CLOSE_CURLY);
 }
}