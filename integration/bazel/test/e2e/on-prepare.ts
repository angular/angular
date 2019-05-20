import {OnPrepareConfig, startServer} from '@angular/bazel/protractor-utils';

export = function(config: OnPrepareConfig) {
  const portFlag = /prodserver(\.exe)?$/.test(config.server) ? '-p' : '-port';
  return startServer({config, portFlag})
    .then(serverSpec => {
      const serverUrl = `http://localhost:${serverSpec.port}`;
      console.log(`Server has been started, starting tests against ${serverUrl}`);
      global['protractorBaseUrl'] = serverUrl;
    });
}
