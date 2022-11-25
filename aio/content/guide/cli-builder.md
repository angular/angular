# Angular CLI builders

A number of Angular CLI commands run a complex process on your code, such as linting, building, or testing.
The commands use an internal tool called Architect to run *CLI builders*, which apply another tool to accomplish the wanted task.

With Angular version 8, the CLI Builder API is stable and available to developers who want to customize the Angular CLI by adding or modifying commands.
For example, you could supply a builder to perform an entirely new task, or to change which third-party tool is used by an existing command.

This document explains how CLI builders integrate with the workspace configuration file, and shows how you can create your own builder.

<div class="alert is-helpful">

Find the code from the examples used here in this [GitHub repository](https://github.com/mgechev/cli-builders-demo).

</div>

## CLI builders

The internal Architect tool delegates work to handler functions called [*builders*](guide/glossary#builder).
A builder handler function receives two arguments; a set of input `options` \(a JSON object\), and a `context` \(a `BuilderContext` object\).

The separation of concerns here is the same as with [schematics](guide/glossary#schematic), which are used for other CLI commands that touch your code \(such as `ng generate`\).

*   The `options` object is provided by the CLI user, while the `context` object is provided by the CLI Builder API
*   In addition to the contextual information, the `context` object, which is an instance of the `BuilderContext`, also provides access to a scheduling method, `context.scheduleTarget()`.
    The scheduler executes the builder handler function with a given [target configuration](guide/glossary#target).

The builder handler function can be synchronous \(return a value\) or asynchronous \(return a Promise\), or it can watch and return multiple values \(return an Observable\).
The return value or values must always be of type `BuilderOutput`.
This object contains a Boolean `success` field and an optional `error` field that can contain an error message.

Angular provides some builders that are used by the CLI for commands such as `ng build` and `ng test`.
Default target configurations for these and other built-in CLI builders can be found \(and customized\) in the "architect" section of the [workspace configuration file](guide/workspace-config), `angular.json`.
Also, extend and customize Angular by creating your own builders, which you can run using the [`ng run` CLI command](cli/run).

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

Publish the builder to `npm` \(see [Publishing your Library](guide/creating-libraries#publishing-your-library)\).
If you publish it as `@example/my-builder`, install it using the following command.

<code-example format="shell" language="shell">

npm install &commat;example/my-builder

</code-example>

## Creating a builder

As an example, create a builder that copies a file.
To create a builder, use the `createBuilder()` CLI Builder function, and return a `Promise<BuilderOutput>` object.

<code-example header="src/my-builder.ts (builder skeleton)" path="cli-builder/src/my-builder.ts" region="builder-skeleton"></code-example>

Now let's add some logic to it.
The following code retrieves the source and destination file paths from user options and copies the file from the source to the destination \(using the [Promise version of the built-in NodeJS `copyFile()` function](https://nodejs.org/api/fs.html#fs_fspromises_copyfile_src_dest_mode)\).
If the copy operation fails, it returns an error with a message about the underlying problem.

<code-example header="src/my-builder.ts (builder)" path="cli-builder/src/my-builder.ts" region="builder"></code-example>

### Handling output

By default, `copyFile()` does not print anything to the process standard output or error.
If an error occurs, it might be difficult to understand exactly what the builder was trying to do when the problem occurred.
Add some additional context by logging additional information using the `Logger` API.
This also lets the builder itself be executed in a separate process, even if the standard output and error are deactivated \(as in an [Electron app](https://electronjs.org)\).

You can retrieve a `Logger` instance from the context.

<code-example header="src/my-builder.ts (handling output)" path="cli-builder/src/my-builder.ts" region="handling-output"></code-example>

### Progress and status reporting

The CLI Builder API includes progress and status reporting tools, which can provide hints for certain functions and interfaces.

To report progress, use the `context.reportProgress()` method, which takes a current value, \(optional\) total, and status string as arguments.
The total can be any number; for example, if you know how many files you have to process, the total could be the number of files, and current should be the number processed so far.
The status string is unmodified unless you pass in a new string value.

You can see an [example](https://github.com/angular/angular-cli/blob/ba21c855c0c8b778005df01d4851b5a2176edc6f/packages/angular_devkit/build_angular/src/tslint/index.ts#L107) of how the `tslint` builder reports progress.

In our example, the copy operation either finishes or is still executing, so there's no need for a progress report, but you can report status so that a parent builder that called our builder would know what's going on.
Use the `context.reportStatus()` method to generate a status string of any length.

<div class="alert is-helpful">

**NOTE**: <br />
There's no guarantee that a long string will be shown entirely; it could be cut to fit the UI that displays it.

</div>

Pass an empty string to remove the status.

<code-example header="src/my-builder.ts (progress reporting)" path="cli-builder/src/my-builder.ts" region="progress-reporting"></code-example>

## Builder input

You can invoke a builder indirectly through a CLI command, or directly with the Angular CLI `ng run` command.
In either case, you must provide required inputs, but can let other inputs default to values that are pre-configured for a specific [*target*](guide/glossary#target), provide a pre-defined, named override configuration, and provide further override option values on the command line.

### Input validation

You define builder inputs in a JSON schema associated with that builder.
The Architect tool collects the resolved input values into an `options` object, and validates their types against the schema before passing them to the builder function.
\(The Schematics library does the same kind of validation of user input.\)

For our example builder, you expect the `options` value to be a `JsonObject` with two keys:
A `source` and a `destination`, each of which are a string.

You can provide the following schema for type validation of these values.

<code-example header="src/schema.json" format="json" language="json">

{
  "&dollar;schema": "http://json-schema.org/schema",
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

</code-example>

<div class="alert is-helpful">

This is a very simple example, but the use of a schema for validation can be very powerful.
For more information, see the [JSON schemas website](http://json-schema.org).

</div>

To link our builder implementation with its schema and name, you need to create a *builder definition* file, which you can point to in `package.json`.

Create a file named `builders.json` that looks like this:

<code-example header="builders.json" format="json" language="json">

{
  "builders": {
    "copy": {
      "implementation": "./dist/my-builder.js",
      "schema": "./src/schema.json",
      "description": "Copies a file."
    }
  }
}

</code-example>

In the `package.json` file, add a `builders` key that tells the Architect tool where to find our builder definition file.

<code-example header="package.json" format="json" language="json">

{
  "name": "&commat;example/copy-file",
  "version": "1.0.0",
  "description": "Builder for copying files",
  "builders": "builders.json",
  "dependencies": {
    "&commat;angular-devkit/architect": "~0.1200.0",
    "&commat;angular-devkit/core": "^12.0.0"
  }
}

</code-example>

The official name of our builder is now ` @example/copy-file:copy`.
The first part of this is the package name \(resolved using node resolution\), and the second part is the builder name \(resolved using the `builders.json` file\).

Using one of our `options` is very straightforward.
You did this in the previous section when you accessed `options.source` and `options.destination`.

<code-example header="src/my-builder.ts (report status)" path="cli-builder/src/my-builder.ts" region="report-status"></code-example>

### Target configuration

A builder must have a defined target that associates it with a specific input configuration and [project](guide/glossary#project).

Targets are defined in the `angular.json` [CLI configuration file](guide/workspace-config).
A target specifies the builder to use, its default options configuration, and named alternative configurations.
The Architect tool uses the target definition to resolve input options for a given run.

The `angular.json` file has a section for each project, and the "architect" section of each project configures targets for builders used by CLI commands such as 'build', 'test', and 'lint'.
By default, for example, the `build` command runs the builder `@angular-devkit/build-angular:browser` to perform the build task, and passes in default option values as specified for the `build` target in `angular.json`.

<code-example format="json" header="angular.json" language="json">
{
  "myApp": {
    &hellip;
    "architect": {
      "build": {
        "builder": "&commat;angular-devkit/build-angular:browser",
        "options": {
          "outputPath": "dist/myApp",
          "index": "src/index.html",
          &hellip;
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
            &hellip;
          }
        }
      },
      &hellip;

</code-example>

The command passes the builder the set of default options specified in the "options" section.
If you pass the `--configuration=production` flag, it uses the override values specified in the `production` alternative configuration.
Specify further option overrides individually on the command line.
You might also add more alternative configurations to the `build` target, to define other environments such as `stage` or `qa`.

#### Target strings

The generic `ng run` CLI command takes as its first argument a target string of the following form.

<code-example format="shell" language="shell">

project:target[:configuration]

</code-example>

|               | Details |
|:---           |:---     |
| project       | The name of the Angular CLI project that the target is associated with.                                                 |
| target        | A named builder configuration from the `architect` section of the `angular.json` file.                                  |
| configuration | \(optional\) The name of a specific configuration override for the given target, as defined in the `angular.json` file. |

If your builder calls another builder, it might need to read a passed target string.
Parse this string into an object by using the `targetFromTargetString()` utility function from `@angular-devkit/architect`.

## Schedule and run

Architect runs builders asynchronously.
To invoke a builder, you schedule a task to be run when all configuration resolution is complete.

The builder function is not executed until the scheduler returns a `BuilderRun` control object.
The CLI typically schedules tasks by calling the `context.scheduleTarget()` function, and then resolves input options using the target definition in the `angular.json` file.

Architect resolves input options for a given target by taking the default options object, then overwriting values from the configuration used \(if any\), then further overwriting values from the overrides object passed to `context.scheduleTarget()`.
For the Angular CLI, the overrides object is built from command line arguments.

Architect validates the resulting options values against the schema of the builder.
If inputs are valid, Architect creates the context and executes the builder.

For more information see [Workspace Configuration](guide/workspace-config).

<div class="alert is-helpful">

You can also invoke a builder directly from another builder or test by calling `context.scheduleBuilder()`.
You pass an `options` object directly to the method, and those option values are validated against the schema of the builder without further adjustment.

Only the  `context.scheduleTarget()` method resolves the configuration and overrides through the `angular.json` file.

</div>

### Default architect configuration

Let's create a simple `angular.json` file that puts target configurations into context.

You can publish the builder to npm \(see [Publishing your Library](guide/creating-libraries#publishing-your-library)\), and install it using the following command:

<code-example format="shell" language="shell">

npm install &commat;example/copy-file

</code-example>

If you create a new project with `ng new builder-test`, the generated `angular.json` file looks something like this, with only default builder configurations.

<code-example format="json" header="angular.json" language="json">

{
  // &hellip;
  "projects": {
    // &hellip;
    "builder-test": {
      // &hellip;
      "architect": {
        // &hellip;
        "build": {
          "builder": "&commat;angular-devkit/build-angular:browser",
          "options": {
            // &hellip; more options&hellip;
            "outputPath": "dist/builder-test",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "src/tsconfig.app.json"
          },
          "configurations": {
            "production": {
              // &hellip; more options&hellip;
              "optimization": true,
              "aot": true,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
  // &hellip;
}

</code-example>

### Adding a target

Add a new target that will run our builder to copy a file.
This target tells the builder to copy the `package.json` file.

You need to update the `angular.json` file to add a target for this builder to the "architect" section of our new project.

*   We'll add a new target section to the "architect" object for our project
*   The target named "copy-package" uses our builder, which you published to `@example/copy-file`.
    \(See [Publishing your Library](guide/creating-libraries#publishing-your-library).\)

*   The options object provides default values for the two inputs that you defined; `source`, which is the existing file you are copying, and `destination`, the path you want to copy to
*   The `configurations` key is optional, we'll leave it out for now

<code-example format="json" header="angular.json" language="json">

{
  "projects": {
    "builder-test": {
      "architect": {
        "copy-package": {
          "builder": "&commat;example/copy-file:copy",
          "options": {
            "source": "package.json",
            "destination": "package-copy.json"
          }
        },
        "build": {
          "builder": "&commat;angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/builder-test",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "src/tsconfig.app.json"
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
              "aot": true,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
}

</code-example>

### Running the builder

To run our builder with the new target's default configuration, use the following CLI command.

<code-example format="shell" language="shell">

ng run builder-test:copy-package

</code-example>

This copies the `package.json` file to `package-copy.json`.

Use command-line arguments to override the configured defaults.
For example, to run with a different `destination` value, use the following CLI command.

<code-example format="shell" language="shell">

ng run builder-test:copy-package --destination=package-other.json

</code-example>

This copies the file to `package-other.json` instead of `package-copy.json`.
Because you did not override the *source* option, it will copy from the `package.json` file \(the default value provided for the target\).

## Testing a builder

Use integration testing for your builder, so that you can use the Architect scheduler to create a context, as in this [example](https://github.com/mgechev/cli-builders-demo).

*   In the builder source directory, you have created a new test file `my-builder.spec.ts`.
    The code creates new instances of `JsonSchemaRegistry` \(for schema validation\), `TestingArchitectHost` \(an in-memory implementation of `ArchitectHost`\), and `Architect`.

*   We've added a `builders.json` file next to the builder's `package.json` file, and modified the package file to point to it.

Here's an example of a test that runs the copy file builder.
The test uses the builder to copy the `package.json` file and validates that the copied file's contents are the same as the source.

<code-example header="src/my-builder.spec.ts" path="cli-builder/src/my-builder.spec.ts"></code-example>

<div class="alert is-helpful">

When running this test in your repo, you need the [`ts-node`](https://github.com/TypeStrong/ts-node) package.
You can avoid this by renaming `my-builder.spec.ts` to `my-builder.spec.js`.

</div>

### Watch mode

Architect expects builders to run once \(by default\) and return.
This behavior is not entirely compatible with a builder that watches for changes \(like Webpack, for example\).
Architect can support watch mode, but there are some things to look out for.

*   To be used with watch mode, a builder handler function should return an Observable.
    Architect subscribes to the Observable until it completes and might reuse it if the builder is scheduled again with the same arguments.

*   The builder should always emit a `BuilderOutput` object after each execution.
    Once it's been executed, it can enter a watch mode, to be triggered by an external event.
    If an event triggers it to restart, the builder should execute the `context.reportRunning()` function to tell Architect that it is running again.
    This prevents Architect from stopping the builder if another run is scheduled.

When your builder calls `BuilderRun.stop()` to exit watch mode, Architect unsubscribes from the builder's Observable and calls the builder's teardown logic to clean up.
\(This behavior also allows for long-running builds to be stopped and cleaned up.\)

In general, if your builder is watching an external event, you should separate your run into three phases.

| Phases     | Details |
|:---        |:---     |
| Running    | For example, webpack compiles. This ends when webpack finishes and your builder emits a `BuilderOutput` object.                                                                                                                                              |
| Watching   | Between two runs, watch an external event stream. For example, webpack watches the file system for any changes. This ends when webpack restarts building, and `context.reportRunning()` is called. This goes back to step 1.                                 |
| Completion | Either the task is fully completed \(for example, webpack was supposed to run a number of times\), or the builder run was stopped \(using `BuilderRun.stop()`\). Your teardown logic is executed, and Architect unsubscribes from your builder's Observable. |

## Summary

The CLI Builder API provides a new way of changing the behavior of the Angular CLI by using builders to execute custom logic.

*   Builders can be synchronous or asynchronous, execute once or watch for external events, and can schedule other builders or targets
*   Builders have option defaults specified in the `angular.json` configuration file, which can be overwritten by an alternate configuration for the target, and further overwritten by command line flags

*   We recommend that you use integration tests to test Architect builders.
    Use unit tests to validate the logic that the builder executes.

*   If your builder returns an Observable, it should clean up in the teardown logic of that Observable

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
