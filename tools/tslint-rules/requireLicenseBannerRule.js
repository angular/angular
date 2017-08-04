const Lint = require('tslint');
const path = require('path');
const minimatch = require('minimatch');
const buildConfig = require('../../build-config');

/** Paths to the directories that are public packages and should be validated. */
const packageDirs = [
  path.join(buildConfig.packagesDir, 'lib'),
  path.join(buildConfig.packagesDir, 'cdk')
];

/** License banner that is placed at the top of every public TypeScript file. */
const licenseBanner = buildConfig.licenseBanner;

/** Failure message that will be shown if a license banner is missing. */
const ERROR_MESSAGE = 'Missing license header in this TypeScript file. ' +
  'Every TypeScript file of the library needs to have the Google license banner at the top.';

/** TSLint fix that can be used to add the license banner easily. */
const tslintFix = Lint.Replacement.appendText(0, licenseBanner + '\n\n');

/**
 * Rule that walks through all TypeScript files of public packages and shows failures if a
 * file does not have the license banner at the top of the file.
 */
class Rule extends Lint.Rules.AbstractRule {

  apply(sourceFile) {
    return this.applyWithWalker(new RequireLicenseBannerWalker(sourceFile, this.getOptions()));
  }
}

class RequireLicenseBannerWalker extends Lint.RuleWalker {

  constructor(file, options) {
    super(...arguments);

    // Globs that are used to determine which files to lint.
    const fileGlobs = options.ruleArguments;

    // Relative path for the current TypeScript source file.
    const relativeFilePath = path.relative(process.cwd(), file.fileName);

    // Whether the file should be checked at all.
    this._enabled = fileGlobs.some(p => minimatch(relativeFilePath, p));
  }

  visitSourceFile(sourceFile) {
    if (!this._enabled) {
      return;
    }

    const fileContent = sourceFile.getFullText();
    const licenseCommentPos = fileContent.indexOf(licenseBanner);

    if (licenseCommentPos !== 0) {
      return this.addFailureAt(0, 0, ERROR_MESSAGE, tslintFix);
    }

    super.visitSourceFile(sourceFile);
  }
}

exports.Rule = Rule;
