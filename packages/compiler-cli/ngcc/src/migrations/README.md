# ngcc migrations

There are some cases where source code needs to be migrated before ngtsc can compile it correctly.

For example, there are cases where ngtsc expects directives need to be explicitly attached to
classes, whereas previously they were not required.

There are two ways this can happen:

1) in a project being developed, the code can be migrated via a CLI schematic.
2) in a package already published to npm, the code can be migrated as part of the ngcc compilation.

To create one of these migrations for ngcc, you should implement the `Migration` interface and add
an instance of the class to the `DecorationAnalyzer.migrations` collection.

This folder is where we keep the `Migration` interface and the implemented migrations.

Each migration should have a unit test stored in the `../../test/migrations` directory.