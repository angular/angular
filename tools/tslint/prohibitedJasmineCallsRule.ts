/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuleWalker} from 'tslint/lib/language/walker';
import {IOptions, IRuleMetadata, RuleFailure, Utils} from 'tslint/lib/lint';
import {AbstractRule} from 'tslint/lib/rules';
import * as ts from 'typescript';

const OPTION_PROHIBIT_EXCLUDUD = 'prohibit-excluded';

const FOCUS_FUNCTIONS = ['fdescribe', 'fit'];
const EXCLUDE_FUNCTIONS = ['xdescribe', 'xit'];

export class Rule extends AbstractRule {
  public static metadata: IRuleMetadata = {
    ruleName: 'prohibited-jasmine-calls',
    description: 'Checks that focused tests and optionally excluded tests are not present.',
    optionsDescription: Utils.dedent `
        The first argument is required. The second is optional.
        * \`"Regex"\`: Regex to apply to filenames to identify jasmine test files
        * \`"${OPTION_PROHIBIT_EXCLUDUD}"\`: Checks that excluded tests are not present
        `,
    options: {
      type: 'array',
      items: {
        type: 'string',
        firstItem: 'Regex to apply to filenames to identify jasmine test files',
        optionalSecondItem: OPTION_PROHIBIT_EXCLUDUD
      },
      minLength: 1,
      maxLength: 2,
    },
    optionExamples: ['[true, "*[\.,_]spec.ts", "prohibit-excluded"]'],
    type: 'functionality'
  };

  public apply(sourceFile: ts.SourceFile): RuleFailure[] {
    // the first ruleArgument holds the regex used to identify jasmine test files
    const options: IOptions = this.getOptions();
    const ruleArguments: any[] = options.ruleArguments;
    if (!ruleArguments || ruleArguments.length == 0)
      throw 'tslint.config should provide config data e.g. unwantedJasmineCalls: [true, "regular' +
          ' expression to identify test files"]';

    if (new RegExp(ruleArguments[0]).test(sourceFile.fileName)) {
      const walker = new JasmineTestWalker(sourceFile, options);
      return this.applyWithWalker(walker);
    } else {
      return [];
    }
  }
}

class JasmineTestWalker extends RuleWalker {
  private prohibitedCalls: string[] = [];

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    super(sourceFile, options);
    this.prohibitedCalls.push.apply(this.prohibitedCalls, FOCUS_FUNCTIONS);
    if (this.hasOption(OPTION_PROHIBIT_EXCLUDUD)) {
      this.prohibitedCalls.push.apply(this.prohibitedCalls, EXCLUDE_FUNCTIONS);
    }
  }

  protected visitCallExpression(node: ts.CallExpression): void {
    const functionName: string = node.expression.getText();

    if (this.prohibitedCalls.indexOf(functionName) > -1) {
      // firstArgument likely to be the test name, output this in error message
      const firstArgument: string = node.arguments.length > 0 ? node.arguments[0].getText() : '';

      this.addFailure(this.createFailure(
          node.getStart(), node.getWidth(),
          `Prohibited function call: ${functionName}(${firstArgument}...`));
    }
    super.visitCallExpression(node);
  }
}