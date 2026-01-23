const exportFakeTimersToSandboxGlobal = function (jestEnv) {
  jestEnv.global.legacyFakeTimers = jestEnv.fakeTimers;
  jestEnv.global.modernFakeTimers = jestEnv.fakeTimersModern;
};

module.exports = exportFakeTimersToSandboxGlobal;
