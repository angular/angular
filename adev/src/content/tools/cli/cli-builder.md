# Angular CLI builders

A number of Angular CLI commands run a complex process on your code, such as building, testing, or serving your application.
The commands use an internal tool called Architect to run *CLI builders*, which invoke another tool (bundler, test runner, server) to accomplish the desired task.
Custom builders can perform an entirely new task, or to change which third-party tool is used by an existing command.

This document explains how CLI builders integrate with the workspace configuration file, and shows how you can create your own builder.

HELPFUL: Find the code from the examples used here in this [GitHub repository](https://github.com/mgechev/cli-builders-demo).

## CLI builders

The internal Architect tool delegates work to handler functions called *builders*.
A builder handler function receives two arguments:

| Argument  | Type             |
|:---       |:---              |
| `options` | `JSONObject`     |
| `context` | `BuilderContext` |

The separation of concerns here is the same as with [schematics](tools/cli/schematics-authoring), which are used for other CLI commands that touch your code (such as `ng generate`).

* The `options` object is provided by the CLI user's options and configuration, while the `context` object is provided by the CLI Builder API automatically.
* In addition to the contextual information, the `context` object also provides access to a scheduling method, `context.scheduleTarget()`.
    The scheduler executes the builder handler function with a given target configuration.

The builder handler function can be synchronous (return a value), asynchronous (return a `Promise`), or watch and return multiple values (return an `Observable`).
The return values must always be of type `BuilderOutput`.
This object contains a Boolean `success` field and an optional `error` field that can contain an error message.

Angular provides some builders that are used by the CLI for commands such as `ng build` and `ng test`.
Default target configurations for these and other built-in CLI builders can be found and configured in the "architect" section of the [workspace configuration file](reference/configs/workspace-config), `angular.json`.
Also, extend and customize Angular by creating your own builders, which you can run directly using the [`ng run` CLI command](cli/run).

### Builder project structure

A builder resides in a "project" folder that is similar in structure to an Angular workspace, with global configuration files at the top level, and more specific configuration in a source folder with the code files that define the behavior.
For example, your `myBuilder` folder could contain the following files.

| Files                    | Purpose                                                                                                   |
|:---                      | :---                                                                                                      |
| `src/my-builder.ts`      | Main source file for the builder definition.                                                              |
| `src/my-builder.spec.ts` | Source file for tests.                                                                                    |
| `src/schema.json`        | Definition of builder input options.                                                                      |
| `builders.json`          | Builders definition.                                                                                      |
| `package.json`           | Dependencies. See [https://docs.npmjs.com/files/package.json](https://docs.npmjs.com/files/package.json). |
| `tsconfig.json`          | [TypeScript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).              |

Builders can be published to `npm`, see [Publishing your Library](tools/libraries/creating-libraries).

## Creating a builder

As an example, create a builder that copies a file to a new location.
To create a builder, use the `createBuilder()` CLI Builder function, and return a `Promise<BuilderOutput>` object.

<docs-code header="src/my-builder.ts (builder skeleton)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" visibleRegion="builder-skeleton"/>

Now let's add some logic to it.
The following code retrieves the source and destination file paths from user options and copies the file from the source to the destination \(using the [Promise version of the built-in NodeJS `copyFile()` function](https://nodejs.org/api/fs.html#fs_fspromises_copyfile_src_dest_mode)\).
If the copy operation fails, it returns an error with a message about the underlying problem.

<docs-code header="src/my-builder.ts (builder)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" visibleRegion="builder"/>

### Handling output

By default, `copyFile()` does not print anything to the process standard output or error.
If an error occurs, it might be difficult to understand exactly what the builder was trying to do when the problem occurred.
Add some additional context by logging additional information using the `Logger` API.
This also lets the builder itself be executed in a separate process, even if the standard output and error are deactivated.

You can retrieve a `Logger` instance from the context.

<docs-code header="src/my-builder.ts (handling output)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" visibleRegion="handling-output"/>

### Progress and status reporting

The CLI Builder API includes progress and status reporting tools, which can provide hints for certain functions and interfaces.

To report progress, use the `context.reportProgress()` method, which takes a current value, optional total, and status string as arguments.
The total can be any number. For example, if you know how many files you have to process, the total could be the number of files, and current should be the number processed so far.
The status string is unmodified unless you pass in a new string value.

In our example, the copy operation either finishes or is still executing, so there's no need for a progress report, but you can report status so that a parent builder that called our builder would know what's going on.
Use the `context.reportStatus()` method to generate a status string of any length.

HELPFUL: There's no guarantee that a long string will be shown entirely; it could be cut to fit the UI that displays it.

Pass an empty string to remove the status.

<docs-code header="src/my-builder.ts (progress reporting)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" visibleRegion="progress-reporting"/>

## Builder input

You can invoke a builder indirectly through a CLI command such as `ng build`, or directly with the Angular CLI `ng run` command.
In either case, you must provide required inputs, but can let other inputs default to values that are pre-configured for a specific *target*, specified by a [configuration](tools/cli/environments), or set on the command line.

### Input validation

You define builder inputs in a JSON schema associated with that builder.
Similar to schematics, the Architect tool collects the resolved input values into an `options` object, and validates their types against the schema before passing them to the builder function.

For our example builder, `options` should be a `JsonObject` with two keys:
a `source` and a `destination`, each of which are a string.

You can provide the following schema for type validation of these values.

<docs-code header="src/schema.json" language="json">

{
  "$schema": "http://json-schema.org/schema",
  "type": "object",
  "properties": {
    "source": {
      "type": "string"
    },
    "destination": {
      "type": "string"
    }
  }
}

</docs-code>

HELPFUL: This is a minimal example, but the use of a schema for validation can be very powerful.
For more information, see the [JSON schemas website](http://json-schema.org).

To link our builder implementation with its schema and name, you need to create a *builder definition* file, which you can point to in `package.json`.

Create a file named `builders.json` that looks like this:

<docs-code header="builders.json" language="json">

{
  "builders": {
    "copy": {
      "implementation": "./dist/my-builder.js",
      "schema": "./src/schema.json",
      "description": "Copies a file."
    }
  }
}

</docs-code>

In the `package.json` file, add a `builders` key that tells the Architect tool where to find our builder definition file.

<docs-code header="package.json" language="json">

{
  "name": "@example/copy-file",
  "version": "1.0.0",
  "description": "Builder for copying files",
  "builders": "builders.json",
  "dependencies": {
    "@angular-devkit/architect": "~0.1200.0",
    "@angular-devkit/core": "^12.0.0"
  }
}

</docs-code>

The official name of our builder is now `@example/copy-file:copy`.
The first part of this is the package name and the second part is the builder name as specified in the `builders.json` file.

These values are accessed on `options.source` and `options.destination`.

<docs-code header="src/my-builder.ts (report status)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" visibleRegion="report-status"/>

### Target configuration

A builder must have a defined target that associates it with a specific input configuration and project.

Targets are defined in the `angular.json` [CLI configuration file](reference/configs/workspace-config).
A target specifies the builder to use, its default options configuration, and named alternative configurations.
Architect in the Angular CLI uses the target definition to resolve input options for a given run.

The `angular.json` file has a section for each project, and the "architect" section of each project configures targets for builders used by CLI commands such as 'build', 'test', and 'serve'.
By default, for example, the `ng build` command runs the builder `@angular-devkit/build-angular:browser` to perform the build task, and passes in default option values as specified for the `build` target in `angular.json`.

<docs-code header="angular.json" language="json">

…

"myApp": {
  …
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:browser",
      "options": {
        "outputPath": "dist/myApp",
        "index": "src/index.html",
        …
      },
      "configurations": {
        "production": {
          "fileReplacements": [
            {
              "replace": "src/environments/environment.ts",
              "with": "src/environments/environment.prod.ts"
            }
          ],
          "optimization": true,
          "outputHashing": "all",
          …
        }
      }
    },
    …
  }
}

…

</docs-code>

The command passes the builder the set of default options specified in the "options" section.
If you pass the `--configuration=production` flag, it uses the override values specified in the `production` configuration.
Specify further option overrides individually on the command line.

#### Target strings

The generic `ng run` CLI command takes as its first argument a target string of the following form.

<docs-code language="shell">

project:target[:configuration]

</docs-code>

|               | Details |
|:---           |:---     |
| project       | The name of the Angular CLI project that the target is associated with.                                               |
| target        | A named builder configuration from the `architect` section of the `angular.json` file.                                |
| configuration | (optional) The name of a specific configuration override for the given target, as defined in the `angular.json` file. |

If your builder calls another builder, it might need to read a passed target string.
Parse this string into an object by using the `targetFromTargetString()` utility function from `@angular-devkit/architect`.

## Schedule and run

Architect runs builders asynchronously.
To invoke a builder, you schedule a task to be run when all configuration resolution is complete.

The builder function is not executed until the scheduler returns a `BuilderRun` control object.
The CLI typically schedules tasks by calling the `context.scheduleTarget()` function, and then resolves input options using the target definition in the `angular.json` file.

Architect resolves input options for a given target by taking the default options object, then overwriting values from the configuration, then further overwriting values from the overrides object passed to `context.scheduleTarget()`.
For the Angular CLI, the overrides object is built from command line arguments.

Architect validates the resulting options values against the schema of the builder.
If inputs are valid, Architect creates the context and executes the builder.

For more information see [Workspace Configuration](reference/configs/workspace-config).

HELPFUL: You can also invoke a builder directly from another builder or test by calling `context.scheduleBuilder()`.
You pass an `options` object directly to the method, and those option values are validated against the schema of the builder without further adjustment.

Only the  `context.scheduleTarget()` method resolves the configuration and overrides through the `angular.json` file.

### Default architect configuration

Let's create a simple `angular.json` file that puts target configurations into context.

You can publish the builder to npm (see [Publishing your Library](tools/libraries/creating-libraries#publishing-your-library)), and install it using the following command:

<docs-code language="shell">

npm install @example/copy-file

</docs-code>

If you create a new project with `ng new builder-test`, the generated `angular.json` file looks something like this, with only default builder configurations.

<docs-code header="angular.json" language="json">

{
  "projects": {
    "builder-test": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            // more options...
            "outputPath": "dist/builder-test",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "src/tsconfig.app.json"
          },
          "configurations": {
            "production": {
              // more options...
              "optimization": true,
              "aot": true,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
}

</docs-code>

### Adding a target

Add a new target that will run our builder to copy a file.
This target tells the builder to copy the `package.json` file.

* We will add a new target section to the `architect` object for our project
* The target named `copy-package` uses our builder, which you published to `@example/copy-file`.
* The options object provides default values for the two inputs that you defined.
  * `source` - The existing file you are copying.
  * `destination` - The path you want to copy to.

<docs-code header="angular.json" language="json">

{
  "projects": {
    "builder-test": {
      "architect": {
        "copy-package": {
          "builder": "@example/copy-file:copy",
          "options": {
            "source": "package.json",
            "destination": "package-copy.json"
          }
        },

        // Existing targets...
      }
    }
  }
}

</docs-code>

### Running the builder

To run our builder with the new target's default configuration, use the following CLI command.

<docs-code language="shell">

ng run builder-test:copy-package

</docs-code>

This copies the `package.json` file to `package-copy.json`.

Use command-line arguments to override the configured defaults.
For example, to run with a different `destination` value, use the following CLI command.

<docs-code language="shell">

ng run builder-test:copy-package --destination=package-other.json

</docs-code>

This copies the file to `package-other.json` instead of `package-copy.json`.
Because you did not override the *source* option, it will still copy from the default `package.json` file.

## Testing a builder

Use integration testing for your builder, so that you can use the Architect scheduler to create a context, as in this [example](https://github.com/mgechev/cli-builders-demo).
In the builder source directory, create a new test file `my-builder.spec.ts`. The test creates new instances of `JsonSchemaRegistry` (for schema validation), `TestingArchitectHost` (an in-memory implementation of `ArchitectHost`), and `Architect`.

Here's an example of a test that runs the copy file builder.
The test uses the builder to copy the `package.json` file and validates that the copied file's contents are the same as the source.

<docs-code header="src/my-builder.spec.ts" path="adev/src/content/examples/cli-builder/src/my-builder.spec.ts"/>

HELPFUL: When running this test in your repo, you need the [`ts-node`](https://github.com/TypeStrong/ts-node) package.
You can avoid this by renaming `my-builder.spec.ts` to `my-builder.spec.js`.

### Watch mode

Most builders to run once and return. However, this behavior is not entirely compatible with a builder that watches for changes (like a devserver, for example).
Architect can support watch mode, but there are some things to look out for.

* To be used with watch mode, a builder handler function should return an `Observable`.
    Architect subscribes to the `Observable` until it completes and might reuse it if the builder is scheduled again with the same arguments.

* The builder should always emit a `BuilderOutput` object after each execution.
    Once it's been executed, it can enter a watch mode, to be triggered by an external event.
    If an event triggers it to restart, the builder should execute the `context.reportRunning()` function to tell Architect that it is running again.
    This prevents Architect from stopping the builder if another run is scheduled.

When your builder calls `BuilderRun.stop()` to exit watch mode, Architect unsubscribes from the builder's `Observable` and calls the builder's teardown logic to clean up.
This behavior also allows for long-running builds to be stopped and cleaned up.

In general, if your builder is watching an external event, you should separate your run into three phases.

| Phases     | Details |
|:---        |:---     |
| Running    | The task being performed, such as invoking a compiler. This ends when the compiler finishes and your builder emits a `BuilderOutput` object.                                                                                                  |
| Watching   | Between two runs, watch an external event stream. For example, watch the file system for any changes. This ends when the compiler restarts, and `context.reportRunning()` is called.                                                          |
| Completion | Either the task is fully completed, such as a compiler which needs to run a number of times, or the builder run was stopped (using `BuilderRun.stop()`). Architect executes teardown logic and unsubscribes from your builder's `Observable`. |

## Summary

The CLI Builder API provides a means of changing the behavior of the Angular CLI by using builders to execute custom logic.

* Builders can be synchronous or asynchronous, execute once or watch for external events, and can schedule other builders or targets.
* Builders have option defaults specified in the `angular.json` configuration file, which can be overwritten by an alternate configuration for the target, and further overwritten by command line flags
* The Angular team recommends that you use integration tests to test Architect builders. Use unit tests to validate the logic that the builder executes.
* If your builder returns an `Observable`, it should clean up the builder in the teardown logic of that `Observable`.
