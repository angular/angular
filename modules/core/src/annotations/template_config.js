import {ABSTRACT, CONST} from 'facade/lang';
// import {Type, List} from 'facade/lang';

export class TemplateConfig {
  url: string;
  inline: string;
  directives: List<Type>;
  formatters: List<Type>;
  source: List<TemplateConfig>;
  @CONST()
  constructor({
      url,
      inline,
      directives,
      formatters,
      source
    }: {
      url: string,
      inline: string,
      directives: List<Type>,
      formatters: List<Type>,
      source: List<TemplateConfig>
    })
  {
    this.url = url;
    this.inline = inline;
    this.directives = directives;
    this.formatters = formatters;
    this.source = source;
  }
}
