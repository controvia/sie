# library-template
Template for Typescript library.

## Configuration files
### `package.json`
Important fields in this file

#### `"type"`
Should be set to `"module"`. Modules are the future.

#### `"exports"`
Exports define which file should be imported when the module is imported. each import path can be split up into an `import` field and a `require` field. `import` points to the ESM entry and `require` points to the CJS entry.

#### `"main"`
Included for legacy reasons. Export field has priority for consumers supporting it. This points to the main entry for users importing via `require`

#### `"module"`
A widespread unofficial field included for legacy and bundler reasons. Many bundlers might still look for this field. This points to the main entry for users importing via `import`

#### `"types"`
Included for legacy reasons. Types defined by exports field should have priority but there types will be used by consumers using the `main` and `module` fields.

---

### `vite.config.ts`
Test environment configuration. Some libraries might need to be included in this configs `test.server.deps.inline` field for tests to not crash (like jest ignoreTransform patterns).

---

### `tsconfig.json`
Base configuration file. Contains configuration for building and running in test environment.
If more types are added to the `"types"` field in here make sure to update the other tsconfig files as well.

---

### `tsconfig.mjs.json`
Extends the base configuration file and excludes configuration related to the test environment.
If more types are added to the `"types"` field in here make sure to update the other tsconfig files as well.

---

### `tsconfig.cjs.json`
Extends the base configuration file and excludes configuration related to the test environment.
If more types are added to the `"types"` field in here make sure to update the other tsconfig files as well.
