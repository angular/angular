const JsDOMEnvironment = require('jest-environment-jsdom');
const exportFakeTimersToSandboxGlobal = require('./jest-zone-patch-fake-timer');

class ZoneJsDOMEnvironment extends JsDOMEnvironment {
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

module.exports = ZoneJsDOMEnvironment;
