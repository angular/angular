import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as ts from 'typescript';

export async function findAllEntryPointsAndExportedModules(packagePath: string) {
  const packageJsonRaw = await fs.readFile(path.join(packagePath, 'package.json'), 'utf8');
  const packageJson = JSON.parse(packageJsonRaw) as {
    name: string;
    exports: Record<string, Record<string, string>>;
  };
  const tasks: Promise<{importPath: string; symbolName: string}[]>[] = [];

  for (const [subpath, conditions] of Object.entries(packageJson.exports)) {
    if (conditions['types'] === undefined) {
      continue;
    }

    // Skip wild-card conditions. Those are not entry-points. e.g. common/locales.
    if (conditions['types'].includes('*')) {
      continue;
    }

    tasks.push(
      (async () => {
        const dtsFile = path.join(packagePath, conditions['types']);
        const dtsBundleFile = ts.createSourceFile(
          dtsFile,
          await fs.readFile(dtsFile, 'utf8'),
          ts.ScriptTarget.ESNext,
          false,
        );

        return scanExportsForModules(dtsBundleFile).map((e) => ({
          importPath: path.posix.join(packageJson.name, subpath),
          symbolName: e,
        }));
      })(),
    );
  }

  const moduleExports = (await Promise.all(tasks)).flat();

  return {name: packageJson.name, packagePath, moduleExports};
}

function scanExportsForModules(sf: ts.SourceFile): string[] {
  const moduleExports: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isExportDeclaration(node) &&
      node.exportClause !== undefined &&
      ts.isNamedExports(node.exportClause)
    ) {
      moduleExports.push(
        ...node.exportClause.elements
          .filter(
            (e) =>
              e.name.text.endsWith('Module') &&
              // Check if the first letter is upper-case.
              e.name.text[0].toLowerCase() !== e.name.text[0],
          )
          .map((e) => e.name.text),
      );
    }
  };

  ts.forEachChild(sf, visit);

  return moduleExports;
}
