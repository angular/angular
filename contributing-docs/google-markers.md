# Angular Google Sync Comment Markers Guide

This document describes the comment-based markers used in the Angular repository to manage the synchronization process between the public GitHub repository and Google's internal codebase (google3).

As an Angular contributor, you will occasionally encounter these markers in the codebase. Most external contributors will never need to **write** these markers themselves. Instead, this guide exists to explain what these markers mean and why they are in the code when you run into them.

These tags are necessary because Google's internal codebase builds and integrates Angular in a slightly different configuration than the public NPM packages. For example, Google may require certain APIs to remain public internally for integration purposes, or might need to bypass public-only configurations. These markers allow the automated sync tooling to adjust the code seamlessly during the import process.

---

## Reference Table

The following markers are processed during the synchronization to Google's internal codebase:

| Marker                                        | Type        | Action in Google's Codebase                 | Intended Use Case                                                                           |
| :-------------------------------------------- | :---------- | :------------------------------------------ | :------------------------------------------------------------------------------------------ |
| **`// 3p-only`**                              | Single-line | **Strip**: Deletes the entire line          | Remove imports or calls that only exist in the public version.                              |
| **`// 3p-only-start`** / **`// 3p-only-end`** | Block       | **Strip**: Deletes the entire block         | Remove larger chunks of public-only code (e.g., benchmarking suites, public-only adapters). |
| **`// g3-only`**                              | Single-line | **Insert**: Uncomments the rest of the line | Export Google-internal symbols or activate Google-specific configurations.                  |
| **`// g3-only-start`** / **`// g3-only-end`** | Block       | **Insert**: Uncomments every line inside    | Add larger Google-specific functions or class definitions.                                  |

---

## Detailed Marker Explanations & Examples

### 1. Removing Single Lines (`// 3p-only`)

This tag is appended at the end of a line comment to completely remove that line when the code is synced internally to Google.

- **GitHub Source**:
  ```typescript
  import {ExternalBenchmarkRunner} from './benchmarks'; // 3p-only
  ```
- **Google's Internal Codebase**:
  _(The line is completely removed)_

---

### 2. Removing Blocks of Code (`// 3p-only-start` / `// 3p-only-end`)

Blocks of code that should only run in the public version are surrounded by these markers. The entire block is stripped during the sync.

- **GitHub Source**:
  ```typescript
  // 3p-only-start
  export function initializeDevTools() {
    console.log('Setting up external devtools...');
    setupExternalDebugger();
  }
  // 3p-only-end
  ```
- **Google's Internal Codebase**:
  _(The entire block, including markers, is completely removed)_

---

### 3. Activating Single Lines (`// g3-only`)

Google-specific code is written as a comment and prefixed with `// g3-only`. The sync tooling uncomments this line when importing it into Google's codebase.

- **GitHub Source**:
  ```typescript
  // g3-only export {ForeignComponent} from './interface/foreign_component';
  ```
- **Google's Internal Codebase**:
  ```typescript
  export {ForeignComponent} from './interface/foreign_component';
  ```

---

### 4. Activating Blocks of Code (`// g3-only-start` / `// g3-only-end`)

Larger blocks of Google-specific code are commented out line-by-line and wrapped in the `g3-only` start/end markers. The sync tooling strips the markers and uncomments all lines in between.

- **GitHub Source**:
  ```typescript
  // g3-only-start
  // export function getGoogleSpecificConfig() {
  //   return {
  //     enableInternalLogging: true,
  //     useInternalDatabase: true,
  //   };
  // }
  // g3-only-end
  ```
- **Google's Internal Codebase**:
  ```typescript
  export function getGoogleSpecificConfig() {
    return {
      enableInternalLogging: true,
      useInternalDatabase: true,
    };
  }
  ```
