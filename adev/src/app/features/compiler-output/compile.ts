import * as ng from '@angular/compiler';
// TODO: investigate shiki integration
// import { HighlighterGeneric, createHighlighter } from 'shiki';

import {formatJs} from './prettier';
import {Context, Printer} from './printer';

// let highlighter: HighlighterGeneric<any, any>;

// export async function initHightlighter() {
//   highlighter = await createHighlighter({
//     themes: ['github-dark'],
//     langs: ['javascript'],
//   });
// }

interface CompileOutput {
  output: string;
  errors: ng.ParseError[] | null;
}

export function compileTemplate(templateStr: string): CompileOutput {
  const constantPool = new ng.ConstantPool();
  const template = ng.parseTemplate(templateStr, 'template.html', {
    preserveWhitespaces: false,
  });

  const CMP_NAME = 'TestCmp';

  const out = ng.compileComponentFromMetadata(
    {
      name: CMP_NAME,
      isStandalone: true,
      selector: 'test-cmp',
      host: {
        attributes: {},
        listeners: {},
        properties: {},
        specialAttributes: {},
      },
      inputs: {},
      outputs: {},
      lifecycle: {
        usesOnChanges: false,
      },
      hostDirectives: null,
      declarations: [],
      declarationListEmitMode: ng.DeclarationListEmitMode.Direct,
      deps: [],
      animations: null,
      defer: {
        dependenciesFn: null,
        mode: ng.DeferBlockDepsEmitMode.PerComponent,
      },
      i18nUseExternalIds: false,
      interpolation: ng.DEFAULT_INTERPOLATION_CONFIG,
      isSignal: false,
      providers: null,
      queries: [],
      styles: [],
      template,
      encapsulation: ng.ViewEncapsulation.Emulated,
      exportAs: null,
      fullInheritance: false,
      changeDetection: null,
      relativeContextFilePath: 'template.html',
      type: {
        value: new ng.WrappedNodeExpr(CMP_NAME),
        type: new ng.WrappedNodeExpr(CMP_NAME),
      },
      typeArgumentCount: 0,
      typeSourceSpan: null!,
      usesInheritance: false,
      viewProviders: null,
      viewQueries: [],
      relativeTemplatePath: '',
      hasDirectiveDependencies: false,
    },
    constantPool,
    ng.makeBindingParser(ng.DEFAULT_INTERPOLATION_CONFIG),
  );

  const printer = new Printer();
  let strExpression = out.expression.visitExpression(printer, new Context(false));

  for (const stmt of constantPool.statements) {
    const strStmt = stmt.visitStatement(printer, new Context(true));

    strExpression += `\n\n${strStmt}`;
  }

  return {output: strExpression, errors: template.errors};
}

export async function compileFormatAndHighlight(template: string): Promise<CompileOutput> {
  const {output: unformated, errors} = compileTemplate(template);

  const formatted = await formatJs(unformated);
  // const highlighted = highlighter.codeToHtml(formatted, {
  //   lang: 'javascript',
  //   theme: 'github-dark',
  // });

  return {output: formatted, errors};
}
