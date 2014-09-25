import {ParseTree} from 'traceur/src/syntax/trees/ParseTree';

var CLASS_FIELD = 'CLASS_FIELD';

export class ClassFieldParseTree extends ParseTree {
  constructor(location, identifier, typeAnnotation) {
    this.location = location;
    this.identifier = identifier;
    this.typeAnnotation = typeAnnotation;
  }
  get type() {
    return CLASS_FIELD;
  }
  visit(visitor) {
    visitor.visitClassField(this);
  }
  transform(transformer) {
    return this;
  }
}
