import { browser } from 'protractor';
import {OnPrepareConfig, runServer} from '@bazel/protractor/protractor-utils';
import * as path from 'path';

export = function(config: OnPrepareConfig) {
  const isProdserver = path.basename(config.server, path.extname(config.server)) === 'prodserver';
  return runServer(config.workspace, config.server, isProdserver ? '-p' : '-port', [])
    .then(serverSpec => {
      const serverUrl = `http://localhost:${serverSpec.port}`;
      console.log(`Server has been started, starting tests against ${serverUrl}`);
      browser.baseUrl = serverUrl;
    });
}
