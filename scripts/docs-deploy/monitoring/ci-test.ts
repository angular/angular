import {runMonitorTestsForStable} from './index';

if (require.main === module) {
  runMonitorTestsForStable().catch(e => {
    console.error(e);
    process.exitCode = 1;
  });
}
