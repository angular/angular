# About paths in ngtsc

Within the compiler, there are a number of different types of file system or URL "paths" which are manipulated as strings. While it's possible to declare the variables and fields which store these different kinds of paths using the 'string' type, this has significant drawbacks:

* When calling a function which accepts a path as an argument, it's not clear what kind of path should be passed.
* It can be expensive to check whether a path is properly formatted, and without types it's easy to fall into the habit of normalizing different kinds of paths repeatedly.
* There is no static check to detect if paths are improperly used in the wrong context (e.g. a relative path passed where an absolute path was required). This can cause subtle bugs.
* When running on Windows, some paths can use different conventions (e.g. forward vs back slashes). It's not always clear when a path needs to be checked for the correct convention.

To address these issues, ngtsc has specific static types for each kind of path in the system. These types are not mutually assignable, nor can they be directly assigned from `string`s (though they can be assigned _to_ `string`s). Conversion between `string`s and these specific path types happens through a narrow API which validates that all typed paths are valid.

# The different path kinds

All paths in the type system use POSIX format (`/` separators).

## `AbsoluteFsPath`

This path type represents an absolute path to a physical directory or file. For example, `/foo/bar.txt`.

## `PathSegment`

This path type represents a relative path to a directory or file. It only makes sense in the context of some directory (e.g. the working directory) or set of directories to search, and does not need to necessarily represent a relative path between two physical files.

## `LogicalProjectPath`

This path type represents a path to a file in TypeScript's logical file system.

TypeScript supports multiple root directories for a given project, which are effectively overlayed to obtain a file layout. For example, if a project has two root directories `foo` and `bar` with the layout:

```text
/foo
/foo/foo.ts
/bar
/bar/bar.ts
```

Then `foo.ts` could theoretically contain:

```typescript
import {Bar} from './bar';
```

This import of `./bar` is not a valid relative path from `foo.ts` to `bar.ts` on the physical filesystem, but is valid in the context of the project because the contents of the `foo` and `bar` directories are overlayed as far as TypeScript is concerned.

In this example, `/foo/foo.ts` has a `LogicalProjectPath` of `/foo.ts` and `/bar/bar.ts` has a `LogicalProjectPath` of `/bar.ts`, allowing the module specifier in the import (`./bar`) to be resolved via standard path operations.