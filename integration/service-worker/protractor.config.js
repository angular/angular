exports.config = {
    baseUrl: 'http://localhost:8080/',
    specs: ['dist-e2e/test/*_e2e.js'],
    directConnect: true,
    exclude: [],
    multiCapabilities: [{
        browserName: 'chrome',
        chromeOptions: {
            args: ['--no-sandbox'],
            binary: process.env.CHROME_BIN,
            prefs: {
                'profile.content_settings.exceptions.push_messaging': {
                    'http://localhost:8080,http://localhost:8080': { 'setting': 1 }
                },
                'profile.content_settings.exceptions.notifications': {
                    'http://localhost:8080,*': {
                        'setting': 1,
                        'last_used': '1467058850.735089'
                    }
                }
            }
        }
    }],
    allScriptsTimeout: 110000,
    getPageTimeout: 100000,
    framework: 'jasmine2',
    jasmineNodeOpts: {
        isVerbose: false,
        showColors: true,
        includeStackTrace: false,
        defaultTimeoutInterval: 400000
    },
    
    /**
     * ng2 related configuration
     *
     * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
     * `rootEl`
     *
     */
     useAllAngular2AppRoots: true,
};
