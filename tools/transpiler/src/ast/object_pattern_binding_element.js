import {BindingElement} from 'traceur/src/syntax/trees/ParseTrees';

export class ObjectPatternBindingElement extends BindingElement {
  visit(visitor) {
    visitor.visitObjectPatternBindingElement(this);
  }
}
