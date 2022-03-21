import {Renderer, Slugger} from 'marked';
import {basename, extname} from 'path';

/** Regular expression that matches example comments. */
const exampleCommentRegex = /<!--\s*example\(([^)]+)\)\s*-->/g;

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular Material docs.
 */
export class DocsMarkdownRenderer extends Renderer {
  /** Set of fragment links discovered in the currently rendered file. */
  private _referencedFragments = new Set<string>();

  /**
   * Slugger provided by the `marked` package. Can be used to create unique
   * ids  for headings.
   */
  private _slugger = new Slugger();

  /**
   * Transforms a markdown heading into the corresponding HTML output. In our case, we
   * want to create a header-link for each H2, H3, and H4 heading. This allows users to jump to
   * specific parts of the docs.
   */
  heading(label: string, level: number, raw: string) {
    if (level === 2 || level === 3 || level === 4 || level === 5 || level === 6) {
      const headingId = this._slugger.slug(raw);
      return `
        <h${level} id="${headingId}" class="docs-header-link">
          <span header-link="${headingId}"></span>
          ${label}
        </h${level}>
      `;
    }

    return `<h${level}>${label}</h${level}>`;
  }

  /** Transforms markdown links into the corresponding HTML output. */
  link(href: string, title: string, text: string) {
    // We only want to fix up markdown links that are relative and do not refer to guides already.
    // Otherwise we always map the link to the "guide/" path.
    // TODO(devversion): remove this logic and just disallow relative paths.
    if (!href.startsWith('http') && !href.startsWith('#') && !href.includes('guide/')) {
      return super.link(`guide/${basename(href, extname(href))}`, title, text);
    }

    // Keep track of all fragments discovered in a file.
    if (href.startsWith('#')) {
      this._referencedFragments.add(href.slice(1));
    }

    return super.link(href, title, text);
  }

  /**
   * Method that will be called whenever inline HTML is processed by marked. In that case,
   * we can easily transform the example comments into real HTML elements.
   * For example:
   * (New API)
   * `<!-- example(
   *   {
   *    "example": "exampleName",
   *    "file": "example-html.html",
   *    "region": "some-region"
   *   }
   *  ) -->`
   *  turns into
   *  `<div material-docs-example="exampleName"
   *        file="example-html.html"
   *        region="some-region"></div>`
   *
   *  (old API)
   *  `<!-- example(name) -->`
   *  turns into
   *  `<div material-docs-example="name"></div>`
   */
  html(html: string) {
    html = html.replace(exampleCommentRegex, (_match: string, content: string) => {
      // using [\s\S]* because .* does not match line breaks
      if (content.match(/\{[\s\S]*\}/g)) {
        const {example, file, region} = JSON.parse(content) as {
          example: string;
          file: string;
          region: string;
        };
        return `<div material-docs-example="${example}"
                             ${file ? `file="${file}"` : ''}
                             ${region ? `region="${region}"` : ''}></div>`;
      } else {
        return `<div material-docs-example="${content}"></div>`;
      }
    });

    return super.html(html);
  }

  /**
   * Method that will be called after a markdown file has been transformed to HTML. This method
   * can be used to finalize the content (e.g. by adding an additional wrapper HTML element)
   */
  finalizeOutput(output: string, fileName: string): string {
    const failures: string[] = [];

    // Collect any fragment links that do not resolve to existing fragments in the
    // rendered file. We want to error for broken fragment links.
    this._referencedFragments.forEach(id => {
      if (this._slugger.seen[id] === undefined) {
        failures.push(`Found link to "${id}". This heading does not exist.`);
      }
    });

    if (failures.length) {
      console.error(`Could not process file: ${fileName}. Please fix the following errors:`);
      failures.forEach(message => console.error(`  -  ${message}`));
      process.exit(1);
    }

    this._slugger.seen = {};
    this._referencedFragments.clear();

    return `<div class="docs-markdown">${output}</div>`;
  }
}
