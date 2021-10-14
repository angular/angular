require('ts-node').register({
  dir: __dirname,
  transpileOnly: true,
  compilerOptions: {module: 'commonjs'},
});

const {parse} = require('semver');
const {assertValidFrameworkPeerDependency} = require('./check-framework-peer-dependency');
const {assertValidUpdateMigrationCollections} = require('./check-migration-collections');

async function main(newVersion) {
  await assertValidFrameworkPeerDependency(newVersion);
  await assertValidUpdateMigrationCollections(newVersion);
}

if (require.main === module) {
  const newVersion = parse(process.argv[2]);

  if (newVersion === null) {
    throw Error('No proper version specified for release checks.');
  }

  main(newVersion).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
