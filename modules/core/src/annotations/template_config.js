import {Type, List} from 'facade/lang';

export class TemplateConfig {
  @CONST constructor({
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
  {}
}