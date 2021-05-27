'use strict';

var tslib = require('tslib');
var fs = require('fs');
var path = require('path');
require('chalk');
require('inquirer');
var child_process = require('child_process');
var semver = require('semver');
var graphql = require('@octokit/graphql');
var rest = require('@octokit/rest');
var typedGraphqlify = require('typed-graphqlify');
var url = require('url');

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Whether the current environment is in dry run mode. */
function isDryRun() {
    return process.env['DRY_RUN'] !== undefined;
}
/** Error to be thrown when a function or method is called in dryRun mode and shouldn't be. */
var DryRunError = /** @class */ (function (_super) {
    tslib.__extends(DryRunError, _super);
    function DryRunError() {
        var _this = _super.call(this, 'Cannot call this function in dryRun mode.') || this;
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(_this, DryRunError.prototype);
        return _this;
    }
    return DryRunError;
}(Error));

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Error for failed Github API requests. */
var GithubApiRequestError = /** @class */ (function (_super) {
    tslib.__extends(GithubApiRequestError, _super);
    function GithubApiRequestError(status, message) {
        var _this = _super.call(this, message) || this;
        _this.status = status;
        return _this;
    }
    return GithubApiRequestError;
}(Error));
/** A Github client for interacting with the Github APIs. */
var GithubClient = /** @class */ (function () {
    function GithubClient(_octokitOptions) {
        this._octokitOptions = _octokitOptions;
        /** The octokit instance actually performing API requests. */
        this._octokit = new rest.Octokit(this._octokitOptions);
        this.pulls = this._octokit.pulls;
        this.repos = this._octokit.repos;
        this.issues = this._octokit.issues;
        this.git = this._octokit.git;
        this.rateLimit = this._octokit.rateLimit;
        this.teams = this._octokit.teams;
        // Note: These are properties from `Octokit` that are brought in by optional plugins.
        // TypeScript requires us to provide an explicit type for these.
        this.rest = this._octokit.rest;
        this.paginate = this._octokit.paginate;
    }
    return GithubClient;
}());
/**
 * Extension of the `GithubClient` that provides utilities which are specific
 * to authenticated instances.
 */
var AuthenticatedGithubClient = /** @class */ (function (_super) {
    tslib.__extends(AuthenticatedGithubClient, _super);
    function AuthenticatedGithubClient(_token) {
        var _this = 
        // Set the token for the octokit instance.
        _super.call(this, { auth: _token }) || this;
        _this._token = _token;
        /** The graphql instance with authentication set during construction. */
        _this._graphql = graphql.graphql.defaults({ headers: { authorization: "token " + _this._token } });
        return _this;
    }
    /** Perform a query using Github's Graphql API. */
    AuthenticatedGithubClient.prototype.graphql = function (queryObject, params) {
        if (params === void 0) { params = {}; }
        return tslib.__awaiter(this, void 0, void 0, function () {
            return tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._graphql(typedGraphqlify.query(queryObject).toString(), params)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    return AuthenticatedGithubClient;
}(GithubClient));

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Adds the provided token to the given Github HTTPs remote url. */
function addTokenToGitHttpsUrl(githubHttpsUrl, token) {
    var url$1 = new url.URL(githubHttpsUrl);
    url$1.username = token;
    return url$1.href;
}
/** Gets the repository Git URL for the given github config. */
function getRepositoryGitUrl(config, githubToken) {
    if (config.useSsh) {
        return "git@github.com:" + config.owner + "/" + config.name + ".git";
    }
    var baseHttpUrl = "https://github.com/" + config.owner + "/" + config.name + ".git";
    if (githubToken !== undefined) {
        return addTokenToGitHttpsUrl(baseHttpUrl, githubToken);
    }
    return baseHttpUrl;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Error for failed Git commands. */
var GitCommandError = /** @class */ (function (_super) {
    tslib.__extends(GitCommandError, _super);
    function GitCommandError(client, args) {
        var _this = 
        // Errors are not guaranteed to be caught. To ensure that we don't
        // accidentally leak the Github token that might be used in a command,
        // we sanitize the command that will be part of the error message.
        _super.call(this, "Command failed: git " + client.sanitizeConsoleOutput(args.join(' '))) || this;
        _this.args = args;
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(_this, GitCommandError.prototype);
        return _this;
    }
    return GitCommandError;
}(Error));
/** Class that can be used to perform Git interactions with a given remote. **/
var GitClient = /** @class */ (function () {
    function GitClient(
    /** The full path to the root of the repository base. */
    baseDir, 
    /** The configuration, containing the github specific configuration. */
    config) {
        if (baseDir === void 0) { baseDir = determineRepoBaseDirFromCwd(); }
        if (config === void 0) { config = getConfig(baseDir); }
        this.baseDir = baseDir;
        this.config = config;
        /** Short-hand for accessing the default remote configuration. */
        this.remoteConfig = this.config.github;
        /** Octokit request parameters object for targeting the configured remote. */
        this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
        /** Instance of the Github client. */
        this.github = new GithubClient();
    }
    /** Executes the given git command. Throws if the command fails. */
    GitClient.prototype.run = function (args, options) {
        var result = this.runGraceful(args, options);
        if (result.status !== 0) {
            throw new GitCommandError(this, args);
        }
        // Omit `status` from the type so that it's obvious that the status is never
        // non-zero as explained in the method description.
        return result;
    };
    /**
     * Spawns a given Git command process. Does not throw if the command fails. Additionally,
     * if there is any stderr output, the output will be printed. This makes it easier to
     * info failed commands.
     */
    GitClient.prototype.runGraceful = function (args, options) {
        if (options === void 0) { options = {}; }
        /** The git command to be run. */
        var gitCommand = args[0];
        if (isDryRun() && gitCommand === 'push') {
            debug("\"git push\" is not able to be run in dryRun mode.");
            throw new DryRunError();
        }
        // To improve the debugging experience in case something fails, we print all executed Git
        // commands at the DEBUG level to better understand the git actions occurring. Verbose logging,
        // always logging at the INFO level, can be enabled either by setting the verboseLogging
        // property on the GitClient class or the options object provided to the method.
        var printFn = (GitClient.verboseLogging || options.verboseLogging) ? info : debug;
        // Note that we sanitize the command before printing it to the console. We do not want to
        // print an access token if it is contained in the command. It's common to share errors with
        // others if the tool failed, and we do not want to leak tokens.
        printFn('Executing: git', this.sanitizeConsoleOutput(args.join(' ')));
        var result = child_process.spawnSync('git', args, tslib.__assign(tslib.__assign({ cwd: this.baseDir, stdio: 'pipe' }, options), { 
            // Encoding is always `utf8` and not overridable. This ensures that this method
            // always returns `string` as output instead of buffers.
            encoding: 'utf8' }));
        if (result.stderr !== null) {
            // Git sometimes prints the command if it failed. This means that it could
            // potentially leak the Github token used for accessing the remote. To avoid
            // printing a token, we sanitize the string before printing the stderr output.
            process.stderr.write(this.sanitizeConsoleOutput(result.stderr));
        }
        return result;
    };
    /** Git URL that resolves to the configured repository. */
    GitClient.prototype.getRepoGitUrl = function () {
        return getRepositoryGitUrl(this.remoteConfig);
    };
    /** Whether the given branch contains the specified SHA. */
    GitClient.prototype.hasCommit = function (branchName, sha) {
        return this.run(['branch', branchName, '--contains', sha]).stdout !== '';
    };
    /** Gets the currently checked out branch or revision. */
    GitClient.prototype.getCurrentBranchOrRevision = function () {
        var branchName = this.run(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
        // If no branch name could be resolved. i.e. `HEAD` has been returned, then Git
        // is currently in a detached state. In those cases, we just want to return the
        // currently checked out revision/SHA.
        if (branchName === 'HEAD') {
            return this.run(['rev-parse', 'HEAD']).stdout.trim();
        }
        return branchName;
    };
    /** Gets whether the current Git repository has uncommitted changes. */
    GitClient.prototype.hasUncommittedChanges = function () {
        return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
    };
    /**
     * Checks out a requested branch or revision, optionally cleaning the state of the repository
     * before attempting the checking. Returns a boolean indicating whether the branch or revision
     * was cleanly checked out.
     */
    GitClient.prototype.checkout = function (branchOrRevision, cleanState) {
        if (cleanState) {
            // Abort any outstanding ams.
            this.runGraceful(['am', '--abort'], { stdio: 'ignore' });
            // Abort any outstanding cherry-picks.
            this.runGraceful(['cherry-pick', '--abort'], { stdio: 'ignore' });
            // Abort any outstanding rebases.
            this.runGraceful(['rebase', '--abort'], { stdio: 'ignore' });
            // Clear any changes in the current repo.
            this.runGraceful(['reset', '--hard'], { stdio: 'ignore' });
        }
        return this.runGraceful(['checkout', branchOrRevision], { stdio: 'ignore' }).status === 0;
    };
    /** Gets the latest git tag on the current branch that matches SemVer. */
    GitClient.prototype.getLatestSemverTag = function () {
        var semVerOptions = { loose: true };
        var tags = this.runGraceful(['tag', '--sort=-committerdate', '--merged']).stdout.split('\n');
        var latestTag = tags.find(function (tag) { return semver.parse(tag, semVerOptions); });
        if (latestTag === undefined) {
            throw new Error("Unable to find a SemVer matching tag on \"" + this.getCurrentBranchOrRevision() + "\"");
        }
        return new semver.SemVer(latestTag, semVerOptions);
    };
    /** Retrieves the git tag matching the provided SemVer, if it exists. */
    GitClient.prototype.getMatchingTagForSemver = function (semver$1) {
        var semVerOptions = { loose: true };
        var tags = this.runGraceful(['tag', '--sort=-committerdate', '--merged']).stdout.split('\n');
        var matchingTag = tags.find(function (tag) { var _a; return ((_a = semver.parse(tag, semVerOptions)) === null || _a === void 0 ? void 0 : _a.compare(semver$1)) === 0; });
        if (matchingTag === undefined) {
            throw new Error("Unable to find a tag for the version: \"" + semver$1.format() + "\"");
        }
        return matchingTag;
    };
    /** Retrieve a list of all files in the repository changed since the provided shaOrRef. */
    GitClient.prototype.allChangesFilesSince = function (shaOrRef) {
        if (shaOrRef === void 0) { shaOrRef = 'HEAD'; }
        return Array.from(new Set(tslib.__spreadArray(tslib.__spreadArray([], tslib.__read(gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=d', shaOrRef])))), tslib.__read(gitOutputAsArray(this.runGraceful(['ls-files', '--others', '--exclude-standard']))))));
    };
    /** Retrieve a list of all files currently staged in the repostitory. */
    GitClient.prototype.allStagedFiles = function () {
        return gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=ACM', '--staged']));
    };
    /** Retrieve a list of all files tracked in the repository. */
    GitClient.prototype.allFiles = function () {
        return gitOutputAsArray(this.runGraceful(['ls-files']));
    };
    /**
     * Sanitizes the given console message. This method can be overridden by
     * derived classes. e.g. to sanitize access tokens from Git commands.
     */
    GitClient.prototype.sanitizeConsoleOutput = function (value) {
        return value;
    };
    /** Set the verbose logging state of all git client instances. */
    GitClient.setVerboseLoggingState = function (verbose) {
        GitClient.verboseLogging = verbose;
    };
    /**
     * Static method to get the singleton instance of the `GitClient`, creating it
     * if it has not yet been created.
     */
    GitClient.get = function () {
        if (!this._unauthenticatedInstance) {
            GitClient._unauthenticatedInstance = new GitClient();
        }
        return GitClient._unauthenticatedInstance;
    };
    /** Whether verbose logging of Git actions should be used. */
    GitClient.verboseLogging = false;
    return GitClient;
}());
/**
 * Takes the output from `run` and `runGraceful` and returns an array of strings for each
 * new line. Git commands typically return multiple output values for a command a set of
 * strings separated by new lines.
 *
 * Note: This is specifically created as a locally available function for usage as convenience
 * utility within `GitClient`'s methods to create outputs as array.
 */
function gitOutputAsArray(gitCommandResult) {
    return gitCommandResult.stdout.split('\n').map(function (x) { return x.trim(); }).filter(function (x) { return !!x; });
}
/** Determines the repository base directory from the current working directory. */
function determineRepoBaseDirFromCwd() {
    // TODO(devversion): Replace with common spawn sync utility once available.
    var _a = child_process.spawnSync('git', ['rev-parse --show-toplevel'], { shell: true, stdio: 'pipe', encoding: 'utf8' }), stdout = _a.stdout, stderr = _a.stderr, status = _a.status;
    if (status !== 0) {
        throw Error("Unable to find the path to the base directory of the repository.\n" +
            "Was the command run from inside of the repo?\n\n" +
            ("" + stderr));
    }
    return stdout.trim();
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Supported levels for logging functions.
 *
 * Levels are mapped to numbers to represent a hierarchy of logging levels.
 */
var LOG_LEVELS;
(function (LOG_LEVELS) {
    LOG_LEVELS[LOG_LEVELS["SILENT"] = 0] = "SILENT";
    LOG_LEVELS[LOG_LEVELS["ERROR"] = 1] = "ERROR";
    LOG_LEVELS[LOG_LEVELS["WARN"] = 2] = "WARN";
    LOG_LEVELS[LOG_LEVELS["LOG"] = 3] = "LOG";
    LOG_LEVELS[LOG_LEVELS["INFO"] = 4] = "INFO";
    LOG_LEVELS[LOG_LEVELS["DEBUG"] = 5] = "DEBUG";
})(LOG_LEVELS || (LOG_LEVELS = {}));
/** Default log level for the tool. */
var DEFAULT_LOG_LEVEL = LOG_LEVELS.INFO;
/** Write to the console for at INFO logging level */
var info = buildLogLevelFunction(function () { return console.info; }, LOG_LEVELS.INFO);
/** Write to the console for at ERROR logging level */
var error = buildLogLevelFunction(function () { return console.error; }, LOG_LEVELS.ERROR);
/** Write to the console for at DEBUG logging level */
var debug = buildLogLevelFunction(function () { return console.debug; }, LOG_LEVELS.DEBUG);
/** Write to the console for at LOG logging level */
// tslint:disable-next-line: no-console
var log = buildLogLevelFunction(function () { return console.log; }, LOG_LEVELS.LOG);
/** Write to the console for at WARN logging level */
var warn = buildLogLevelFunction(function () { return console.warn; }, LOG_LEVELS.WARN);
/** Build an instance of a logging function for the provided level. */
function buildLogLevelFunction(loadCommand, level) {
    /** Write to stdout for the LOG_LEVEL. */
    var loggingFunction = function () {
        var text = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            text[_i] = arguments[_i];
        }
        runConsoleCommand.apply(void 0, tslib.__spreadArray([loadCommand, level], tslib.__read(text)));
    };
    /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
    loggingFunction.group = function (text, collapsed) {
        if (collapsed === void 0) { collapsed = false; }
        var command = collapsed ? console.groupCollapsed : console.group;
        runConsoleCommand(function () { return command; }, level, text);
    };
    /** End the group at the LOG_LEVEL. */
    loggingFunction.groupEnd = function () {
        runConsoleCommand(function () { return console.groupEnd; }, level);
    };
    return loggingFunction;
}
/**
 * Run the console command provided, if the environments logging level greater than the
 * provided logging level.
 *
 * The loadCommand takes in a function which is called to retrieve the console.* function
 * to allow for jasmine spies to still work in testing.  Without this method of retrieval
 * the console.* function, the function is saved into the closure of the created logging
 * function before jasmine can spy.
 */
function runConsoleCommand(loadCommand, logLevel) {
    var text = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        text[_i - 2] = arguments[_i];
    }
    if (getLogLevel() >= logLevel) {
        loadCommand().apply(void 0, tslib.__spreadArray([], tslib.__read(text)));
    }
    printToLogFile.apply(void 0, tslib.__spreadArray([logLevel], tslib.__read(text)));
}
/**
 * Retrieve the log level from environment variables, if the value found
 * based on the LOG_LEVEL environment variable is undefined, return the default
 * logging level.
 */
function getLogLevel() {
    var logLevelEnvValue = (process.env["LOG_LEVEL"] || '').toUpperCase();
    var logLevel = LOG_LEVELS[logLevelEnvValue];
    if (logLevel === undefined) {
        return DEFAULT_LOG_LEVEL;
    }
    return logLevel;
}
/**
 * The number of columns used in the prepended log level information on each line of the logging
 * output file.
 */
var LOG_LEVEL_COLUMNS = 7;
/** Write the provided text to the log file, prepending each line with the log level.  */
function printToLogFile(logLevel) {
    var text = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        text[_i - 1] = arguments[_i];
    }
    var logLevelText = (LOG_LEVELS[logLevel] + ":").padEnd(LOG_LEVEL_COLUMNS);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Whether ts-node has been installed and is available to ng-dev. */
function isTsNodeAvailable() {
    try {
        require.resolve('ts-node');
        return true;
    }
    catch (_a) {
        return false;
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * The filename expected for creating the ng-dev config, without the file
 * extension to allow either a typescript or javascript file to be used.
 */
var CONFIG_FILE_PATH = '.ng-dev/config';
/** The configuration for ng-dev. */
var cachedConfig = null;
function getConfig(baseDir) {
    // If the global config is not defined, load it from the file system.
    if (cachedConfig === null) {
        baseDir = baseDir || GitClient.get().baseDir;
        // The full path to the configuration file.
        var configPath = path.join(baseDir, CONFIG_FILE_PATH);
        // Read the configuration and validate it before caching it for the future.
        cachedConfig = validateCommonConfig(readConfigFile(configPath));
    }
    // Return a clone of the cached global config to ensure that a new instance of the config
    // is returned each time, preventing unexpected effects of modifications to the config object.
    return tslib.__assign({}, cachedConfig);
}
/** Validate the common configuration has been met for the ng-dev command. */
function validateCommonConfig(config) {
    var errors = [];
    // Validate the github configuration.
    if (config.github === undefined) {
        errors.push("Github repository not configured. Set the \"github\" option.");
    }
    else {
        if (config.github.name === undefined) {
            errors.push("\"github.name\" is not defined");
        }
        if (config.github.owner === undefined) {
            errors.push("\"github.owner\" is not defined");
        }
    }
    assertNoErrors(errors);
    return config;
}
/**
 * Resolves and reads the specified configuration file, optionally returning an empty object if the
 * configuration file cannot be read.
 */
function readConfigFile(configPath, returnEmptyObjectOnError) {
    if (returnEmptyObjectOnError === void 0) { returnEmptyObjectOnError = false; }
    // If the `.ts` extension has not been set up already, and a TypeScript based
    // version of the given configuration seems to exist, set up `ts-node` if available.
    if (require.extensions['.ts'] === undefined && fs.existsSync(configPath + ".ts") &&
        isTsNodeAvailable()) {
        // Ensure the module target is set to `commonjs`. This is necessary because the
        // dev-infra tool runs in NodeJS which does not support ES modules by default.
        // Additionally, set the `dir` option to the directory that contains the configuration
        // file. This allows for custom compiler options (such as `--strict`).
        require('ts-node').register({ dir: path.dirname(configPath), transpileOnly: true, compilerOptions: { module: 'commonjs' } });
    }
    try {
        return require(configPath);
    }
    catch (e) {
        if (returnEmptyObjectOnError) {
            debug("Could not read configuration file at " + configPath + ", returning empty object instead.");
            debug(e);
            return {};
        }
        error("Could not read configuration file at " + configPath + ".");
        error(e);
        process.exit(1);
    }
}
/**
 * Asserts the provided array of error messages is empty. If any errors are in the array,
 * logs the errors and exit the process as a failure.
 */
function assertNoErrors(errors) {
    var e_1, _a;
    if (errors.length == 0) {
        return;
    }
    error("Errors discovered while loading configuration file:");
    try {
        for (var errors_1 = tslib.__values(errors), errors_1_1 = errors_1.next(); !errors_1_1.done; errors_1_1 = errors_1.next()) {
            var err = errors_1_1.value;
            error("  - " + err);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (errors_1_1 && !errors_1_1.done && (_a = errors_1.return)) _a.call(errors_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    process.exit(1);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Retrieve and validate the config as `ReleaseConfig`. */
function getReleaseConfig(config = getConfig()) {
    var _a, _b, _c;
    // List of errors encountered validating the config.
    const errors = [];
    if (config.release === undefined) {
        errors.push(`No configuration defined for "release"`);
    }
    if (((_a = config.release) === null || _a === void 0 ? void 0 : _a.npmPackages) === undefined) {
        errors.push(`No "npmPackages" configured for releasing.`);
    }
    if (((_b = config.release) === null || _b === void 0 ? void 0 : _b.buildPackages) === undefined) {
        errors.push(`No "buildPackages" function configured for releasing.`);
    }
    if (((_c = config.release) === null || _c === void 0 ? void 0 : _c.releaseNotes) === undefined) {
        errors.push(`No "releaseNotes" configured for releasing.`);
    }
    assertNoErrors(errors);
    return config.release;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Start the release package building.
main(process.argv[2] === 'true');
/** Main function for building the release packages. */
function main(stampForRelease) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        if (process.send === undefined) {
            throw Error('This script needs to be invoked as a NodeJS worker.');
        }
        const config = getReleaseConfig();
        const builtPackages = yield config.buildPackages(stampForRelease);
        // Transfer the built packages back to the parent process.
        process.send(builtPackages);
    });
}
