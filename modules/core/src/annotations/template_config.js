import {ABSTRACT, CONST, Type} from 'facade/src/lang';
import {List} from 'facade/src/collection';

export class TemplateConfig {
  url:any; //string;
  inline:any; //string;
  directives:any; //List<Type>;
  formatters:any; //List<Type>;
  source:any;//List<TemplateConfig>;
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
