const {legacyFakeTimers, modernFakeTimers} = global;

require('../../../../dist/bin/packages/zone.js/npm_package/dist/zone');
require('../../../../dist/bin/packages/zone.js/npm_package/dist/zone-testing');

if (Zone && Zone.patchJestObject) {
  Zone.patchJestObject(legacyFakeTimers);
  Zone.patchJestObject(modernFakeTimers);
}
