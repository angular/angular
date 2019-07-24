import { browser } from 'protractor';
import {OnPrepareConfig, runServer} from '@bazel/protractor/protractor-utils';

export = function(config: OnPrepareConfig) {
  const portFlag = /prodserver(\.exe)?$/.test(config.server) ? '-p' : '-port';
  return runServer(config.workspace, config.server, portFlag, [])
    .then(serverSpec => {
      const serverUrl = `http://localhost:${serverSpec.port}`;
      console.log(`Server has been started, starting tests against ${serverUrl}`);
      browser.baseUrl = serverUrl;
    });
}
