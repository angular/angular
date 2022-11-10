const {runfiles} = require('@bazel/runfiles');
const {resolve} = require('canonical-path');
const { existsSync } = require('fs');
const semver = require('semver');
const Package = require('dgeni').Package;
const basePackage = require('../angular-base-package');
const contentPackage = require('../content-package');
const {CONTENTS_PATH, TEMPLATES_PATH, requireFolder} = require('../config');

const CLI_SOURCE_PATH = resolveCliSourcePath();
const CLI_SOURCE_HELP_PATH = resolve(CLI_SOURCE_PATH, 'help');

// The cli sources are downloaded as an external repository, so where
// to resolve them depends on whether we are running dgeni under a build
// target or a test target.
function resolveCliSourcePath() {
  // Case: build, find in execroot
  const path = resolve('external', 'angular_cli_src');
  if (existsSync(path)) {
    return path;
  }
  // Case: bazel test, find in runfiles
  return runfiles.resolve('angular_cli_src');
}

// Define the dgeni package for generating the docs
module.exports =
    new Package('cli-docs', [basePackage, contentPackage])

        // Register the services and file readers
        .factory(require('./readers/cli-command'))

        // Register the processors
        .processor(require('./processors/processCliContainerDoc'))
        .processor(require('./processors/processCliCommands'))

        // Configure file reading
        .config(function(readFilesProcessor, cliCommandFileReader) {
          readFilesProcessor.fileReaders.push(cliCommandFileReader);
          readFilesProcessor.sourceFiles = readFilesProcessor.sourceFiles.concat([
            {
              basePath: CLI_SOURCE_HELP_PATH,
              include: resolve(CLI_SOURCE_HELP_PATH, '*.json'),
              fileReader: 'cliCommandFileReader'
            },
            {
              basePath: CONTENTS_PATH,
              include: resolve(CONTENTS_PATH, 'cli/**'),
              fileReader: 'contentFileReader'
            },
          ]);
        })

        .config(function(templateFinder, templateEngine, getInjectables) {
          // Where to find the templates for the CLI doc rendering
          templateFinder.templateFolders.unshift(resolve(TEMPLATES_PATH, 'cli'));
          // Add in templating filters and tags
          templateEngine.filters = templateEngine.filters.concat(
              getInjectables(requireFolder(__dirname, './rendering')));
        })


        .config(function(renderDocsProcessor) {

          const cliPackage = require(resolve(CLI_SOURCE_PATH, 'package.json'));
          const repoUrlParts = cliPackage.repository.url.replace(/\.git$/, '').split('/');
          const version = semver.clean(cliPackage.version);
          const repo = repoUrlParts.pop();
          const owner = repoUrlParts.pop();
          const cliVersionInfo = {gitRepoInfo: {owner, repo}, currentVersion: {raw: version}};

          // Add the cli version data to the renderer, for use in things like github links
          renderDocsProcessor.extraData.cliVersionInfo = cliVersionInfo;
        })


        .config(function(convertToJsonProcessor, postProcessHtml) {
          convertToJsonProcessor.docTypes =
              convertToJsonProcessor.docTypes.concat(['cli-command', 'cli-overview']);
          postProcessHtml.docTypes =
              postProcessHtml.docTypes.concat(['cli-command', 'cli-overview']);
        });

