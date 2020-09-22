const NodeEnvironment = require('jest-environment-node');
const exportFakeTimersToSandboxGlobal = require('./jest-zone-patch-fake-timer');

class ZoneNodeEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
    exportFakeTimersToSandboxGlobal(this);
  }

  async setup() {
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = ZoneNodeEnvironment;
