const Lint = require('tslint');
const path = require('path');
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

  visitSourceFile(sourceFile) {
    const filePath = path.join(buildConfig.projectDir, sourceFile.fileName);

    // Do not check TypeScript source files that are not inside of a public package.
    if (!packageDirs.some(packageDir => filePath.includes(packageDir))) {
      return;
    }

    // Do not check source files inside of public packages that are spec or definition files.
    if (filePath.endsWith('.spec.ts') || filePath.endsWith('.d.ts')) {
      return;
    }

    const fileContent = sourceFile.getFullText();
    const licenseCommentPos = fileContent.indexOf(licenseBanner);

    if (licenseCommentPos !== 0) {
      return this.addFailureAt(0, 0, ERROR_MESSAGE, tslintFix);
    }
  }
}

exports.Rule = Rule;
