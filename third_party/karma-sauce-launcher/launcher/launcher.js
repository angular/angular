"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const selenium_webdriver_1 = require("selenium-webdriver");
const process_config_1 = require("../process-config");
function SaucelabsLauncher(args,
/* config.sauceLabs */ config,
/* SauceConnect */ sauceConnect, browserMap, logger, baseLauncherDecorator, captureTimeoutLauncherDecorator, retryLauncherDecorator) {
    // Apply base class mixins. This would be nice to have typed, but this is a low-priority now.
    baseLauncherDecorator(this);
    captureTimeoutLauncherDecorator(this);
    retryLauncherDecorator(this);
    const log = logger.create('SaucelabsLauncher');
    const { startConnect, sauceConnectOptions, sauceApiProxy, seleniumHostUrl, seleniumCapabilities, browserName, username, accessKey } = process_config_1.processConfig(config, args);
    // Array of connected drivers. This is useful for quitting all connected drivers on kill.
    let connectedDrivers = [];
    // Setup Browser name that will be printed out by Karma.
    this.name = browserName + ' on SauceLabs';
    // Listen for the start event from Karma. I know, the API is a bit different to how you
    // would expect, but we need to follow this approach unless we want to spend more work
    // improving type safety.
    this.on('start', (pageUrl) => __awaiter(this, void 0, void 0, function* () {
        if (startConnect) {
            try {
                // In case the "startConnect" option has been enabled, establish a tunnel and wait
                // for it being ready. In case a tunnel is already active, this will just continue
                // without establishing a new one.
                yield sauceConnect.establishTunnel(sauceConnectOptions);
            }
            catch (error) {
                log.error(error);
                this._done('failure');
                return;
            }
        }
        try {
            // See the following link for public API of the selenium server.
            // https://wiki.saucelabs.com/display/DOCS/Instant+Selenium+Node.js+Tests
            const driver = yield new selenium_webdriver_1.Builder()
                .withCapabilities(seleniumCapabilities)
                .usingServer(`http://${username}:${accessKey}@${seleniumHostUrl}`)
                .build();
            // Keep track of all connected drivers because it's possible that there are multiple
            // driver instances (e.g. when running with concurrency)
            connectedDrivers.push(driver);
            const sessionId = (yield driver.getSession()).getId();
            log.info('%s session at https://saucelabs.com/tests/%s', browserName, sessionId);
            log.debug('Opening "%s" on the selenium client', pageUrl);
            // Store the information about the current session in the browserMap. This is necessary
            // because otherwise the Saucelabs reporter is not able to report results.
            browserMap.set(this.id, { sessionId, username, accessKey, proxy: sauceApiProxy });
            yield driver.get(pageUrl);
        }
        catch (e) {
            log.error(e);
            // Notify karma about the failure.
            this._done('failure');
        }
    }));
    this.on('kill', (doneFn) => __awaiter(this, void 0, void 0, function* () {
        try {

            yield Promise.all(connectedDrivers.map(driver =>
              driver.manage().logs().get("browser").then(logs => {
                logs.forEach(l => console.error(l.toJSON()));
              })
            ));

            yield Promise.all(connectedDrivers.map(driver => driver.quit()));
        }
        catch (e) {
            // We need to ignore the exception here because we want to make sure that Karma is still
            // able to retry connecting if Saucelabs itself terminated the session (and not Karma)
            // For example if the "idleTimeout" is exceeded and Saucelabs errored the session. See:
            // https://wiki.saucelabs.com/display/DOCS/Test+Didn%27t+See+a+New+Command+for+90+Seconds
            log.error('Could not quit the Saucelabs selenium connection. Failure message:');
            log.error(e);
        }
        // Reset connected drivers in case the launcher will be reused.
        connectedDrivers = [];
        doneFn();
    }));
}
exports.SaucelabsLauncher = SaucelabsLauncher;
//# sourceMappingURL=launcher.js.map
