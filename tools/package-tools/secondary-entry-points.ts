import {join} from 'path';
import {readdirSync, lstatSync, existsSync} from 'fs';
import {spawnSync} from 'child_process';
import {BuildPackage} from './build-package';
import {platform} from 'os';


/**
 * Gets secondary entry-points for a given package in the order they should be built.
 *
 * This currently assumes that every directory under a package should be an entry-point except for
 * specifically black-listed directories.
 *
 * @param pkg The package for which to get entry points, e.g., 'cdk'.
 * @returns An array of secondary entry-points names, e.g., ['a11y', 'bidi', ...]
 */
export function getSecondaryEntryPointsForPackage(pkg: BuildPackage) {
  const packageName = pkg.name;
  const packageDir = pkg.sourceDir;

  // Get the list of all entry-points as the list of directories in the package that have a
  // tsconfig-build.json
  const entryPoints = getSubdirectoryNames(packageDir)
      .filter(d => existsSync(join(packageDir, d, 'tsconfig-build.json')));

  // Create nodes that comprise the build graph.
  const buildNodes: BuildNode[] = entryPoints.map(p => ({name: p, deps: [], depth: 0}));

  // Create a lookup for name -> build graph node.
  const nodeLookup = buildNodes.reduce((lookup, node) => {
    return lookup.set(node.name, node);
  }, new Map<string, BuildNode>());

  // Regex used to extract entry-point name from an import statement referencing that entry-point.
  // E.g., extract "portal" from "from '@angular/cdk/portal';".
  const importRegex = new RegExp(`${packageName}/(.+)';`);

  // Update the deps for each node to point to the appropriate BuildNodes.
  buildNodes.forEach(node => {
    const importStatementFindCommand = buildPackageImportStatementFindCommand(
        join(packageDir, node.name), packageName);

    // Look for any imports that reference this same umbrella package and get the corresponding
    // BuildNode for each by looking at the import statements with grep.
    node.deps = spawnSync(importStatementFindCommand.binary, importStatementFindCommand.args)
    .stdout
    .toString()
    .split('\n')
    .filter(n => n)
    .map(importStatement => importStatement.match(importRegex)![1])
    .filter(n => nodeLookup.has(n) && n !== node.name)
    .map(depName => nodeLookup.get(depName)!) || [];
  });

  // Concatenate the build order for each node into one global build order.
  // Duplicates are automatically omitted by getBuildOrder.
  const buildOrder = buildNodes.reduce((order: BuildNode[], node) => {
    return [...order, ...getBuildOrder(node)];
  }, []);

  return partitionNodesByDepth(buildOrder).map(level => level.map(node => node.name));
}

/** Gets the build order for node with DFS. As a side-effect, sets the depth on visited nodes. */
function getBuildOrder(node: BuildNode): BuildNode[] {
  if (node.visited) {
    return [];
  }

  let buildOrder: BuildNode[] = [];
  for (const dep of node.deps) {
    buildOrder = [...buildOrder, ...getBuildOrder(dep)];
    node.depth = node.deps.reduce((maxDepth, d) => Math.max(d.depth + 1, maxDepth), -1);
  }

  node.visited = true;
  return [...buildOrder, node];
}

/** Gets the names of all subdirectories for a given path. */
export function getSubdirectoryNames(dir: string): string[] {
  return readdirSync(dir).filter(f => lstatSync(join(dir, f)).isDirectory());
}

/** A node in the build graph of a package's entry-points. */
interface BuildNode {
  name: string;
  deps: BuildNode[];
  visited?: boolean;
  depth: number;
}


/**
 * Partitions nodes into groups by depth. For example,
 * [{name: a11y, depth: 1}, {name: bidi, depth: 0}, {name: platform, depth: 0}]
 * =>
 * [ [{name: bidi, depth: 0}, {name: platform, depth: 0}], [{name: a11y, depth: 1}] ]
 */
function partitionNodesByDepth(nodes: BuildNode[]): BuildNode[][] {
  const result: BuildNode[][] = [[]];
  let lastDepth = 0;

  nodes.sort((a, b) => a.depth - b.depth).forEach(node => {
    if (node.depth === lastDepth) {
      result[result.length - 1].push(node);
    } else {
      result.push([node]);
      lastDepth = node.depth;
    }
  });

  return result;
}

/** Builds the command that will be executed to find all import statements for a package. */
function buildPackageImportStatementFindCommand(searchDirectory: string, packageName: string) {
  if (platform() === 'win32') {
    return {
      binary: 'findstr',
      args: ['/r', `from.'@angular/${packageName}/.*'`, `${searchDirectory}\\*.ts`]
    };
  } else {
    return {
      binary: 'grep',
      args: ['-Eroh', '--include', '*.ts', `from '@angular/${packageName}/.+';`, searchDirectory]
    };
  }
}
