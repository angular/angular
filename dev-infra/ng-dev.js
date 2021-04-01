#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var yargs = require('yargs');
var tslib = require('tslib');
var chalk = _interopDefault(require('chalk'));
var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var shelljs = require('shelljs');
var url = require('url');
var child_process = require('child_process');
var graphql = require('@octokit/graphql');
var Octokit = require('@octokit/rest');
var typedGraphqlify = require('typed-graphqlify');
var fetch = _interopDefault(require('node-fetch'));
var semver = require('semver');
var multimatch = require('multimatch');
var yaml = require('yaml');
var conventionalCommitsParser = require('conventional-commits-parser');
var gitCommits_ = require('git-raw-commits');
var cliProgress = require('cli-progress');
var os = require('os');
var minimatch = require('minimatch');
var ora = require('ora');
var glob = require('glob');
var ts = require('typescript');

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Runs an given command as child process. By default, child process
 * output will not be printed.
 */
function exec(cmd, opts) {
    return shelljs.exec(cmd, tslib.__assign(tslib.__assign({ silent: true }, opts), { async: false }));
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
/**
 * The filename expected for local user config, without the file extension to allow a typescript,
 * javascript or json file to be used.
 */
var USER_CONFIG_FILE_PATH = '.ng-dev.user';
/** The local user configuration for ng-dev. */
var userConfig = null;
/**
 * Get the configuration from the file system, returning the already loaded
 * copy if it is defined.
 */
function getConfig() {
    // If the global config is not defined, load it from the file system.
    if (cachedConfig === null) {
        // The full path to the configuration file.
        var configPath = path.join(getRepoBaseDir(), CONFIG_FILE_PATH);
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
/** Gets the path of the directory for the repository base. */
function getRepoBaseDir() {
    var baseRepoDir = exec("git rev-parse --show-toplevel");
    if (baseRepoDir.code) {
        throw Error("Unable to find the path to the base directory of the repository.\n" +
            "Was the command run from inside of the repo?\n\n" +
            ("ERROR:\n " + baseRepoDir.stderr));
    }
    return baseRepoDir.trim();
}
/**
 * Get the local user configuration from the file system, returning the already loaded copy if it is
 * defined.
 *
 * @returns The user configuration object, or an empty object if no user configuration file is
 * present. The object is an untyped object as there are no required user configurations.
 */
function getUserConfig() {
    // If the global config is not defined, load it from the file system.
    if (userConfig === null) {
        // The full path to the configuration file.
        var configPath = path.join(getRepoBaseDir(), USER_CONFIG_FILE_PATH);
        // Set the global config object.
        userConfig = readConfigFile(configPath, true);
    }
    // Return a clone of the user config to ensure that a new instance of the config is returned
    // each time, preventing unexpected effects of modifications to the config object.
    return tslib.__assign({}, userConfig);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Reexport of chalk colors for convenient access. */
var red = chalk.red;
var green = chalk.green;
var yellow = chalk.yellow;
var bold = chalk.bold;
var blue = chalk.blue;
/** Prompts the user with a confirmation question and a specified message. */
function promptConfirm(message, defaultValue) {
    if (defaultValue === void 0) { defaultValue = false; }
    return tslib.__awaiter(this, void 0, void 0, function () {
        return tslib.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer.prompt({
                        type: 'confirm',
                        name: 'result',
                        message: message,
                        default: defaultValue,
                    })];
                case 1: return [2 /*return*/, (_a.sent())
                        .result];
            }
        });
    });
}
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
/** All text to write to the log file. */
var LOGGED_TEXT = '';
/** Whether file logging as been enabled. */
var FILE_LOGGING_ENABLED = false;
/**
 * The number of columns used in the prepended log level information on each line of the logging
 * output file.
 */
var LOG_LEVEL_COLUMNS = 7;
/**
 * Enable writing the logged outputs to the log file on process exit, sets initial lines from the
 * command execution, containing information about the timing and command parameters.
 *
 * This is expected to be called only once during a command run, and should be called by the
 * middleware of yargs to enable the file logging before the rest of the command parsing and
 * response is executed.
 */
function captureLogOutputForCommand(argv) {
    if (FILE_LOGGING_ENABLED) {
        throw Error('`captureLogOutputForCommand` cannot be called multiple times');
    }
    /** The date time used for timestamping when the command was invoked. */
    var now = new Date();
    /** Header line to separate command runs in log files. */
    var headerLine = Array(100).fill('#').join('');
    LOGGED_TEXT += headerLine + "\nCommand: " + argv.$0 + " " + argv._.join(' ') + "\nRan at: " + now + "\n";
    // On process exit, write the logged output to the appropriate log files
    process.on('exit', function (code) {
        LOGGED_TEXT += headerLine + "\n";
        LOGGED_TEXT += "Command ran in " + (new Date().getTime() - now.getTime()) + "ms\n";
        LOGGED_TEXT += "Exit Code: " + code + "\n";
        /** Path to the log file location. */
        var logFilePath = path.join(getRepoBaseDir(), '.ng-dev.log');
        // Strip ANSI escape codes from log outputs.
        LOGGED_TEXT = LOGGED_TEXT.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]/g, '');
        fs.writeFileSync(logFilePath, LOGGED_TEXT);
        // For failure codes greater than 1, the new logged lines should be written to a specific log
        // file for the command run failure.
        if (code > 1) {
            var logFileName = ".ng-dev.err-" + now.getTime() + ".log";
            console.error("Exit code: " + code + ". Writing full log to " + logFileName);
            fs.writeFileSync(path.join(getRepoBaseDir(), logFileName), LOGGED_TEXT);
        }
    });
    // Mark file logging as enabled to prevent the function from executing multiple times.
    FILE_LOGGING_ENABLED = true;
}
/** Write the provided text to the log file, prepending each line with the log level.  */
function printToLogFile(logLevel) {
    var text = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        text[_i - 1] = arguments[_i];
    }
    var logLevelText = (LOG_LEVELS[logLevel] + ":").padEnd(LOG_LEVEL_COLUMNS);
    LOGGED_TEXT += text.join(' ').split('\n').map(function (l) { return logLevelText + " " + l + "\n"; }).join('');
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** URL to the Github page where personal access tokens can be managed. */
var GITHUB_TOKEN_SETTINGS_URL = 'https://github.com/settings/tokens';
/** URL to the Github page where personal access tokens can be generated. */
var GITHUB_TOKEN_GENERATE_URL = 'https://github.com/settings/tokens/new';
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
/** Gets a Github URL that refers to a list of recent commits within a specified branch. */
function getListCommitsInBranchUrl(_a, branchName) {
    var remoteParams = _a.remoteParams;
    return "https://github.com/" + remoteParams.owner + "/" + remoteParams.repo + "/commits/" + branchName;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Sets up the `github-token` command option for the given Yargs instance. */
function addGithubTokenOption(yargs) {
    return yargs
        // 'github-token' is casted to 'githubToken' to properly set up typings to reflect the key in
        // the Argv object being camelCase rather than kebob case due to the `camel-case-expansion`
        // config: https://github.com/yargs/yargs-parser#camel-case-expansion
        .option('github-token', {
        type: 'string',
        description: 'Github token. If not set, token is retrieved from the environment variables.',
        coerce: function (token) {
            var githubToken = token || process.env.GITHUB_TOKEN || process.env.TOKEN;
            if (!githubToken) {
                error(red('No Github token set. Please set the `GITHUB_TOKEN` environment variable.'));
                error(red('Alternatively, pass the `--github-token` command line flag.'));
                error(yellow("You can generate a token here: " + GITHUB_TOKEN_GENERATE_URL));
                process.exit(1);
            }
            return githubToken;
        },
    })
        .default('github-token', '', '<LOCAL TOKEN>');
}

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
/**
 * A Github client for interacting with the Github APIs.
 *
 * Additionally, provides convenience methods for actions which require multiple requests, or
 * would provide value from memoized style responses.
 **/
var GithubClient = /** @class */ (function (_super) {
    tslib.__extends(GithubClient, _super);
    function GithubClient(token) {
        var _this = 
        // Pass in authentication token to base Octokit class.
        _super.call(this, { auth: token }) || this;
        /** The current user based on checking against the Github API. */
        _this._currentUser = null;
        _this.hook.error('request', function (error) {
            // Wrap API errors in a known error class. This allows us to
            // expect Github API errors better and in a non-ambiguous way.
            throw new GithubApiRequestError(error.status, error.message);
        });
        // Create authenticated graphql client.
        _this.graphql = new GithubGraphqlClient(token);
        return _this;
    }
    /** Retrieve the login of the current user from Github. */
    GithubClient.prototype.getCurrentUser = function () {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the current user has already been retrieved return the current user value again.
                        if (this._currentUser !== null) {
                            return [2 /*return*/, this._currentUser];
                        }
                        return [4 /*yield*/, this.graphql.query({
                                viewer: {
                                    login: typedGraphqlify.types.string,
                                }
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, this._currentUser = result.viewer.login];
                }
            });
        });
    };
    return GithubClient;
}(Octokit));
/** A client for interacting with Github's GraphQL API. */
var GithubGraphqlClient = /** @class */ (function () {
    function GithubGraphqlClient(token) {
        /** The Github GraphQL (v4) API. */
        this.graqhql = graphql.graphql;
        // Set the default headers to include authorization with the provided token for all
        // graphQL calls.
        if (token) {
            this.graqhql = this.graqhql.defaults({ headers: { authorization: "token " + token } });
        }
    }
    /** Perform a query using Github's GraphQL API. */
    GithubGraphqlClient.prototype.query = function (queryObject, params) {
        if (params === void 0) { params = {}; }
        return tslib.__awaiter(this, void 0, void 0, function () {
            var queryString;
            return tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryString = typedGraphqlify.query(queryObject);
                        return [4 /*yield*/, this.graqhql(queryString, params)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    return GithubGraphqlClient;
}());

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
        _super.call(this, "Command failed: git " + client.omitGithubTokenFromMessage(args.join(' '))) || this;
        _this.args = args;
        return _this;
    }
    return GitCommandError;
}(Error));
/**
 * Common client for performing Git interactions with a given remote.
 *
 * Takes in two optional arguments:
 *   `githubToken`: the token used for authentication in Github interactions, by default empty
 *     allowing readonly actions.
 *   `config`: The dev-infra configuration containing information about the remote. By default
 *     the dev-infra configuration is loaded with its Github configuration.
 **/
var GitClient = /** @class */ (function () {
    function GitClient(githubToken, _config, _projectRoot) {
        if (_config === void 0) { _config = getConfig(); }
        if (_projectRoot === void 0) { _projectRoot = getRepoBaseDir(); }
        this.githubToken = githubToken;
        this._config = _config;
        this._projectRoot = _projectRoot;
        /** Short-hand for accessing the default remote configuration. */
        this.remoteConfig = this._config.github;
        /** Octokit request parameters object for targeting the configured remote. */
        this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
        /** Git URL that resolves to the configured repository. */
        this.repoGitUrl = getRepositoryGitUrl(this.remoteConfig, this.githubToken);
        /** Instance of the authenticated Github octokit API. */
        this.github = new GithubClient(this.githubToken);
        /** The OAuth scopes available for the provided Github token. */
        this._cachedOauthScopes = null;
        /**
         * Regular expression that matches the provided Github token. Used for
         * sanitizing the token from Git child process output.
         */
        this._githubTokenRegex = null;
        // If a token has been specified (and is not empty), pass it to the Octokit API and
        // also create a regular expression that can be used for sanitizing Git command output
        // so that it does not print the token accidentally.
        if (githubToken != null) {
            this._githubTokenRegex = new RegExp(githubToken, 'g');
        }
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
        // To improve the debugging experience in case something fails, we print all executed Git
        // commands to better understand the git actions occuring. Depending on the command being
        // executed, this debugging information should be logged at different logging levels.
        var printFn = (!GitClient.LOG_COMMANDS || options.stdio === 'ignore') ? debug : info;
        // Note that we do not want to print the token if it is contained in the command. It's common
        // to share errors with others if the tool failed, and we do not want to leak tokens.
        printFn('Executing: git', this.omitGithubTokenFromMessage(args.join(' ')));
        var result = child_process.spawnSync('git', args, tslib.__assign(tslib.__assign({ cwd: this._projectRoot, stdio: 'pipe' }, options), { 
            // Encoding is always `utf8` and not overridable. This ensures that this method
            // always returns `string` as output instead of buffers.
            encoding: 'utf8' }));
        if (result.stderr !== null) {
            // Git sometimes prints the command if it failed. This means that it could
            // potentially leak the Github token used for accessing the remote. To avoid
            // printing a token, we sanitize the string before printing the stderr output.
            process.stderr.write(this.omitGithubTokenFromMessage(result.stderr));
        }
        return result;
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
    /** Whether the repo has any local changes. */
    GitClient.prototype.hasLocalChanges = function () {
        return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
    };
    /** Sanitizes a given message by omitting the provided Github token if present. */
    GitClient.prototype.omitGithubTokenFromMessage = function (value) {
        // If no token has been defined (i.e. no token regex), we just return the
        // value as is. There is no secret value that needs to be omitted.
        if (this._githubTokenRegex === null) {
            return value;
        }
        return value.replace(this._githubTokenRegex, '<TOKEN>');
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
    /**
     * Assert the GitClient instance is using a token with permissions for the all of the
     * provided OAuth scopes.
     */
    GitClient.prototype.hasOauthScopes = function (testFn) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var scopes, missingScopes, error;
            return tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAuthScopesForToken()];
                    case 1:
                        scopes = _a.sent();
                        missingScopes = [];
                        // Test Github OAuth scopes and collect missing ones.
                        testFn(scopes, missingScopes);
                        // If no missing scopes are found, return true to indicate all OAuth Scopes are available.
                        if (missingScopes.length === 0) {
                            return [2 /*return*/, true];
                        }
                        error = "The provided <TOKEN> does not have required permissions due to missing scope(s): " +
                            (yellow(missingScopes.join(', ')) + "\n\n") +
                            "Update the token in use at:\n" +
                            ("  " + GITHUB_TOKEN_SETTINGS_URL + "\n\n") +
                            ("Alternatively, a new token can be created at: " + GITHUB_TOKEN_GENERATE_URL + "\n");
                        return [2 /*return*/, { error: error }];
                }
            });
        });
    };
    /**
     * Retrieve the OAuth scopes for the loaded Github token.
     **/
    GitClient.prototype.getAuthScopesForToken = function () {
        // If the OAuth scopes have already been loaded, return the Promise containing them.
        if (this._cachedOauthScopes !== null) {
            return this._cachedOauthScopes;
        }
        // OAuth scopes are loaded via the /rate_limit endpoint to prevent
        // usage of a request against that rate_limit for this lookup.
        return this._cachedOauthScopes = this.github.rateLimit.get().then(function (_response) {
            var response = _response;
            var scopes = response.headers['x-oauth-scopes'] || '';
            return scopes.split(',').map(function (scope) { return scope.trim(); });
        });
    };
    /** Whether verbose logging of Git actions should be used. */
    GitClient.LOG_COMMANDS = true;
    return GitClient;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Retrieve and validate the config as `CaretakerConfig`. */
function getCaretakerConfig() {
    // List of errors encountered validating the config.
    const errors = [];
    // The non-validated config object.
    const config = getConfig();
    assertNoErrors(errors);
    return config;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Class describing a release-train. */
class ReleaseTrain {
    constructor(
    /** Name of the branch for this release-train. */
    branchName, 
    /** Most recent version for this release train. */
    version) {
        this.branchName = branchName;
        this.version = version;
        /** Whether the release train is currently targeting a major. */
        this.isMajor = this.version.minor === 0 && this.version.patch === 0;
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Regular expression that matches version-branches. */
const versionBranchNameRegex = /^(\d+)\.(\d+)\.x$/;
/** Gets the version of a given branch by reading the `package.json` upstream. */
function getVersionOfBranch(repo, branchName) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const { data } = yield repo.api.repos.getContents({ owner: repo.owner, repo: repo.name, path: '/package.json', ref: branchName });
        const { version } = JSON.parse(Buffer.from(data.content, 'base64').toString());
        const parsedVersion = semver.parse(version);
        if (parsedVersion === null) {
            throw Error(`Invalid version detected in following branch: ${branchName}.`);
        }
        return parsedVersion;
    });
}
/** Whether the given branch corresponds to a version branch. */
function isVersionBranch(branchName) {
    return versionBranchNameRegex.test(branchName);
}
/**
 * Converts a given version-branch into a SemVer version that can be used with SemVer
 * utilities. e.g. to determine semantic order, extract major digit, compare.
 *
 * For example `10.0.x` will become `10.0.0` in SemVer. The patch digit is not
 * relevant but needed for parsing. SemVer does not allow `x` as patch digit.
 */
function getVersionForVersionBranch(branchName) {
    return semver.parse(branchName.replace(versionBranchNameRegex, '$1.$2.0'));
}
/**
 * Gets the version branches for the specified major versions in descending
 * order. i.e. latest version branches first.
 */
function getBranchesForMajorVersions(repo, majorVersions) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const { data: branchData } = yield repo.api.repos.listBranches({ owner: repo.owner, repo: repo.name, protected: true });
        const branches = [];
        for (const { name } of branchData) {
            if (!isVersionBranch(name)) {
                continue;
            }
            // Convert the version-branch into a SemVer version that can be used with the
            // SemVer utilities. e.g. to determine semantic order, compare versions.
            const parsed = getVersionForVersionBranch(name);
            // Collect all version-branches that match the specified major versions.
            if (parsed !== null && majorVersions.includes(parsed.major)) {
                branches.push({ name, parsed });
            }
        }
        // Sort captured version-branches in descending order.
        return branches.sort((a, b) => semver.rcompare(a.parsed, b.parsed));
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Branch name for the `next` branch. */
const nextBranchName = 'master';
/** Fetches the active release trains for the configured project. */
function fetchActiveReleaseTrains(repo) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const nextVersion = yield getVersionOfBranch(repo, nextBranchName);
        const next = new ReleaseTrain(nextBranchName, nextVersion);
        const majorVersionsToConsider = [];
        let expectedReleaseCandidateMajor;
        // If the `next` branch (i.e. `master` branch) is for an upcoming major version, we know
        // that there is no patch branch or feature-freeze/release-candidate branch for this major
        // digit. If the current `next` version is the first minor of a major version, we know that
        // the feature-freeze/release-candidate branch can only be the actual major branch. The
        // patch branch is based on that, either the actual major branch or the last minor from the
        // preceding major version. In all other cases, the patch branch and feature-freeze or
        // release-candidate branch are part of the same major version. Consider the following:
        //
        //  CASE 1. next: 11.0.0-next.0: patch and feature-freeze/release-candidate can only be
        //          most recent `10.<>.x` branches. The FF/RC branch can only be the last-minor of v10.
        //  CASE 2. next: 11.1.0-next.0: patch can be either `11.0.x` or last-minor in v10 based
        //          on whether there is a feature-freeze/release-candidate branch (=> `11.0.x`).
        //  CASE 3. next: 10.6.0-next.0: patch can be either `10.5.x` or `10.4.x` based on whether
        //          there is a feature-freeze/release-candidate branch (=> `10.5.x`)
        if (nextVersion.minor === 0) {
            expectedReleaseCandidateMajor = nextVersion.major - 1;
            majorVersionsToConsider.push(nextVersion.major - 1);
        }
        else if (nextVersion.minor === 1) {
            expectedReleaseCandidateMajor = nextVersion.major;
            majorVersionsToConsider.push(nextVersion.major, nextVersion.major - 1);
        }
        else {
            expectedReleaseCandidateMajor = nextVersion.major;
            majorVersionsToConsider.push(nextVersion.major);
        }
        // Collect all version-branches that should be considered for the latest version-branch,
        // or the feature-freeze/release-candidate.
        const branches = (yield getBranchesForMajorVersions(repo, majorVersionsToConsider));
        const { latest, releaseCandidate } = yield findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor);
        if (latest === null) {
            throw Error(`Unable to determine the latest release-train. The following branches ` +
                `have been considered: [${branches.map(b => b.name).join(', ')}]`);
        }
        return { releaseCandidate, latest, next };
    });
}
/** Finds the currently active release trains from the specified version branches. */
function findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        // Version representing the release-train currently in the next phase. Note that we ignore
        // patch and pre-release segments in order to be able to compare the next release train to
        // other release trains from version branches (which follow the `N.N.x` pattern).
        const nextReleaseTrainVersion = semver.parse(`${nextVersion.major}.${nextVersion.minor}.0`);
        let latest = null;
        let releaseCandidate = null;
        // Iterate through the captured branches and find the latest non-prerelease branch and a
        // potential release candidate branch. From the collected branches we iterate descending
        // order (most recent semantic version-branch first). The first branch is either the latest
        // active version branch (i.e. patch) or a feature-freeze/release-candidate branch. A FF/RC
        // branch cannot be older than the latest active version-branch, so we stop iterating once
        // we found such a branch. Otherwise, if we found a FF/RC branch, we continue looking for the
        // next version-branch as that one is supposed to be the latest active version-branch. If it
        // is not, then an error will be thrown due to two FF/RC branches existing at the same time.
        for (const { name, parsed } of branches) {
            // It can happen that version branches have been accidentally created which are more recent
            // than the release-train in the next branch (i.e. `master`). We could ignore such branches
            // silently, but it might be symptomatic for an outdated version in the `next` branch, or an
            // accidentally created branch by the caretaker. In either way we want to raise awareness.
            if (semver.gt(parsed, nextReleaseTrainVersion)) {
                throw Error(`Discovered unexpected version-branch "${name}" for a release-train that is ` +
                    `more recent than the release-train currently in the "${nextBranchName}" branch. ` +
                    `Please either delete the branch if created by accident, or update the outdated ` +
                    `version in the next branch (${nextBranchName}).`);
            }
            else if (semver.eq(parsed, nextReleaseTrainVersion)) {
                throw Error(`Discovered unexpected version-branch "${name}" for a release-train that is already ` +
                    `active in the "${nextBranchName}" branch. Please either delete the branch if ` +
                    `created by accident, or update the version in the next branch (${nextBranchName}).`);
            }
            const version = yield getVersionOfBranch(repo, name);
            const releaseTrain = new ReleaseTrain(name, version);
            const isPrerelease = version.prerelease[0] === 'rc' || version.prerelease[0] === 'next';
            if (isPrerelease) {
                if (releaseCandidate !== null) {
                    throw Error(`Unable to determine latest release-train. Found two consecutive ` +
                        `branches in feature-freeze/release-candidate phase. Did not expect both "${name}" ` +
                        `and "${releaseCandidate.branchName}" to be in feature-freeze/release-candidate mode.`);
                }
                else if (version.major !== expectedReleaseCandidateMajor) {
                    throw Error(`Discovered unexpected old feature-freeze/release-candidate branch. Expected no ` +
                        `version-branch in feature-freeze/release-candidate mode for v${version.major}.`);
                }
                releaseCandidate = releaseTrain;
            }
            else {
                latest = releaseTrain;
                break;
            }
        }
        return { releaseCandidate, latest };
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Cache for requested NPM package information. A cache is desirable as the NPM
 * registry requests are usually very large and slow.
 */
const _npmPackageInfoCache = {};
/**
 * Fetches the NPM package representing the project. Angular repositories usually contain
 * multiple packages in a monorepo scheme, but packages dealt with as part of the release
 * tooling are released together with the same versioning and branching. This means that
 * a single package can be used as source of truth for NPM package queries.
 */
function fetchProjectNpmPackageInfo(config) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const pkgName = getRepresentativeNpmPackage(config);
        return yield fetchPackageInfoFromNpmRegistry(pkgName);
    });
}
/** Gets whether the given version is published to NPM or not */
function isVersionPublishedToNpm(version, config) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const { versions } = yield fetchProjectNpmPackageInfo(config);
        return versions[version.format()] !== undefined;
    });
}
/**
 * Gets the representative NPM package for the specified release configuration. Angular
 * repositories usually contain multiple packages in a monorepo scheme, but packages dealt with
 * as part of the release tooling are released together with the same versioning and branching.
 * This means that a single package can be used as source of truth for NPM package queries.
 */
function getRepresentativeNpmPackage(config) {
    return config.npmPackages[0];
}
/** Fetches the specified NPM package from the NPM registry. */
function fetchPackageInfoFromNpmRegistry(pkgName) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        if (_npmPackageInfoCache[pkgName] === undefined) {
            _npmPackageInfoCache[pkgName] =
                fetch(`https://registry.npmjs.org/${pkgName}`).then(r => r.json());
        }
        return yield _npmPackageInfoCache[pkgName];
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Number of months a major version in Angular is actively supported. See:
 * https://angular.io/guide/releases#support-policy-and-schedule.
 */
const majorActiveSupportDuration = 6;
/**
 * Number of months a major version has active long-term support. See:
 * https://angular.io/guide/releases#support-policy-and-schedule.
 */
const majorLongTermSupportDuration = 12;
/** Regular expression that matches LTS NPM dist tags. */
const ltsNpmDistTagRegex = /^v(\d+)-lts$/;
/** Finds all long-term support release trains from the specified NPM package. */
function fetchLongTermSupportBranchesFromNpm(config) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const { 'dist-tags': distTags, time } = yield fetchProjectNpmPackageInfo(config);
        const today = new Date();
        const active = [];
        const inactive = [];
        // Iterate through the NPM package information and determine active/inactive LTS versions with
        // their corresponding branches. We assume that an LTS tagged version in NPM belongs to the
        // last-minor branch of a given major (i.e. we assume there are no outdated LTS NPM dist tags).
        for (const npmDistTag in distTags) {
            if (ltsNpmDistTagRegex.test(npmDistTag)) {
                const version = semver.parse(distTags[npmDistTag]);
                const branchName = `${version.major}.${version.minor}.x`;
                const majorReleaseDate = new Date(time[`${version.major}.0.0`]);
                const ltsEndDate = computeLtsEndDateOfMajor(majorReleaseDate);
                const ltsBranch = { name: branchName, version, npmDistTag };
                // Depending on whether the LTS phase is still active, add the branch
                // to the list of active or inactive LTS branches.
                if (today <= ltsEndDate) {
                    active.push(ltsBranch);
                }
                else {
                    inactive.push(ltsBranch);
                }
            }
        }
        // Sort LTS branches in descending order. i.e. most recent ones first.
        active.sort((a, b) => semver.rcompare(a.version, b.version));
        inactive.sort((a, b) => semver.rcompare(a.version, b.version));
        return { active, inactive };
    });
}
/**
 * Computes the date when long-term support ends for a major released at the
 * specified date.
 */
function computeLtsEndDateOfMajor(majorReleaseDate) {
    return new Date(majorReleaseDate.getFullYear(), majorReleaseDate.getMonth() + majorActiveSupportDuration + majorLongTermSupportDuration, majorReleaseDate.getDate(), majorReleaseDate.getHours(), majorReleaseDate.getMinutes(), majorReleaseDate.getSeconds(), majorReleaseDate.getMilliseconds());
}
/** Gets the long-term support NPM dist tag for a given major version. */
function getLtsNpmDistTagOfMajor(major) {
    // LTS versions should be tagged in NPM in the following format: `v{major}-lts`.
    return `v${major}-lts`;
}

/** The BaseModule to extend modules for caretaker checks from. */
class BaseModule {
    constructor(git, config) {
        this.git = git;
        this.config = config;
        /** The data for the module. */
        this.data = this.retrieveData();
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class CiModule extends BaseModule {
    retrieveData() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const gitRepoWithApi = Object.assign({ api: this.git.github }, this.git.remoteConfig);
            const releaseTrains = yield fetchActiveReleaseTrains(gitRepoWithApi);
            const ciResultPromises = Object.entries(releaseTrains).map(([trainName, train]) => tslib.__awaiter(this, void 0, void 0, function* () {
                if (train === null) {
                    return {
                        active: false,
                        name: trainName,
                        label: '',
                        status: 'not found',
                    };
                }
                return {
                    active: true,
                    name: train.branchName,
                    label: `${trainName} (${train.branchName})`,
                    status: yield this.getBranchStatusFromCi(train.branchName),
                };
            }));
            return yield Promise.all(ciResultPromises);
        });
    }
    printToTerminal() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const data = yield this.data;
            const minLabelLength = Math.max(...data.map(result => result.label.length));
            info.group(bold(`CI`));
            data.forEach(result => {
                if (result.active === false) {
                    debug(`No active release train for ${result.name}`);
                    return;
                }
                const label = result.label.padEnd(minLabelLength);
                if (result.status === 'not found') {
                    info(`${result.name} was not found on CircleCI`);
                }
                else if (result.status === 'success') {
                    info(`${label} ✅`);
                }
                else {
                    info(`${label} ❌`);
                }
            });
            info.groupEnd();
            info();
        });
    }
    /** Get the CI status of a given branch from CircleCI. */
    getBranchStatusFromCi(branch) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { owner, name } = this.git.remoteConfig;
            const url = `https://circleci.com/gh/${owner}/${name}/tree/${branch}.svg?style=shield`;
            const result = yield fetch(url).then(result => result.text());
            if (result && !result.includes('no builds')) {
                return result.includes('passing') ? 'success' : 'failed';
            }
            return 'not found';
        });
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class G3Module extends BaseModule {
    retrieveData() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const toCopyToG3 = this.getG3FileIncludeAndExcludeLists();
            const latestSha = this.getLatestShas();
            if (toCopyToG3 === null || latestSha === null) {
                return;
            }
            return this.getDiffStats(latestSha.g3, latestSha.master, toCopyToG3.include, toCopyToG3.exclude);
        });
    }
    printToTerminal() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const stats = yield this.data;
            if (!stats) {
                return;
            }
            info.group(bold('g3 branch check'));
            if (stats.files === 0) {
                info(`${stats.commits} commits between g3 and master`);
                info('✅  No sync is needed at this time');
            }
            else {
                info(`${stats.files} files changed, ${stats.insertions} insertions(+), ${stats.deletions} ` +
                    `deletions(-) from ${stats.commits} commits will be included in the next sync`);
            }
            info.groupEnd();
            info();
        });
    }
    /** Fetch and retrieve the latest sha for a specific branch. */
    getShaForBranchLatest(branch) {
        const { owner, name } = this.git.remoteConfig;
        /** The result fo the fetch command. */
        const fetchResult = this.git.runGraceful(['fetch', '-q', `https://github.com/${owner}/${name}.git`, branch]);
        if (fetchResult.status !== 0 &&
            fetchResult.stderr.includes(`couldn't find remote ref ${branch}`)) {
            debug(`No '${branch}' branch exists on upstream, skipping.`);
            return null;
        }
        return this.git.runGraceful(['rev-parse', 'FETCH_HEAD']).stdout.trim();
    }
    /**
     * Get git diff stats between master and g3, for all files and filtered to only g3 affecting
     * files.
     */
    getDiffStats(g3Ref, masterRef, includeFiles, excludeFiles) {
        /** The diff stats to be returned. */
        const stats = {
            insertions: 0,
            deletions: 0,
            files: 0,
            commits: 0,
        };
        // Determine the number of commits between master and g3 refs. */
        stats.commits =
            parseInt(this.git.run(['rev-list', '--count', `${g3Ref}..${masterRef}`]).stdout, 10);
        // Get the numstat information between master and g3
        this.git.run(['diff', `${g3Ref}...${masterRef}`, '--numstat'])
            .stdout
            // Remove the extra space after git's output.
            .trim()
            // Split each line of git output into array
            .split('\n')
            // Split each line from the git output into components parts: insertions,
            // deletions and file name respectively
            .map(line => line.trim().split('\t'))
            // Parse number value from the insertions and deletions values
            // Example raw line input:
            //   10\t5\tsrc/file/name.ts
            .map(line => [Number(line[0]), Number(line[1]), line[2]])
            // Add each line's value to the diff stats, and conditionally to the g3
            // stats as well if the file name is included in the files synced to g3.
            .forEach(([insertions, deletions, fileName]) => {
            if (this.checkMatchAgainstIncludeAndExclude(fileName, includeFiles, excludeFiles)) {
                stats.insertions += insertions;
                stats.deletions += deletions;
                stats.files += 1;
            }
        });
        return stats;
    }
    /** Determine whether the file name passes both include and exclude checks. */
    checkMatchAgainstIncludeAndExclude(file, includes, excludes) {
        return (multimatch.call(undefined, file, includes).length >= 1 &&
            multimatch.call(undefined, file, excludes).length === 0);
    }
    getG3FileIncludeAndExcludeLists() {
        var _a, _b, _c, _d;
        const angularRobotFilePath = path.join(getRepoBaseDir(), '.github/angular-robot.yml');
        if (!fs.existsSync(angularRobotFilePath)) {
            debug('No angular robot configuration file exists, skipping.');
            return null;
        }
        /** The configuration defined for the angular robot. */
        const robotConfig = yaml.parse(fs.readFileSync(angularRobotFilePath).toString());
        /** The files to be included in the g3 sync. */
        const include = ((_b = (_a = robotConfig === null || robotConfig === void 0 ? void 0 : robotConfig.merge) === null || _a === void 0 ? void 0 : _a.g3Status) === null || _b === void 0 ? void 0 : _b.include) || [];
        /** The files to be expected in the g3 sync. */
        const exclude = ((_d = (_c = robotConfig === null || robotConfig === void 0 ? void 0 : robotConfig.merge) === null || _c === void 0 ? void 0 : _c.g3Status) === null || _d === void 0 ? void 0 : _d.exclude) || [];
        if (include.length === 0 && exclude.length === 0) {
            debug('No g3Status include or exclude lists are defined in the angular robot configuration');
            return null;
        }
        return { include, exclude };
    }
    getLatestShas() {
        /** The latest sha for the g3 branch. */
        const g3 = this.getShaForBranchLatest('g3');
        /** The latest sha for the master branch. */
        const master = this.getShaForBranchLatest('master');
        if (g3 === null || master === null) {
            debug('Either the g3 or master was unable to be retrieved');
            return null;
        }
        return { g3, master };
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** The fragment for a result from Github's api for a Github query. */
const GithubQueryResultFragment = {
    issueCount: typedGraphqlify.types.number,
    nodes: [Object.assign({}, typedGraphqlify.onUnion({
            PullRequest: {
                url: typedGraphqlify.types.string,
            },
            Issue: {
                url: typedGraphqlify.types.string,
            },
        }))],
};
/**
 * Cap the returned issues in the queries to an arbitrary 20. At that point, caretaker has a lot
 * of work to do and showing more than that isn't really useful.
 */
const MAX_RETURNED_ISSUES = 20;
class GithubQueriesModule extends BaseModule {
    retrieveData() {
        var _a;
        return tslib.__awaiter(this, void 0, void 0, function* () {
            // Non-null assertion is used here as the check for undefined immediately follows to confirm the
            // assertion.  Typescript's type filtering does not seem to work as needed to understand
            // whether githubQueries is undefined or not.
            let queries = (_a = this.config.caretaker) === null || _a === void 0 ? void 0 : _a.githubQueries;
            if (queries === undefined || queries.length === 0) {
                debug('No github queries defined in the configuration, skipping');
                return;
            }
            /** The results of the generated github query. */
            const queryResult = yield this.git.github.graphql.query(this.buildGraphqlQuery(queries));
            const results = Object.values(queryResult);
            const { owner, name: repo } = this.git.remoteConfig;
            return results.map((result, i) => {
                return {
                    queryName: queries[i].name,
                    count: result.issueCount,
                    queryUrl: encodeURI(`https://github.com/${owner}/${repo}/issues?q=${queries[i].query}`),
                    matchedUrls: result.nodes.map(node => node.url)
                };
            });
        });
    }
    /** Build a Graphql query statement for the provided queries. */
    buildGraphqlQuery(queries) {
        /** The query object for graphql. */
        const graphQlQuery = {};
        const { owner, name: repo } = this.git.remoteConfig;
        /** The Github search filter for the configured repository. */
        const repoFilter = `repo:${owner}/${repo}`;
        queries.forEach(({ name, query }) => {
            /** The name of the query, with spaces removed to match GraphQL requirements. */
            const queryKey = typedGraphqlify.alias(name.replace(/ /g, ''), 'search');
            graphQlQuery[queryKey] = typedGraphqlify.params({
                type: 'ISSUE',
                first: MAX_RETURNED_ISSUES,
                query: `"${repoFilter} ${query.replace(/"/g, '\\"')}"`,
            }, Object.assign({}, GithubQueryResultFragment));
        });
        return graphQlQuery;
    }
    printToTerminal() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const queryResults = yield this.data;
            if (!queryResults) {
                return;
            }
            info.group(bold('Github Tasks'));
            const minQueryNameLength = Math.max(...queryResults.map(result => result.queryName.length));
            for (const queryResult of queryResults) {
                info(`${queryResult.queryName.padEnd(minQueryNameLength)}  ${queryResult.count}`);
                if (queryResult.count > 0) {
                    info.group(queryResult.queryUrl);
                    queryResult.matchedUrls.forEach(url => info(`- ${url}`));
                    if (queryResult.count > MAX_RETURNED_ISSUES) {
                        info(`... ${queryResult.count - MAX_RETURNED_ISSUES} additional matches`);
                    }
                    info.groupEnd();
                }
            }
            info.groupEnd();
            info();
        });
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** List of services Angular relies on. */
const services = [
    {
        url: 'https://status.us-west-1.saucelabs.com/api/v2/status.json',
        name: 'Saucelabs',
    },
    {
        url: 'https://status.npmjs.org/api/v2/status.json',
        name: 'Npm',
    },
    {
        url: 'https://status.circleci.com/api/v2/status.json',
        name: 'CircleCi',
    },
    {
        url: 'https://www.githubstatus.com/api/v2/status.json',
        name: 'Github',
    },
];
class ServicesModule extends BaseModule {
    retrieveData() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return Promise.all(services.map(service => this.getStatusFromStandardApi(service)));
        });
    }
    printToTerminal() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const statuses = yield this.data;
            const serviceNameMinLength = Math.max(...statuses.map(service => service.name.length));
            info.group(bold('Service Statuses'));
            for (const status of statuses) {
                const name = status.name.padEnd(serviceNameMinLength);
                if (status.status === 'passing') {
                    info(`${name} ✅`);
                }
                else {
                    info.group(`${name} ❌ (Updated: ${status.lastUpdated.toLocaleString()})`);
                    info(`  Details: ${status.description}`);
                    info.groupEnd();
                }
            }
            info.groupEnd();
            info();
        });
    }
    /** Retrieve the status information for a service which uses a standard API response. */
    getStatusFromStandardApi(service) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const result = yield fetch(service.url).then(result => result.json());
            const status = result.status.indicator === 'none' ? 'passing' : 'failing';
            return {
                name: service.name,
                status,
                description: result.status.description,
                lastUpdated: new Date(result.page.updated_at)
            };
        });
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** List of modules checked for the caretaker check command. */
const moduleList = [
    GithubQueriesModule,
    ServicesModule,
    CiModule,
    G3Module,
];
/** Check the status of services which Angular caretakers need to monitor. */
function checkServiceStatuses(githubToken) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        /** The configuration for the caretaker commands. */
        const config = getCaretakerConfig();
        /** The GitClient for interacting with git and Github. */
        const git = new GitClient(githubToken, config);
        // Prevent logging of the git commands being executed during the check.
        GitClient.LOG_COMMANDS = false;
        /** List of instances of Caretaker Check modules */
        const caretakerCheckModules = moduleList.map(module => new module(git, config));
        // Module's `data` is casted as Promise<unknown> because the data types of the `module`'s `data`
        // promises do not match typings, however our usage here is only to determine when the promise
        // resolves.
        yield Promise.all(caretakerCheckModules.map(module => module.data));
        for (const module of caretakerCheckModules) {
            yield module.printToTerminal();
        }
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Builds the command. */
function builder(yargs) {
    return addGithubTokenOption(yargs);
}
/** Handles the command. */
function handler({ githubToken }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        yield checkServiceStatuses(githubToken);
    });
}
/** yargs command module for checking status information for the repository  */
const CheckModule = {
    handler,
    builder,
    command: 'check',
    describe: 'Check the status of information the caretaker manages for the repository',
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Build the parser for the caretaker commands. */
function buildCaretakerParser(yargs) {
    return yargs.command(CheckModule);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Load the commit message draft from the file system if it exists. */
function loadCommitMessageDraft(basePath) {
    const commitMessageDraftPath = `${basePath}.ngDevSave`;
    if (fs.existsSync(commitMessageDraftPath)) {
        return fs.readFileSync(commitMessageDraftPath).toString();
    }
    return '';
}
/** Remove the commit message draft from the file system. */
function deleteCommitMessageDraft(basePath) {
    const commitMessageDraftPath = `${basePath}.ngDevSave`;
    if (fs.existsSync(commitMessageDraftPath)) {
        fs.unlinkSync(commitMessageDraftPath);
    }
}
/** Save the commit message draft to the file system for later retrieval. */
function saveCommitMessageDraft(basePath, commitMessage) {
    fs.writeFileSync(`${basePath}.ngDevSave`, commitMessage);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Restore the commit message draft to the git to be used as the default commit message.
 *
 * The source provided may be one of the sources described in
 *   https://git-scm.com/docs/githooks#_prepare_commit_msg
 */
function restoreCommitMessage(filePath, source) {
    if (!!source) {
        log('Skipping commit message restoration attempt');
        if (source === 'message') {
            debug('A commit message was already provided via the command with a -m or -F flag');
        }
        if (source === 'template') {
            debug('A commit message was already provided via the -t flag or config.template setting');
        }
        if (source === 'squash') {
            debug('A commit message was already provided as a merge action or via .git/MERGE_MSG');
        }
        if (source === 'commit') {
            debug('A commit message was already provided through a revision specified via --fixup, -c,');
            debug('-C or --amend flag');
        }
        process.exit(0);
    }
    /** A draft of a commit message. */
    const commitMessage = loadCommitMessageDraft(filePath);
    // If the commit message draft has content, restore it into the provided filepath.
    if (commitMessage) {
        fs.writeFileSync(filePath, commitMessage);
    }
    // Exit the process
    process.exit(0);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Builds the command. */
function builder$1(yargs) {
    return yargs
        .option('file-env-variable', {
        type: 'string',
        description: 'The key for the environment variable which holds the arguments for the\n' +
            'prepare-commit-msg hook as described here:\n' +
            'https://git-scm.com/docs/githooks#_prepare_commit_msg'
    })
        .positional('file', { type: 'string' })
        .positional('source', { type: 'string' });
}
/** Handles the command. */
function handler$1({ fileEnvVariable, file, source }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        // File and source are provided as command line parameters
        if (file !== undefined) {
            restoreCommitMessage(file, source);
            return;
        }
        // File and source are provided as values held in an environment variable.
        if (fileEnvVariable !== undefined) {
            const [fileFromEnv, sourceFromEnv] = (process.env[fileEnvVariable] || '').split(' ');
            if (!fileFromEnv) {
                throw new Error(`Provided environment variable "${fileEnvVariable}" was not found.`);
            }
            restoreCommitMessage(fileFromEnv, sourceFromEnv);
            return;
        }
        throw new Error('No file path and commit message source provide. Provide values via positional command ' +
            'arguments, or via the --file-env-variable flag');
    });
}
/** yargs command module describing the command. */
const RestoreCommitMessageModule = {
    handler: handler$1,
    builder: builder$1,
    command: 'restore-commit-message-draft [file] [source]',
    // Description: Restore a commit message draft if one has been saved from a failed commit attempt.
    // No describe is defiend to hide the command from the --help.
    describe: false,
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Retrieve and validate the config as `CommitMessageConfig`. */
function getCommitMessageConfig() {
    // List of errors encountered validating the config.
    const errors = [];
    // The non-validated config object.
    const config = getConfig();
    if (config.commitMessage === undefined) {
        errors.push(`No configuration defined for "commitMessage"`);
    }
    assertNoErrors(errors);
    return config;
}
/** Scope requirement level to be set for each commit type. */
var ScopeRequirement;
(function (ScopeRequirement) {
    ScopeRequirement[ScopeRequirement["Required"] = 0] = "Required";
    ScopeRequirement[ScopeRequirement["Optional"] = 1] = "Optional";
    ScopeRequirement[ScopeRequirement["Forbidden"] = 2] = "Forbidden";
})(ScopeRequirement || (ScopeRequirement = {}));
/** The valid commit types for Angular commit messages. */
const COMMIT_TYPES = {
    build: {
        name: 'build',
        description: 'Changes to local repository build system and tooling',
        scope: ScopeRequirement.Optional,
    },
    ci: {
        name: 'ci',
        description: 'Changes to CI configuration and CI specific tooling',
        scope: ScopeRequirement.Forbidden,
    },
    docs: {
        name: 'docs',
        description: 'Changes which exclusively affects documentation.',
        scope: ScopeRequirement.Optional,
    },
    feat: {
        name: 'feat',
        description: 'Creates a new feature',
        scope: ScopeRequirement.Required,
    },
    fix: {
        name: 'fix',
        description: 'Fixes a previously discovered failure/bug',
        scope: ScopeRequirement.Required,
    },
    perf: {
        name: 'perf',
        description: 'Improves performance without any change in functionality or API',
        scope: ScopeRequirement.Required,
    },
    refactor: {
        name: 'refactor',
        description: 'Refactor without any change in functionality or API (includes style changes)',
        scope: ScopeRequirement.Required,
    },
    release: {
        name: 'release',
        description: 'A release point in the repository',
        scope: ScopeRequirement.Forbidden,
    },
    test: {
        name: 'test',
        description: 'Improvements or corrections made to the project\'s test suite',
        scope: ScopeRequirement.Required,
    },
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A list of tuples expressing the fields to extract from each commit log entry. The tuple contains
 * two values, the first is the key for the property and the second is the template shortcut for the
 * git log command.
 */
const commitFields = {
    hash: '%H',
    shortHash: '%h',
    author: '%aN',
};
/** The commit fields described as git log format entries for parsing. */
const commitFieldsAsFormat = (fields) => {
    return Object.entries(fields).map(([key, value]) => `%n-${key}-%n${value}`).join('');
};
/**
 * The git log format template to create git log entries for parsing.
 *
 * The conventional commits parser expects to parse the standard git log raw body (%B) into its
 * component parts. Additionally it will parse additional fields with keys defined by
 * `-{key name}-` separated by new lines.
 * */
const gitLogFormatForParsing = `%B${commitFieldsAsFormat(commitFields)}`;
/** Markers used to denote the start of a note section in a commit. */
var NoteSections;
(function (NoteSections) {
    NoteSections["BREAKING_CHANGE"] = "BREAKING CHANGE";
    NoteSections["DEPRECATED"] = "DEPRECATED";
})(NoteSections || (NoteSections = {}));
/** Regex determining if a commit is a fixup. */
const FIXUP_PREFIX_RE = /^fixup! /i;
/** Regex determining if a commit is a squash. */
const SQUASH_PREFIX_RE = /^squash! /i;
/** Regex determining if a commit is a revert. */
const REVERT_PREFIX_RE = /^revert:? /i;
/**
 * Regex pattern for parsing the header line of a commit.
 *
 * Several groups are being matched to be used in the parsed commit object, being mapped to the
 * `headerCorrespondence` object.
 *
 * The pattern can be broken down into component parts:
 * - `(\w+)` - a capturing group discovering the type of the commit.
 * - `(?:\((?:([^/]+)\/)?([^)]+)\))?` - a pair of capturing groups to capture the scope and,
 * optionally the npmScope of the commit.
 * - `(.*)` - a capturing group discovering the subject of the commit.
 */
const headerPattern = /^(\w+)(?:\((?:([^/]+)\/)?([^)]+)\))?: (.*)$/;
/**
 * The property names used for the values extracted from the header via the `headerPattern` regex.
 */
const headerCorrespondence = ['type', 'npmScope', 'scope', 'subject'];
/**
 * Configuration options for the commit parser.
 *
 * NOTE: An extended type from `Options` must be used because the current
 * @types/conventional-commits-parser version does not include the `notesPattern` field.
 */
const parseOptions = {
    commentChar: '#',
    headerPattern,
    headerCorrespondence,
    noteKeywords: [NoteSections.BREAKING_CHANGE, NoteSections.DEPRECATED],
    notesPattern: (keywords) => new RegExp(`(${keywords})(?:: ?)(.*)`),
};
/** Parse a full commit message into its composite parts. */
function parseCommitMessage(fullText) {
    // Ensure the fullText symbol is a `string`, even if a Buffer was provided.
    fullText = fullText.toString();
    /** The commit message text with the fixup and squash markers stripped out. */
    const strippedCommitMsg = fullText.replace(FIXUP_PREFIX_RE, '')
        .replace(SQUASH_PREFIX_RE, '')
        .replace(REVERT_PREFIX_RE, '');
    /** The initially parsed commit. */
    const commit = conventionalCommitsParser.sync(strippedCommitMsg, parseOptions);
    /** A list of breaking change notes from the commit. */
    const breakingChanges = [];
    /** A list of deprecation notes from the commit. */
    const deprecations = [];
    // Extract the commit message notes by marked types into their respective lists.
    commit.notes.forEach((note) => {
        if (note.title === NoteSections.BREAKING_CHANGE) {
            return breakingChanges.push(note);
        }
        if (note.title === NoteSections.DEPRECATED) {
            return deprecations.push(note);
        }
    });
    return {
        fullText,
        breakingChanges,
        deprecations,
        body: commit.body || '',
        footer: commit.footer || '',
        header: commit.header || '',
        references: commit.references,
        scope: commit.scope || '',
        subject: commit.subject || '',
        type: commit.type || '',
        npmScope: commit.npmScope || '',
        isFixup: FIXUP_PREFIX_RE.test(fullText),
        isSquash: SQUASH_PREFIX_RE.test(fullText),
        isRevert: REVERT_PREFIX_RE.test(fullText),
    };
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Regex matching a URL for an entire commit body line. */
const COMMIT_BODY_URL_LINE_RE = /^https?:\/\/.*$/;
/**
 * Regex matching a breaking change.
 *
 * - Starts with BREAKING CHANGE
 * - Followed by a colon
 * - Followed by a single space or two consecutive new lines
 *
 * NB: Anything after `BREAKING CHANGE` is optional to facilitate the validation.
 */
const COMMIT_BODY_BREAKING_CHANGE_RE = /^BREAKING CHANGE(:( |\n{2}))?/m;
/** Validate a commit message against using the local repo's config. */
function validateCommitMessage(commitMsg, options = {}) {
    const config = getCommitMessageConfig().commitMessage;
    const commit = typeof commitMsg === 'string' ? parseCommitMessage(commitMsg) : commitMsg;
    const errors = [];
    /** Perform the validation checks against the parsed commit. */
    function validateCommitAndCollectErrors() {
        ////////////////////////////////////
        // Checking revert, squash, fixup //
        ////////////////////////////////////
        var _a;
        // All revert commits are considered valid.
        if (commit.isRevert) {
            return true;
        }
        // All squashes are considered valid, as the commit will be squashed into another in
        // the git history anyway, unless the options provided to not allow squash commits.
        if (commit.isSquash) {
            if (options.disallowSquash) {
                errors.push('The commit must be manually squashed into the target commit');
                return false;
            }
            return true;
        }
        // Fixups commits are considered valid, unless nonFixupCommitHeaders are provided to check
        // against. If `nonFixupCommitHeaders` is not empty, we check whether there is a corresponding
        // non-fixup commit (i.e. a commit whose header is identical to this commit's header after
        // stripping the `fixup! ` prefix), otherwise we assume this verification will happen in another
        // check.
        if (commit.isFixup) {
            if (options.nonFixupCommitHeaders && !options.nonFixupCommitHeaders.includes(commit.header)) {
                errors.push('Unable to find match for fixup commit among prior commits: ' +
                    (options.nonFixupCommitHeaders.map(x => `\n      ${x}`).join('') || '-'));
                return false;
            }
            return true;
        }
        ////////////////////////////
        // Checking commit header //
        ////////////////////////////
        if (commit.header.length > config.maxLineLength) {
            errors.push(`The commit message header is longer than ${config.maxLineLength} characters`);
            return false;
        }
        if (!commit.type) {
            errors.push(`The commit message header does not match the expected format.`);
            return false;
        }
        if (COMMIT_TYPES[commit.type] === undefined) {
            errors.push(`'${commit.type}' is not an allowed type.\n => TYPES: ${Object.keys(COMMIT_TYPES).join(', ')}`);
            return false;
        }
        /** The scope requirement level for the provided type of the commit message. */
        const scopeRequirementForType = COMMIT_TYPES[commit.type].scope;
        if (scopeRequirementForType === ScopeRequirement.Forbidden && commit.scope) {
            errors.push(`Scopes are forbidden for commits with type '${commit.type}', but a scope of '${commit.scope}' was provided.`);
            return false;
        }
        if (scopeRequirementForType === ScopeRequirement.Required && !commit.scope) {
            errors.push(`Scopes are required for commits with type '${commit.type}', but no scope was provided.`);
            return false;
        }
        const fullScope = commit.npmScope ? `${commit.npmScope}/${commit.scope}` : commit.scope;
        if (fullScope && !config.scopes.includes(fullScope)) {
            errors.push(`'${fullScope}' is not an allowed scope.\n => SCOPES: ${config.scopes.join(', ')}`);
            return false;
        }
        // Commits with the type of `release` do not require a commit body.
        if (commit.type === 'release') {
            return true;
        }
        //////////////////////////
        // Checking commit body //
        //////////////////////////
        // Due to an issue in which conventional-commits-parser considers all parts of a commit after
        // a `#` reference to be the footer, we check the length of all of the commit content after the
        // header. In the future, we expect to be able to check only the body once the parser properly
        // handles this case.
        const allNonHeaderContent = `${commit.body.trim()}\n${commit.footer.trim()}`;
        if (!((_a = config.minBodyLengthTypeExcludes) === null || _a === void 0 ? void 0 : _a.includes(commit.type)) &&
            allNonHeaderContent.length < config.minBodyLength) {
            errors.push(`The commit message body does not meet the minimum length of ${config.minBodyLength} characters`);
            return false;
        }
        const bodyByLine = commit.body.split('\n');
        const lineExceedsMaxLength = bodyByLine.some((line) => {
            // Check if any line exceeds the max line length limit. The limit is ignored for
            // lines that just contain an URL (as these usually cannot be wrapped or shortened).
            return line.length > config.maxLineLength && !COMMIT_BODY_URL_LINE_RE.test(line);
        });
        if (lineExceedsMaxLength) {
            errors.push(`The commit message body contains lines greater than ${config.maxLineLength} characters.`);
            return false;
        }
        // Breaking change
        // Check if the commit message contains a valid break change description.
        // https://github.com/angular/angular/blob/88fbc066775ab1a2f6a8c75f933375b46d8fa9a4/CONTRIBUTING.md#commit-message-footer
        const hasBreakingChange = COMMIT_BODY_BREAKING_CHANGE_RE.exec(commit.fullText);
        if (hasBreakingChange !== null) {
            const [, breakingChangeDescription] = hasBreakingChange;
            if (!breakingChangeDescription) {
                // Not followed by :, space or two consecutive new lines,
                errors.push(`The commit message body contains an invalid breaking change description.`);
                return false;
            }
        }
        return true;
    }
    return { valid: validateCommitAndCollectErrors(), errors, commit };
}
/** Print the error messages from the commit message validation to the console. */
function printValidationErrors(errors, print = error) {
    print.group(`Error${errors.length === 1 ? '' : 's'}:`);
    errors.forEach(line => print(line));
    print.groupEnd();
    print();
    print('The expected format for a commit is: ');
    print('<type>(<scope>): <summary>');
    print();
    print('<body>');
    print();
    print(`BREAKING CHANGE: <breaking change summary>`);
    print();
    print(`<breaking change description>`);
    print();
    print();
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Validate commit message at the provided file path. */
function validateFile(filePath, isErrorMode) {
    const commitMessage = fs.readFileSync(path.resolve(getRepoBaseDir(), filePath), 'utf8');
    const { valid, errors } = validateCommitMessage(commitMessage);
    if (valid) {
        info(`${green('√')}  Valid commit message`);
        deleteCommitMessageDraft(filePath);
        process.exitCode = 0;
        return;
    }
    /** Function used to print to the console log. */
    let printFn = isErrorMode ? error : log;
    printFn(`${isErrorMode ? red('✘') : yellow('!')}  Invalid commit message`);
    printValidationErrors(errors, printFn);
    if (isErrorMode) {
        printFn(red('Aborting commit attempt due to invalid commit message.'));
        printFn(red('Commit message aborted as failure rather than warning due to local configuration.'));
    }
    else {
        printFn(yellow('Before this commit can be merged into the upstream repository, it must be'));
        printFn(yellow('amended to follow commit message guidelines.'));
    }
    // On all invalid commit messages, the commit message should be saved as a draft to be
    // restored on the next commit attempt.
    saveCommitMessageDraft(filePath, commitMessage);
    // Set the correct exit code based on if invalid commit message is an error.
    process.exitCode = isErrorMode ? 1 : 0;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Builds the command. */
function builder$2(yargs) {
    var _a;
    return yargs
        .option('file', {
        type: 'string',
        conflicts: ['file-env-variable'],
        description: 'The path of the commit message file.',
    })
        .option('file-env-variable', {
        type: 'string',
        conflicts: ['file'],
        description: 'The key of the environment variable for the path of the commit message file.',
        coerce: (arg) => {
            const file = process.env[arg];
            if (!file) {
                throw new Error(`Provided environment variable "${arg}" was not found.`);
            }
            return file;
        },
    })
        .option('error', {
        type: 'boolean',
        description: 'Whether invalid commit messages should be treated as failures rather than a warning',
        default: !!((_a = getUserConfig().commitMessage) === null || _a === void 0 ? void 0 : _a.errorOnInvalidMessage) || !!process.env['CI']
    });
}
/** Handles the command. */
function handler$2({ error, file, fileEnvVariable }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const filePath = file || fileEnvVariable || '.git/COMMIT_EDITMSG';
        validateFile(filePath, error);
    });
}
/** yargs command module describing the command. */
const ValidateFileModule = {
    handler: handler$2,
    builder: builder$2,
    command: 'pre-commit-validate',
    describe: 'Validate the most recent commit message',
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Set `gitCommits` as this imported value to address "Cannot call a namespace" error.
const gitCommits = gitCommits_;
/**
 * Find all commits within the given range and return an object describing those.
 */
function getCommitsInRange(from, to = 'HEAD') {
    return new Promise((resolve, reject) => {
        /** List of parsed commit objects. */
        const commits = [];
        /** Stream of raw git commit strings in the range provided. */
        const commitStream = gitCommits({ from, to, format: gitLogFormatForParsing });
        // Accumulate the parsed commits for each commit from the Readable stream into an array, then
        // resolve the promise with the array when the Readable stream ends.
        commitStream.on('data', (commit) => commits.push(parseCommitMessage(commit)));
        commitStream.on('error', (err) => reject(err));
        commitStream.on('end', () => resolve(commits));
    });
}

// Whether the provided commit is a fixup commit.
const isNonFixup = (commit) => !commit.isFixup;
// Extracts commit header (first line of commit message).
const extractCommitHeader = (commit) => commit.header;
/** Validate all commits in a provided git commit range. */
function validateCommitRange(from, to) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        /** A list of tuples of the commit header string and a list of error messages for the commit. */
        const errors = [];
        /** A list of parsed commit messages from the range. */
        const commits = yield getCommitsInRange(from, to);
        info(`Examining ${commits.length} commit(s) in the provided range: ${from}..${to}`);
        /**
         * Whether all commits in the range are valid, commits are allowed to be fixup commits for other
         * commits in the provided commit range.
         */
        const allCommitsInRangeValid = commits.every((commit, i) => {
            const options = {
                disallowSquash: true,
                nonFixupCommitHeaders: isNonFixup(commit) ?
                    undefined :
                    commits.slice(i + 1).filter(isNonFixup).map(extractCommitHeader)
            };
            const { valid, errors: localErrors } = validateCommitMessage(commit, options);
            if (localErrors.length) {
                errors.push([commit.header, localErrors]);
            }
            return valid;
        });
        if (allCommitsInRangeValid) {
            info(green('√  All commit messages in range valid.'));
        }
        else {
            error(red('✘  Invalid commit message'));
            errors.forEach(([header, validationErrors]) => {
                error.group(header);
                printValidationErrors(validationErrors);
                error.groupEnd();
            });
            // Exit with a non-zero exit code if invalid commit messages have
            // been discovered.
            process.exit(1);
        }
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Builds the command. */
function builder$3(yargs) {
    return yargs
        .positional('startingRef', {
        description: 'The first ref in the range to select',
        type: 'string',
        demandOption: true,
    })
        .positional('endingRef', {
        description: 'The last ref in the range to select',
        type: 'string',
        default: 'HEAD',
    });
}
/** Handles the command. */
function handler$3({ startingRef, endingRef }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        // If on CI, and no pull request number is provided, assume the branch
        // being run on is an upstream branch.
        if (process.env['CI'] && process.env['CI_PULL_REQUEST'] === 'false') {
            info(`Since valid commit messages are enforced by PR linting on CI, we do not`);
            info(`need to validate commit messages on CI runs on upstream branches.`);
            info();
            info(`Skipping check of provided commit range`);
            return;
        }
        yield validateCommitRange(startingRef, endingRef);
    });
}
/** yargs command module describing the command. */
const ValidateRangeModule = {
    handler: handler$3,
    builder: builder$3,
    command: 'validate-range <starting-ref> [ending-ref]',
    describe: 'Validate a range of commit messages',
};

/** Build the parser for the commit-message commands. */
function buildCommitMessageParser(localYargs) {
    return localYargs.help()
        .strict()
        .command(RestoreCommitMessageModule)
        .command(ValidateFileModule)
        .command(ValidateRangeModule);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A list of all files currently in the repo which have been modified since the provided sha.
 *
 * git diff
 * Deleted files (--diff-filter=d) are not included as they are not longer present in the repo
 * and can not be checked anymore.
 *
 * git ls-files
 * Untracked files (--others), which are not matched by .gitignore (--exclude-standard)
 * as they are expected to become tracked files.
 */
function allChangedFilesSince(sha) {
    if (sha === void 0) { sha = 'HEAD'; }
    var diffFiles = gitOutputAsArray("git diff --name-only --diff-filter=d " + sha);
    var untrackedFiles = gitOutputAsArray("git ls-files --others --exclude-standard");
    // Use a set to deduplicate the list as its possible for a file to show up in both lists.
    return Array.from(new Set(tslib.__spreadArray(tslib.__spreadArray([], tslib.__read(diffFiles)), tslib.__read(untrackedFiles))));
}
/**
 * A list of all staged files which have been modified.
 *
 * Only added, created and modified files are listed as others (deleted, renamed, etc) aren't
 * changed or available as content to act upon.
 */
function allStagedFiles() {
    return gitOutputAsArray("git diff --staged --name-only --diff-filter=ACM");
}
function allFiles() {
    return gitOutputAsArray("git ls-files");
}
function gitOutputAsArray(cmd) {
    return exec(cmd, { cwd: getRepoBaseDir() }).split('\n').map(function (x) { return x.trim(); }).filter(function (x) { return !!x; });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Retrieve and validate the config as `FormatConfig`. */
function getFormatConfig() {
    // List of errors encountered validating the config.
    const errors = [];
    // The unvalidated config object.
    const config = getConfig();
    if (config.format === undefined) {
        errors.push(`No configuration defined for "format"`);
    }
    for (const [key, value] of Object.entries(config.format)) {
        switch (typeof value) {
            case 'boolean':
                break;
            case 'object':
                checkFormatterConfig(key, value, errors);
                break;
            default:
                errors.push(`"format.${key}" is not a boolean or Formatter object`);
        }
    }
    assertNoErrors(errors);
    return config;
}
/** Validate an individual Formatter config. */
function checkFormatterConfig(key, config, errors) {
    if (config.matchers === undefined) {
        errors.push(`Missing "format.${key}.matchers" value`);
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
 * The base class for formatters to run against provided files.
 */
class Formatter {
    constructor(config) {
        this.config = config;
    }
    /**
     * Retrieve the command to execute the provided action, including both the binary
     * and command line flags.
     */
    commandFor(action) {
        switch (action) {
            case 'check':
                return `${this.binaryFilePath} ${this.actions.check.commandFlags}`;
            case 'format':
                return `${this.binaryFilePath} ${this.actions.format.commandFlags}`;
            default:
                throw Error('Unknown action type');
        }
    }
    /**
     * Retrieve the callback for the provided action to determine if an action
     * failed in formatting.
     */
    callbackFor(action) {
        switch (action) {
            case 'check':
                return this.actions.check.callback;
            case 'format':
                return this.actions.format.callback;
            default:
                throw Error('Unknown action type');
        }
    }
    /** Whether the formatter is enabled in the provided config. */
    isEnabled() {
        return !!this.config[this.name];
    }
    /** Retrieve the active file matcher for the formatter. */
    getFileMatcher() {
        return this.getFileMatcherFromConfig() || this.defaultFileMatcher;
    }
    /**
     * Retrieves the file matcher from the config provided to the constructor if provided.
     */
    getFileMatcherFromConfig() {
        const formatterConfig = this.config[this.name];
        if (typeof formatterConfig === 'boolean') {
            return undefined;
        }
        return formatterConfig.matchers;
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
 * Formatter for running buildifier against bazel related files.
 */
class Buildifier extends Formatter {
    constructor() {
        super(...arguments);
        this.name = 'buildifier';
        this.binaryFilePath = path.join(getRepoBaseDir(), 'node_modules/.bin/buildifier');
        this.defaultFileMatcher = ['**/*.bzl', '**/BUILD.bazel', '**/WORKSPACE', '**/BUILD'];
        this.actions = {
            check: {
                commandFlags: `${BAZEL_WARNING_FLAG} --lint=warn --mode=check --format=json`,
                callback: (_, code, stdout) => {
                    return code !== 0 || !JSON.parse(stdout).success;
                },
            },
            format: {
                commandFlags: `${BAZEL_WARNING_FLAG} --lint=fix --mode=fix`,
                callback: (file, code, _, stderr) => {
                    if (code !== 0) {
                        error(`Error running buildifier on: ${file}`);
                        error(stderr);
                        error();
                        return true;
                    }
                    return false;
                }
            }
        };
    }
}
// The warning flag for buildifier copied from angular/angular's usage.
const BAZEL_WARNING_FLAG = `--warnings=attr-cfg,attr-license,attr-non-empty,attr-output-default,` +
    `attr-single-file,constant-glob,ctx-args,depset-iteration,depset-union,dict-concatenation,` +
    `duplicated-name,filetype,git-repository,http-archive,integer-division,load,load-on-top,` +
    `native-build,native-package,output-group,package-name,package-on-top,positional-args,` +
    `redefined-variable,repository-name,same-origin-load,string-iteration,unused-variable`;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Formatter for running clang-format against Typescript and Javascript files
 */
class ClangFormat extends Formatter {
    constructor() {
        super(...arguments);
        this.name = 'clang-format';
        this.binaryFilePath = path.join(getRepoBaseDir(), 'node_modules/.bin/clang-format');
        this.defaultFileMatcher = ['**/*.{t,j}s'];
        this.actions = {
            check: {
                commandFlags: `--Werror -n -style=file`,
                callback: (_, code) => {
                    return code !== 0;
                },
            },
            format: {
                commandFlags: `-i -style=file`,
                callback: (file, code, _, stderr) => {
                    if (code !== 0) {
                        error(`Error running clang-format on: ${file}`);
                        error(stderr);
                        error();
                        return true;
                    }
                    return false;
                }
            }
        };
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
 * Get all defined formatters which are active based on the current loaded config.
 */
function getActiveFormatters() {
    const config = getFormatConfig().format;
    return [new Buildifier(config), new ClangFormat(config)].filter(formatter => formatter.isEnabled());
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const AVAILABLE_THREADS = Math.max(os.cpus().length - 1, 1);
/**
 * Run the provided commands in parallel for each provided file.
 *
 * Running the formatter is split across (number of available cpu threads - 1) processess.
 * The task is done in multiple processess to speed up the overall time of the task, as running
 * across entire repositories takes a large amount of time.
 * As a data point for illustration, using 8 process rather than 1 cut the execution
 * time from 276 seconds to 39 seconds for the same 2700 files.
 *
 * A promise is returned, completed when the command has completed running for each file.
 * The promise resolves with a list of failures, or `false` if no formatters have matched.
 */
function runFormatterInParallel(allFiles, action) {
    return new Promise((resolve) => {
        const formatters = getActiveFormatters();
        const failures = [];
        const pendingCommands = [];
        for (const formatter of formatters) {
            pendingCommands.push(...multimatch.call(undefined, allFiles, formatter.getFileMatcher(), { dot: true })
                .map(file => ({ formatter, file })));
        }
        // If no commands are generated, resolve the promise as `false` as no files
        // were run against the any formatters.
        if (pendingCommands.length === 0) {
            return resolve(false);
        }
        switch (action) {
            case 'format':
                info(`Formatting ${pendingCommands.length} file(s)`);
                break;
            case 'check':
                info(`Checking format of ${pendingCommands.length} file(s)`);
                break;
            default:
                throw Error(`Invalid format action "${action}": allowed actions are "format" and "check"`);
        }
        // The progress bar instance to use for progress tracking.
        const progressBar = new cliProgress.Bar({ format: `[{bar}] ETA: {eta}s | {value}/{total} files`, clearOnComplete: true });
        // A local copy of the files to run the command on.
        // An array to represent the current usage state of each of the threads for parallelization.
        const threads = new Array(AVAILABLE_THREADS).fill(false);
        // Recursively run the command on the next available file from the list using the provided
        // thread.
        function runCommandInThread(thread) {
            const nextCommand = pendingCommands.pop();
            // If no file was pulled from the array, return as there are no more files to run against.
            if (nextCommand === undefined) {
                threads[thread] = false;
                return;
            }
            // Get the file and formatter for the next command.
            const { file, formatter } = nextCommand;
            shelljs.exec(`${formatter.commandFor(action)} ${file}`, { async: true, silent: true }, (code, stdout, stderr) => {
                // Run the provided callback function.
                const failed = formatter.callbackFor(action)(file, code, stdout, stderr);
                if (failed) {
                    failures.push(file);
                }
                // Note in the progress bar another file being completed.
                progressBar.increment(1);
                // If more files exist in the list, run again to work on the next file,
                // using the same slot.
                if (pendingCommands.length) {
                    return runCommandInThread(thread);
                }
                // If not more files are available, mark the thread as unused.
                threads[thread] = false;
                // If all of the threads are false, as they are unused, mark the progress bar
                // completed and resolve the promise.
                if (threads.every(active => !active)) {
                    progressBar.stop();
                    resolve(failures);
                }
            });
            // Mark the thread as in use as the command execution has been started.
            threads[thread] = true;
        }
        // Start the progress bar
        progressBar.start(pendingCommands.length, 0);
        // Start running the command on files from the least in each available thread.
        threads.forEach((_, idx) => runCommandInThread(idx));
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Format provided files in place.
 */
function formatFiles(files) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        // Whether any files failed to format.
        let failures = yield runFormatterInParallel(files, 'format');
        if (failures === false) {
            info('No files matched for formatting.');
            process.exit(0);
        }
        // The process should exit as a failure if any of the files failed to format.
        if (failures.length !== 0) {
            error(`Formatting failed, see errors above for more information.`);
            process.exit(1);
        }
        info(`√  Formatting complete.`);
        process.exit(0);
    });
}
/**
 * Check provided files for formatting correctness.
 */
function checkFiles(files) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        // Files which are currently not formatted correctly.
        const failures = yield runFormatterInParallel(files, 'check');
        if (failures === false) {
            info('No files matched for formatting check.');
            process.exit(0);
        }
        if (failures.length) {
            // Provide output expressing which files are failing formatting.
            info.group('\nThe following files are out of format:');
            for (const file of failures) {
                info(`  - ${file}`);
            }
            info.groupEnd();
            info();
            // If the command is run in a non-CI environment, prompt to format the files immediately.
            let runFormatter = false;
            if (!process.env['CI']) {
                runFormatter = yield promptConfirm('Format the files now?', true);
            }
            if (runFormatter) {
                // Format the failing files as requested.
                yield formatFiles(failures);
                process.exit(0);
            }
            else {
                // Inform user how to format files in the future.
                info();
                info(`To format the failing file run the following command:`);
                info(`  yarn ng-dev format files ${failures.join(' ')}`);
                process.exit(1);
            }
        }
        else {
            info('√  All files correctly formatted.');
            process.exit(0);
        }
    });
}

/** Build the parser for the format commands. */
function buildFormatParser(localYargs) {
    return localYargs.help()
        .strict()
        .demandCommand()
        .option('check', {
        type: 'boolean',
        default: process.env['CI'] ? true : false,
        description: 'Run the formatter to check formatting rather than updating code format'
    })
        .command('all', 'Run the formatter on all files in the repository', args => args, ({ check }) => {
        const executionCmd = check ? checkFiles : formatFiles;
        executionCmd(allFiles());
    })
        .command('changed [shaOrRef]', 'Run the formatter on files changed since the provided sha/ref', args => args.positional('shaOrRef', { type: 'string' }), ({ shaOrRef, check }) => {
        const sha = shaOrRef || 'master';
        const executionCmd = check ? checkFiles : formatFiles;
        executionCmd(allChangedFilesSince(sha));
    })
        .command('staged', 'Run the formatter on all staged files', args => args, ({ check }) => {
        const executionCmd = check ? checkFiles : formatFiles;
        executionCmd(allStagedFiles());
    })
        .command('files <files..>', 'Run the formatter on provided files', args => args.positional('files', { array: true, type: 'string' }), ({ check, files }) => {
        const executionCmd = check ? checkFiles : formatFiles;
        executionCmd(files);
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function verify() {
    /** Full path to NgBot config file */
    const NGBOT_CONFIG_YAML_PATH = path.resolve(getRepoBaseDir(), '.github/angular-robot.yml');
    /** The NgBot config file */
    const ngBotYaml = fs.readFileSync(NGBOT_CONFIG_YAML_PATH, 'utf8');
    try {
        // Try parsing the config file to verify that the syntax is correct.
        yaml.parse(ngBotYaml);
        info(`${green('√')}  Valid NgBot YAML config`);
    }
    catch (e) {
        error(`${red('!')} Invalid NgBot YAML config`);
        error(e);
        process.exitCode = 1;
    }
}

/** Build the parser for the NgBot commands. */
function buildNgbotParser(localYargs) {
    return localYargs.help().strict().demandCommand().command('verify', 'Verify the NgBot config', {}, () => verify());
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Loads and validates the merge configuration. */
function loadAndValidateConfig(config, api) {
    return tslib.__awaiter(this, void 0, void 0, function () {
        var mergeConfig, errors;
        return tslib.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (config.merge === undefined) {
                        return [2 /*return*/, { errors: ['No merge configuration found. Set the `merge` configuration.'] }];
                    }
                    if (typeof config.merge !== 'function') {
                        return [2 /*return*/, { errors: ['Expected merge configuration to be defined lazily through a function.'] }];
                    }
                    return [4 /*yield*/, config.merge(api)];
                case 1:
                    mergeConfig = _a.sent();
                    errors = validateMergeConfig(mergeConfig);
                    if (errors.length) {
                        return [2 /*return*/, { errors: errors }];
                    }
                    return [2 /*return*/, { config: mergeConfig }];
            }
        });
    });
}
/** Validates the specified configuration. Returns a list of failure messages. */
function validateMergeConfig(config) {
    var errors = [];
    if (!config.labels) {
        errors.push('No label configuration.');
    }
    else if (!Array.isArray(config.labels)) {
        errors.push('Label configuration needs to be an array.');
    }
    if (!config.claSignedLabel) {
        errors.push('No CLA signed label configured.');
    }
    if (!config.mergeReadyLabel) {
        errors.push('No merge ready label configured.');
    }
    if (config.githubApiMerge === undefined) {
        errors.push('No explicit choice of merge strategy. Please set `githubApiMerge`.');
    }
    return errors;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Checks whether the specified value matches the given pattern. */
function matchesPattern(value, pattern) {
    return typeof pattern === 'string' ? value === pattern : pattern.test(value);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid branch is targeted.
 */
var InvalidTargetBranchError = /** @class */ (function () {
    function InvalidTargetBranchError(failureMessage) {
        this.failureMessage = failureMessage;
    }
    return InvalidTargetBranchError;
}());
/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid label has been applied to a pull request.
 */
var InvalidTargetLabelError = /** @class */ (function () {
    function InvalidTargetLabelError(failureMessage) {
        this.failureMessage = failureMessage;
    }
    return InvalidTargetLabelError;
}());
/** Gets the target label from the specified pull request labels. */
function getTargetLabelFromPullRequest(config, labels) {
    var e_1, _a;
    /** List of discovered target labels for the PR. */
    var matches = [];
    var _loop_1 = function (label) {
        var match = config.labels.find(function (_a) {
            var pattern = _a.pattern;
            return matchesPattern(label, pattern);
        });
        if (match !== undefined) {
            matches.push(match);
        }
    };
    try {
        for (var labels_1 = tslib.__values(labels), labels_1_1 = labels_1.next(); !labels_1_1.done; labels_1_1 = labels_1.next()) {
            var label = labels_1_1.value;
            _loop_1(label);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (labels_1_1 && !labels_1_1.done && (_a = labels_1.return)) _a.call(labels_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (matches.length === 1) {
        return matches[0];
    }
    if (matches.length === 0) {
        throw new InvalidTargetLabelError('Unable to determine target for the PR as it has no target label.');
    }
    throw new InvalidTargetLabelError('Unable to determine target for the PR as it has multiple target labels.');
}
/**
 * Gets the branches from the specified target label.
 *
 * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
 * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
 */
function getBranchesFromTargetLabel(label, githubTargetBranch) {
    return tslib.__awaiter(this, void 0, void 0, function () {
        var _a;
        return tslib.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(typeof label.branches === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, label.branches(githubTargetBranch)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, label.branches];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, _a];
            }
        });
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getTargetBranchesForPr(prNumber) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        /** The ng-dev configuration. */
        const config = getConfig();
        /** Repo owner and name for the github repository. */
        const { owner, name: repo } = config.github;
        /** The git client to get a Github API service instance. */
        const git = new GitClient(undefined, config);
        /** The validated merge config. */
        const { config: mergeConfig, errors } = yield loadAndValidateConfig(config, git.github);
        if (errors !== undefined) {
            throw Error(`Invalid configuration found: ${errors}`);
        }
        /** The current state of the pull request from Github. */
        const prData = (yield git.github.pulls.get({ owner, repo, pull_number: prNumber })).data;
        /** The list of labels on the PR as strings. */
        const labels = prData.labels.map(l => l.name);
        /** The branch targetted via the Github UI. */
        const githubTargetBranch = prData.base.ref;
        /** The active label which is being used for targetting the PR. */
        let targetLabel;
        try {
            targetLabel = getTargetLabelFromPullRequest(mergeConfig, labels);
        }
        catch (e) {
            if (e instanceof InvalidTargetLabelError) {
                error(red(e.failureMessage));
                process.exitCode = 1;
                return;
            }
            throw e;
        }
        /** The target branches based on the target label and branch targetted in the Github UI. */
        return yield getBranchesFromTargetLabel(targetLabel, githubTargetBranch);
    });
}
function printTargetBranchesForPr(prNumber) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const targets = yield getTargetBranchesForPr(prNumber);
        if (targets === undefined) {
            return;
        }
        info.group(`PR #${prNumber} will merge into:`);
        targets.forEach(target => info(`- ${target}`));
        info.groupEnd();
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Builds the command. */
function builder$4(yargs) {
    return yargs.positional('pr', {
        description: 'The pull request number',
        type: 'number',
        demandOption: true,
    });
}
/** Handles the command. */
function handler$4({ pr }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        yield printTargetBranchesForPr(pr);
    });
}
/** yargs command module describing the command.  */
const CheckTargetBranchesModule = {
    handler: handler$4,
    builder: builder$4,
    command: 'check-target-branches <pr>',
    describe: 'Check a PR to determine what branches it is currently targeting',
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Get a PR from github  */
function getPr(prSchema, prNumber, git) {
    return tslib.__awaiter(this, void 0, void 0, function () {
        var _a, owner, name, PR_QUERY, result;
        return tslib.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = git.remoteConfig, owner = _a.owner, name = _a.name;
                    PR_QUERY = typedGraphqlify.params({
                        $number: 'Int!',
                        $owner: 'String!',
                        $name: 'String!', // The organization to query for
                    }, {
                        repository: typedGraphqlify.params({ owner: '$owner', name: '$name' }, {
                            pullRequest: typedGraphqlify.params({ number: '$number' }, prSchema),
                        })
                    });
                    return [4 /*yield*/, git.github.graphql.query(PR_QUERY, { number: prNumber, owner: owner, name: name })];
                case 1:
                    result = (_b.sent());
                    return [2 /*return*/, result.repository.pullRequest];
            }
        });
    });
}
/** Get all pending PRs from github  */
function getPendingPrs(prSchema, git) {
    return tslib.__awaiter(this, void 0, void 0, function () {
        var _a, owner, name, PRS_QUERY, cursor, hasNextPage, prs, params_1, results;
        return tslib.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = git.remoteConfig, owner = _a.owner, name = _a.name;
                    PRS_QUERY = typedGraphqlify.params({
                        $first: 'Int',
                        $after: 'String',
                        $owner: 'String!',
                        $name: 'String!', // The repository to query for
                    }, {
                        repository: typedGraphqlify.params({ owner: '$owner', name: '$name' }, {
                            pullRequests: typedGraphqlify.params({
                                first: '$first',
                                after: '$after',
                                states: "OPEN",
                            }, {
                                nodes: [prSchema],
                                pageInfo: {
                                    hasNextPage: typedGraphqlify.types.boolean,
                                    endCursor: typedGraphqlify.types.string,
                                },
                            }),
                        })
                    });
                    hasNextPage = true;
                    prs = [];
                    _b.label = 1;
                case 1:
                    if (!hasNextPage) return [3 /*break*/, 3];
                    params_1 = {
                        after: cursor || null,
                        first: 100,
                        owner: owner,
                        name: name,
                    };
                    return [4 /*yield*/, git.github.graphql.query(PRS_QUERY, params_1)];
                case 2:
                    results = _b.sent();
                    prs.push.apply(prs, tslib.__spreadArray([], tslib.__read(results.repository.pullRequests.nodes)));
                    hasNextPage = results.repository.pullRequests.pageInfo.hasNextPage;
                    cursor = results.repository.pullRequests.pageInfo.endCursor;
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, prs];
            }
        });
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* GraphQL schema for the response body for a pending PR. */
const PR_SCHEMA = {
    state: typedGraphqlify.types.string,
    maintainerCanModify: typedGraphqlify.types.boolean,
    viewerDidAuthor: typedGraphqlify.types.boolean,
    headRefOid: typedGraphqlify.types.string,
    headRef: {
        name: typedGraphqlify.types.string,
        repository: {
            url: typedGraphqlify.types.string,
            nameWithOwner: typedGraphqlify.types.string,
        },
    },
    baseRef: {
        name: typedGraphqlify.types.string,
        repository: {
            url: typedGraphqlify.types.string,
            nameWithOwner: typedGraphqlify.types.string,
        },
    },
};
class UnexpectedLocalChangesError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, UnexpectedLocalChangesError.prototype);
    }
}
class MaintainerModifyAccessError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, MaintainerModifyAccessError.prototype);
    }
}
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
function checkOutPullRequestLocally(prNumber, githubToken, opts = {}) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        /** Authenticated Git client for git and Github interactions. */
        const git = new GitClient(githubToken);
        // In order to preserve local changes, checkouts cannot occur if local changes are present in the
        // git environment. Checked before retrieving the PR to fail fast.
        if (git.hasLocalChanges()) {
            throw new UnexpectedLocalChangesError('Unable to checkout PR due to uncommitted changes.');
        }
        /**
         * The branch or revision originally checked out before this method performed
         * any Git operations that may change the working branch.
         */
        const previousBranchOrRevision = git.getCurrentBranchOrRevision();
        /* The PR information from Github. */
        const pr = yield getPr(PR_SCHEMA, prNumber, git);
        /** The branch name of the PR from the repository the PR came from. */
        const headRefName = pr.headRef.name;
        /** The full ref for the repository and branch the PR came from. */
        const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
        /** The full URL path of the repository the PR came from with github token as authentication. */
        const headRefUrl = addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
        // Note: Since we use a detached head for rebasing the PR and therefore do not have
        // remote-tracking branches configured, we need to set our expected ref and SHA. This
        // allows us to use `--force-with-lease` for the detached head while ensuring that we
        // never accidentally override upstream changes that have been pushed in the meanwhile.
        // See:
        // https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt
        /** Flag for a force push with leage back to upstream. */
        const forceWithLeaseFlag = `--force-with-lease=${headRefName}:${pr.headRefOid}`;
        // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
        // be pushed up.
        if (!pr.maintainerCanModify && !pr.viewerDidAuthor && !opts.allowIfMaintainerCannotModify) {
            throw new MaintainerModifyAccessError('PR is not set to allow maintainers to modify the PR');
        }
        try {
            // Fetch the branch at the commit of the PR, and check it out in a detached state.
            info(`Checking out PR #${prNumber} from ${fullHeadRef}`);
            git.run(['fetch', '-q', headRefUrl, headRefName]);
            git.run(['checkout', '--detach', 'FETCH_HEAD']);
        }
        catch (e) {
            git.checkout(previousBranchOrRevision, true);
            throw e;
        }
        return {
            /**
             * Pushes the current local branch to the PR on the upstream repository.
             *
             * @returns true If the command did not fail causing a GitCommandError to be thrown.
             * @throws GitCommandError Thrown when the push back to upstream fails.
             */
            pushToUpstream: () => {
                git.run(['push', headRefUrl, `HEAD:${headRefName}`, forceWithLeaseFlag]);
                return true;
            },
            /** Restores the state of the local repository to before the PR checkout occured. */
            resetGitState: () => {
                return git.checkout(previousBranchOrRevision, true);
            }
        };
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Builds the checkout pull request command. */
function builder$5(yargs) {
    return addGithubTokenOption(yargs).positional('prNumber', { type: 'number', demandOption: true });
}
/** Handles the checkout pull request command. */
function handler$5({ prNumber, githubToken }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const prCheckoutOptions = { allowIfMaintainerCannotModify: true, branchName: `pr-${prNumber}` };
        yield checkOutPullRequestLocally(prNumber, githubToken, prCheckoutOptions);
    });
}
/** yargs command module for checking out a PR  */
const CheckoutCommandModule = {
    handler: handler$5,
    builder: builder$5,
    command: 'checkout <pr-number>',
    describe: 'Checkout a PR from the upstream repo',
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* GraphQL schema for the response body for each pending PR. */
const PR_SCHEMA$1 = {
    headRef: {
        name: typedGraphqlify.types.string,
        repository: {
            url: typedGraphqlify.types.string,
            nameWithOwner: typedGraphqlify.types.string,
        },
    },
    baseRef: {
        name: typedGraphqlify.types.string,
        repository: {
            url: typedGraphqlify.types.string,
            nameWithOwner: typedGraphqlify.types.string,
        },
    },
    updatedAt: typedGraphqlify.types.string,
    number: typedGraphqlify.types.number,
    mergeable: typedGraphqlify.types.string,
    title: typedGraphqlify.types.string,
};
/** Convert raw Pull Request response from Github to usable Pull Request object. */
function processPr(pr) {
    return Object.assign(Object.assign({}, pr), { updatedAt: (new Date(pr.updatedAt)).getTime() });
}
/** Name of a temporary local branch that is used for checking conflicts. **/
const tempWorkingBranch = '__NgDevRepoBaseAfterChange__';
/** Checks if the provided PR will cause new conflicts in other pending PRs. */
function discoverNewConflictsForPr(newPrNumber, updatedAfter, config = getConfig()) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const git = new GitClient();
        // If there are any local changes in the current repository state, the
        // check cannot run as it needs to move between branches.
        if (git.hasLocalChanges()) {
            error('Cannot run with local changes. Please make sure there are no local changes.');
            process.exit(1);
        }
        /** The active github branch or revision before we performed any Git commands. */
        const previousBranchOrRevision = git.getCurrentBranchOrRevision();
        /* Progress bar to indicate progress. */
        const progressBar = new cliProgress.Bar({ format: `[{bar}] ETA: {eta}s | {value}/{total}` });
        /* PRs which were found to be conflicting. */
        const conflicts = [];
        info(`Requesting pending PRs from Github`);
        /** List of PRs from github currently known as mergable. */
        const allPendingPRs = (yield getPendingPrs(PR_SCHEMA$1, git)).map(processPr);
        /** The PR which is being checked against. */
        const requestedPr = allPendingPRs.find(pr => pr.number === newPrNumber);
        if (requestedPr === undefined) {
            error(`The request PR, #${newPrNumber} was not found as a pending PR on github, please confirm`);
            error(`the PR number is correct and is an open PR`);
            process.exit(1);
        }
        const pendingPrs = allPendingPRs.filter(pr => {
            return (
            // PRs being merged into the same target branch as the requested PR
            pr.baseRef.name === requestedPr.baseRef.name &&
                // PRs which either have not been processed or are determined as mergable by Github
                pr.mergeable !== 'CONFLICTING' &&
                // PRs updated after the provided date
                pr.updatedAt >= updatedAfter);
        });
        info(`Retrieved ${allPendingPRs.length} total pending PRs`);
        info(`Checking ${pendingPrs.length} PRs for conflicts after a merge of #${newPrNumber}`);
        // Fetch and checkout the PR being checked.
        exec(`git fetch ${requestedPr.headRef.repository.url} ${requestedPr.headRef.name}`);
        exec(`git checkout -B ${tempWorkingBranch} FETCH_HEAD`);
        // Rebase the PR against the PRs target branch.
        exec(`git fetch ${requestedPr.baseRef.repository.url} ${requestedPr.baseRef.name}`);
        const result = exec(`git rebase FETCH_HEAD`);
        if (result.code) {
            error('The requested PR currently has conflicts');
            cleanUpGitState(previousBranchOrRevision);
            process.exit(1);
        }
        // Start the progress bar
        progressBar.start(pendingPrs.length, 0);
        // Check each PR to determine if it can merge cleanly into the repo after the target PR.
        for (const pr of pendingPrs) {
            // Fetch and checkout the next PR
            exec(`git fetch ${pr.headRef.repository.url} ${pr.headRef.name}`);
            exec(`git checkout --detach FETCH_HEAD`);
            // Check if the PR cleanly rebases into the repo after the target PR.
            const result = exec(`git rebase ${tempWorkingBranch}`);
            if (result.code !== 0) {
                conflicts.push(pr);
            }
            // Abort any outstanding rebase attempt.
            exec(`git rebase --abort`);
            progressBar.increment(1);
        }
        // End the progress bar as all PRs have been processed.
        progressBar.stop();
        info();
        info(`Result:`);
        cleanUpGitState(previousBranchOrRevision);
        // If no conflicts are found, exit successfully.
        if (conflicts.length === 0) {
            info(`No new conflicting PRs found after #${newPrNumber} merging`);
            process.exit(0);
        }
        // Inform about discovered conflicts, exit with failure.
        error.group(`${conflicts.length} PR(s) which conflict(s) after #${newPrNumber} merges:`);
        for (const pr of conflicts) {
            error(`  - #${pr.number}: ${pr.title}`);
        }
        error.groupEnd();
        process.exit(1);
    });
}
/** Reset git back to the provided branch or revision. */
function cleanUpGitState(previousBranchOrRevision) {
    // Ensure that any outstanding rebases are aborted.
    exec(`git rebase --abort`);
    // Ensure that any changes in the current repo state are cleared.
    exec(`git reset --hard`);
    // Checkout the original branch from before the run began.
    exec(`git checkout ${previousBranchOrRevision}`);
    // Delete the generated branch.
    exec(`git branch -D ${tempWorkingBranch}`);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Builds the discover-new-conflicts pull request command. */
function buildDiscoverNewConflictsCommand(yargs) {
    return yargs
        .option('date', {
        description: 'Only consider PRs updated since provided date',
        defaultDescription: '30 days ago',
        coerce: (date) => typeof date === 'number' ? date : Date.parse(date),
        default: getThirtyDaysAgoDate(),
    })
        .positional('pr-number', { demandOption: true, type: 'number' });
}
/** Handles the discover-new-conflicts pull request command. */
function handleDiscoverNewConflictsCommand({ 'pr-number': prNumber, date }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        // If a provided date is not able to be parsed, yargs provides it as NaN.
        if (isNaN(date)) {
            error('Unable to parse the value provided via --date flag');
            process.exit(1);
        }
        yield discoverNewConflictsForPr(prNumber, date);
    });
}
/** Gets a date object 30 days ago from today. */
function getThirtyDaysAgoDate() {
    const date = new Date();
    // Set the hours, minutes and seconds to 0 to only consider date.
    date.setHours(0, 0, 0, 0);
    // Set the date to 30 days in the past.
    date.setDate(date.getDate() - 30);
    return date.getTime();
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Class that can be used to describe pull request failures. A failure
 * is described through a human-readable message and a flag indicating
 * whether it is non-fatal or not.
 */
var PullRequestFailure = /** @class */ (function () {
    function PullRequestFailure(
    /** Human-readable message for the failure */
    message, 
    /** Whether the failure is non-fatal and can be forcibly ignored. */
    nonFatal) {
        if (nonFatal === void 0) { nonFatal = false; }
        this.message = message;
        this.nonFatal = nonFatal;
    }
    PullRequestFailure.claUnsigned = function () {
        return new this("CLA has not been signed. Please make sure the PR author has signed the CLA.");
    };
    PullRequestFailure.failingCiJobs = function () {
        return new this("Failing CI jobs.", true);
    };
    PullRequestFailure.pendingCiJobs = function () {
        return new this("Pending CI jobs.", true);
    };
    PullRequestFailure.notMergeReady = function () {
        return new this("Not marked as merge ready.");
    };
    PullRequestFailure.mismatchingTargetBranch = function (allowedBranches) {
        return new this("Pull request is set to wrong base branch. Please update the PR in the Github UI " +
            ("to one of the following branches: " + allowedBranches.join(', ') + "."));
    };
    PullRequestFailure.unsatisfiedBaseSha = function () {
        return new this("Pull request has not been rebased recently and could be bypassing CI checks. " +
            "Please rebase the PR.");
    };
    PullRequestFailure.mergeConflicts = function (failedBranches) {
        return new this("Could not merge pull request into the following branches due to merge " +
            ("conflicts: " + failedBranches.join(', ') + ". Please rebase the PR or update the target label."));
    };
    PullRequestFailure.unknownMergeError = function () {
        return new this("Unknown merge error occurred. Please see console output above for debugging.");
    };
    PullRequestFailure.unableToFixupCommitMessageSquashOnly = function () {
        return new this("Unable to fixup commit message of pull request. Commit message can only be " +
            "modified if the PR is merged using squash.");
    };
    PullRequestFailure.notFound = function () {
        return new this("Pull request could not be found upstream.");
    };
    PullRequestFailure.insufficientPermissionsToMerge = function (message) {
        if (message === void 0) { message = "Insufficient Github API permissions to merge pull request. Please ensure that " +
            "your auth token has write access."; }
        return new this(message);
    };
    return PullRequestFailure;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getCaretakerNotePromptMessage(pullRequest) {
    return red('Pull request has a caretaker note applied. Please make sure you read it.') +
        ("\nQuick link to PR: " + pullRequest.url + "\nDo you want to proceed merging?");
}
function getTargettedBranchesConfirmationPromptMessage(pullRequest) {
    var targetBranchListAsString = pullRequest.targetBranches.map(function (b) { return " - " + b + "\n"; }).join('');
    return "Pull request #" + pullRequest.prNumber + " will merge into:\n" + targetBranchListAsString + "\nDo you want to proceed merging?";
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 */
function loadAndValidatePullRequest(_a, prNumber, ignoreNonFatalFailures) {
    var git = _a.git, config = _a.config;
    if (ignoreNonFatalFailures === void 0) { ignoreNonFatalFailures = false; }
    return tslib.__awaiter(this, void 0, void 0, function () {
        var prData, labels, targetLabel, state, githubTargetBranch, requiredBaseSha, needsCommitMessageFixup, hasCaretakerNote, targetBranches, error_1;
        return tslib.__generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetchPullRequestFromGithub(git, prNumber)];
                case 1:
                    prData = _b.sent();
                    if (prData === null) {
                        return [2 /*return*/, PullRequestFailure.notFound()];
                    }
                    labels = prData.labels.map(function (l) { return l.name; });
                    if (!labels.some(function (name) { return matchesPattern(name, config.mergeReadyLabel); })) {
                        return [2 /*return*/, PullRequestFailure.notMergeReady()];
                    }
                    if (!labels.some(function (name) { return matchesPattern(name, config.claSignedLabel); })) {
                        return [2 /*return*/, PullRequestFailure.claUnsigned()];
                    }
                    try {
                        targetLabel = getTargetLabelFromPullRequest(config, labels);
                    }
                    catch (error) {
                        if (error instanceof InvalidTargetLabelError) {
                            return [2 /*return*/, new PullRequestFailure(error.failureMessage)];
                        }
                        throw error;
                    }
                    return [4 /*yield*/, git.github.repos.getCombinedStatusForRef(tslib.__assign(tslib.__assign({}, git.remoteParams), { ref: prData.head.sha }))];
                case 2:
                    state = (_b.sent()).data.state;
                    if (state === 'failure' && !ignoreNonFatalFailures) {
                        return [2 /*return*/, PullRequestFailure.failingCiJobs()];
                    }
                    if (state === 'pending' && !ignoreNonFatalFailures) {
                        return [2 /*return*/, PullRequestFailure.pendingCiJobs()];
                    }
                    githubTargetBranch = prData.base.ref;
                    requiredBaseSha = config.requiredBaseCommits && config.requiredBaseCommits[githubTargetBranch];
                    needsCommitMessageFixup = !!config.commitMessageFixupLabel &&
                        labels.some(function (name) { return matchesPattern(name, config.commitMessageFixupLabel); });
                    hasCaretakerNote = !!config.caretakerNoteLabel &&
                        labels.some(function (name) { return matchesPattern(name, config.caretakerNoteLabel); });
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, getBranchesFromTargetLabel(targetLabel, githubTargetBranch)];
                case 4:
                    targetBranches = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    if (error_1 instanceof InvalidTargetBranchError || error_1 instanceof InvalidTargetLabelError) {
                        return [2 /*return*/, new PullRequestFailure(error_1.failureMessage)];
                    }
                    throw error_1;
                case 6: return [2 /*return*/, {
                        url: prData.html_url,
                        prNumber: prNumber,
                        labels: labels,
                        requiredBaseSha: requiredBaseSha,
                        githubTargetBranch: githubTargetBranch,
                        needsCommitMessageFixup: needsCommitMessageFixup,
                        hasCaretakerNote: hasCaretakerNote,
                        targetBranches: targetBranches,
                        title: prData.title,
                        commitCount: prData.commits,
                    }];
            }
        });
    });
}
/** Fetches a pull request from Github. Returns null if an error occurred. */
function fetchPullRequestFromGithub(git, prNumber) {
    return tslib.__awaiter(this, void 0, void 0, function () {
        var result, e_1;
        return tslib.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, git.github.pulls.get(tslib.__assign(tslib.__assign({}, git.remoteParams), { pull_number: prNumber }))];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.data];
                case 2:
                    e_1 = _a.sent();
                    // If the pull request could not be found, we want to return `null` so
                    // that the error can be handled gracefully.
                    if (e_1.status === 404) {
                        return [2 /*return*/, null];
                    }
                    throw e_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/** Whether the specified value resolves to a pull request. */
function isPullRequest(v) {
    return v.targetBranches !== undefined;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Name of a temporary branch that contains the head of a currently-processed PR. Note
 * that a branch name should be used that most likely does not conflict with other local
 * development branches.
 */
var TEMP_PR_HEAD_BRANCH = 'merge_pr_head';
/**
 * Base class for merge strategies. A merge strategy accepts a pull request and
 * merges it into the determined target branches.
 */
var MergeStrategy = /** @class */ (function () {
    function MergeStrategy(git) {
        this.git = git;
    }
    /**
     * Prepares a merge of the given pull request. The strategy by default will
     * fetch all target branches and the pull request into local temporary branches.
     */
    MergeStrategy.prototype.prepare = function (pullRequest) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            return tslib.__generator(this, function (_a) {
                this.fetchTargetBranches(pullRequest.targetBranches, "pull/" + pullRequest.prNumber + "/head:" + TEMP_PR_HEAD_BRANCH);
                return [2 /*return*/];
            });
        });
    };
    /** Cleans up the pull request merge. e.g. deleting temporary local branches. */
    MergeStrategy.prototype.cleanup = function (pullRequest) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib.__generator(this, function (_a) {
                // Delete all temporary target branches.
                pullRequest.targetBranches.forEach(function (branchName) { return _this.git.run(['branch', '-D', _this.getLocalTargetBranchName(branchName)]); });
                // Delete temporary branch for the pull request head.
                this.git.run(['branch', '-D', TEMP_PR_HEAD_BRANCH]);
                return [2 /*return*/];
            });
        });
    };
    /** Gets the revision range for all commits in the given pull request. */
    MergeStrategy.prototype.getPullRequestRevisionRange = function (pullRequest) {
        return this.getPullRequestBaseRevision(pullRequest) + ".." + TEMP_PR_HEAD_BRANCH;
    };
    /** Gets the base revision of a pull request. i.e. the commit the PR is based on. */
    MergeStrategy.prototype.getPullRequestBaseRevision = function (pullRequest) {
        return TEMP_PR_HEAD_BRANCH + "~" + pullRequest.commitCount;
    };
    /** Gets a deterministic local branch name for a given branch. */
    MergeStrategy.prototype.getLocalTargetBranchName = function (targetBranch) {
        return "merge_pr_target_" + targetBranch.replace(/\//g, '_');
    };
    /**
     * Cherry-picks the given revision range into the specified target branches.
     * @returns A list of branches for which the revisions could not be cherry-picked into.
     */
    MergeStrategy.prototype.cherryPickIntoTargetBranches = function (revisionRange, targetBranches, options) {
        var e_1, _a;
        if (options === void 0) { options = {}; }
        var cherryPickArgs = [revisionRange];
        var failedBranches = [];
        if (options.dryRun) {
            // https://git-scm.com/docs/git-cherry-pick#Documentation/git-cherry-pick.txt---no-commit
            // This causes `git cherry-pick` to not generate any commits. Instead, the changes are
            // applied directly in the working tree. This allow us to easily discard the changes
            // for dry-run purposes.
            cherryPickArgs.push('--no-commit');
        }
        if (options.linkToOriginalCommits) {
            // We add `-x` when cherry-picking as that will allow us to easily jump to original
            // commits for cherry-picked commits. With that flag set, Git will automatically append
            // the original SHA/revision to the commit message. e.g. `(cherry picked from commit <..>)`.
            // https://git-scm.com/docs/git-cherry-pick#Documentation/git-cherry-pick.txt--x.
            cherryPickArgs.push('-x');
        }
        try {
            // Cherry-pick the refspec into all determined target branches.
            for (var targetBranches_1 = tslib.__values(targetBranches), targetBranches_1_1 = targetBranches_1.next(); !targetBranches_1_1.done; targetBranches_1_1 = targetBranches_1.next()) {
                var branchName = targetBranches_1_1.value;
                var localTargetBranch = this.getLocalTargetBranchName(branchName);
                // Checkout the local target branch.
                this.git.run(['checkout', localTargetBranch]);
                // Cherry-pick the refspec into the target branch.
                if (this.git.runGraceful(tslib.__spreadArray(['cherry-pick'], tslib.__read(cherryPickArgs))).status !== 0) {
                    // Abort the failed cherry-pick. We do this because Git persists the failed
                    // cherry-pick state globally in the repository. This could prevent future
                    // pull request merges as a Git thinks a cherry-pick is still in progress.
                    this.git.runGraceful(['cherry-pick', '--abort']);
                    failedBranches.push(branchName);
                }
                // If we run with dry run mode, we reset the local target branch so that all dry-run
                // cherry-pick changes are discard. Changes are applied to the working tree and index.
                if (options.dryRun) {
                    this.git.run(['reset', '--hard', 'HEAD']);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (targetBranches_1_1 && !targetBranches_1_1.done && (_a = targetBranches_1.return)) _a.call(targetBranches_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return failedBranches;
    };
    /**
     * Fetches the given target branches. Also accepts a list of additional refspecs that
     * should be fetched. This is helpful as multiple slow fetches could be avoided.
     */
    MergeStrategy.prototype.fetchTargetBranches = function (names) {
        var _this = this;
        var extraRefspecs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            extraRefspecs[_i - 1] = arguments[_i];
        }
        var fetchRefspecs = names.map(function (targetBranch) {
            var localTargetBranch = _this.getLocalTargetBranchName(targetBranch);
            return "refs/heads/" + targetBranch + ":" + localTargetBranch;
        });
        // Fetch all target branches with a single command. We don't want to fetch them
        // individually as that could cause an unnecessary slow-down.
        this.git.run(tslib.__spreadArray(tslib.__spreadArray(['fetch', '-q', '-f', this.git.repoGitUrl], tslib.__read(fetchRefspecs)), tslib.__read(extraRefspecs)));
    };
    /** Pushes the given target branches upstream. */
    MergeStrategy.prototype.pushTargetBranchesUpstream = function (names) {
        var _this = this;
        var pushRefspecs = names.map(function (targetBranch) {
            var localTargetBranch = _this.getLocalTargetBranchName(targetBranch);
            return localTargetBranch + ":refs/heads/" + targetBranch;
        });
        // Push all target branches with a single command if we don't run in dry-run mode.
        // We don't want to push them individually as that could cause an unnecessary slow-down.
        this.git.run(tslib.__spreadArray(['push', this.git.repoGitUrl], tslib.__read(pushRefspecs)));
    };
    return MergeStrategy;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Separator between commit message header and body. */
var COMMIT_HEADER_SEPARATOR = '\n\n';
/**
 * Merge strategy that primarily leverages the Github API. The strategy merges a given
 * pull request into a target branch using the API. This ensures that Github displays
 * the pull request as merged. The merged commits are then cherry-picked into the remaining
 * target branches using the local Git instance. The benefit is that the Github merged state
 * is properly set, but a notable downside is that PRs cannot use fixup or squash commits.
 */
var GithubApiMergeStrategy = /** @class */ (function (_super) {
    tslib.__extends(GithubApiMergeStrategy, _super);
    function GithubApiMergeStrategy(git, _config) {
        var _this = _super.call(this, git) || this;
        _this._config = _config;
        return _this;
    }
    GithubApiMergeStrategy.prototype.merge = function (pullRequest) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var githubTargetBranch, prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup, method, cherryPickTargetBranches, failure, mergeOptions, mergeStatusCode, targetSha, result, e_1, targetCommitsCount, failedBranches;
            return tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubTargetBranch = pullRequest.githubTargetBranch, prNumber = pullRequest.prNumber, targetBranches = pullRequest.targetBranches, requiredBaseSha = pullRequest.requiredBaseSha, needsCommitMessageFixup = pullRequest.needsCommitMessageFixup;
                        // If the pull request does not have its base branch set to any determined target
                        // branch, we cannot merge using the API.
                        if (targetBranches.every(function (t) { return t !== githubTargetBranch; })) {
                            return [2 /*return*/, PullRequestFailure.mismatchingTargetBranch(targetBranches)];
                        }
                        // In cases where a required base commit is specified for this pull request, check if
                        // the pull request contains the given commit. If not, return a pull request failure.
                        // This check is useful for enforcing that PRs are rebased on top of a given commit.
                        // e.g. a commit that changes the code ownership validation. PRs which are not rebased
                        // could bypass new codeowner ship rules.
                        if (requiredBaseSha && !this.git.hasCommit(TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
                            return [2 /*return*/, PullRequestFailure.unsatisfiedBaseSha()];
                        }
                        method = this._getMergeActionFromPullRequest(pullRequest);
                        cherryPickTargetBranches = targetBranches.filter(function (b) { return b !== githubTargetBranch; });
                        return [4 /*yield*/, this._checkMergability(pullRequest, cherryPickTargetBranches)];
                    case 1:
                        failure = _a.sent();
                        // If the PR could not be cherry-picked into all target branches locally, we know it can't
                        // be done through the Github API either. We abort merging and pass-through the failure.
                        if (failure !== null) {
                            return [2 /*return*/, failure];
                        }
                        mergeOptions = tslib.__assign({ pull_number: prNumber, merge_method: method }, this.git.remoteParams);
                        if (!needsCommitMessageFixup) return [3 /*break*/, 3];
                        // Commit message fixup does not work with other merge methods as the Github API only
                        // allows commit message modifications for squash merging.
                        if (method !== 'squash') {
                            return [2 /*return*/, PullRequestFailure.unableToFixupCommitMessageSquashOnly()];
                        }
                        return [4 /*yield*/, this._promptCommitMessageEdit(pullRequest, mergeOptions)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.git.github.pulls.merge(mergeOptions)];
                    case 4:
                        result = _a.sent();
                        mergeStatusCode = result.status;
                        targetSha = result.data.sha;
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        // Note: Github usually returns `404` as status code if the API request uses a
                        // token with insufficient permissions. Github does this because it doesn't want
                        // to leak whether a repository exists or not. In our case we expect a certain
                        // repository to exist, so we always treat this as a permission failure.
                        if (e_1.status === 403 || e_1.status === 404) {
                            return [2 /*return*/, PullRequestFailure.insufficientPermissionsToMerge()];
                        }
                        throw e_1;
                    case 6:
                        // https://developer.github.com/v3/pulls/#response-if-merge-cannot-be-performed
                        // Pull request cannot be merged due to merge conflicts.
                        if (mergeStatusCode === 405) {
                            return [2 /*return*/, PullRequestFailure.mergeConflicts([githubTargetBranch])];
                        }
                        if (mergeStatusCode !== 200) {
                            return [2 /*return*/, PullRequestFailure.unknownMergeError()];
                        }
                        // If the PR does  not need to be merged into any other target branches,
                        // we exit here as we already completed the merge.
                        if (!cherryPickTargetBranches.length) {
                            return [2 /*return*/, null];
                        }
                        // Refresh the target branch the PR has been merged into through the API. We need
                        // to re-fetch as otherwise we cannot cherry-pick the new commits into the remaining
                        // target branches.
                        this.fetchTargetBranches([githubTargetBranch]);
                        targetCommitsCount = method === 'squash' ? 1 : pullRequest.commitCount;
                        return [4 /*yield*/, this.cherryPickIntoTargetBranches(targetSha + "~" + targetCommitsCount + ".." + targetSha, cherryPickTargetBranches, {
                                // Commits that have been created by the Github API do not necessarily contain
                                // a reference to the source pull request (unless the squash strategy is used).
                                // To ensure that original commits can be found when a commit is viewed in a
                                // target branch, we add a link to the original commits when cherry-picking.
                                linkToOriginalCommits: true,
                            })];
                    case 7:
                        failedBranches = _a.sent();
                        // We already checked whether the PR can be cherry-picked into the target branches,
                        // but in case the cherry-pick somehow fails, we still handle the conflicts here. The
                        // commits created through the Github API could be different (i.e. through squash).
                        if (failedBranches.length) {
                            return [2 /*return*/, PullRequestFailure.mergeConflicts(failedBranches)];
                        }
                        this.pushTargetBranchesUpstream(cherryPickTargetBranches);
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Prompts the user for the commit message changes. Unlike as in the autosquash merge
     * strategy, we cannot start an interactive rebase because we merge using the Github API.
     * The Github API only allows modifications to PR title and body for squash merges.
     */
    GithubApiMergeStrategy.prototype._promptCommitMessageEdit = function (pullRequest, mergeOptions) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var commitMessage, result, _a, newTitle, newMessage;
            return tslib.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._getDefaultSquashCommitMessage(pullRequest)];
                    case 1:
                        commitMessage = _b.sent();
                        return [4 /*yield*/, inquirer.prompt({
                                type: 'editor',
                                name: 'result',
                                message: 'Please update the commit message',
                                default: commitMessage,
                            })];
                    case 2:
                        result = (_b.sent()).result;
                        _a = tslib.__read(result.split(COMMIT_HEADER_SEPARATOR)), newTitle = _a[0], newMessage = _a.slice(1);
                        // Update the merge options so that the changes are reflected in there.
                        mergeOptions.commit_title = newTitle + " (#" + pullRequest.prNumber + ")";
                        mergeOptions.commit_message = newMessage.join(COMMIT_HEADER_SEPARATOR);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets a commit message for the given pull request. Github by default concatenates
     * multiple commit messages if a PR is merged in squash mode. We try to replicate this
     * behavior here so that we have a default commit message that can be fixed up.
     */
    GithubApiMergeStrategy.prototype._getDefaultSquashCommitMessage = function (pullRequest) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var commits, messageBase, joinedMessages;
            return tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getPullRequestCommitMessages(pullRequest)];
                    case 1:
                        commits = (_a.sent())
                            .map(function (message) { return ({ message: message, parsed: parseCommitMessage(message) }); });
                        messageBase = "" + pullRequest.title + COMMIT_HEADER_SEPARATOR;
                        if (commits.length <= 1) {
                            return [2 /*return*/, "" + messageBase + commits[0].parsed.body];
                        }
                        joinedMessages = commits.map(function (c) { return "* " + c.message; }).join(COMMIT_HEADER_SEPARATOR);
                        return [2 /*return*/, "" + messageBase + joinedMessages];
                }
            });
        });
    };
    /** Gets all commit messages of commits in the pull request. */
    GithubApiMergeStrategy.prototype._getPullRequestCommitMessages = function (_a) {
        var prNumber = _a.prNumber;
        return tslib.__awaiter(this, void 0, void 0, function () {
            var request, allCommits;
            return tslib.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        request = this.git.github.pulls.listCommits.endpoint.merge(tslib.__assign(tslib.__assign({}, this.git.remoteParams), { pull_number: prNumber }));
                        return [4 /*yield*/, this.git.github.paginate(request)];
                    case 1:
                        allCommits = _b.sent();
                        return [2 /*return*/, allCommits.map(function (_a) {
                                var commit = _a.commit;
                                return commit.message;
                            })];
                }
            });
        });
    };
    /**
     * Checks if given pull request could be merged into its target branches.
     * @returns A pull request failure if it the PR could not be merged.
     */
    GithubApiMergeStrategy.prototype._checkMergability = function (pullRequest, targetBranches) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var revisionRange, failedBranches;
            return tslib.__generator(this, function (_a) {
                revisionRange = this.getPullRequestRevisionRange(pullRequest);
                failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches, { dryRun: true });
                if (failedBranches.length) {
                    return [2 /*return*/, PullRequestFailure.mergeConflicts(failedBranches)];
                }
                return [2 /*return*/, null];
            });
        });
    };
    /** Determines the merge action from the given pull request. */
    GithubApiMergeStrategy.prototype._getMergeActionFromPullRequest = function (_a) {
        var labels = _a.labels;
        if (this._config.labels) {
            var matchingLabel = this._config.labels.find(function (_a) {
                var pattern = _a.pattern;
                return labels.some(function (l) { return matchesPattern(l, pattern); });
            });
            if (matchingLabel !== undefined) {
                return matchingLabel.method;
            }
        }
        return this._config.default;
    };
    return GithubApiMergeStrategy;
}(MergeStrategy));

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Path to the commit message filter script. Git expects this paths to use forward slashes. */
var MSG_FILTER_SCRIPT = path.join(__dirname, './commit-message-filter.js').replace(/\\/g, '/');
/**
 * Merge strategy that does not use the Github API for merging. Instead, it fetches
 * all target branches and the PR locally. The PR is then cherry-picked with autosquash
 * enabled into the target branches. The benefit is the support for fixup and squash commits.
 * A notable downside though is that Github does not show the PR as `Merged` due to non
 * fast-forward merges
 */
var AutosquashMergeStrategy = /** @class */ (function (_super) {
    tslib.__extends(AutosquashMergeStrategy, _super);
    function AutosquashMergeStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Merges the specified pull request into the target branches and pushes the target
     * branches upstream. This method requires the temporary target branches to be fetched
     * already as we don't want to fetch the target branches per pull request merge. This
     * would causes unnecessary multiple fetch requests when multiple PRs are merged.
     * @throws {GitCommandError} An unknown Git command error occurred that is not
     *   specific to the pull request merge.
     * @returns A pull request failure or null in case of success.
     */
    AutosquashMergeStrategy.prototype.merge = function (pullRequest) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup, githubTargetBranch, baseSha, revisionRange, branchOrRevisionBeforeRebase, rebaseEnv, failedBranches, localBranch, sha;
            return tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prNumber = pullRequest.prNumber, targetBranches = pullRequest.targetBranches, requiredBaseSha = pullRequest.requiredBaseSha, needsCommitMessageFixup = pullRequest.needsCommitMessageFixup, githubTargetBranch = pullRequest.githubTargetBranch;
                        // In case a required base is specified for this pull request, check if the pull
                        // request contains the given commit. If not, return a pull request failure. This
                        // check is useful for enforcing that PRs are rebased on top of a given commit. e.g.
                        // a commit that changes the codeowner ship validation. PRs which are not rebased
                        // could bypass new codeowner ship rules.
                        if (requiredBaseSha && !this.git.hasCommit(TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
                            return [2 /*return*/, PullRequestFailure.unsatisfiedBaseSha()];
                        }
                        baseSha = this.git.run(['rev-parse', this.getPullRequestBaseRevision(pullRequest)]).stdout.trim();
                        revisionRange = baseSha + ".." + TEMP_PR_HEAD_BRANCH;
                        branchOrRevisionBeforeRebase = this.git.getCurrentBranchOrRevision();
                        rebaseEnv = needsCommitMessageFixup ? undefined : tslib.__assign(tslib.__assign({}, process.env), { GIT_SEQUENCE_EDITOR: 'true' });
                        this.git.run(['rebase', '--interactive', '--autosquash', baseSha, TEMP_PR_HEAD_BRANCH], { stdio: 'inherit', env: rebaseEnv });
                        // Update pull requests commits to reference the pull request. This matches what
                        // Github does when pull requests are merged through the Web UI. The motivation is
                        // that it should be easy to determine which pull request contained a given commit.
                        // Note: The filter-branch command relies on the working tree, so we want to make sure
                        // that we are on the initial branch or revision where the merge script has been invoked.
                        this.git.run(['checkout', '-f', branchOrRevisionBeforeRebase]);
                        this.git.run(['filter-branch', '-f', '--msg-filter', MSG_FILTER_SCRIPT + " " + prNumber, revisionRange]);
                        failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches);
                        if (failedBranches.length) {
                            return [2 /*return*/, PullRequestFailure.mergeConflicts(failedBranches)];
                        }
                        this.pushTargetBranchesUpstream(targetBranches);
                        if (!(githubTargetBranch !== 'master')) return [3 /*break*/, 3];
                        localBranch = this.getLocalTargetBranchName(githubTargetBranch);
                        sha = this.git.run(['rev-parse', localBranch]).stdout.trim();
                        // Create a comment saying the PR was closed by the SHA.
                        return [4 /*yield*/, this.git.github.issues.createComment(tslib.__assign(tslib.__assign({}, this.git.remoteParams), { issue_number: pullRequest.prNumber, body: "Closed by commit " + sha }))];
                    case 1:
                        // Create a comment saying the PR was closed by the SHA.
                        _a.sent();
                        // Actually close the PR.
                        return [4 /*yield*/, this.git.github.pulls.update(tslib.__assign(tslib.__assign({}, this.git.remoteParams), { pull_number: pullRequest.prNumber, state: 'closed' }))];
                    case 2:
                        // Actually close the PR.
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, null];
                }
            });
        });
    };
    return AutosquashMergeStrategy;
}(MergeStrategy));

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var defaultPullRequestMergeTaskFlags = {
    branchPrompt: true,
};
/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
var PullRequestMergeTask = /** @class */ (function () {
    function PullRequestMergeTask(config, git, flags) {
        this.config = config;
        this.git = git;
        // Update flags property with the provided flags values as patches to the default flag values.
        this.flags = tslib.__assign(tslib.__assign({}, defaultPullRequestMergeTaskFlags), flags);
    }
    /**
     * Merges the given pull request and pushes it upstream.
     * @param prNumber Pull request that should be merged.
     * @param force Whether non-critical pull request failures should be ignored.
     */
    PullRequestMergeTask.prototype.merge = function (prNumber, force) {
        if (force === void 0) { force = false; }
        return tslib.__awaiter(this, void 0, void 0, function () {
            var hasOauthScopes, pullRequest, _a, _b, strategy, previousBranchOrRevision, failure, e_1;
            var _this = this;
            return tslib.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.git.hasOauthScopes(function (scopes, missing) {
                            if (!scopes.includes('repo')) {
                                if (_this.config.remote.private) {
                                    missing.push('repo');
                                }
                                else if (!scopes.includes('public_repo')) {
                                    missing.push('public_repo');
                                }
                            }
                        })];
                    case 1:
                        hasOauthScopes = _c.sent();
                        if (hasOauthScopes !== true) {
                            return [2 /*return*/, {
                                    status: 5 /* GITHUB_ERROR */,
                                    failure: PullRequestFailure.insufficientPermissionsToMerge(hasOauthScopes.error)
                                }];
                        }
                        if (this.git.hasUncommittedChanges()) {
                            return [2 /*return*/, { status: 1 /* DIRTY_WORKING_DIR */ }];
                        }
                        return [4 /*yield*/, loadAndValidatePullRequest(this, prNumber, force)];
                    case 2:
                        pullRequest = _c.sent();
                        if (!isPullRequest(pullRequest)) {
                            return [2 /*return*/, { status: 3 /* FAILED */, failure: pullRequest }];
                        }
                        _a = this.flags.branchPrompt;
                        if (!_a) return [3 /*break*/, 4];
                        return [4 /*yield*/, promptConfirm(getTargettedBranchesConfirmationPromptMessage(pullRequest))];
                    case 3:
                        _a = !(_c.sent());
                        _c.label = 4;
                    case 4:
                        if (_a) {
                            return [2 /*return*/, { status: 4 /* USER_ABORTED */ }];
                        }
                        _b = pullRequest.hasCaretakerNote;
                        if (!_b) return [3 /*break*/, 6];
                        return [4 /*yield*/, promptConfirm(getCaretakerNotePromptMessage(pullRequest))];
                    case 5:
                        _b = !(_c.sent());
                        _c.label = 6;
                    case 6:
                        // If the pull request has a caretaker note applied, raise awareness by prompting
                        // the caretaker. The caretaker can then decide to proceed or abort the merge.
                        if (_b) {
                            return [2 /*return*/, { status: 4 /* USER_ABORTED */ }];
                        }
                        strategy = this.config.githubApiMerge ?
                            new GithubApiMergeStrategy(this.git, this.config.githubApiMerge) :
                            new AutosquashMergeStrategy(this.git);
                        previousBranchOrRevision = null;
                        _c.label = 7;
                    case 7:
                        _c.trys.push([7, 11, 12, 13]);
                        previousBranchOrRevision = this.git.getCurrentBranchOrRevision();
                        // Run preparations for the merge (e.g. fetching branches).
                        return [4 /*yield*/, strategy.prepare(pullRequest)];
                    case 8:
                        // Run preparations for the merge (e.g. fetching branches).
                        _c.sent();
                        return [4 /*yield*/, strategy.merge(pullRequest)];
                    case 9:
                        failure = _c.sent();
                        if (failure !== null) {
                            return [2 /*return*/, { status: 3 /* FAILED */, failure: failure }];
                        }
                        // Switch back to the previous branch. We need to do this before deleting the temporary
                        // branches because we cannot delete branches which are currently checked out.
                        this.git.run(['checkout', '-f', previousBranchOrRevision]);
                        return [4 /*yield*/, strategy.cleanup(pullRequest)];
                    case 10:
                        _c.sent();
                        // Return a successful merge status.
                        return [2 /*return*/, { status: 2 /* SUCCESS */ }];
                    case 11:
                        e_1 = _c.sent();
                        // Catch all git command errors and return a merge result w/ git error status code.
                        // Other unknown errors which aren't caused by a git command are re-thrown.
                        if (e_1 instanceof GitCommandError) {
                            return [2 /*return*/, { status: 0 /* UNKNOWN_GIT_ERROR */ }];
                        }
                        throw e_1;
                    case 12:
                        // Always try to restore the branch if possible. We don't want to leave
                        // the repository in a different state than before.
                        if (previousBranchOrRevision !== null) {
                            this.git.runGraceful(['checkout', '-f', previousBranchOrRevision]);
                        }
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    return PullRequestMergeTask;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Merges a given pull request based on labels configured in the given merge configuration.
 * Pull requests can be merged with different strategies such as the Github API merge
 * strategy, or the local autosquash strategy. Either strategy has benefits and downsides.
 * More information on these strategies can be found in their dedicated strategy classes.
 *
 * See {@link GithubApiMergeStrategy} and {@link AutosquashMergeStrategy}
 *
 * @param prNumber Number of the pull request that should be merged.
 * @param githubToken Github token used for merging (i.e. fetching and pushing)
 * @param projectRoot Path to the local Git project that is used for merging.
 * @param config Configuration for merging pull requests.
 */
function mergePullRequest(prNumber, githubToken, flags) {
    return tslib.__awaiter(this, void 0, void 0, function () {
        /** Performs the merge and returns whether it was successful or not. */
        function performMerge(ignoreFatalErrors) {
            return tslib.__awaiter(this, void 0, void 0, function () {
                var result, e_1;
                return tslib.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, api.merge(prNumber, ignoreFatalErrors)];
                        case 1:
                            result = _a.sent();
                            return [4 /*yield*/, handleMergeResult(result, ignoreFatalErrors)];
                        case 2: return [2 /*return*/, _a.sent()];
                        case 3:
                            e_1 = _a.sent();
                            // Catch errors to the Github API for invalid requests. We want to
                            // exit the script with a better explanation of the error.
                            if (e_1 instanceof GithubApiRequestError && e_1.status === 401) {
                                error(red('Github API request failed. ' + e_1.message));
                                error(yellow('Please ensure that your provided token is valid.'));
                                error(yellow("You can generate a token here: " + GITHUB_TOKEN_GENERATE_URL));
                                process.exit(1);
                            }
                            throw e_1;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        /**
         * Prompts whether the specified pull request should be forcibly merged. If so, merges
         * the specified pull request forcibly (ignoring non-critical failures).
         * @returns Whether the specified pull request has been forcibly merged.
         */
        function promptAndPerformForceMerge() {
            return tslib.__awaiter(this, void 0, void 0, function () {
                return tslib.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, promptConfirm('Do you want to forcibly proceed with merging?')];
                        case 1:
                            if (_a.sent()) {
                                // Perform the merge in force mode. This means that non-fatal failures
                                // are ignored and the merge continues.
                                return [2 /*return*/, performMerge(true)];
                            }
                            return [2 /*return*/, false];
                    }
                });
            });
        }
        /**
         * Handles the merge result by printing console messages, exiting the process
         * based on the result, or by restarting the merge if force mode has been enabled.
         * @returns Whether the merge completed without errors or not.
         */
        function handleMergeResult(result, disableForceMergePrompt) {
            if (disableForceMergePrompt === void 0) { disableForceMergePrompt = false; }
            return tslib.__awaiter(this, void 0, void 0, function () {
                var failure, status, canForciblyMerge, _a;
                return tslib.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            failure = result.failure, status = result.status;
                            canForciblyMerge = failure && failure.nonFatal;
                            _a = status;
                            switch (_a) {
                                case 2 /* SUCCESS */: return [3 /*break*/, 1];
                                case 1 /* DIRTY_WORKING_DIR */: return [3 /*break*/, 2];
                                case 0 /* UNKNOWN_GIT_ERROR */: return [3 /*break*/, 3];
                                case 5 /* GITHUB_ERROR */: return [3 /*break*/, 4];
                                case 4 /* USER_ABORTED */: return [3 /*break*/, 5];
                                case 3 /* FAILED */: return [3 /*break*/, 6];
                            }
                            return [3 /*break*/, 9];
                        case 1:
                            info(green("Successfully merged the pull request: #" + prNumber));
                            return [2 /*return*/, true];
                        case 2:
                            error(red("Local working repository not clean. Please make sure there are " +
                                "no uncommitted changes."));
                            return [2 /*return*/, false];
                        case 3:
                            error(red('An unknown Git error has been thrown. Please check the output ' +
                                'above for details.'));
                            return [2 /*return*/, false];
                        case 4:
                            error(red('An error related to interacting with Github has been discovered.'));
                            error(failure.message);
                            return [2 /*return*/, false];
                        case 5:
                            info("Merge of pull request has been aborted manually: #" + prNumber);
                            return [2 /*return*/, true];
                        case 6:
                            error(yellow("Could not merge the specified pull request."));
                            error(red(failure.message));
                            if (!(canForciblyMerge && !disableForceMergePrompt)) return [3 /*break*/, 8];
                            info();
                            info(yellow('The pull request above failed due to non-critical errors.'));
                            info(yellow("This error can be forcibly ignored if desired."));
                            return [4 /*yield*/, promptAndPerformForceMerge()];
                        case 7: return [2 /*return*/, _b.sent()];
                        case 8: return [2 /*return*/, false];
                        case 9: throw Error("Unexpected merge result: " + status);
                    }
                });
            });
        }
        var api;
        return tslib.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set the environment variable to skip all git commit hooks triggered by husky. We are unable to
                    // rely on `--no-verify` as some hooks still run, notably the `prepare-commit-msg` hook.
                    process.env['HUSKY'] = '0';
                    return [4 /*yield*/, createPullRequestMergeTask(githubToken, flags)];
                case 1:
                    api = _a.sent();
                    return [4 /*yield*/, performMerge(false)];
                case 2:
                    // Perform the merge. Force mode can be activated through a command line flag.
                    // Alternatively, if the merge fails with non-fatal failures, the script
                    // will prompt whether it should rerun in force mode.
                    if (!(_a.sent())) {
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Creates the pull request merge task from the given Github token, project root
 * and optional explicit configuration. An explicit configuration can be specified
 * when the merge script is used outside of a `ng-dev` configured repository.
 */
function createPullRequestMergeTask(githubToken, flags) {
    return tslib.__awaiter(this, void 0, void 0, function () {
        var projectRoot, devInfraConfig, git, _a, config, errors;
        return tslib.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    projectRoot = getRepoBaseDir();
                    devInfraConfig = getConfig();
                    git = new GitClient(githubToken, devInfraConfig, projectRoot);
                    return [4 /*yield*/, loadAndValidateConfig(devInfraConfig, git.github)];
                case 1:
                    _a = _b.sent(), config = _a.config, errors = _a.errors;
                    if (errors) {
                        error(red('Invalid merge configuration:'));
                        errors.forEach(function (desc) { return error(yellow("  -  " + desc)); });
                        process.exit(1);
                    }
                    // Set the remote so that the merge tool has access to information about
                    // the remote it intends to merge to.
                    config.remote = devInfraConfig.github;
                    // We can cast this to a merge config with remote because we always set the
                    // remote above.
                    return [2 /*return*/, new PullRequestMergeTask(config, git, flags)];
            }
        });
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Builds the command. */
function builder$6(yargs) {
    return addGithubTokenOption(yargs)
        .help()
        .strict()
        .positional('pr', {
        demandOption: true,
        type: 'number',
        description: 'The PR to be merged.',
    })
        .option('branch-prompt', {
        type: 'boolean',
        default: true,
        description: 'Whether to prompt to confirm the branches a PR will merge into.',
    });
}
/** Handles the command. */
function handler$6(_a) {
    var pr = _a.pr, githubToken = _a.githubToken, branchPrompt = _a.branchPrompt;
    return tslib.__awaiter(this, void 0, void 0, function () {
        return tslib.__generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, mergePullRequest(pr, githubToken, { branchPrompt: branchPrompt })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/** yargs command module describing the command. */
var MergeCommandModule = {
    handler: handler$6,
    builder: builder$6,
    command: 'merge <pr>',
    describe: 'Merge a PR into its targeted branches.',
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* GraphQL schema for the response body for each pending PR. */
const PR_SCHEMA$2 = {
    state: typedGraphqlify.types.string,
    maintainerCanModify: typedGraphqlify.types.boolean,
    viewerDidAuthor: typedGraphqlify.types.boolean,
    headRefOid: typedGraphqlify.types.string,
    headRef: {
        name: typedGraphqlify.types.string,
        repository: {
            url: typedGraphqlify.types.string,
            nameWithOwner: typedGraphqlify.types.string,
        },
    },
    baseRef: {
        name: typedGraphqlify.types.string,
        repository: {
            url: typedGraphqlify.types.string,
            nameWithOwner: typedGraphqlify.types.string,
        },
    },
};
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
function rebasePr(prNumber, githubToken, config = getConfig()) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const git = new GitClient(githubToken);
        // TODO: Rely on a common assertNoLocalChanges function.
        if (git.hasLocalChanges()) {
            error('Cannot perform rebase of PR with local changes.');
            process.exit(1);
        }
        /**
         * The branch or revision originally checked out before this method performed
         * any Git operations that may change the working branch.
         */
        const previousBranchOrRevision = git.getCurrentBranchOrRevision();
        /* Get the PR information from Github. */
        const pr = yield getPr(PR_SCHEMA$2, prNumber, git);
        const headRefName = pr.headRef.name;
        const baseRefName = pr.baseRef.name;
        const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
        const fullBaseRef = `${pr.baseRef.repository.nameWithOwner}:${baseRefName}`;
        const headRefUrl = addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
        const baseRefUrl = addTokenToGitHttpsUrl(pr.baseRef.repository.url, githubToken);
        // Note: Since we use a detached head for rebasing the PR and therefore do not have
        // remote-tracking branches configured, we need to set our expected ref and SHA. This
        // allows us to use `--force-with-lease` for the detached head while ensuring that we
        // never accidentally override upstream changes that have been pushed in the meanwhile.
        // See:
        // https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt
        const forceWithLeaseFlag = `--force-with-lease=${headRefName}:${pr.headRefOid}`;
        // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
        // be pushed up.
        if (!pr.maintainerCanModify && !pr.viewerDidAuthor) {
            error(`Cannot rebase as you did not author the PR and the PR does not allow maintainers` +
                `to modify the PR`);
            process.exit(1);
        }
        try {
            // Fetch the branch at the commit of the PR, and check it out in a detached state.
            info(`Checking out PR #${prNumber} from ${fullHeadRef}`);
            git.run(['fetch', '-q', headRefUrl, headRefName]);
            git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
            // Fetch the PRs target branch and rebase onto it.
            info(`Fetching ${fullBaseRef} to rebase #${prNumber} on`);
            git.run(['fetch', '-q', baseRefUrl, baseRefName]);
            const commonAncestorSha = git.run(['merge-base', 'HEAD', 'FETCH_HEAD']).stdout.trim();
            const commits = yield getCommitsInRange(commonAncestorSha, 'HEAD');
            let squashFixups = commits.filter((commit) => commit.isFixup).length === 0 ?
                false :
                yield promptConfirm(`PR #${prNumber} contains fixup commits, would you like to squash them during rebase?`, true);
            info(`Attempting to rebase PR #${prNumber} on ${fullBaseRef}`);
            /**
             * Tuple of flags to be added to the rebase command and env object to run the git command.
             *
             * Additional flags to perform the autosquashing are added when the user confirm squashing of
             * fixup commits should occur.
             */
            const [flags, env] = squashFixups ?
                [['--interactive', '--autosquash'], Object.assign(Object.assign({}, process.env), { GIT_SEQUENCE_EDITOR: 'true' })] :
                [[], undefined];
            const rebaseResult = git.runGraceful(['rebase', ...flags, 'FETCH_HEAD'], { env: env });
            // If the rebase was clean, push the rebased PR up to the authors fork.
            if (rebaseResult.status === 0) {
                info(`Rebase was able to complete automatically without conflicts`);
                info(`Pushing rebased PR #${prNumber} to ${fullHeadRef}`);
                git.run(['push', headRefUrl, `HEAD:${headRefName}`, forceWithLeaseFlag]);
                info(`Rebased and updated PR #${prNumber}`);
                git.checkout(previousBranchOrRevision, true);
                process.exit(0);
            }
        }
        catch (err) {
            error(err.message);
            git.checkout(previousBranchOrRevision, true);
            process.exit(1);
        }
        // On automatic rebase failures, prompt to choose if the rebase should be continued
        // manually or aborted now.
        info(`Rebase was unable to complete automatically without conflicts.`);
        // If the command is run in a non-CI environment, prompt to format the files immediately.
        const continueRebase = process.env['CI'] === undefined && (yield promptConfirm('Manually complete rebase?'));
        if (continueRebase) {
            info(`After manually completing rebase, run the following command to update PR #${prNumber}:`);
            info(` $ git push ${pr.headRef.repository.url} HEAD:${headRefName} ${forceWithLeaseFlag}`);
            info();
            info(`To abort the rebase and return to the state of the repository before this command`);
            info(`run the following command:`);
            info(` $ git rebase --abort && git reset --hard && git checkout ${previousBranchOrRevision}`);
            process.exit(1);
        }
        else {
            info(`Cleaning up git state, and restoring previous state.`);
        }
        git.checkout(previousBranchOrRevision, true);
        process.exit(1);
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Builds the rebase pull request command. */
function buildRebaseCommand(yargs) {
    return addGithubTokenOption(yargs).positional('prNumber', { type: 'number', demandOption: true });
}
/** Handles the rebase pull request command. */
function handleRebaseCommand({ prNumber, githubToken }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        yield rebasePr(prNumber, githubToken);
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Build the parser for pull request commands. */
function buildPrParser(localYargs) {
    return localYargs.help()
        .strict()
        .demandCommand()
        .command('discover-new-conflicts <pr-number>', 'Check if a pending PR causes new conflicts for other pending PRs', buildDiscoverNewConflictsCommand, handleDiscoverNewConflictsCommand)
        .command('rebase <pr-number>', 'Rebase a pending PR and push the rebased commits back to Github', buildRebaseCommand, handleRebaseCommand)
        .command(MergeCommandModule)
        .command(CheckoutCommandModule)
        .command(CheckTargetBranchesModule);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Create logs for each pullapprove group result. */
function logGroup(group, conditionsToPrint, printMessageFn = info) {
    const conditions = group[conditionsToPrint];
    printMessageFn.group(`[${group.groupName}]`);
    if (conditions.length) {
        conditions.forEach(groupCondition => {
            const count = groupCondition.matchedFiles.size;
            if (conditionsToPrint === 'unverifiableConditions') {
                printMessageFn(`${groupCondition.expression}`);
            }
            else {
                printMessageFn(`${count} ${count === 1 ? 'match' : 'matches'} - ${groupCondition.expression}`);
            }
        });
        printMessageFn.groupEnd();
    }
}
/** Logs a header within a text drawn box. */
function logHeader(...params) {
    const totalWidth = 80;
    const fillWidth = totalWidth - 2;
    const headerText = params.join(' ').substr(0, fillWidth);
    const leftSpace = Math.ceil((fillWidth - headerText.length) / 2);
    const rightSpace = fillWidth - leftSpace - headerText.length;
    const fill = (count, content) => content.repeat(count);
    info(`┌${fill(fillWidth, '─')}┐`);
    info(`│${fill(leftSpace, ' ')}${headerText}${fill(rightSpace, ' ')}│`);
    info(`└${fill(fillWidth, '─')}┘`);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Map that holds patterns and their corresponding Minimatch globs. */
const patternCache = new Map();
/**
 * Gets a glob for the given pattern. The cached glob will be returned
 * if available. Otherwise a new glob will be created and cached.
 */
function getOrCreateGlob(pattern) {
    if (patternCache.has(pattern)) {
        return patternCache.get(pattern);
    }
    const glob = new minimatch.Minimatch(pattern, { dot: true });
    patternCache.set(pattern, glob);
    return glob;
}

class PullApproveGroupStateDependencyError extends Error {
    constructor(message) {
        super(message);
        // Set the prototype explicitly because in ES5, the prototype is accidentally
        // lost due to a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, PullApproveGroupStateDependencyError.prototype);
        // Error names are displayed in their stack but can't be set in the constructor.
        this.name = PullApproveGroupStateDependencyError.name;
    }
}
/**
 * Superset of a native array. The superset provides methods which mimic the
 * list data structure used in PullApprove for files in conditions.
 */
class PullApproveStringArray extends Array {
    constructor(...elements) {
        super(...elements);
        // Set the prototype explicitly because in ES5, the prototype is accidentally
        // lost due to a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, PullApproveStringArray.prototype);
    }
    /** Returns a new array which only includes files that match the given pattern. */
    include(pattern) {
        return new PullApproveStringArray(...this.filter(s => getOrCreateGlob(pattern).match(s)));
    }
    /** Returns a new array which only includes files that did not match the given pattern. */
    exclude(pattern) {
        return new PullApproveStringArray(...this.filter(s => !getOrCreateGlob(pattern).match(s)));
    }
}
/**
 * Superset of a native array. The superset provides methods which mimic the
 * list data structure used in PullApprove for groups in conditions.
 */
class PullApproveGroupArray extends Array {
    constructor(...elements) {
        super(...elements);
        // Set the prototype explicitly because in ES5, the prototype is accidentally
        // lost due to a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, PullApproveGroupArray.prototype);
    }
    include(pattern) {
        return new PullApproveGroupArray(...this.filter(s => s.groupName.match(pattern)));
    }
    /** Returns a new array which only includes files that did not match the given pattern. */
    exclude(pattern) {
        return new PullApproveGroupArray(...this.filter(s => s.groupName.match(pattern)));
    }
    get pending() {
        throw new PullApproveGroupStateDependencyError();
    }
    get active() {
        throw new PullApproveGroupStateDependencyError();
    }
    get inactive() {
        throw new PullApproveGroupStateDependencyError();
    }
    get rejected() {
        throw new PullApproveGroupStateDependencyError();
    }
    get names() {
        return this.map(g => g.groupName);
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
 * Context that is provided to conditions. Conditions can use various helpers
 * that PullApprove provides. We try to mock them here. Consult the official
 * docs for more details: https://docs.pullapprove.com/config/conditions.
 */
const conditionContext = {
    'len': (value) => value.length,
    'contains_any_globs': (files, patterns) => {
        // Note: Do not always create globs for the same pattern again. This method
        // could be called for each source file. Creating glob's is expensive.
        return files.some(f => patterns.some(pattern => getOrCreateGlob(pattern).match(f)));
    },
};
/**
 * Converts a given condition to a function that accepts a set of files. The returned
 * function can be called to check if the set of files matches the condition.
 */
function convertConditionToFunction(expr) {
    // Creates a dynamic function with the specified expression.
    // The first parameter will be `files` as that corresponds to the supported `files` variable that
    // can be accessed in PullApprove condition expressions. The second parameter is the list of
    // PullApproveGroups that are accessible in the condition expressions. The followed parameters
    // correspond to other context variables provided by PullApprove for conditions.
    const evaluateFn = new Function('files', 'groups', ...Object.keys(conditionContext), `
    return (${transformExpressionToJs(expr)});
  `);
    // Create a function that calls the dynamically constructed function which mimics
    // the condition expression that is usually evaluated with Python in PullApprove.
    return (files, groups) => {
        const result = evaluateFn(new PullApproveStringArray(...files), new PullApproveGroupArray(...groups), ...Object.values(conditionContext));
        // If an array is returned, we consider the condition as active if the array is not
        // empty. This matches PullApprove's condition evaluation that is based on Python.
        if (Array.isArray(result)) {
            return result.length !== 0;
        }
        return !!result;
    };
}
/**
 * Transforms a condition expression from PullApprove that is based on python
 * so that it can be run inside JavaScript. Current transformations:
 *   1. `not <..>` -> `!<..>`
 */
function transformExpressionToJs(expression) {
    return expression.replace(/not\s+/g, '!');
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Regular expression that matches conditions for the global approval.
const GLOBAL_APPROVAL_CONDITION_REGEX = /^"global-(docs-)?approvers" not in groups.approved$/;
// Name of the PullApprove group that serves as fallback. This group should never capture
// any conditions as it would always match specified files. This is not desired as we want
// to figure out as part of this tool, whether there actually are unmatched files.
const FALLBACK_GROUP_NAME = 'fallback';
/** A PullApprove group to be able to test files against. */
class PullApproveGroup {
    constructor(groupName, config, precedingGroups = []) {
        this.groupName = groupName;
        this.precedingGroups = precedingGroups;
        /** List of conditions for the group. */
        this.conditions = [];
        this._captureConditions(config);
    }
    _captureConditions(config) {
        if (config.conditions && this.groupName !== FALLBACK_GROUP_NAME) {
            return config.conditions.forEach(condition => {
                const expression = condition.trim();
                if (expression.match(GLOBAL_APPROVAL_CONDITION_REGEX)) {
                    // Currently a noop as we don't take any action for global approval conditions.
                    return;
                }
                try {
                    this.conditions.push({
                        expression,
                        checkFn: convertConditionToFunction(expression),
                        matchedFiles: new Set(),
                        unverifiable: false,
                    });
                }
                catch (e) {
                    error(`Could not parse condition in group: ${this.groupName}`);
                    error(` - ${expression}`);
                    error(`Error:`);
                    error(e.message);
                    error(e.stack);
                    process.exit(1);
                }
            });
        }
    }
    /**
     * Tests a provided file path to determine if it would be considered matched by
     * the pull approve group's conditions.
     */
    testFile(filePath) {
        return this.conditions.every((condition) => {
            const { matchedFiles, checkFn, expression } = condition;
            try {
                const matchesFile = checkFn([filePath], this.precedingGroups);
                if (matchesFile) {
                    matchedFiles.add(filePath);
                }
                return matchesFile;
            }
            catch (e) {
                // In the case of a condition that depends on the state of groups we want to
                // ignore that the verification can't accurately evaluate the condition and then
                // continue processing. Other types of errors fail the verification, as conditions
                // should otherwise be able to execute without throwing.
                if (e instanceof PullApproveGroupStateDependencyError) {
                    condition.unverifiable = true;
                    // Return true so that `this.conditions.every` can continue evaluating.
                    return true;
                }
                else {
                    const errMessage = `Condition could not be evaluated: \n\n` +
                        `From the [${this.groupName}] group:\n` +
                        ` - ${expression}` +
                        `\n\n${e.message} ${e.stack}\n\n`;
                    error(errMessage);
                    process.exit(1);
                }
            }
        });
    }
    /** Retrieve the results for the Group, all matched and unmatched conditions. */
    getResults() {
        const matchedConditions = this.conditions.filter(c => c.matchedFiles.size > 0);
        const unmatchedConditions = this.conditions.filter(c => c.matchedFiles.size === 0 && !c.unverifiable);
        const unverifiableConditions = this.conditions.filter(c => c.unverifiable);
        return {
            matchedConditions,
            matchedCount: matchedConditions.length,
            unmatchedConditions,
            unmatchedCount: unmatchedConditions.length,
            unverifiableConditions,
            groupName: this.groupName,
        };
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function parsePullApproveYaml(rawYaml) {
    return yaml.parse(rawYaml, { merge: true });
}
/** Parses all of the groups defined in the pullapprove yaml. */
function getGroupsFromYaml(pullApproveYamlRaw) {
    /** JSON representation of the pullapprove yaml file. */
    const pullApprove = parsePullApproveYaml(pullApproveYamlRaw);
    return Object.entries(pullApprove.groups).reduce((groups, [groupName, group]) => {
        return groups.concat(new PullApproveGroup(groupName, group, groups));
    }, []);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function verify$1() {
    /** Full path to PullApprove config file */
    const PULL_APPROVE_YAML_PATH = path.resolve(getRepoBaseDir(), '.pullapprove.yml');
    /** All tracked files in the repository. */
    const REPO_FILES = allFiles();
    /** The pull approve config file. */
    const pullApproveYamlRaw = fs.readFileSync(PULL_APPROVE_YAML_PATH, 'utf8');
    /** All of the groups defined in the pullapprove yaml. */
    const groups = getGroupsFromYaml(pullApproveYamlRaw);
    /**
     * PullApprove groups without conditions. These are skipped in the verification
     * as those would always be active and cause zero unmatched files.
     */
    const groupsSkipped = groups.filter(group => !group.conditions.length);
    /** PullApprove groups with conditions. */
    const groupsWithConditions = groups.filter(group => !!group.conditions.length);
    /** Files which are matched by at least one group. */
    const matchedFiles = [];
    /** Files which are not matched by at least one group. */
    const unmatchedFiles = [];
    // Test each file in the repo against each group for being matched.
    REPO_FILES.forEach((file) => {
        if (groupsWithConditions.filter(group => group.testFile(file)).length) {
            matchedFiles.push(file);
        }
        else {
            unmatchedFiles.push(file);
        }
    });
    /** Results for each group */
    const resultsByGroup = groupsWithConditions.map(group => group.getResults());
    /**
     * Whether all group condition lines match at least one file and all files
     * are matched by at least one group.
     */
    const verificationSucceeded = resultsByGroup.every(r => !r.unmatchedCount) && !unmatchedFiles.length;
    /**
     * Overall result
     */
    logHeader('Overall Result');
    if (verificationSucceeded) {
        info('PullApprove verification succeeded!');
    }
    else {
        info(`PullApprove verification failed.`);
        info();
        info(`Please update '.pullapprove.yml' to ensure that all necessary`);
        info(`files/directories have owners and all patterns that appear in`);
        info(`the file correspond to actual files/directories in the repo.`);
    }
    /**
     * File by file Summary
     */
    logHeader('PullApprove results by file');
    info.group(`Matched Files (${matchedFiles.length} files)`);
    matchedFiles.forEach(file => debug(file));
    info.groupEnd();
    info.group(`Unmatched Files (${unmatchedFiles.length} files)`);
    unmatchedFiles.forEach(file => info(file));
    info.groupEnd();
    /**
     * Group by group Summary
     */
    logHeader('PullApprove results by group');
    info.group(`Groups skipped (${groupsSkipped.length} groups)`);
    groupsSkipped.forEach(group => debug(`${group.groupName}`));
    info.groupEnd();
    const matchedGroups = resultsByGroup.filter(group => !group.unmatchedCount);
    info.group(`Matched conditions by Group (${matchedGroups.length} groups)`);
    matchedGroups.forEach(group => logGroup(group, 'matchedConditions', debug));
    info.groupEnd();
    const unmatchedGroups = resultsByGroup.filter(group => group.unmatchedCount);
    info.group(`Unmatched conditions by Group (${unmatchedGroups.length} groups)`);
    unmatchedGroups.forEach(group => logGroup(group, 'unmatchedConditions'));
    info.groupEnd();
    const unverifiableConditionsInGroups = resultsByGroup.filter(group => group.unverifiableConditions.length > 0);
    info.group(`Unverifiable conditions by Group (${unverifiableConditionsInGroups.length} groups)`);
    unverifiableConditionsInGroups.forEach(group => logGroup(group, 'unverifiableConditions'));
    info.groupEnd();
    // Provide correct exit code based on verification success.
    process.exit(verificationSucceeded ? 0 : 1);
}

/** Build the parser for the pullapprove commands. */
function buildPullapproveParser(localYargs) {
    return localYargs.help().strict().demandCommand().command('verify', 'Verify the pullapprove config', {}, () => verify$1());
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
    if (((_c = config.release) === null || _c === void 0 ? void 0 : _c.generateReleaseNotesForHead) === undefined) {
        errors.push(`No "generateReleaseNotesForHead" function configured for releasing.`);
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
/**
 * Builds the release output without polluting the process stdout. Build scripts commonly
 * print messages to stderr or stdout. This is fine in most cases, but sometimes other tooling
 * reserves stdout for data transfer (e.g. when `ng release build --json` is invoked). To not
 * pollute the stdout in such cases, we launch a child process for building the release packages
 * and redirect all stdout output to the stderr channel (which can be read in the terminal).
 */
function buildReleaseOutput() {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const buildProcess = child_process.fork(require.resolve('./build-worker'), [], {
                // The stdio option is set to redirect any "stdout" output directly to the "stderr" file
                // descriptor. An additional "ipc" file descriptor is created to support communication with
                // the build process. https://nodejs.org/api/child_process.html#child_process_options_stdio.
                stdio: ['inherit', 2, 2, 'ipc'],
            });
            let builtPackages = null;
            // The child process will pass the `buildPackages()` output through the
            // IPC channel. We keep track of it so that we can use it as resolve value.
            buildProcess.on('message', buildResponse => builtPackages = buildResponse);
            // On child process exit, resolve the promise with the received output.
            buildProcess.on('exit', () => resolve(builtPackages));
        });
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Yargs command builder for configuring the `ng-dev release build` command. */
function builder$7(argv) {
    return argv.option('json', {
        type: 'boolean',
        description: 'Whether the built packages should be printed to stdout as JSON.',
        default: false,
    });
}
/** Yargs command handler for building a release. */
function handler$7(args) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const { npmPackages } = getReleaseConfig();
        let builtPackages = yield buildReleaseOutput();
        // If package building failed, print an error and exit with an error code.
        if (builtPackages === null) {
            error(red(`  ✘   Could not build release output. Please check output above.`));
            process.exit(1);
        }
        // If no packages have been built, we assume that this is never correct
        // and exit with an error code.
        if (builtPackages.length === 0) {
            error(red(`  ✘   No release packages have been built. Please ensure that the`));
            error(red(`      build script is configured correctly in ".ng-dev".`));
            process.exit(1);
        }
        const missingPackages = npmPackages.filter(pkgName => !builtPackages.find(b => b.name === pkgName));
        // Check for configured release packages which have not been built. We want to
        // error and exit if any configured package has not been built.
        if (missingPackages.length > 0) {
            error(red(`  ✘   Release output missing for the following packages:`));
            missingPackages.forEach(pkgName => error(red(`      - ${pkgName}`)));
            process.exit(1);
        }
        if (args.json) {
            process.stdout.write(JSON.stringify(builtPackages, null, 2));
        }
        else {
            info(green('  ✓   Built release packages.'));
            builtPackages.forEach(({ name }) => info(green(`      - ${name}`)));
        }
    });
}
/** CLI command module for building release output. */
const ReleaseBuildCommandModule = {
    builder: builder$7,
    handler: handler$7,
    command: 'build',
    describe: 'Builds the release output for the current branch.',
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Spawns a given command with the specified arguments inside a shell. All process stdout
 * output is captured and returned as resolution on completion. Depending on the chosen
 * output mode, stdout/stderr output is also printed to the console, or only on error.
 *
 * @returns a Promise resolving with captured stdout on success. The promise
 *   rejects on command failure.
 */
function spawnWithDebugOutput(command, args, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve, reject) {
        var commandText = command + " " + args.join(' ');
        var outputMode = options.mode;
        debug("Executing command: " + commandText);
        var childProcess = child_process.spawn(command, args, tslib.__assign(tslib.__assign({}, options), { shell: true, stdio: ['inherit', 'pipe', 'pipe'] }));
        var logOutput = '';
        var stdout = '';
        // Capture the stdout separately so that it can be passed as resolve value.
        // This is useful if commands return parsable stdout.
        childProcess.stderr.on('data', function (message) {
            logOutput += message;
            // If console output is enabled, print the message directly to the stderr. Note that
            // we intentionally print all output to stderr as stdout should not be polluted.
            if (outputMode === undefined || outputMode === 'enabled') {
                process.stderr.write(message);
            }
        });
        childProcess.stdout.on('data', function (message) {
            stdout += message;
            logOutput += message;
            // If console output is enabled, print the message directly to the stderr. Note that
            // we intentionally print all output to stderr as stdout should not be polluted.
            if (outputMode === undefined || outputMode === 'enabled') {
                process.stderr.write(message);
            }
        });
        childProcess.on('exit', function (status, signal) {
            var exitDescription = status !== null ? "exit code \"" + status + "\"" : "signal \"" + signal + "\"";
            var printFn = outputMode === 'on-error' ? error : debug;
            printFn("Command \"" + commandText + "\" completed with " + exitDescription + ".");
            printFn("Process output: \n" + logOutput);
            // On success, resolve the promise. Otherwise reject with the captured stderr
            // and stdout log output if the output mode was set to `silent`.
            if (status === 0) {
                resolve({ stdout: stdout });
            }
            else {
                reject(outputMode === 'silent' ? logOutput : undefined);
            }
        });
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Runs NPM publish within a specified package directory.
 * @throws With the process log output if the publish failed.
 */
function runNpmPublish(packagePath, distTag, registryUrl) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const args = ['publish', '--access', 'public', '--tag', distTag];
        // If a custom registry URL has been specified, add the `--registry` flag.
        if (registryUrl !== undefined) {
            args.push('--registry', registryUrl);
        }
        yield spawnWithDebugOutput('npm', args, { cwd: packagePath, mode: 'silent' });
    });
}
/**
 * Sets the NPM tag to the specified version for the given package.
 * @throws With the process log output if the tagging failed.
 */
function setNpmTagForPackage(packageName, distTag, version, registryUrl) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const args = ['dist-tag', 'add', `${packageName}@${version}`, distTag];
        // If a custom registry URL has been specified, add the `--registry` flag.
        if (registryUrl !== undefined) {
            args.push('--registry', registryUrl);
        }
        yield spawnWithDebugOutput('npm', args, { mode: 'silent' });
    });
}
/**
 * Checks whether the user is currently logged into NPM.
 * @returns Whether the user is currently logged into NPM.
 */
function npmIsLoggedIn(registryUrl) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const args = ['whoami'];
        // If a custom registry URL has been specified, add the `--registry` flag.
        if (registryUrl !== undefined) {
            args.push('--registry', registryUrl);
        }
        try {
            yield spawnWithDebugOutput('npm', args, { mode: 'silent' });
        }
        catch (e) {
            return false;
        }
        return true;
    });
}
/**
 * Log into NPM at a provided registry.
 * @throws With the process log output if the login fails.
 */
function npmLogin(registryUrl) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const args = ['login', '--no-browser'];
        // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
        // must be spliced into the correct place in the command as npm expects it to be the flag
        // immediately following the login subcommand.
        if (registryUrl !== undefined) {
            args.splice(1, 0, '--registry', registryUrl);
        }
        yield spawnWithDebugOutput('npm', args);
    });
}
/**
 * Log out of NPM at a provided registry.
 * @returns Whether the user was logged out of NPM.
 */
function npmLogout(registryUrl) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const args = ['logout'];
        // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
        // must be spliced into the correct place in the command as npm expects it to be the flag
        // immediately following the logout subcommand.
        if (registryUrl !== undefined) {
            args.splice(1, 0, '--registry', registryUrl);
        }
        try {
            yield spawnWithDebugOutput('npm', args, { mode: 'silent' });
        }
        finally {
            return npmIsLoggedIn(registryUrl);
        }
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Prints the active release trains to the console.
 * @params active Active release trains that should be printed.
 * @params config Release configuration used for querying NPM on published versions.
 */
function printActiveReleaseTrains(active, config) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const { releaseCandidate, next, latest } = active;
        const isNextPublishedToNpm = yield isVersionPublishedToNpm(next.version, config);
        const nextTrainType = next.isMajor ? 'major' : 'minor';
        const ltsBranches = yield fetchLongTermSupportBranchesFromNpm(config);
        info();
        info(blue('Current version branches in the project:'));
        // Print information for release trains in the feature-freeze/release-candidate phase.
        if (releaseCandidate !== null) {
            const rcVersion = releaseCandidate.version;
            const rcTrainType = releaseCandidate.isMajor ? 'major' : 'minor';
            const rcTrainPhase = rcVersion.prerelease[0] === 'next' ? 'feature-freeze' : 'release-candidate';
            info(` • ${bold(releaseCandidate.branchName)} contains changes for an upcoming ` +
                `${rcTrainType} that is currently in ${bold(rcTrainPhase)} phase.`);
            info(`   Most recent pre-release for this branch is "${bold(`v${rcVersion}`)}".`);
        }
        // Print information about the release-train in the latest phase. i.e. the patch branch.
        info(` • ${bold(latest.branchName)} contains changes for the most recent patch.`);
        info(`   Most recent patch version for this branch is "${bold(`v${latest.version}`)}".`);
        // Print information about the release-train in the next phase.
        info(` • ${bold(next.branchName)} contains changes for a ${nextTrainType} ` +
            `currently in active development.`);
        // Note that there is a special case for versions in the next release-train. The version in
        // the next branch is not always published to NPM. This can happen when we recently branched
        // off for a feature-freeze release-train. More details are in the next pre-release action.
        if (isNextPublishedToNpm) {
            info(`   Most recent pre-release version for this branch is "${bold(`v${next.version}`)}".`);
        }
        else {
            info(`   Version is currently set to "${bold(`v${next.version}`)}", but has not been ` +
                `published yet.`);
        }
        // If no release-train in release-candidate or feature-freeze phase is active,
        // we print a message as last bullet point to make this clear.
        if (releaseCandidate === null) {
            info(' • No release-candidate or feature-freeze branch currently active.');
        }
        info();
        info(blue('Current active LTS version branches:'));
        // Print all active LTS branches (each branch as own bullet point).
        if (ltsBranches.active.length !== 0) {
            for (const ltsBranch of ltsBranches.active) {
                info(` • ${bold(ltsBranch.name)} is currently in active long-term support phase.`);
                info(`   Most recent patch version for this branch is "${bold(`v${ltsBranch.version}`)}".`);
            }
        }
        info();
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Error that will be thrown if the user manually aborted a release action. */
class UserAbortedReleaseActionError extends Error {
    constructor() {
        super();
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, UserAbortedReleaseActionError.prototype);
    }
}
/** Error that will be thrown if the action has been aborted due to a fatal error. */
class FatalReleaseActionError extends Error {
    constructor() {
        super();
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, FatalReleaseActionError.prototype);
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
 * Increments a specified SemVer version. Compared to the original increment in SemVer,
 * the version is cloned to not modify the original version instance.
 */
function semverInc(version, release, identifier) {
    const clone = new semver.SemVer(version.version);
    return clone.inc(release, identifier);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Gets the commit message for a new release point in the project. */
function getCommitMessageForRelease(newVersion) {
    return `release: cut the v${newVersion} release`;
}
/**
 * Gets the commit message for an exceptional version bump in the next branch. The next
 * branch version will be bumped without the release being published in some situations.
 * More details can be found in the `MoveNextIntoFeatureFreeze` release action and in:
 * https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A.
 */
function getCommitMessageForExceptionalNextVersionBump(newVersion) {
    return `release: bump the next branch to v${newVersion}`;
}
/** Gets the commit message for a release notes cherry-pick commit */
function getReleaseNoteCherryPickCommitMessage(newVersion) {
    return `docs: release notes for the v${newVersion} release`;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Project-relative path for the changelog file. */
const changelogPath = 'CHANGELOG.md';
/** Project-relative path for the "package.json" file. */
const packageJsonPath = 'package.json';
/** Default interval in milliseconds to check whether a pull request has been merged. */
const waitForPullRequestInterval = 10000;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/*
 * ###############################################################
 *
 * This file contains helpers for invoking external `ng-dev` commands. A subset of actions,
 * like building release output or setting aν NPM dist tag for release packages, cannot be
 * performed directly as part of the release tool and need to be delegated to external `ng-dev`
 * commands that exist across arbitrary version branches.
 *
 * In a concrete example: Consider a new patch version is released and that a new release
 * package has been added to the `next` branch. The patch branch will not contain the new
 * release package, so we could not build the release output for it. To work around this, we
 * call the ng-dev build command for the patch version branch and expect it to return a list
 * of built packages that need to be released as part of this release train.
 *
 * ###############################################################
 */
/**
 * Invokes the `ng-dev release set-dist-tag` command in order to set the specified
 * NPM dist tag for all packages in the checked out branch to the given version.
 */
function invokeSetNpmDistCommand(npmDistTag, version) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        try {
            // Note: No progress indicator needed as that is the responsibility of the command.
            yield spawnWithDebugOutput('yarn', ['--silent', 'ng-dev', 'release', 'set-dist-tag', npmDistTag, version.format()]);
            info(green(`  ✓   Set "${npmDistTag}" NPM dist tag for all packages to v${version}.`));
        }
        catch (e) {
            error(e);
            error(red(`  ✘   An error occurred while setting the NPM dist tag for "${npmDistTag}".`));
            throw new FatalReleaseActionError();
        }
    });
}
/**
 * Invokes the `ng-dev release build` command in order to build the release
 * packages for the currently checked out branch.
 */
function invokeReleaseBuildCommand() {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const spinner = ora.call(undefined).start('Building release output.');
        try {
            // Since we expect JSON to be printed from the `ng-dev release build` command,
            // we spawn the process in silent mode. We have set up an Ora progress spinner.
            const { stdout } = yield spawnWithDebugOutput('yarn', ['--silent', 'ng-dev', 'release', 'build', '--json'], { mode: 'silent' });
            spinner.stop();
            info(green('  ✓   Built release output for all packages.'));
            // The `ng-dev release build` command prints a JSON array to stdout
            // that represents the built release packages and their output paths.
            return JSON.parse(stdout.trim());
        }
        catch (e) {
            spinner.stop();
            error(e);
            error(red('  ✘   An error occurred while building the release packages.'));
            throw new FatalReleaseActionError();
        }
    });
}
/**
 * Invokes the `yarn install` command in order to install dependencies for
 * the configured project with the currently checked out revision.
 */
function invokeYarnInstallCommand(projectDir) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        try {
            // Note: No progress indicator needed as that is the responsibility of the command.
            // TODO: Consider using an Ora spinner instead to ensure minimal console output.
            yield spawnWithDebugOutput('yarn', ['install', '--frozen-lockfile', '--non-interactive'], { cwd: projectDir });
            info(green('  ✓   Installed project dependencies.'));
        }
        catch (e) {
            error(e);
            error(red('  ✘   An error occurred while installing dependencies.'));
            throw new FatalReleaseActionError();
        }
    });
}
/**
 * Invokes the `yarn bazel clean` command in order to clean the output tree and ensure new artifacts
 * are created for builds.
 */
function invokeBazelCleanCommand(projectDir) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        try {
            // Note: No progress indicator needed as that is the responsibility of the command.
            // TODO: Consider using an Ora spinner instead to ensure minimal console output.
            yield spawnWithDebugOutput('yarn', ['bazel', 'clean'], { cwd: projectDir });
            info(green('  ✓   Cleaned bazel output tree.'));
        }
        catch (e) {
            error(e);
            error(red('  ✘   An error occurred while cleaning the bazel output tree.'));
            throw new FatalReleaseActionError();
        }
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Graphql Github API query that can be used to find forks of a given repository
 * that are owned by the current viewer authenticated with the Github API.
 */
const findOwnedForksOfRepoQuery = typedGraphqlify.params({
    $owner: 'String!',
    $name: 'String!',
}, {
    repository: typedGraphqlify.params({ owner: '$owner', name: '$name' }, {
        forks: typedGraphqlify.params({ affiliations: 'OWNER', first: 1 }, {
            nodes: [{
                    owner: {
                        login: typedGraphqlify.types.string,
                    },
                    name: typedGraphqlify.types.string,
                }],
        }),
    }),
});

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Thirty seconds in milliseconds. */
const THIRTY_SECONDS_IN_MS = 30000;
/** Gets whether a given pull request has been merged. */
function getPullRequestState(api, id) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const { data } = yield api.github.pulls.get(Object.assign(Object.assign({}, api.remoteParams), { pull_number: id }));
        if (data.merged) {
            return 'merged';
        }
        // Check if the PR was closed more than 30 seconds ago, this extra time gives Github time to
        // update the closed pull request to be associated with the closing commit.
        // Note: a Date constructed with `null` creates an object at 0 time, which will never be greater
        // than the current date time.
        if (data.closed_at !== null &&
            (new Date(data.closed_at).getTime() < Date.now() - THIRTY_SECONDS_IN_MS)) {
            return (yield isPullRequestClosedWithAssociatedCommit(api, id)) ? 'merged' : 'closed';
        }
        return 'open';
    });
}
/**
 * Whether the pull request has been closed with an associated commit. This is usually
 * the case if a PR has been merged using the autosquash merge script strategy. Since
 * the merge is not fast-forward, Github does not consider the PR as merged and instead
 * shows the PR as closed. See for example: https://github.com/angular/angular/pull/37918.
 */
function isPullRequestClosedWithAssociatedCommit(api, id) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const request = api.github.issues.listEvents.endpoint.merge(Object.assign(Object.assign({}, api.remoteParams), { issue_number: id }));
        const events = yield api.github.paginate(request);
        // Iterate through the events of the pull request in reverse. We want to find the most
        // recent events and check if the PR has been closed with a commit associated with it.
        // If the PR has been closed through a commit, we assume that the PR has been merged
        // using the autosquash merge strategy. For more details. See the `AutosquashMergeStrategy`.
        for (let i = events.length - 1; i >= 0; i--) {
            const { event, commit_id } = events[i];
            // If we come across a "reopened" event, we abort looking for referenced commits. Any
            // commits that closed the PR before, are no longer relevant and did not close the PR.
            if (event === 'reopened') {
                return false;
            }
            // If a `closed` event is captured with a commit assigned, then we assume that
            // this PR has been merged properly.
            if (event === 'closed' && commit_id) {
                return true;
            }
            // If the PR has been referenced by a commit, check if the commit closes this pull
            // request. Note that this is needed besides checking `closed` as PRs could be merged
            // into any non-default branch where the `Closes <..>` keyword does not work and the PR
            // is simply closed without an associated `commit_id`. For more details see:
            // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords#:~:text=non-default.
            if (event === 'referenced' && commit_id &&
                (yield isCommitClosingPullRequest(api, commit_id, id))) {
                return true;
            }
        }
        return false;
    });
}
/** Checks whether the specified commit is closing the given pull request. */
function isCommitClosingPullRequest(api, sha, id) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const { data } = yield api.github.repos.getCommit(Object.assign(Object.assign({}, api.remoteParams), { ref: sha }));
        // Matches the closing keyword supported in commit messages. See:
        // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords.
        return data.commit.message.match(new RegExp(`(?:close[sd]?|fix(?:e[sd]?)|resolve[sd]?):? #${id}(?!\\d)`, 'i'));
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Gets the default pattern for extracting release notes for the given version.
 * This pattern matches for the conventional-changelog Angular preset.
 */
function getDefaultExtractReleaseNotesPattern(version) {
    const escapedVersion = version.format().replace('.', '\\.');
    // TODO: Change this once we have a canonical changelog generation tool. Also update this
    // based on the conventional-changelog version. They removed anchors in more recent versions.
    return new RegExp(`(<a name="${escapedVersion}"></a>.*?)(?:<a name="|$)`, 's');
}
/** Gets the path for the changelog file in a given project. */
function getLocalChangelogFilePath(projectDir) {
    return path.join(projectDir, changelogPath);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Abstract base class for a release action. A release action is selectable by the caretaker
 * if active, and can perform changes for releasing, such as staging a release, bumping the
 * version, cherry-picking the changelog, branching off from master. etc.
 */
class ReleaseAction {
    constructor(active, git, config, projectDir) {
        this.active = active;
        this.git = git;
        this.config = config;
        this.projectDir = projectDir;
        /** Cached found fork of the configured project. */
        this._cachedForkRepo = null;
    }
    /** Whether the release action is currently active. */
    static isActive(_trains) {
        throw Error('Not implemented.');
    }
    /** Updates the version in the project top-level `package.json` file. */
    updateProjectVersion(newVersion) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const pkgJsonPath = path.join(this.projectDir, packageJsonPath);
            const pkgJson = JSON.parse(yield fs.promises.readFile(pkgJsonPath, 'utf8'));
            pkgJson.version = newVersion.format();
            // Write the `package.json` file. Note that we add a trailing new line
            // to avoid unnecessary diff. IDEs usually add a trailing new line.
            yield fs.promises.writeFile(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
            info(green(`  ✓   Updated project version to ${pkgJson.version}`));
        });
    }
    /** Gets the most recent commit of a specified branch. */
    _getCommitOfBranch(branchName) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { data: { commit } } = yield this.git.github.repos.getBranch(Object.assign(Object.assign({}, this.git.remoteParams), { branch: branchName }));
            return commit.sha;
        });
    }
    /** Verifies that the latest commit for the given branch is passing all statuses. */
    verifyPassingGithubStatus(branchName) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const commitSha = yield this._getCommitOfBranch(branchName);
            const { data: { state } } = yield this.git.github.repos.getCombinedStatusForRef(Object.assign(Object.assign({}, this.git.remoteParams), { ref: commitSha }));
            const branchCommitsUrl = getListCommitsInBranchUrl(this.git, branchName);
            if (state === 'failure') {
                error(red(`  ✘   Cannot stage release. Commit "${commitSha}" does not pass all github ` +
                    'status checks. Please make sure this commit passes all checks before re-running.'));
                error(`      Please have a look at: ${branchCommitsUrl}`);
                if (yield promptConfirm('Do you want to ignore the Github status and proceed?')) {
                    info(yellow('  ⚠   Upstream commit is failing CI checks, but status has been forcibly ignored.'));
                    return;
                }
                throw new UserAbortedReleaseActionError();
            }
            else if (state === 'pending') {
                error(red(`  ✘   Commit "${commitSha}" still has pending github statuses that ` +
                    'need to succeed before staging a release.'));
                error(red(`      Please have a look at: ${branchCommitsUrl}`));
                if (yield promptConfirm('Do you want to ignore the Github status and proceed?')) {
                    info(yellow('  ⚠   Upstream commit is pending CI, but status has been forcibly ignored.'));
                    return;
                }
                throw new UserAbortedReleaseActionError();
            }
            info(green('  ✓   Upstream commit is passing all github status checks.'));
        });
    }
    /** Generates the changelog for the specified for the current `HEAD`. */
    _generateReleaseNotesForHead(version) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const changelogPath = getLocalChangelogFilePath(this.projectDir);
            yield this.config.generateReleaseNotesForHead(changelogPath);
            info(green(`  ✓   Updated the changelog to capture changes for "${version}".`));
        });
    }
    /** Extract the release notes for the given version from the changelog file. */
    _extractReleaseNotesForVersion(changelogContent, version) {
        const pattern = this.config.extractReleaseNotesPattern !== undefined ?
            this.config.extractReleaseNotesPattern(version) :
            getDefaultExtractReleaseNotesPattern(version);
        const matchedNotes = pattern.exec(changelogContent);
        return matchedNotes === null ? null : matchedNotes[1];
    }
    /**
     * Prompts the user for potential release notes edits that need to be made. Once
     * confirmed, a new commit for the release point is created.
     */
    waitForEditsAndCreateReleaseCommit(newVersion) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            info(yellow('  ⚠   Please review the changelog and ensure that the log contains only changes ' +
                'that apply to the public API surface. Manual changes can be made. When done, please ' +
                'proceed with the prompt below.'));
            if (!(yield promptConfirm('Do you want to proceed and commit the changes?'))) {
                throw new UserAbortedReleaseActionError();
            }
            // Commit message for the release point.
            const commitMessage = getCommitMessageForRelease(newVersion);
            // Create a release staging commit including changelog and version bump.
            yield this.createCommit(commitMessage, [packageJsonPath, changelogPath]);
            info(green(`  ✓   Created release commit for: "${newVersion}".`));
        });
    }
    /**
     * Gets an owned fork for the configured project of the authenticated user. Aborts the
     * process with an error if no fork could be found. Also caches the determined fork
     * repository as the authenticated user cannot change during action execution.
     */
    _getForkOfAuthenticatedUser() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            if (this._cachedForkRepo !== null) {
                return this._cachedForkRepo;
            }
            const { owner, name } = this.git.remoteConfig;
            const result = yield this.git.github.graphql.query(findOwnedForksOfRepoQuery, { owner, name });
            const forks = result.repository.forks.nodes;
            if (forks.length === 0) {
                error(red('  ✘   Unable to find fork for currently authenticated user.'));
                error(red(`      Please ensure you created a fork of: ${owner}/${name}.`));
                throw new FatalReleaseActionError();
            }
            const fork = forks[0];
            return this._cachedForkRepo = { owner: fork.owner.login, name: fork.name };
        });
    }
    /** Checks whether a given branch name is reserved in the specified repository. */
    _isBranchNameReservedInRepo(repo, name) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            try {
                yield this.git.github.repos.getBranch({ owner: repo.owner, repo: repo.name, branch: name });
                return true;
            }
            catch (e) {
                // If the error has a `status` property set to `404`, then we know that the branch
                // does not exist. Otherwise, it might be an API error that we want to report/re-throw.
                if (e.status === 404) {
                    return false;
                }
                throw e;
            }
        });
    }
    /** Finds a non-reserved branch name in the repository with respect to a base name. */
    _findAvailableBranchName(repo, baseName) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            let currentName = baseName;
            let suffixNum = 0;
            while (yield this._isBranchNameReservedInRepo(repo, currentName)) {
                suffixNum++;
                currentName = `${baseName}_${suffixNum}`;
            }
            return currentName;
        });
    }
    /**
     * Creates a local branch from the current Git `HEAD`. Will override
     * existing branches in case of a collision.
     */
    createLocalBranchFromHead(branchName) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            this.git.run(['checkout', '-B', branchName]);
        });
    }
    /** Pushes the current Git `HEAD` to the given remote branch in the configured project. */
    pushHeadToRemoteBranch(branchName) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            // Push the local `HEAD` to the remote branch in the configured project.
            this.git.run(['push', this.git.repoGitUrl, `HEAD:refs/heads/${branchName}`]);
        });
    }
    /**
     * Pushes the current Git `HEAD` to a fork for the configured project that is owned by
     * the authenticated user. If the specified branch name exists in the fork already, a
     * unique one will be generated based on the proposed name to avoid collisions.
     * @param proposedBranchName Proposed branch name for the fork.
     * @param trackLocalBranch Whether the fork branch should be tracked locally. i.e. whether
     *   a local branch with remote tracking should be set up.
     * @returns The fork and branch name containing the pushed changes.
     */
    _pushHeadToFork(proposedBranchName, trackLocalBranch) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const fork = yield this._getForkOfAuthenticatedUser();
            // Compute a repository URL for pushing to the fork. Note that we want to respect
            // the SSH option from the dev-infra github configuration.
            const repoGitUrl = getRepositoryGitUrl(Object.assign(Object.assign({}, fork), { useSsh: this.git.remoteConfig.useSsh }), this.git.githubToken);
            const branchName = yield this._findAvailableBranchName(fork, proposedBranchName);
            const pushArgs = [];
            // If a local branch should track the remote fork branch, create a branch matching
            // the remote branch. Later with the `git push`, the remote is set for the branch.
            if (trackLocalBranch) {
                yield this.createLocalBranchFromHead(branchName);
                pushArgs.push('--set-upstream');
            }
            // Push the local `HEAD` to the remote branch in the fork.
            this.git.run(['push', repoGitUrl, `HEAD:refs/heads/${branchName}`, ...pushArgs]);
            return { fork, branchName };
        });
    }
    /**
     * Pushes changes to a fork for the configured project that is owned by the currently
     * authenticated user. A pull request is then created for the pushed changes on the
     * configured project that targets the specified target branch.
     * @returns An object describing the created pull request.
     */
    pushChangesToForkAndCreatePullRequest(targetBranch, proposedForkBranchName, title, body) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const repoSlug = `${this.git.remoteParams.owner}/${this.git.remoteParams.repo}`;
            const { fork, branchName } = yield this._pushHeadToFork(proposedForkBranchName, true);
            const { data } = yield this.git.github.pulls.create(Object.assign(Object.assign({}, this.git.remoteParams), { head: `${fork.owner}:${branchName}`, base: targetBranch, body,
                title }));
            // Add labels to the newly created PR if provided in the configuration.
            if (this.config.releasePrLabels !== undefined) {
                yield this.git.github.issues.addLabels(Object.assign(Object.assign({}, this.git.remoteParams), { issue_number: data.number, labels: this.config.releasePrLabels }));
            }
            info(green(`  ✓   Created pull request #${data.number} in ${repoSlug}.`));
            return {
                id: data.number,
                url: data.html_url,
                fork,
                forkBranch: branchName,
            };
        });
    }
    /**
     * Waits for the given pull request to be merged. Default interval for checking the Github
     * API is 10 seconds (to not exceed any rate limits). If the pull request is closed without
     * merge, the script will abort gracefully (considering a manual user abort).
     */
    waitForPullRequestToBeMerged(id, interval = waitForPullRequestInterval) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                debug(`Waiting for pull request #${id} to be merged.`);
                const spinner = ora.call(undefined).start(`Waiting for pull request #${id} to be merged.`);
                const intervalId = setInterval(() => tslib.__awaiter(this, void 0, void 0, function* () {
                    const prState = yield getPullRequestState(this.git, id);
                    if (prState === 'merged') {
                        spinner.stop();
                        info(green(`  ✓   Pull request #${id} has been merged.`));
                        clearInterval(intervalId);
                        resolve();
                    }
                    else if (prState === 'closed') {
                        spinner.stop();
                        warn(yellow(`  ✘   Pull request #${id} has been closed.`));
                        clearInterval(intervalId);
                        reject(new UserAbortedReleaseActionError());
                    }
                }), interval);
            });
        });
    }
    /**
     * Prepend releases notes for a version published in a given branch to the changelog in
     * the current Git `HEAD`. This is useful for cherry-picking the changelog.
     * @returns A boolean indicating whether the release notes have been prepended.
     */
    prependReleaseNotesFromVersionBranch(version, containingBranch) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.git.github.repos.getContents(Object.assign(Object.assign({}, this.git.remoteParams), { path: '/' + changelogPath, ref: containingBranch }));
            const branchChangelog = Buffer.from(data.content, 'base64').toString();
            let releaseNotes = this._extractReleaseNotesForVersion(branchChangelog, version);
            // If no release notes could be extracted, return "false" so that the caller
            // can tell that changelog prepending failed.
            if (releaseNotes === null) {
                return false;
            }
            const localChangelogPath = getLocalChangelogFilePath(this.projectDir);
            const localChangelog = yield fs.promises.readFile(localChangelogPath, 'utf8');
            // If the extracted release notes do not have any new lines at the end and the
            // local changelog is not empty, we add lines manually so that there is space
            // between the previous and cherry-picked release notes.
            if (!/[\r\n]+$/.test(releaseNotes) && localChangelog !== '') {
                releaseNotes = `${releaseNotes}\n\n`;
            }
            // Prepend the extracted release notes to the local changelog and write it back.
            yield fs.promises.writeFile(localChangelogPath, releaseNotes + localChangelog);
            return true;
        });
    }
    /** Checks out an upstream branch with a detached head. */
    checkoutUpstreamBranch(branchName) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            this.git.run(['fetch', '-q', this.git.repoGitUrl, branchName]);
            this.git.run(['checkout', 'FETCH_HEAD', '--detach']);
        });
    }
    /**
     * Creates a commit for the specified files with the given message.
     * @param message Message for the created commit
     * @param files List of project-relative file paths to be commited.
     */
    createCommit(message, files) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            this.git.run(['commit', '--no-verify', '-m', message, ...files]);
        });
    }
    /**
     * Creates a cherry-pick commit for the release notes of the specified version that
     * has been pushed to the given branch.
     * @returns a boolean indicating whether the commit has been created successfully.
     */
    createCherryPickReleaseNotesCommitFrom(version, branchName) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const commitMessage = getReleaseNoteCherryPickCommitMessage(version);
            // Fetch, extract and prepend the release notes to the local changelog. If that is not
            // possible, abort so that we can ask the user to manually cherry-pick the changelog.
            if (!(yield this.prependReleaseNotesFromVersionBranch(version, branchName))) {
                return false;
            }
            // Create a changelog cherry-pick commit.
            yield this.createCommit(commitMessage, [changelogPath]);
            info(green(`  ✓   Created changelog cherry-pick commit for: "${version}".`));
            return true;
        });
    }
    /**
     * Stages the specified new version for the current branch and creates a
     * pull request that targets the given base branch.
     * @returns an object describing the created pull request.
     */
    stageVersionForBranchAndCreatePullRequest(newVersion, pullRequestBaseBranch) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            yield this.updateProjectVersion(newVersion);
            yield this._generateReleaseNotesForHead(newVersion);
            yield this.waitForEditsAndCreateReleaseCommit(newVersion);
            const pullRequest = yield this.pushChangesToForkAndCreatePullRequest(pullRequestBaseBranch, `release-stage-${newVersion}`, `Bump version to "v${newVersion}" with changelog.`);
            info(green('  ✓   Release staging pull request has been created.'));
            info(yellow(`      Please ask team members to review: ${pullRequest.url}.`));
            return pullRequest;
        });
    }
    /**
     * Checks out the specified target branch, verifies its CI status and stages
     * the specified new version in order to create a pull request.
     * @returns an object describing the created pull request.
     */
    checkoutBranchAndStageVersion(newVersion, stagingBranch) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            yield this.verifyPassingGithubStatus(stagingBranch);
            yield this.checkoutUpstreamBranch(stagingBranch);
            return yield this.stageVersionForBranchAndCreatePullRequest(newVersion, stagingBranch);
        });
    }
    /**
     * Cherry-picks the release notes of a version that have been pushed to a given branch
     * into the `next` primary development branch. A pull request is created for this.
     * @returns a boolean indicating successful creation of the cherry-pick pull request.
     */
    cherryPickChangelogIntoNextBranch(newVersion, stagingBranch) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const nextBranch = this.active.next.branchName;
            const commitMessage = getReleaseNoteCherryPickCommitMessage(newVersion);
            // Checkout the next branch.
            yield this.checkoutUpstreamBranch(nextBranch);
            // Cherry-pick the release notes into the current branch. If it fails,
            // ask the user to manually copy the release notes into the next branch.
            if (!(yield this.createCherryPickReleaseNotesCommitFrom(newVersion, stagingBranch))) {
                error(yellow(`  ✘   Could not cherry-pick release notes for v${newVersion}.`));
                error(yellow(`      Please copy the release notes manually into the "${nextBranch}" branch.`));
                return false;
            }
            // Create a cherry-pick pull request that should be merged by the caretaker.
            const { url, id } = yield this.pushChangesToForkAndCreatePullRequest(nextBranch, `changelog-cherry-pick-${newVersion}`, commitMessage, `Cherry-picks the changelog from the "${stagingBranch}" branch to the next ` +
                `branch (${nextBranch}).`);
            info(green(`  ✓   Pull request for cherry-picking the changelog into "${nextBranch}" ` +
                'has been created.'));
            info(yellow(`      Please ask team members to review: ${url}.`));
            // Wait for the Pull Request to be merged.
            yield this.waitForPullRequestToBeMerged(id);
            return true;
        });
    }
    /**
     * Creates a Github release for the specified version in the configured project.
     * The release is created by tagging the specified commit SHA.
     */
    _createGithubReleaseForVersion(newVersion, versionBumpCommitSha, prerelease) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const tagName = newVersion.format();
            yield this.git.github.git.createRef(Object.assign(Object.assign({}, this.git.remoteParams), { ref: `refs/tags/${tagName}`, sha: versionBumpCommitSha }));
            info(green(`  ✓   Tagged v${newVersion} release upstream.`));
            yield this.git.github.repos.createRelease(Object.assign(Object.assign({}, this.git.remoteParams), { name: `v${newVersion}`, tag_name: tagName, prerelease }));
            info(green(`  ✓   Created v${newVersion} release in Github.`));
        });
    }
    /**
     * Builds and publishes the given version in the specified branch.
     * @param newVersion The new version to be published.
     * @param publishBranch Name of the branch that contains the new version.
     * @param npmDistTag NPM dist tag where the version should be published to.
     */
    buildAndPublish(newVersion, publishBranch, npmDistTag) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const versionBumpCommitSha = yield this._getCommitOfBranch(publishBranch);
            if (!(yield this._isCommitForVersionStaging(newVersion, versionBumpCommitSha))) {
                error(red(`  ✘   Latest commit in "${publishBranch}" branch is not a staging commit.`));
                error(red('      Please make sure the staging pull request has been merged.'));
                throw new FatalReleaseActionError();
            }
            // Checkout the publish branch and build the release packages.
            yield this.checkoutUpstreamBranch(publishBranch);
            // Install the project dependencies for the publish branch, and then build the release
            // packages. Note that we do not directly call the build packages function from the release
            // config. We only want to build and publish packages that have been configured in the given
            // publish branch. e.g. consider we publish patch version and a new package has been
            // created in the `next` branch. The new package would not be part of the patch branch,
            // so we cannot build and publish it.
            yield invokeYarnInstallCommand(this.projectDir);
            yield invokeBazelCleanCommand(this.projectDir);
            const builtPackages = yield invokeReleaseBuildCommand();
            // Verify the packages built are the correct version.
            yield this._verifyPackageVersions(newVersion, builtPackages);
            // Create a Github release for the new version.
            yield this._createGithubReleaseForVersion(newVersion, versionBumpCommitSha, npmDistTag === 'next');
            // Walk through all built packages and publish them to NPM.
            for (const builtPackage of builtPackages) {
                yield this._publishBuiltPackageToNpm(builtPackage, npmDistTag);
            }
            info(green('  ✓   Published all packages successfully'));
        });
    }
    /** Publishes the given built package to NPM with the specified NPM dist tag. */
    _publishBuiltPackageToNpm(pkg, npmDistTag) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            debug(`Starting publish of "${pkg.name}".`);
            const spinner = ora.call(undefined).start(`Publishing "${pkg.name}"`);
            try {
                yield runNpmPublish(pkg.outputPath, npmDistTag, this.config.publishRegistry);
                spinner.stop();
                info(green(`  ✓   Successfully published "${pkg.name}.`));
            }
            catch (e) {
                spinner.stop();
                error(e);
                error(red(`  ✘   An error occurred while publishing "${pkg.name}".`));
                throw new FatalReleaseActionError();
            }
        });
    }
    /** Checks whether the given commit represents a staging commit for the specified version. */
    _isCommitForVersionStaging(version, commitSha) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.git.github.repos.getCommit(Object.assign(Object.assign({}, this.git.remoteParams), { ref: commitSha }));
            return data.commit.message.startsWith(getCommitMessageForRelease(version));
        });
    }
    /** Verify the version of each generated package exact matches the specified version. */
    _verifyPackageVersions(version, packages) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            for (const pkg of packages) {
                const { version: packageJsonVersion } = JSON.parse(yield fs.promises.readFile(path.join(pkg.outputPath, 'package.json'), 'utf8'));
                if (version.compare(packageJsonVersion) !== 0) {
                    error(red('The built package version does not match the version being released.'));
                    error(`  Release Version:   ${version.version}`);
                    error(`  Generated Version: ${packageJsonVersion}`);
                    throw new FatalReleaseActionError();
                }
            }
        });
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
 * Release action that cuts a new patch release for an active release-train in the long-term
 * support phase. The patch segment is incremented. The changelog is generated for the new
 * patch version, but also needs to be cherry-picked into the next development branch.
 */
class CutLongTermSupportPatchAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        /** Promise resolving an object describing long-term support branches. */
        this.ltsBranches = fetchLongTermSupportBranchesFromNpm(this.config);
    }
    getDescription() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { active } = yield this.ltsBranches;
            return `Cut a new release for an active LTS branch (${active.length} active).`;
        });
    }
    perform() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const ltsBranch = yield this._promptForTargetLtsBranch();
            const newVersion = semverInc(ltsBranch.version, 'patch');
            const { id } = yield this.checkoutBranchAndStageVersion(newVersion, ltsBranch.name);
            yield this.waitForPullRequestToBeMerged(id);
            yield this.buildAndPublish(newVersion, ltsBranch.name, ltsBranch.npmDistTag);
            yield this.cherryPickChangelogIntoNextBranch(newVersion, ltsBranch.name);
        });
    }
    /** Prompts the user to select an LTS branch for which a patch should but cut. */
    _promptForTargetLtsBranch() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { active, inactive } = yield this.ltsBranches;
            const activeBranchChoices = active.map(branch => this._getChoiceForLtsBranch(branch));
            // If there are inactive LTS branches, we allow them to be selected. In some situations,
            // patch releases are still cut for inactive LTS branches. e.g. when the LTS duration
            // has been increased due to exceptional events ()
            if (inactive.length !== 0) {
                activeBranchChoices.push({ name: 'Inactive LTS versions (not recommended)', value: null });
            }
            const { activeLtsBranch, inactiveLtsBranch } = yield inquirer.prompt([
                {
                    name: 'activeLtsBranch',
                    type: 'list',
                    message: 'Please select a version for which you want to cut an LTS patch',
                    choices: activeBranchChoices,
                },
                {
                    name: 'inactiveLtsBranch',
                    type: 'list',
                    when: o => o.activeLtsBranch === null,
                    message: 'Please select an inactive LTS version for which you want to cut an LTS patch',
                    choices: inactive.map(branch => this._getChoiceForLtsBranch(branch)),
                }
            ]);
            return activeLtsBranch !== null && activeLtsBranch !== void 0 ? activeLtsBranch : inactiveLtsBranch;
        });
    }
    /** Gets an inquirer choice for the given LTS branch. */
    _getChoiceForLtsBranch(branch) {
        return { name: `v${branch.version.major} (from ${branch.name})`, value: branch };
    }
    static isActive(active) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            // LTS patch versions can be only cut if there are release trains in LTS phase.
            // This action is always selectable as we support publishing of old LTS branches,
            // and have prompt for selecting an LTS branch when the action performs.
            return true;
        });
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
 * Release action that cuts a new patch release for the current latest release-train version
 * branch (i.e. the patch branch). The patch segment is incremented. The changelog is generated
 * for the new patch version, but also needs to be cherry-picked into the next development branch.
 */
class CutNewPatchAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = semverInc(this.active.latest.version, 'patch');
    }
    getDescription() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.latest;
            const newVersion = this._newVersion;
            return `Cut a new patch release for the "${branchName}" branch (v${newVersion}).`;
        });
    }
    perform() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.latest;
            const newVersion = this._newVersion;
            const { id } = yield this.checkoutBranchAndStageVersion(newVersion, branchName);
            yield this.waitForPullRequestToBeMerged(id);
            yield this.buildAndPublish(newVersion, branchName, 'latest');
            yield this.cherryPickChangelogIntoNextBranch(newVersion, branchName);
        });
    }
    static isActive(active) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            // Patch versions can be cut at any time. See:
            // https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A#Release-prompt-options.
            return true;
        });
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Computes the new pre-release version for the next release-train. */
function computeNewPrereleaseVersionForNext(active, config) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const { version: nextVersion } = active.next;
        const isNextPublishedToNpm = yield isVersionPublishedToNpm(nextVersion, config);
        // Special-case where the version in the `next` release-train is not published yet. This
        // happens when we recently branched off for feature-freeze. We already bump the version to
        // the next minor or major, but do not publish immediately. Cutting a release immediately would
        // be not helpful as there are no other changes than in the feature-freeze branch. If we happen
        // to detect this case, we stage the release as usual but do not increment the version.
        if (isNextPublishedToNpm) {
            return semverInc(nextVersion, 'prerelease');
        }
        else {
            return nextVersion;
        }
    });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Release action that cuts a prerelease for the next branch. A version in the next
 * branch can have an arbitrary amount of next pre-releases.
 */
class CutNextPrereleaseAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        /** Promise resolving with the new version if a NPM next pre-release is cut. */
        this._newVersion = this._computeNewVersion();
    }
    getDescription() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { branchName } = this._getActivePrereleaseTrain();
            const newVersion = yield this._newVersion;
            return `Cut a new next pre-release for the "${branchName}" branch (v${newVersion}).`;
        });
    }
    perform() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const releaseTrain = this._getActivePrereleaseTrain();
            const { branchName } = releaseTrain;
            const newVersion = yield this._newVersion;
            const { id } = yield this.checkoutBranchAndStageVersion(newVersion, branchName);
            yield this.waitForPullRequestToBeMerged(id);
            yield this.buildAndPublish(newVersion, branchName, 'next');
            // If the pre-release has been cut from a branch that is not corresponding
            // to the next release-train, cherry-pick the changelog into the primary
            // development branch. i.e. the `next` branch that is usually `master`.
            if (releaseTrain !== this.active.next) {
                yield this.cherryPickChangelogIntoNextBranch(newVersion, branchName);
            }
        });
    }
    /** Gets the release train for which NPM next pre-releases should be cut. */
    _getActivePrereleaseTrain() {
        var _a;
        return (_a = this.active.releaseCandidate) !== null && _a !== void 0 ? _a : this.active.next;
    }
    /** Gets the new pre-release version for this release action. */
    _computeNewVersion() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const releaseTrain = this._getActivePrereleaseTrain();
            // If a pre-release is cut for the next release-train, the new version is computed
            // with respect to special cases surfacing with FF/RC branches. Otherwise, the basic
            // pre-release increment of the version is used as new version.
            if (releaseTrain === this.active.next) {
                return yield computeNewPrereleaseVersionForNext(this.active, this.config);
            }
            else {
                return semverInc(releaseTrain.version, 'prerelease');
            }
        });
    }
    static isActive() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            // Pre-releases for the `next` NPM dist tag can always be cut. Depending on whether
            // there is a feature-freeze/release-candidate branch, the next pre-releases are either
            // cut from such a branch, or from the actual `next` release-train branch (i.e. master).
            return true;
        });
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
 * Cuts the first release candidate for a release-train currently in the
 * feature-freeze phase. The version is bumped from `next` to `rc.0`.
 */
class CutReleaseCandidateAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = semverInc(this.active.releaseCandidate.version, 'prerelease', 'rc');
    }
    getDescription() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const newVersion = this._newVersion;
            return `Cut a first release-candidate for the feature-freeze branch (v${newVersion}).`;
        });
    }
    perform() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.releaseCandidate;
            const newVersion = this._newVersion;
            const { id } = yield this.checkoutBranchAndStageVersion(newVersion, branchName);
            yield this.waitForPullRequestToBeMerged(id);
            yield this.buildAndPublish(newVersion, branchName, 'next');
            yield this.cherryPickChangelogIntoNextBranch(newVersion, branchName);
        });
    }
    static isActive(active) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            // A release-candidate can be cut for an active release-train currently
            // in the feature-freeze phase.
            return active.releaseCandidate !== null &&
                active.releaseCandidate.version.prerelease[0] === 'next';
        });
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
 * Release action that cuts a stable version for the current release-train in the release
 * candidate phase. The pre-release release-candidate version label is removed.
 */
class CutStableAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = this._computeNewVersion();
    }
    getDescription() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const newVersion = this._newVersion;
            return `Cut a stable release for the release-candidate branch (v${newVersion}).`;
        });
    }
    perform() {
        var _a;
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.releaseCandidate;
            const newVersion = this._newVersion;
            const isNewMajor = (_a = this.active.releaseCandidate) === null || _a === void 0 ? void 0 : _a.isMajor;
            const { id } = yield this.checkoutBranchAndStageVersion(newVersion, branchName);
            yield this.waitForPullRequestToBeMerged(id);
            yield this.buildAndPublish(newVersion, branchName, 'latest');
            // If a new major version is published and becomes the "latest" release-train, we need
            // to set the LTS npm dist tag for the previous latest release-train (the current patch).
            if (isNewMajor) {
                const previousPatchVersion = this.active.latest.version;
                const ltsTagForPatch = getLtsNpmDistTagOfMajor(previousPatchVersion.major);
                // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
                // setting the NPM dist tag to the specified version. We do this because release NPM
                // packages could be different in the previous patch branch, and we want to set the
                // LTS tag for all packages part of the last major. It would not be possible to set the
                // NPM dist tag for new packages part of the released major, nor would it be acceptable
                // to skip the LTS tag for packages which are no longer part of the new major.
                yield invokeYarnInstallCommand(this.projectDir);
                yield invokeSetNpmDistCommand(ltsTagForPatch, previousPatchVersion);
            }
            yield this.cherryPickChangelogIntoNextBranch(newVersion, branchName);
        });
    }
    /** Gets the new stable version of the release candidate release-train. */
    _computeNewVersion() {
        const { version } = this.active.releaseCandidate;
        return semver.parse(`${version.major}.${version.minor}.${version.patch}`);
    }
    static isActive(active) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            // A stable version can be cut for an active release-train currently in the
            // release-candidate phase. Note: It is not possible to directly release from
            // feature-freeze phase into a stable version.
            return active.releaseCandidate !== null &&
                active.releaseCandidate.version.prerelease[0] === 'rc';
        });
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
 * Release action that moves the next release-train into the feature-freeze phase. This means
 * that a new version branch is created from the next branch, and a new next pre-release is
 * cut indicating the started feature-freeze.
 */
class MoveNextIntoFeatureFreezeAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = computeNewPrereleaseVersionForNext(this.active, this.config);
    }
    getDescription() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.next;
            const newVersion = yield this._newVersion;
            return `Move the "${branchName}" branch into feature-freeze phase (v${newVersion}).`;
        });
    }
    perform() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const newVersion = yield this._newVersion;
            const newBranch = `${newVersion.major}.${newVersion.minor}.x`;
            // Branch-off the next branch into a feature-freeze branch.
            yield this._createNewVersionBranchFromNext(newBranch);
            // Stage the new version for the newly created branch, and push changes to a
            // fork in order to create a staging pull request. Note that we re-use the newly
            // created branch instead of re-fetching from the upstream.
            const stagingPullRequest = yield this.stageVersionForBranchAndCreatePullRequest(newVersion, newBranch);
            // Wait for the staging PR to be merged. Then build and publish the feature-freeze next
            // pre-release. Finally, cherry-pick the release notes into the next branch in combination
            // with bumping the version to the next minor too.
            yield this.waitForPullRequestToBeMerged(stagingPullRequest.id);
            yield this.buildAndPublish(newVersion, newBranch, 'next');
            yield this._createNextBranchUpdatePullRequest(newVersion, newBranch);
        });
    }
    /** Creates a new version branch from the next branch. */
    _createNewVersionBranchFromNext(newBranch) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { branchName: nextBranch } = this.active.next;
            yield this.verifyPassingGithubStatus(nextBranch);
            yield this.checkoutUpstreamBranch(nextBranch);
            yield this.createLocalBranchFromHead(newBranch);
            yield this.pushHeadToRemoteBranch(newBranch);
            info(green(`  ✓   Version branch "${newBranch}" created.`));
        });
    }
    /**
     * Creates a pull request for the next branch that bumps the version to the next
     * minor, and cherry-picks the changelog for the newly branched-off feature-freeze version.
     */
    _createNextBranchUpdatePullRequest(newVersion, newBranch) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { branchName: nextBranch, version } = this.active.next;
            // We increase the version for the next branch to the next minor. The team can decide
            // later if they want next to be a major through the `Configure Next as Major` release action.
            const newNextVersion = semver.parse(`${version.major}.${version.minor + 1}.0-next.0`);
            const bumpCommitMessage = getCommitMessageForExceptionalNextVersionBump(newNextVersion);
            yield this.checkoutUpstreamBranch(nextBranch);
            yield this.updateProjectVersion(newNextVersion);
            // Create an individual commit for the next version bump. The changelog should go into
            // a separate commit that makes it clear where the changelog is cherry-picked from.
            yield this.createCommit(bumpCommitMessage, [packageJsonPath]);
            let nextPullRequestMessage = `The previous "next" release-train has moved into the ` +
                `release-candidate phase. This PR updates the next branch to the subsequent ` +
                `release-train.`;
            const hasChangelogCherryPicked = yield this.createCherryPickReleaseNotesCommitFrom(newVersion, newBranch);
            if (hasChangelogCherryPicked) {
                nextPullRequestMessage += `\n\nAlso this PR cherry-picks the changelog for ` +
                    `v${newVersion} into the ${nextBranch} branch so that the changelog is up to date.`;
            }
            else {
                error(yellow(`  ✘   Could not cherry-pick release notes for v${newVersion}.`));
                error(yellow(`      Please copy the release note manually into "${nextBranch}".`));
            }
            const nextUpdatePullRequest = yield this.pushChangesToForkAndCreatePullRequest(nextBranch, `next-release-train-${newNextVersion}`, `Update next branch to reflect new release-train "v${newNextVersion}".`, nextPullRequestMessage);
            info(green(`  ✓   Pull request for updating the "${nextBranch}" branch has been created.`));
            info(yellow(`      Please ask team members to review: ${nextUpdatePullRequest.url}.`));
        });
    }
    static isActive(active) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            // A new feature-freeze/release-candidate branch can only be created if there
            // is no active release-train in feature-freeze/release-candidate phase.
            return active.releaseCandidate === null;
        });
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
 * List of release actions supported by the release staging tool. These are sorted
 * by priority. Actions which are selectable are sorted based on this declaration order.
 */
const actions = [
    CutStableAction,
    CutReleaseCandidateAction,
    CutNewPatchAction,
    CutNextPrereleaseAction,
    MoveNextIntoFeatureFreezeAction,
    CutLongTermSupportPatchAction,
];

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var CompletionState;
(function (CompletionState) {
    CompletionState[CompletionState["SUCCESS"] = 0] = "SUCCESS";
    CompletionState[CompletionState["FATAL_ERROR"] = 1] = "FATAL_ERROR";
    CompletionState[CompletionState["MANUALLY_ABORTED"] = 2] = "MANUALLY_ABORTED";
})(CompletionState || (CompletionState = {}));
class ReleaseTool {
    constructor(_config, _github, _githubToken, _projectRoot) {
        this._config = _config;
        this._github = _github;
        this._githubToken = _githubToken;
        this._projectRoot = _projectRoot;
        /** Client for interacting with the Github API and the local Git command. */
        this._git = new GitClient(this._githubToken, { github: this._github }, this._projectRoot);
        /** The previous git commit to return back to after the release tool runs. */
        this.previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();
    }
    /** Runs the interactive release tool. */
    run() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            log();
            log(yellow('--------------------------------------------'));
            log(yellow('  Angular Dev-Infra release staging script'));
            log(yellow('--------------------------------------------'));
            log();
            if (!(yield this._verifyNoUncommittedChanges()) || !(yield this._verifyRunningFromNextBranch())) {
                return CompletionState.FATAL_ERROR;
            }
            if (!(yield this._verifyNpmLoginState())) {
                return CompletionState.MANUALLY_ABORTED;
            }
            const { owner, name } = this._github;
            const repo = { owner, name, api: this._git.github };
            const releaseTrains = yield fetchActiveReleaseTrains(repo);
            // Print the active release trains so that the caretaker can access
            // the current project branching state without switching context.
            yield printActiveReleaseTrains(releaseTrains, this._config);
            const action = yield this._promptForReleaseAction(releaseTrains);
            try {
                yield action.perform();
            }
            catch (e) {
                if (e instanceof UserAbortedReleaseActionError) {
                    return CompletionState.MANUALLY_ABORTED;
                }
                // Only print the error message and stack if the error is not a known fatal release
                // action error (for which we print the error gracefully to the console with colors).
                if (!(e instanceof FatalReleaseActionError) && e instanceof Error) {
                    console.error(e);
                }
                return CompletionState.FATAL_ERROR;
            }
            finally {
                yield this.cleanup();
            }
            return CompletionState.SUCCESS;
        });
    }
    /** Run post release tool cleanups. */
    cleanup() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            // Return back to the git state from before the release tool ran.
            this._git.checkout(this.previousGitBranchOrRevision, true);
            // Ensure log out of NPM.
            yield npmLogout(this._config.publishRegistry);
        });
    }
    /** Prompts the caretaker for a release action that should be performed. */
    _promptForReleaseAction(activeTrains) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const choices = [];
            // Find and instantiate all release actions which are currently valid.
            for (let actionType of actions) {
                if (yield actionType.isActive(activeTrains)) {
                    const action = new actionType(activeTrains, this._git, this._config, this._projectRoot);
                    choices.push({ name: yield action.getDescription(), value: action });
                }
            }
            info('Please select the type of release you want to perform.');
            const { releaseAction } = yield inquirer.prompt({
                name: 'releaseAction',
                message: 'Please select an action:',
                type: 'list',
                choices,
            });
            return releaseAction;
        });
    }
    /**
     * Verifies that there are no uncommitted changes in the project.
     * @returns a boolean indicating success or failure.
     */
    _verifyNoUncommittedChanges() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            if (this._git.hasUncommittedChanges()) {
                error(red('  ✘   There are changes which are not committed and should be discarded.'));
                return false;
            }
            return true;
        });
    }
    /**
     * Verifies that the next branch from the configured repository is checked out.
     * @returns a boolean indicating success or failure.
     */
    _verifyRunningFromNextBranch() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const headSha = this._git.run(['rev-parse', 'HEAD']).stdout.trim();
            const { data } = yield this._git.github.repos.getBranch(Object.assign(Object.assign({}, this._git.remoteParams), { branch: nextBranchName }));
            if (headSha !== data.commit.sha) {
                error(red('  ✘   Running release tool from an outdated local branch.'));
                error(red(`      Please make sure you are running from the "${nextBranchName}" branch.`));
                return false;
            }
            return true;
        });
    }
    /**
     * Verifies that the user is logged into NPM at the correct registry, if defined for the release.
     * @returns a boolean indicating whether the user is logged into NPM.
     */
    _verifyNpmLoginState() {
        var _a, _b;
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const registry = `NPM at the ${(_a = this._config.publishRegistry) !== null && _a !== void 0 ? _a : 'default NPM'} registry`;
            // TODO(josephperrott): remove wombat specific block once wombot allows `npm whoami` check to
            // check the status of the local token in the .npmrc file.
            if ((_b = this._config.publishRegistry) === null || _b === void 0 ? void 0 : _b.includes('wombat-dressing-room.appspot.com')) {
                info('Unable to determine NPM login state for wombat proxy, requiring login now.');
                try {
                    yield npmLogin(this._config.publishRegistry);
                }
                catch (_c) {
                    return false;
                }
                return true;
            }
            if (yield npmIsLoggedIn(this._config.publishRegistry)) {
                debug(`Already logged into ${registry}.`);
                return true;
            }
            error(red(`  ✘   Not currently logged into ${registry}.`));
            const shouldLogin = yield promptConfirm('Would you like to log into NPM now?');
            if (shouldLogin) {
                debug('Starting NPM login.');
                try {
                    yield npmLogin(this._config.publishRegistry);
                }
                catch (_d) {
                    return false;
                }
                return true;
            }
            return false;
        });
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Yargs command builder for configuring the `ng-dev release publish` command. */
function builder$8(argv) {
    return addGithubTokenOption(argv);
}
/** Yargs command handler for staging a release. */
function handler$8(args) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const config = getConfig();
        const releaseConfig = getReleaseConfig(config);
        const projectDir = getRepoBaseDir();
        const task = new ReleaseTool(releaseConfig, config.github, args.githubToken, projectDir);
        const result = yield task.run();
        switch (result) {
            case CompletionState.FATAL_ERROR:
                error(red(`Release action has been aborted due to fatal errors. See above.`));
                process.exitCode = 2;
                break;
            case CompletionState.MANUALLY_ABORTED:
                info(yellow(`Release action has been manually aborted.`));
                process.exitCode = 1;
                break;
            case CompletionState.SUCCESS:
                info(green(`Release action has completed successfully.`));
                break;
        }
    });
}
/** CLI command module for publishing a release. */
const ReleasePublishCommandModule = {
    builder: builder$8,
    handler: handler$8,
    command: 'publish',
    describe: 'Publish new releases and configure version branches.',
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function builder$9(args) {
    return args
        .positional('tagName', {
        type: 'string',
        demandOption: true,
        description: 'Name of the NPM dist tag.',
    })
        .positional('targetVersion', {
        type: 'string',
        demandOption: true,
        description: 'Version to which the dist tag should be set.'
    });
}
/** Yargs command handler for building a release. */
function handler$9(args) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const { targetVersion: rawVersion, tagName } = args;
        const { npmPackages, publishRegistry } = getReleaseConfig();
        const version = semver.parse(rawVersion);
        if (version === null) {
            error(red(`Invalid version specified (${rawVersion}). Unable to set NPM dist tag.`));
            process.exit(1);
        }
        const spinner = ora.call(undefined).start();
        debug(`Setting "${tagName}" NPM dist tag for release packages to v${version}.`);
        for (const pkgName of npmPackages) {
            spinner.text = `Setting NPM dist tag for "${pkgName}"`;
            spinner.render();
            try {
                yield setNpmTagForPackage(pkgName, tagName, version, publishRegistry);
                debug(`Successfully set "${tagName}" NPM dist tag for "${pkgName}".`);
            }
            catch (e) {
                spinner.stop();
                error(e);
                error(red(`  ✘   An error occurred while setting the NPM dist tag for "${pkgName}".`));
                process.exit(1);
            }
        }
        spinner.stop();
        info(green(`  ✓   Set NPM dist tag for all release packages.`));
        info(green(`      ${bold(tagName)} will now point to ${bold(`v${version}`)}.`));
    });
}
/** CLI command module for setting an NPM dist tag. */
const ReleaseSetDistTagCommand = {
    builder: builder$9,
    handler: handler$9,
    command: 'set-dist-tag <tag-name> <target-version>',
    describe: 'Sets a given NPM dist tag for all release packages.',
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Log the environment variables expected by bazel for stamping.
 *
 * See the section on stamping in docs / BAZEL.md
 *
 * This script must be a NodeJS script in order to be cross-platform.
 * See https://github.com/bazelbuild/bazel/issues/5958
 * Note: git operations, especially git status, take a long time inside mounted docker volumes
 * in Windows or OSX hosts (https://github.com/docker/for-win/issues/188).
 */
function buildEnvStamp(mode) {
    console.info(`BUILD_SCM_BRANCH ${getCurrentBranch()}`);
    console.info(`BUILD_SCM_COMMIT_SHA ${getCurrentSha()}`);
    console.info(`BUILD_SCM_HASH ${getCurrentSha()}`);
    console.info(`BUILD_SCM_LOCAL_CHANGES ${hasLocalChanges()}`);
    console.info(`BUILD_SCM_USER ${getCurrentGitUser()}`);
    console.info(`BUILD_SCM_VERSION ${getSCMVersion(mode)}`);
    process.exit(0);
}
/** Run the exec command and return the stdout as a trimmed string. */
function exec$1(cmd) {
    return exec(cmd).trim();
}
/** Whether the repo has local changes. */
function hasLocalChanges() {
    return !!exec$1(`git status --untracked-files=no --porcelain`);
}
/**
 * Get the version for generated packages.
 *
 * In snapshot mode, the version is based on the most recent semver tag.
 * In release mode, the version is based on the base package.json version.
 */
function getSCMVersion(mode) {
    if (mode === 'release') {
        const packageJsonPath = path.join(getRepoBaseDir(), 'package.json');
        const { version } = require(packageJsonPath);
        return version;
    }
    if (mode === 'snapshot') {
        const version = exec$1(`git describe --match [0-9]*.[0-9]*.[0-9]* --abbrev=7 --tags HEAD`);
        return `${version.replace(/-([0-9]+)-g/, '+$1.sha-')}${(hasLocalChanges() ? '.with-local-changes' : '')}`;
    }
    return '0.0.0';
}
/** Get the current SHA of HEAD. */
function getCurrentSha() {
    return exec$1(`git rev-parse HEAD`);
}
/** Get the currently checked out branch. */
function getCurrentBranch() {
    return exec$1(`git symbolic-ref --short HEAD`);
}
/** Get the current git user based on the git config. */
function getCurrentGitUser() {
    const userName = exec$1(`git config user.name`);
    const userEmail = exec$1(`git config user.email`);
    return `${userName} <${userEmail}>`;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function builder$a(args) {
    return args.option('mode', {
        demandOption: true,
        description: 'Whether the env-stamp should be built for a snapshot or release',
        choices: ['snapshot', 'release']
    });
}
function handler$a({ mode }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        buildEnvStamp(mode);
    });
}
/** CLI command module for building the environment stamp. */
const BuildEnvStampCommand = {
    builder: builder$a,
    handler: handler$a,
    command: 'build-env-stamp',
    describe: 'Build the environment stamping information',
};

/** Build the parser for the release commands. */
function buildReleaseParser(localYargs) {
    return localYargs.help()
        .strict()
        .demandCommand()
        .command(ReleasePublishCommandModule)
        .command(ReleaseBuildCommandModule)
        .command(ReleaseSetDistTagCommand)
        .command(BuildEnvStampCommand);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Gets the status of the specified file. Returns null if the file does not exist. */
function getFileStatus(filePath) {
    try {
        return fs.statSync(filePath);
    }
    catch (_a) {
        return null;
    }
}
/** Ensures that the specified path uses forward slashes as delimiter. */
function convertPathToForwardSlash(path) {
    return path.replace(/\\/g, '/');
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Finds all module references in the specified source file.
 * @param node Source file which should be parsed.
 * @returns List of import specifiers in the source file.
 */
function getModuleReferences(node) {
    const references = [];
    const visitNode = (node) => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
            node.moduleSpecifier !== undefined && ts.isStringLiteral(node.moduleSpecifier)) {
            references.push(node.moduleSpecifier.text);
        }
        ts.forEachChild(node, visitNode);
    };
    ts.forEachChild(node, visitNode);
    return references;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Default extensions that the analyzer uses for resolving imports. */
const DEFAULT_EXTENSIONS = ['ts', 'js', 'd.ts'];
/**
 * Analyzer that can be used to detect import cycles within source files. It supports
 * custom module resolution, source file caching and collects unresolved specifiers.
 */
class Analyzer {
    constructor(resolveModuleFn, extensions = DEFAULT_EXTENSIONS) {
        this.resolveModuleFn = resolveModuleFn;
        this.extensions = extensions;
        this._sourceFileCache = new Map();
        this.unresolvedModules = new Set();
        this.unresolvedFiles = new Map();
    }
    /** Finds all cycles in the specified source file. */
    findCycles(sf, visited = new WeakSet(), path = []) {
        const previousIndex = path.indexOf(sf);
        // If the given node is already part of the current path, then a cycle has
        // been found. Add the reference chain which represents the cycle to the results.
        if (previousIndex !== -1) {
            return [path.slice(previousIndex)];
        }
        // If the node has already been visited, then it's not necessary to go check its edges
        // again. Cycles would have been already detected and collected in the first check.
        if (visited.has(sf)) {
            return [];
        }
        path.push(sf);
        visited.add(sf);
        // Go through all edges, which are determined through import/exports, and collect cycles.
        const result = [];
        for (const ref of getModuleReferences(sf)) {
            const targetFile = this._resolveImport(ref, sf.fileName);
            if (targetFile !== null) {
                result.push(...this.findCycles(this.getSourceFile(targetFile), visited, path.slice()));
            }
        }
        return result;
    }
    /** Gets the TypeScript source file of the specified path. */
    getSourceFile(filePath) {
        const resolvedPath = path.resolve(filePath);
        if (this._sourceFileCache.has(resolvedPath)) {
            return this._sourceFileCache.get(resolvedPath);
        }
        const fileContent = fs.readFileSync(resolvedPath, 'utf8');
        const sourceFile = ts.createSourceFile(resolvedPath, fileContent, ts.ScriptTarget.Latest, false);
        this._sourceFileCache.set(resolvedPath, sourceFile);
        return sourceFile;
    }
    /** Resolves the given import specifier with respect to the specified containing file path. */
    _resolveImport(specifier, containingFilePath) {
        if (specifier.charAt(0) === '.') {
            const resolvedPath = this._resolveFileSpecifier(specifier, containingFilePath);
            if (resolvedPath === null) {
                this._trackUnresolvedFileImport(specifier, containingFilePath);
            }
            return resolvedPath;
        }
        if (this.resolveModuleFn) {
            const targetFile = this.resolveModuleFn(specifier);
            if (targetFile !== null) {
                const resolvedPath = this._resolveFileSpecifier(targetFile);
                if (resolvedPath !== null) {
                    return resolvedPath;
                }
            }
        }
        this.unresolvedModules.add(specifier);
        return null;
    }
    /** Tracks the given file import as unresolved. */
    _trackUnresolvedFileImport(specifier, originFilePath) {
        if (!this.unresolvedFiles.has(originFilePath)) {
            this.unresolvedFiles.set(originFilePath, [specifier]);
        }
        this.unresolvedFiles.get(originFilePath).push(specifier);
    }
    /** Resolves the given import specifier to the corresponding source file. */
    _resolveFileSpecifier(specifier, containingFilePath) {
        const importFullPath = containingFilePath !== undefined ? path.join(path.dirname(containingFilePath), specifier) : specifier;
        const stat = getFileStatus(importFullPath);
        if (stat && stat.isFile()) {
            return importFullPath;
        }
        for (const extension of this.extensions) {
            const pathWithExtension = `${importFullPath}.${extension}`;
            const stat = getFileStatus(pathWithExtension);
            if (stat && stat.isFile()) {
                return pathWithExtension;
            }
        }
        // Directories should be considered last. TypeScript first looks for source files, then
        // falls back to directories if no file with appropriate extension could be found.
        if (stat && stat.isDirectory()) {
            return this._resolveFileSpecifier(path.join(importFullPath, 'index'));
        }
        return null;
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
 * Loads the configuration for the circular dependencies test. If the config cannot be
 * loaded, an error will be printed and the process exists with a non-zero exit code.
 */
function loadTestConfig(configPath) {
    const configBaseDir = path.dirname(configPath);
    const resolveRelativePath = (relativePath) => path.resolve(configBaseDir, relativePath);
    try {
        const config = require(configPath);
        if (!path.isAbsolute(config.baseDir)) {
            config.baseDir = resolveRelativePath(config.baseDir);
        }
        if (!path.isAbsolute(config.goldenFile)) {
            config.goldenFile = resolveRelativePath(config.goldenFile);
        }
        if (!path.isAbsolute(config.glob)) {
            config.glob = resolveRelativePath(config.glob);
        }
        return config;
    }
    catch (e) {
        error('Could not load test configuration file at: ' + configPath);
        error(`Failed with: ${e.message}`);
        process.exit(1);
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
 * Converts a list of reference chains to a JSON-compatible golden object. Reference chains
 * by default use TypeScript source file objects. In order to make those chains printable,
 * the source file objects are mapped to their relative file names.
 */
function convertReferenceChainToGolden(refs, baseDir) {
    return refs
        .map(
    // Normalize cycles as the paths can vary based on which node in the cycle is visited
    // first in the analyzer. The paths represent cycles. Hence we can shift nodes in a
    // deterministic way so that the goldens don't change unnecessarily and cycle comparison
    // is simpler.
    chain => normalizeCircularDependency(chain.map(({ fileName }) => convertPathToForwardSlash(path.relative(baseDir, fileName)))))
        // Sort cycles so that the golden doesn't change unnecessarily when cycles are detected
        // in different order (e.g. new imports cause cycles to be detected earlier or later).
        .sort(compareCircularDependency);
}
/**
 * Compares the specified goldens and returns two lists that describe newly
 * added circular dependencies, or fixed circular dependencies.
 */
function compareGoldens(actual, expected) {
    const newCircularDeps = [];
    const fixedCircularDeps = [];
    actual.forEach(a => {
        if (!expected.find(e => isSameCircularDependency(a, e))) {
            newCircularDeps.push(a);
        }
    });
    expected.forEach(e => {
        if (!actual.find(a => isSameCircularDependency(e, a))) {
            fixedCircularDeps.push(e);
        }
    });
    return { newCircularDeps, fixedCircularDeps };
}
/**
 * Normalizes the a circular dependency by ensuring that the path starts with the first
 * node in alphabetical order. Since the path array represents a cycle, we can make a
 * specific node the first element in the path that represents the cycle.
 *
 * This method is helpful because the path of circular dependencies changes based on which
 * file in the path has been visited first by the analyzer. e.g. Assume we have a circular
 * dependency represented as: `A -> B -> C`. The analyzer will detect this cycle when it
 * visits `A`. Though when a source file that is analyzed before `A` starts importing `B`,
 * the cycle path will detected as `B -> C -> A`. This represents the same cycle, but is just
 * different due to a limitation of using a data structure that can be written to a text-based
 * golden file.
 *
 * To account for this non-deterministic behavior in goldens, we shift the circular
 * dependency path to the first node based on alphabetical order. e.g. `A` will always
 * be the first node in the path that represents the cycle.
 */
function normalizeCircularDependency(path) {
    if (path.length <= 1) {
        return path;
    }
    let indexFirstNode = 0;
    let valueFirstNode = path[0];
    // Find a node in the cycle path that precedes all other elements
    // in terms of alphabetical order.
    for (let i = 1; i < path.length; i++) {
        const value = path[i];
        if (value.localeCompare(valueFirstNode, 'en') < 0) {
            indexFirstNode = i;
            valueFirstNode = value;
        }
    }
    // If the alphabetically first node is already at start of the path, just
    // return the actual path as no changes need to be made.
    if (indexFirstNode === 0) {
        return path;
    }
    // Move the determined first node (as of alphabetical order) to the start of a new
    // path array. The nodes before the first node in the old path are then concatenated
    // to the end of the new path. This is possible because the path represents a cycle.
    return [...path.slice(indexFirstNode), ...path.slice(0, indexFirstNode)];
}
/** Checks whether the specified circular dependencies are equal. */
function isSameCircularDependency(actual, expected) {
    if (actual.length !== expected.length) {
        return false;
    }
    for (let i = 0; i < actual.length; i++) {
        if (actual[i] !== expected[i]) {
            return false;
        }
    }
    return true;
}
/**
 * Compares two circular dependencies by respecting the alphabetic order of nodes in the
 * cycle paths. The first nodes which don't match in both paths are decisive on the order.
 */
function compareCircularDependency(a, b) {
    // Go through nodes in both cycle paths and determine whether `a` should be ordered
    // before `b`. The first nodes which don't match decide on the order.
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        const compareValue = a[i].localeCompare(b[i], 'en');
        if (compareValue !== 0) {
            return compareValue;
        }
    }
    // If all nodes are equal in the cycles, the order is based on the length of both cycles.
    return a.length - b.length;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function tsCircularDependenciesBuilder(localYargs) {
    return localYargs.help()
        .strict()
        .demandCommand()
        .option('config', { type: 'string', demandOption: true, description: 'Path to the configuration file.' })
        .option('warnings', { type: 'boolean', description: 'Prints all warnings.' })
        .command('check', 'Checks if the circular dependencies have changed.', args => args, argv => {
        const { config: configArg, warnings } = argv;
        const configPath = path.isAbsolute(configArg) ? configArg : path.resolve(configArg);
        const config = loadTestConfig(configPath);
        process.exit(main(false, config, !!warnings));
    })
        .command('approve', 'Approves the current circular dependencies.', args => args, argv => {
        const { config: configArg, warnings } = argv;
        const configPath = path.isAbsolute(configArg) ? configArg : path.resolve(configArg);
        const config = loadTestConfig(configPath);
        process.exit(main(true, config, !!warnings));
    });
}
/**
 * Runs the ts-circular-dependencies tool.
 * @param approve Whether the detected circular dependencies should be approved.
 * @param config Configuration for the current circular dependencies test.
 * @param printWarnings Whether warnings should be printed out.
 * @returns Status code.
 */
function main(approve, config, printWarnings) {
    const { baseDir, goldenFile, glob: glob$1, resolveModule, approveCommand } = config;
    const analyzer = new Analyzer(resolveModule);
    const cycles = [];
    const checkedNodes = new WeakSet();
    glob.sync(glob$1, { absolute: true, ignore: ['**/node_modules/**'] }).forEach(filePath => {
        const sourceFile = analyzer.getSourceFile(filePath);
        cycles.push(...analyzer.findCycles(sourceFile, checkedNodes));
    });
    const actual = convertReferenceChainToGolden(cycles, baseDir);
    info(green(`   Current number of cycles: ${yellow(cycles.length.toString())}`));
    if (approve) {
        fs.writeFileSync(goldenFile, JSON.stringify(actual, null, 2));
        info(green('✅  Updated golden file.'));
        return 0;
    }
    else if (!fs.existsSync(goldenFile)) {
        error(red(`❌  Could not find golden file: ${goldenFile}`));
        return 1;
    }
    const warningsCount = analyzer.unresolvedFiles.size + analyzer.unresolvedModules.size;
    // By default, warnings for unresolved files or modules are not printed. This is because
    // it's common that third-party modules are not resolved/visited. Also generated files
    // from the View Engine compiler (i.e. factories, summaries) cannot be resolved.
    if (printWarnings && warningsCount !== 0) {
        info(yellow('⚠  The following imports could not be resolved:'));
        Array.from(analyzer.unresolvedModules).sort().forEach(specifier => info(`  • ${specifier}`));
        analyzer.unresolvedFiles.forEach((value, key) => {
            info(`  • ${getRelativePath(baseDir, key)}`);
            value.sort().forEach(specifier => info(`      ${specifier}`));
        });
    }
    else {
        info(yellow(`⚠  ${warningsCount} imports could not be resolved.`));
        info(yellow(`   Please rerun with "--warnings" to inspect unresolved imports.`));
    }
    const expected = JSON.parse(fs.readFileSync(goldenFile, 'utf8'));
    const { fixedCircularDeps, newCircularDeps } = compareGoldens(actual, expected);
    const isMatching = fixedCircularDeps.length === 0 && newCircularDeps.length === 0;
    if (isMatching) {
        info(green('✅  Golden matches current circular dependencies.'));
        return 0;
    }
    error(red('❌  Golden does not match current circular dependencies.'));
    if (newCircularDeps.length !== 0) {
        error(yellow(`   New circular dependencies which are not allowed:`));
        newCircularDeps.forEach(c => error(`     • ${convertReferenceChainToString(c)}`));
        error();
    }
    if (fixedCircularDeps.length !== 0) {
        error(yellow(`   Fixed circular dependencies that need to be removed from the golden:`));
        fixedCircularDeps.forEach(c => error(`     • ${convertReferenceChainToString(c)}`));
        info(yellow(`\n   Total: ${newCircularDeps.length} new cycle(s), ${fixedCircularDeps.length} fixed cycle(s). \n`));
        if (approveCommand) {
            info(yellow(`   Please approve the new golden with: ${approveCommand}`));
        }
        else {
            info(yellow(`   Please update the golden. The following command can be ` +
                `run: yarn ts-circular-deps approve ${getRelativePath(process.cwd(), goldenFile)}.`));
        }
    }
    return 1;
}
/** Gets the specified path relative to the base directory. */
function getRelativePath(baseDir, path$1) {
    return convertPathToForwardSlash(path.relative(baseDir, path$1));
}
/** Converts the given reference chain to its string representation. */
function convertReferenceChainToString(chain) {
    return chain.join(' → ');
}

yargs.scriptName('ng-dev')
    .middleware(captureLogOutputForCommand)
    .demandCommand()
    .recommendCommands()
    .command('commit-message <command>', '', buildCommitMessageParser)
    .command('format <command>', '', buildFormatParser)
    .command('pr <command>', '', buildPrParser)
    .command('pullapprove <command>', '', buildPullapproveParser)
    .command('release <command>', '', buildReleaseParser)
    .command('ts-circular-deps <command>', '', tsCircularDependenciesBuilder)
    .command('caretaker <command>', '', buildCaretakerParser)
    .command('ngbot <command>', false, buildNgbotParser)
    .wrap(120)
    .strict()
    .parse();
