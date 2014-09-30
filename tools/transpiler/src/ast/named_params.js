import {ParseTree} from 'traceur/src/syntax/trees/ParseTree';

export class NamedParams extends ParseTree {
  constructor(location, propertyNameAndValues) {
    this.location = location;
    this.propertyNameAndValues = propertyNameAndValues;
  }

  visit(visitor) {
    visitor.visitNamedParamsExpression(this);
  }

  transform(transformer) {
    return this;
  }
}
