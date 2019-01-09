# ng-update schematic  

**Note** The CDK ng-update schematic is the foundation for the Angular Material update
schematic. This is achieved by making the ng-update code for the CDK as abstract as possible.
 
This means that this document also applies for the Angular Material `ng-update`.

---
  
The `ng-update` schematic consists of multiple migration entry-points where every entry-point
targets a specific Angular CDK or Angular Material version.  


As of right now, we have two migration entry-points that handle the breaking changes for the
given target version:  
  
| Target Version | Description            |
|----------------|------------------------|
| V6 | Upgrade from any version to v6.0.0 |  
| V7 | Upgrade from any version to v7.0.0 |  
| V8 | Upgrade from any version to v8.0.0 |  
  
Note that the migrations run _in order_ if multiple versions are transitively targeted. For
example, consider an application which uses Angular Material v5.0.0. In case the developer runs
`ng update`, the Angular CLI **only** installs V7 and runs the V6 and V7 migrations in order.
 
This shows that the we technically need to keep all migrations from V5 in this code base, because
the CLI usually only installs the latest version and expects all version migrations to be present.
  
## Update concept  
  
The goal of the update schematic is to automatically migrate code that is affected by breaking
changes of the target version. Most of the time, we can apply such automatic migrations, but
there are also a few breaking changes that cannot be migrated automatically.
  
In that case, our goal should be to notify the developer about the breaking change that needs
developer attention.  
  
## Transforming TypeScript files  
  
In order to automatically migrate TypeScript source files, we take advantage of the `tslint`
which allows us to create custom rules that can:
 
* Easily `visit` specific types of TypeScript nodes (e.g. `visitClassDeclaration`)  
* Structure migrations based on the _upgrade data_ or type of migration (different TSLint rules)  
* Easily apply replacements / fixes for specific TypeScript nodes.  
* Easily report breaking changes at TypeScript nodes that cannot be migrated automatically  
* Double check for rule migrations (TSLint always runs rule again after migrations have been applied)  

There also other various concepts for transforming TypeScript source files, but most of them
don't provide a simple API for replacements and reporting. Read more about the possible
approaches below:
  
|Description | Evaluation |  
|------------|------------|  
| Regular Expressions | Too brittle. No type checking possible. Regular Expression _can_ be used in combination with some real AST walking |  
| TypeScript transforms (no emit) | This would be a good solution that avoids using TSLint. No simple API for reporting and visiting specific types of nodes |  
| Plain TypeScript AST | This would be similar to the TypeScript transforms. Extra effort in creating the replacement API; reporting API; walking logic |
  
## ## Transforming CSS and HTML files  
  
Since `TSLint` allows us to only visit TypeScript nodes, we can technically just apply migrations
for inline styles or templates which are part of the TypeScript AST. In our case, the update
schematic should also apply migrations for external templates or styles. In order to archive
this with TSLint, we have a customized implementation of a `TSLint.RuleWalker`. The custom
RuleWalker which is called `ComponentWalker` determines external templates and stylesheets from
the _component/directive_ metadata.

The given resource files will then be wrapped inside of an in-memory TypeScript source file that
can be applied to the rule walker. This ensures that only referenced resource files will be
migrated and also allows us to take advantage of the simple replacement and reporting API from
TSLint.
  
This also makes the rule walker API consistent with the handling of inline resource files.    
  
```ts
// PSEUDO CODE
visitExternalTemplate(node: ts.SourceFile) {
  const parsedHtml = parse5.parse(node.getFullText());
  
  this._findOutdatedInputs(parsedHtml)
   .forEach(offsetStart => this._addExternalFailure(offsetStart, 'Outdated input', _myFix);}
```

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
  
* See here: [src/lib/schematics/update/material/data](https://github.com/angular/material2/tree/master/src/lib/schematics/update/material/data)  
  
### Adding upgrade data
  
Adding upgrade data is now a **mandatory** step before breaking changes should be merged
into `upstream`.  For simple and common breaking changes, there should be already an upgrade
data file that just needs the new change inserted.  
  
In case there is no upgrade data for a breaking change, we need to evaluate if there should be
a single `misc` migration rule that is tied to that specific breaking change, or if we should
create a new migration rule in a more generic way.  

---

**Example**: Adding upgrade data for a property rename  
**Scenario**: In Angular Material V7.0.0, we rename `MatRipple#color` to `MatRipple#newColor`.
  
First, look for an existing upgrade data file that covers similar breaking changes. In that case
an existing upgrade data file for `property-names` already exists. Insert the new breaking change
within the proper `VersionTarget`.  
  
_src/lib/schematics/ng-update/material/data/property-names.ts_
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
  
_src/lib/schematics/ng-update/test-cases/v7/property-names_input.ts_
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

_src/lib/schematics/ng-update/test-cases/v7/property-names_expected_output.ts_  
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
