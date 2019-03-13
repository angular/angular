"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function processConfig(config = {}, args = {}) {
    const username = config.username || process.env.SAUCE_USERNAME;
    const accessKey = config.accessKey || process.env.SAUCE_ACCESS_KEY;
    const startConnect = config.startConnect !== false;
    let tunnelIdentifier = args.tunnelIdentifier || config.tunnelIdentifier;
    let seleniumHostUrl = 'ondemand.saucelabs.com:80/wd/hub';
    // TODO: This option is very ambiguous because it technically only affects the reporter. Consider
    // renaming in the future.
    const sauceApiProxy = args.proxy || config.proxy;
    // Browser name that will be printed out by Karma.
    const browserName = args.browserName +
        (args.version ? ' ' + args.version : '') +
        (args.platform ? ' (' + args.platform + ')' : '');
    // In case "startConnect" is enabled, and no tunnel identifier has been specified, we just
    // generate one randomly. This makes it possible for developers to use "startConnect" with
    // zero setup.
    if (!tunnelIdentifier && startConnect) {
        tunnelIdentifier = 'karma-sauce-' + Math.round(new Date().getTime() / 1000);
    }
    // Support passing a custom selenium location.
    // TODO: This should be just an URL that can be passed. Holding off to avoid breaking changes.
    if (config.connectLocationForSERelay) {
        seleniumHostUrl = `${config.connectLocationForSERelay}:${config.connectPortForSERelay || 80}`;
    }
    const capabilitiesFromConfig = {
        build: config.build,
        commandTimeout: config.commandTimeout || 300,
        customData: config.customData || {},
        idleTimeout: config.idleTimeout || 90,
        maxDuration: config.maxDuration || 1800,
        name: config.testName || 'Saucelabs Launcher Tests',
        parentTunnel: config.parentTunnel,
        public: config.public || 'public',
        recordScreenshots: config.recordScreenshots,
        recordVideo: config.recordVideo,
        tags: config.tags || [],
        tunnelIdentifier: tunnelIdentifier,
        'custom-data': config.customData,
    };
    const sauceConnectOptions = Object.assign({ 
        // By default, we just pass in the general Saucelabs credentials for establishing the
        // SauceConnect tunnel. This makes it possible to use "startConnect" with no additional setup.
        username: username, accessKey: accessKey, tunnelIdentifier: tunnelIdentifier }, config.connectOptions);
    const seleniumCapabilities = Object.assign({}, capabilitiesFromConfig, config.options, args);
    return {
        startConnect,
        sauceConnectOptions,
        sauceApiProxy,
        seleniumHostUrl,
        seleniumCapabilities,
        browserName,
        username,
        accessKey,
    };
}
exports.processConfig = processConfig;
//# sourceMappingURL=process-config.js.map