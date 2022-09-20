const JSDOMEnvironment = require('jest-environment-jsdom').default;
const exportFakeTimersToSandboxGlobal = require('./jest-zone-patch-fake-timer');

class ZoneJsDOMEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
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
