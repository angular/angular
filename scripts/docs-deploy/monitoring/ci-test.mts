import {runMonitorTestsForStable} from './index.mjs';

try {
  await runMonitorTestsForStable();
} catch (e) {
  console.error(e);
  process.exitCode = 1;
}
