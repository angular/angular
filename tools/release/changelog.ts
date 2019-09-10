import {bold, green, yellow} from 'chalk';
import {createReadStream, createWriteStream, readFileSync} from 'fs';
import {prompt} from 'inquirer';
import {join} from 'path';
import {Readable} from 'stream';
import {releasePackages} from './release-output/release-packages';

// These imports lack type definitions.
const conventionalChangelog = require('conventional-changelog');
const changelogCompare = require('conventional-changelog-writer/lib/util');
const merge2 = require('merge2');

/** Interface that describes a package in the changelog. */
interface ChangelogPackage {
  commits: any[];
  breakingChanges: any[];
}

/** Hardcoded order of packages shown in the changelog. */
const changelogPackageOrder = [
  'cdk',
  'material',
  'google-maps',
  'youtube-player',
  'material-moment-adapter',
  'cdk-experimental',
  'material-experimental',
];

/** List of packages which are excluded in the changelog. */
const excludedChangelogPackages = ['google-maps'];

/** Prompts for a changelog release name and prepends the new changelog. */
export async function promptAndGenerateChangelog(changelogPath: string) {
  const releaseName = await promptChangelogReleaseName();
  await prependChangelogFromLatestTag(changelogPath, releaseName);
}

/**
 * Writes the changelog from the latest Semver tag to the current HEAD.
 * @param changelogPath Path to the changelog file.
 * @param releaseName Name of the release that should show up in the changelog.
 */
export async function prependChangelogFromLatestTag(changelogPath: string, releaseName: string) {
  const outputStream: Readable = conventionalChangelog(
      /* core options */ {preset: 'angular'},
      /* context options */ {title: releaseName},
      /* raw-commits options */ null,
      /* commit parser options */ {
        // Expansion of the convention-changelog-angular preset to extract the package
        // name from the commit message.
        headerPattern: /^(\w*)(?:\((?:([^/]+)\/)?(.*)\))?: (.*)$/,
        headerCorrespondence: ['type', 'package', 'scope', 'subject'],
      },
      /* writer options */ createChangelogWriterOptions(changelogPath));

  // Stream for reading the existing changelog. This is necessary because we want to
  // actually prepend the new changelog to the existing one.
  const previousChangelogStream = createReadStream(changelogPath);

  return new Promise((resolve, reject) => {
    // Sequentially merge the changelog output and the previous changelog stream, so that
    // the new changelog section comes before the existing versions. Afterwards, pipe into the
    // changelog file, so that the changes are reflected on file system.
    const mergedCompleteChangelog = merge2(outputStream, previousChangelogStream);

    // Wait for the previous changelog to be completely read because otherwise we would
    // read and write from the same source which causes the content to be thrown off.
    previousChangelogStream.on('end', () => {
      mergedCompleteChangelog.pipe(createWriteStream(changelogPath))
          .once('error', (error: any) => reject(error))
          .once('finish', () => resolve());
    });
  });
}

/** Prompts the terminal for a changelog release name. */
export async function promptChangelogReleaseName(): Promise<string> {
  return (await prompt<{releaseName: string}>({
           type: 'text',
           name: 'releaseName',
           message: 'What should be the name of the release?'
         }))
      .releaseName;
}

/**
 * Creates changelog writer options which ensure that commits which are duplicated, or for
 * experimental packages do not showing up multiple times. Commits can show up multiple times
 * if a changelog has been generated on a publish branch and has been cherry-picked into "master".
 * In that case, the changelog will already contain cherry-picked commits from master which might
 * be added to future changelog's on "master" again. This is because usually patch and minor
 * releases are tagged from the publish branches and therefore conventional-changelog tries to
 * build the changelog from last major version to master's HEAD when a new major version is being
 * published from the "master" branch.
 */
function createChangelogWriterOptions(changelogPath: string) {
  const existingChangelogContent = readFileSync(changelogPath, 'utf8');
  const commitSortFunction = changelogCompare.functionify(['type', 'scope', 'subject']);

  return {
    // Overwrite the changelog templates so that we can render the commits grouped
    // by package names. Templates are based on the original templates of the
    // angular preset: "conventional-changelog-angular/templates".
    mainTemplate: readFileSync(join(__dirname, 'changelog-root-template.hbs'), 'utf8'),
    commitPartial: readFileSync(join(__dirname, 'changelog-commit-template.hbs'), 'utf8'),

    // Specify a writer option that can be used to modify the content of a new changelog section.
    // See: conventional-changelog/tree/master/packages/conventional-changelog-writer
    finalizeContext: (context: any) => {
      const packageGroups: {[packageName: string]: ChangelogPackage} = {};

      context.commitGroups.forEach((group: any) => {
        group.commits.forEach((commit: any) => {
          // Filter out duplicate commits. Note that we cannot compare the SHA because the commits
          // will have a different SHA if they are being cherry-picked into a different branch.
          if (existingChangelogContent.includes(commit.subject)) {
            console.log(yellow(`  ↺   Skipping duplicate: "${bold(commit.header)}"`));
            return false;
          }

          // Commits which just specify a scope that refers to a package but do not follow
          // the commit format that is parsed by the conventional-changelog-parser, can be
          // still resolved to their package from the scope. This handles the case where
          // a commit targets the whole package and does not specify a specific scope.
          // e.g. "refactor(material-experimental): support strictness flags".
          if (!commit.package && commit.scope) {
            const matchingPackage = releasePackages.find(pkgName => pkgName === commit.scope);
            if (matchingPackage) {
              commit.scope = null;
              commit.package = matchingPackage;
            }
          }

          // TODO(devversion): once we formalize the commit message format and
          // require specifying the "material" package explicitly, we can remove
          // the fallback to the "material" package.
          const packageName = commit.package || 'material';
          const type = getTypeOfCommitGroupDescription(group.title);

          if (!packageGroups[packageName]) {
            packageGroups[packageName] = {commits: [], breakingChanges: []};
          }
          const packageGroup = packageGroups[packageName];

          packageGroup.breakingChanges.push(...commit.notes);
          packageGroup.commits.push({...commit, type});
        });
      });

      const sortedPackageGroupNames =
          Object.keys(packageGroups)
              .filter(pkgName => !excludedChangelogPackages.includes(pkgName))
              .sort(preferredOrderComparator);

      context.packageGroups = sortedPackageGroupNames.map(pkgName => {
        const packageGroup = packageGroups[pkgName];
        return {
          title: pkgName,
          commits: packageGroup.commits.sort(commitSortFunction),
          breakingChanges: packageGroup.breakingChanges,
        };
      });

      return context;
    }
  };
}

/**
 * Comparator function that sorts a given array of strings based on the
 * hardcoded changelog package order. Entries which are not hardcoded are
 * sorted in alphabetical order after the hardcoded entries.
 */
function preferredOrderComparator(a: string, b: string): number {
  const aIndex = changelogPackageOrder.indexOf(a);
  const bIndex = changelogPackageOrder.indexOf(b);
  // If a package name could not be found in the hardcoded order, it should be
  // sorted after the hardcoded entries in alphabetical order.
  if (aIndex === -1) {
    return bIndex === -1 ? a.localeCompare(b) : 1;
  } else if (bIndex === -1) {
    return -1;
  }
  return aIndex - bIndex;
}

/** Gets the type of a commit group description. */
function getTypeOfCommitGroupDescription(description: string): string {
  if (description === 'Features') {
    return 'feature';
  } else if (description === 'Bug Fixes') {
    return 'bug fix';
  } else if (description === 'Performance Improvements') {
    return 'performance';
  } else if (description === 'Reverts') {
    return 'revert';
  } else if (description === 'Documentation') {
    return 'docs';
  } else if (description === 'Code Refactoring') {
    return 'refactor';
  }
  return description.toLowerCase();
}

/** Entry-point for generating the changelog when called through the CLI. */
if (require.main === module) {
  promptAndGenerateChangelog(join(__dirname, '../../CHANGELOG.md')).then(() => {
    console.log(green('  ✓   Successfully updated the changelog.'));
  });
}
