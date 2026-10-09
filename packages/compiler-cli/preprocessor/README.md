# Rust-based Compiler Preprocessor

> [!CAUTION]
> **Prototype — External Contributions Not Accepted**
>
> The Rust-based compiler preprocessor code in this directory is an early-stage prototype under active development by the Angular team.
>
> We are **not accepting issues, bug reports, feature requests, or pull requests** for this package from external contributors at this time. Any issues or PRs opened for this code will be closed.

## Overview

This directory contains a native AST analysis preprocessor and typecheck block (TCB) generation pipeline designed for high-performance Angular compilation and developer tooling integration. It combines Rust-based AST analysis (`ng-analyze`) using `oxc` with a TypeScript-based typechecking coordination layer.
