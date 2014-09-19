export class ElementInjectorTarget {
  @FIELD('final _elementInjectorIndex:int')
  @FIELD('final _directiveIndex:int')
  @FIELD('final _setterName:String')
  @FIELD('final _setter:SetterFn')
  constructor() {}
  
  invoke(record:Record, elementInjectors:List<ElementInjector>) {
    var elementInjector:ElementInjector = elementInjectors[this._elementInjectorIndex];
    var directive = elementInjectors.getByIndex(this._directiveIndex);
    this._setter(directive, record.currentValue);
  }
}
