const {legacyFakeTimers, modernFakeTimers} = global;

require('../../../../dist/bin/packages/zone.js/npm_package/bundles/zone.umd.js');
require('../../../../dist/bin/packages/zone.js/npm_package/bundles/zone-testing.umd.js');

if (Zone && Zone.patchJestObject) {
  Zone.patchJestObject(legacyFakeTimers);
  Zone.patchJestObject(modernFakeTimers);
}
