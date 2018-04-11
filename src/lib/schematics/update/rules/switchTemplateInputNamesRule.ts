import {green, red} from 'chalk';
import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {inputNames} from '../material/component-data';
import {ExternalResource} from '../tslint/component-file';
import {ComponentWalker} from '../tslint/component-walker';
import {findAll, findAllInputsInElWithAttr, findAllInputsInElWithTag} from '../typescript/literal';

/**
 * Rule that walks through every component decorator and updates their inline or external
 * templates.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new SwitchTemplateInputNamesWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchTemplateInputNamesWalker extends ComponentWalker {
  visitInlineTemplate(template: ts.StringLiteral) {
    this.replaceNamesInTemplate(template, template.getText()).forEach(replacement => {
      const fix = replacement.replacement;
      const ruleFailure = new RuleFailure(template.getSourceFile(), fix.start, fix.end,
          replacement.message, this.getRuleName(), fix);
      this.addFailure(ruleFailure);
    });
  }

  visitExternalTemplate(template: ExternalResource) {
    this.replaceNamesInTemplate(template, template.getFullText()).forEach(replacement => {
      const fix = replacement.replacement;
      const ruleFailure = new RuleFailure(template, fix.start + 1, fix.end + 1,
          replacement.message, this.getRuleName(), fix);
      this.addFailure(ruleFailure);
    });
  }

  /**
   * Replaces the outdated name in the template with the new one and returns an updated template.
   */
  private replaceNamesInTemplate(node: ts.Node, templateContent: string):
      {message: string, replacement: Replacement}[] {
    const replacements: {message: string, replacement: Replacement}[] = [];

    inputNames.forEach(name => {
      let offsets: number[] = [];
      if (name.whitelist && name.whitelist.attributes && name.whitelist.attributes.length) {
        offsets = offsets.concat(findAllInputsInElWithAttr(
            templateContent, name.replace, name.whitelist.attributes));
      }
      if (name.whitelist && name.whitelist.elements && name.whitelist.elements.length) {
        offsets = offsets.concat(findAllInputsInElWithTag(
            templateContent, name.replace, name.whitelist.elements));
      }
      if (!name.whitelist) {
        offsets = offsets.concat(findAll(templateContent, name.replace));
      }
      this.createReplacementsForOffsets(node, name, offsets).forEach(replacement => {
        replacements.push({
          message: `Found deprecated @Input() "${red(name.replace)}" which has been renamed to` +
              ` "${green(name.replaceWith)}"`,
          replacement
        });
      });
    });

    return replacements;
  }

  private createReplacementsForOffsets(node: ts.Node,
                                       update: {replace: string, replaceWith: string},
                                       offsets: number[]): Replacement[] {
    return offsets.map(offset => this.createReplacement(
        node.getStart() + offset, update.replace.length, update.replaceWith));
  }
}
