import {CONST, Type} from 'facade/lang';
import {List} from 'facade/collection';

export class TemplateConfig {
  url:any; //string;
  inline:any; //string;
  directives:any; //List<Type>;
  formatters:any; //List<Type>;
  source:any;//List<TemplateConfig>;
  cssUrls:any;//List<string>
  @CONST()
  constructor({
      url,
      inline,
      directives,
      formatters,
      source,
      cssUrls
    }: {
      url: string,
      inline: string,
      directives: List<Type>,
      formatters: List<Type>,
      source: List<TemplateConfig>,
      cssUrls: List<string>
    })
  {
    this.url = url;
    this.inline = inline;
    this.directives = directives;
    this.formatters = formatters;
    this.source = source;
    this.cssUrls = cssUrls;
  }
}
