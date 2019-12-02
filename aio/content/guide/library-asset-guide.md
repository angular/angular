# Generating CSS with Angular Libraries

With Angular Libraries its also possible you may need to process CSS/SCSS/SASS and provide it's output as CSS files, like Angular Material. 
There are multiple ways to achieve the same, Angular Material uses `scss-bundle` to generate multiple CSS files.

## Using scss-bundle

`scss-bundle` is easy to use and easy to configure utility to generate the styles.

You need to create file named `scss-bundle.config.json` where you have to define below properties:
* entryFile
* rootDir
* outFile
* ignoreImports
* logLevel

```JSON
{
    "bundlerOptions": {
        "entryFile": "./tests/cases/simple/main.scss",
        "rootDir": "./tests/cases/simple/",
        "outFile": "./bundled.scss",
        "ignoreImports": ["~@angular/.*"],
        "logLevel": "silent"
    }
}
```

once provided we can add below script in scripts:

```sh
"build-css" : "scss-bundle -p <project-path-to-scss-bundle.config.json>"
```

## Copying assets using custom builder

There is a custom builder available to copy the assets folder `@linnenschmidt/build-ng-packagr`

you can refer the [builder](https://github.com/linnenschmidt/build-ng-packagr)