# ng-update schematic

**Note** The CDK ng-update schematic is the foundation for the Angular Material update schematic.
This is achieved by making the ng-update code for the CDK as reusable as possible.

This document also applies for the Angular Material `ng-update`.

---

The `ng-update` schematic consists of multiple migration entry-points where every entry-point
targets a specific Angular CDK or Angular Material version.


As of right now, we have multiple migration entry-points that handle the breaking changes for a
given target version:

| Target Version | Description            |
|----------------|------------------------|
| V6 | Upgrade from any version to v6.0.0 |
| V7 | Upgrade from any version to v7.0.0 |
| V8 | Upgrade from any version to v8.0.0 |
| V9 | Upgrade from any version to v9.0.0 |

Note that the migrations run _in order_ if multiple versions are implicitly targeted. For
example, consider an application which uses Angular Material v5.0.0. In case the developer runs
`ng update`, the Angular CLI **only** installs V7 and runs the V6 and V7 migrations _in order_.

This shows that we technically need to keep all migrations in the code base because
the CLI usually only installs the latest version and expects all migrations for past
major versions to be present.

## Update concept

The goal of the update schematic is to automatically migrate code that is affected by breaking
changes of the target version. Most of the time we can apply such automatic migrations, but
there are also a few breaking changes that cannot be migrated automatically.

In that case, our goal should be to notify the developer about the breaking change that needs
attention.

## Transforming TypeScript files

In order to automatically migrate TypeScript source files, we take advantage of the TypeScript
Compiler API which allows us to parse and work with the AST of project source files. We built
a small framework for analyzing and updating project source files that is called `update-tool`.

The `update-tool` has been specifically built with the goal of being extremely fast and
flexible. This tool had to be built because our initial `ng update` implementation which
used `tslint` had various issues:

* No support for HTML templates and stylesheets (workaround was needed)
* Reruns all upgrade lint rules after file has been updated (significant performance issue for projects with a lot of files)
* Recreates the TypeScript program each time a source file has been updated (significant memory pressure for big TypeScript projects, causing OOM exceptions)
* TSLint recursively visits the nodes of all source files for each upgrade lint rule (performance issue)
* TSLint is not guaranteed to be installed in CLI projects. See: https://github.com/angular/angular-cli/issues/14555
* TSLint replacements lead to memory leaks due to the retained TypeScript nodes
* No way to have a *global analysis* phase since lint rules are only able to visit source files.
* No flexibility. i.e.
  * No way to ensure source files are only analyzed a single time
  * No way to implement a progress bar
  * No easy way to add support for HTML templates or stylesheets

All of these problems that `tslint` had, have been solved when we built the
`update-tool`. The tool currently has the following differences compared to `tslint`:

* Abstraction of file system and ability to run migrations programmatically.
  * Migrations can run in the CLI and in google3.
  * Migrations can run standalone outside of `ng update`
* Integrated support for the HTML templates and stylesheets
* Only runs migrations once per source file.
  * Even if a source file is part of multiple TypeScript projects.
* Program is only created once per TypeScript project. Also the type checker is only retrieved once.
* Migration failures are guaranteed to not retain `ts.Node` instances (avoiding a common tslint memory leak)
* Replacements are performed within the virtual file system (best practice for schematics)
* TypeScript program is only recursively visited **once**
* Full flexibility (e.g. allowing us to implement a progress bar)
* Possibility to have a *global analysis* phase (unlike with tslint where only individual source files can be analyzed)

There also other various concepts for transforming TypeScript source files, but most of them
don't provide a simple API for replacements and reporting. Read more about the possible
approaches below:

|Description | Evaluation |
|------------|------------|
| Regular Expressions | Too brittle. No type checking possible. Regular Expression _can_ be used in combination with some real AST walking |
| TypeScript transforms (no emit) | This would be a good solution but there is no API to serialize the transformed AST into source code without using the `ts.Printer`. The printer can be used to serialize the AST but it breaks formatting, code style and more. This is not acceptable for a migration. |

### Upgrade data for target versions

The upgrade data for migrations is separated based on the target version. This is necessary in
order to allow migrations run sequentially. For example:

* In V6: `onChange` has been renamed to `changed`
* In V7: `changed` has been renamed to `onValueChange`

If we would not run the migrations in order, or don't separate the upgrade data, we would not be
able to properly handle the migrations for each target version. e.g. someone is on
5.0.0 and *only* wants to upgrade to 6.0.0. In that case he would end up with `onValueChange`
because the non-separated upgrade data would just include: _`onChange` => `onValueChange`_

Also besides separating the upgrade data based on the target version, we split the upgrade data
based on the type of code that is affected by these migrations:

* See here: [src/material/schematics/update/material/data](https://github.com/angular/components/tree/master/src/material/schematics/update/material/data)

### Adding upgrade data

Adding upgrade data is now a **mandatory** step before breaking changes should be merged
into `upstream`.  For simple and common breaking changes, there should be already an upgrade
data file that just needs the new change inserted.

In case there is no upgrade data for a breaking change, we need to evaluate if there should be
a single `misc` migration that is tied to that specific breaking change, or if we should
create a new migration that accepts upgrade data (as other configurable migrations).

---

**Example**: Adding upgrade data for a property rename
**Scenario**: In Angular Material V7.0.0, we rename `MatRipple#color` to `MatRipple#newColor`.

First, look for an existing upgrade data file that covers similar breaking changes. In that case
an existing upgrade data file for `property-names` already exists. Insert the new breaking change
within the proper `VersionTarget`.

_src/material/schematics/ng-update/material/data/property-names.ts_
```ts
export const propertyNames: VersionChanges<MaterialPropertyNameData> = {
  [TargetVersion.V7]: [
    {
      pr: '{PULL_REQUEST_LINK_FOR_BREAKING_CHANGE}',
      changes: [
        {
          replace: 'color',
          replaceWith: 'newColor',
          whitelist: {
            classes: ['MatRipple']
          }
        }
      ]
    }
  ],
   ...
};
```
Once the data is inserted into the upgrade data file, the update schematic will properly migrate
`MatRipple#color` to `MatRipple#newColor` if someone upgrades to Angular Material V7.0.0.

But that's not all. It's encouraged to add a test-case for the new migration data. In this case,
a test case already exists for the type of migration and we just need to add our breaking change
to it. Read more about adding a test case in the next section.

### Adding a breaking change to a test case

Considering we added a breaking change to the update schematic, it's encouraged to add a proper
test case for the new change that has been added.

In the scenario where a property from `MatRipple` has been renamed in V7, we don't need to create
a new test-case file because there is already a test case for the `property-names` upgrade data.
In that case, we just need to add the breaking change to the existing test case.

_src/material/schematics/ng-update/test-cases/v7/property-names_input.ts_
```ts
...

/**
 * Mock definitions. This test case does not have access to @angular/material.
 */
class MatRipple {
  color: string;
}

/*
 * Actual test cases using the previously defined definitions.
 */
class A implements OnInit {
  constructor(private a: MatRipple) {}

  ngOnInit() {
    this.a.color = 'primary';
  }
}
```

_src/material/schematics/ng-update/test-cases/v7/property-names_expected_output.ts_
```ts
...

/**
 * Mock definitions. This test case does not have access to @angular/material.
 */
class MatRipple {
  color: string;
}

/*
 * Actual test cases using the previously defined definitions.
 */
class A implements OnInit {
  constructor(private a: MatRipple) {}

  ngOnInit() {
    this.a.newColor = 'primary';
  }
}
```

**Note**: The `_input.ts` file will be just transformed by the V7 migrations and compared to
the `_expected_output.ts` file. This means that it's necessary to also include the no longer
valid mock declarations to the expected output file.
