# Update example dependencies

The dependencies of the example apps (including Angular, Angular Material and Angular CLI) are automatically updated using [Renovate](https://renovatebot.com/).

However, it is useful to periodically also manually update the apps to more closely match (in file layout, configs, etc.) what a new Angular CLI app would look like.
This is typically only needed once for each new major Angular version.

Since the examples are Angular CLI apps, we can take advantage of `ng update` to apply migrations.

Follow these steps to align the example apps with new CLI apps.

> **Note:**
> The following steps assume that the related Angular dependencies have already been updated in [shared/package.json](./shared/package.json) (for example, automatically by Renovate).

- Determine (for example, by examining git history) what is the last versions for which this process was performed.
  These will be referred to as `<FROM_VERSION_*>`.
  If you can't determine these, use arbitrary versions, such as the previous major version.

- In the [shared/](./shared) directory, run `yarn` to ensure the dependencies are installed in the [shared/node_modules/](./shared/node_modules) directory.
  This command will also ensure that the dependency versions of the `package.json` files in each sub-folder of [shared/boilerplate/](./shared/boilerplate) match the ones in [shared/package.json](./shared/package.json).

- Follow the steps in the following section to update the rest of the boilerplate files.


## Update other boilerplate files

The Angular CLI default setup is updated using `ng update`.
Any necessary changes to boilerplate files will be done automatically through migration schematics.

> **Note:**
> Migrations affecting source code files will not happen automatically, because `ng update` does not know about all the examples in `aio/content/examples/`.
> You have to make these changes (if any) manually.
> The [angular-cli-diff](https://github.com/cexbrayat/angular-cli-diff) repo can be a useful resource for discovering changes between versions.

- In the [shared/boilerplate/cli/](./shared/boilerplate/cli) directory, run the following commands to automatically apply any available migrations to the boilerplate project:
  ```sh
  # Ensure dependencies are installed.
  yarn install

  # Migrate project to new versions.
  yarn ng update @angular/cli --allow-dirty --migrate-only --from=<FROM_VERSION_CLI>
  yarn ng update @angular/core --allow-dirty --migrate-only --from=<FROM_VERSION_ANGULAR>
  ```

  > **Note:**
  > In order for `ng update` to work, there must be a `node_modules/` directory with installed dependencies inside the [shared/boilerplate/cli/](./shared/boilerplate/cli) directory.
  > This `node_modules/` directory is only needed during the update operation and is otherwise ignored (both by git and by the [example-boilerplate.js](./example-boilerplate.js) script) by means of the [shared/boilerplate/.gitignore](./shared/boilerplate/.gitignore) file.

- Inspect [shared/package.json](./shared/package.json) to determine what is the current version of Angular CLI (i.e. `@angular/cli`) used in the example apps.
  This will be referred to as `<TO_VERSION_CLI>`.

- Use the [angular-cli-diff](https://github.com/cexbrayat/angular-cli-diff) repository to discover more changes (which are not automatically applied via `ng update` migrations) between Angular CLI apps of different versions.
  Visit https://github.com/cexbrayat/angular-cli-diff/compare/<FROM_VERSION_CLI>...<TO_VERSION_CLI>, inspect the changes between the two versions and apply the ones that make sense to the boilerplate files inside [shared/boilerplate/cli/](./shared/boilerplate/cli).

- The previous steps made any necessary changes to boilerplate files inside the `cli/` directory, but the same changes need to be applied to the other CLI-based boilerplate directories.
  Inspect the changes in `cli/` and manually apply the necessary ones to other CLI-based boilerplate directories.

- Also ensure that any relevant changes in the [shared/boilerplate/cli/](./shared/boilerplate/cli) directory are copied to the [shared/example-scaffold/](./shared/example-scaffold) directory, which is used when creating new examples (via `yarn create-example ...`).
  Only files that would not be considered boilerplate should be added to the `example-scaffold/` directory.

- Run the following command to list all the boilerplate files that are overridden in specific examples.
  ```sh
  node aio/tools/examples/example-boilerplate.js list-overrides
  ```
  Inspect each of these files to determine whether they need to be updated.

- Inspect the changes and determine whether some of them need to be applied to the `systemjs` boilerplate files.

- Inspect the changes and determine whether any updates to guides are necessary.
  For example, if a file is renamed or moved, any guides mentioning that file may need updating to refer to the new name/location.

- Finally, commit all changes and [submit a pull request](../../../CONTRIBUTING.md#submit-pr).
