import {Parser as TraceurParser} from 'traceur/src/syntax/Parser';
import {SyntaxErrorReporter} from 'traceur/src/util/SyntaxErrorReporter';
import {TypeName, ImportSpecifier, ImportedBinding, BindingIdentifier} from 'traceur/src/syntax/trees/ParseTrees';
import {PERIOD, IMPORT, STAR, AS, FROM, CLOSE_ANGLE, OPEN_ANGLE, COMMA, OPEN_CURLY, CLOSE_CURLY, COLON} from 'traceur/src/syntax/TokenType';

export class Parser extends TraceurParser {
  constructor(file, errorReporter = new SyntaxErrorReporter(), options) {
    super(file, errorReporter, options);
  }

  // TODO: add support for object type literals to traceur!
  parseObjectType_() {
   this.eat_(OPEN_CURLY);
   do {
     var identifier = this.eatId_();
     this.eat_(COLON);
     var type = this.parseNamedOrPredefinedType_();
     var typeParameters = this.parseTypeParametersOpt_();
     // TODO(misko): save the type information
   } while (this.eatIf_(COMMA));
   this.eat_(CLOSE_CURLY);
 }
}
