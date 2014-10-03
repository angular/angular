import {ABSTRACT, CONST} from 'facade/lang';
// import {Type, List} from 'facade/lang';

export class TemplateConfig {
  @CONST()
  constructor({
      url,
      directives,
      formatters,
      source
    }: {
      url: String,
      directives: List<Type>,
      formatters: List<Type>,
      source: List<TemplateConfig>
    })
  {
    this.url = url;
    this.directives = directives;
    this.formatters = formatters;
    this.source = source;
  }
}
