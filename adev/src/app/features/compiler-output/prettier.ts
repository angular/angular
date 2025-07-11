import parserBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import parserHtml from 'prettier/plugins/html';
import prettier from 'prettier/standalone';

export async function formatJs(code: string): Promise<string> {
  return prettier.format(code, {
    parser: 'babel',
    plugins: [parserBabel, prettierPluginEstree],
    singleQuote: true,
  });
}

export async function formatAngularTemplate(template: string): Promise<string> {
  return prettier.format(template, {
    parser: 'angular',
    plugins: [parserHtml],
  });
}
