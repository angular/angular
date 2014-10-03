import {Set} from 'facade/lang';
//import {AnnotatedType} from './annotated_type';

export class Selector {
  constructor(directives:Set<AnnotatedType>) {
    this.directives = directives;
  }

  /**
   * When presented with an element description it will return the current set of
   * directives which are present on the element.
   *
   * @param elementName Name of the element
   * @param attributes Attributes on the Element.
   */
  visitElement(elementName:String, attributes:Map<string, string>):List<AnnotatedType> {
    return null;
  }
}
