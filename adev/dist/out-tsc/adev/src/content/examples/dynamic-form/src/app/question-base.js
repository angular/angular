// #docregion
export class QuestionBase {
  value;
  key;
  label;
  required;
  order;
  controlType;
  type;
  options;
  constructor(options = {}) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.type = options.type || '';
    this.options = options.options || [];
  }
}
//# sourceMappingURL=question-base.js.map
