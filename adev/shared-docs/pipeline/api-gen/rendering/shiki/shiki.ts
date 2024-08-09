let highlighter: any;

export async function initHighlighter() {
  const {createHighlighter} = await import('shiki');
  highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: [
      'javascript',
      'typescript',
      'angular-html',
      'angular-ts',
      'shell',
      'html',
      'http',
      'json',
      'jsonc',
      'nginx',
      'markdown',
      'apache',
    ],
  });
}

export function codeToHtml(
  code: string,
  language: string | undefined,
  options?: {removeFunctionKeyword?: boolean},
): string {
  const html = highlighter.codeToHtml(code, {
    lang: language ?? 'text',
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    cssVariablePrefix: '--shiki-',
    defaultColor: false,
  });

  if (options?.removeFunctionKeyword) {
    return removeFunctionKeywordFromShikiHtml(html);
  }
  return html;
}

export function removeFunctionKeywordFromShikiHtml(shikiHtml: string): string {
  return (
    shikiHtml
      // remove the leading space of the element after the "function" element
      .replace(/(<[^>]*>function<\/\w+><[^>]*>)(\s)(\w+<\/\w+>)/g, '$1$3')
      // Shiki requires the keyword function for highlighting functions signatures
      // We don't want to display it so we remove elements with the keyword
      .replace(/<[^>]*>function<\/\w+>/g, '')
  );
}
