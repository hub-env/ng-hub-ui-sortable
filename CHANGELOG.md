# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.2.0] - 2026-09-08

### Added

- **The list can be reordered from the keyboard.** SortableJS binds `mousedown` and `touchstart`
  and nothing else, so until now `hubSortable` simply did not work for anyone who does not drag —
  not a rough edge, an absent feature. Each item, or its `handle` when one is configured, is now a
  Tab stop, and from there the interaction is the grab / move / drop model of the WAI-ARIA
  authoring practices: `Enter` or `Space` picks the item up, the arrows move it, `Home` and `End`
  send it to either end, `Enter`/`Space` drops it and `Escape` puts it back. Every step is
  announced through a polite live region, since the rest of the feedback is visual. The arrows are
  claimed only while an item is held, so the page underneath still scrolls. Reordering this way
  obeys the same rules a drag does — off while `disabled` is `true` or `sort` is `false`, honouring
  `autoUpdateArray`, emitting the same `update` and `sortEvent` with both indexes filled in.
  The alternative model, arrows reordering with no grab step, was rejected: it makes an arrow key
  destructive the moment focus lands on a list.

- **`keyboardSorting`, to turn that off**, for an application that already ships its own keyboard
  path and wants only one.

- **`keyboardMessages`, to translate what is announced.** The sentences are functions, not
  templates with placeholders, so a language whose word order differs is not forced through an
  English shape — this package carries no translation machinery and is not about to grow one.
  `SortableKeyboardMessages` and `DEFAULT_SORTABLE_KEYBOARD_MESSAGES` are exported.

- **`SortableBindings` and `SortableBinding` are exported.** `SortableBindings` is the class that
  keeps several parallel arrays in step through one drag — a table stored as one array per column
  is the case it exists for — and `[hubSortable]` has always accepted an instance in place of an
  array. It was never listed in `public-api.ts`, so nobody outside the package could construct one
  or type a field holding one: the feature was reachable only by accident. Both READMEs gained the
  connected-lists section that explains what to do with it, because exporting a type nobody knows
  how to use fixes nothing.

- **`SortableFormArrayLike`**, the structural description of the four `FormArray` members this
  package calls. It is what lets `SortableData` name a `FormArray` without the package taking a
  dependency on `@angular/forms` — which is exactly what the runtime duck typing in
  `SortableBinding` has always been doing, only now the compiler is in on it.

### Changed

- **BREAKING — `SortableData` is a list type instead of `any`.** It was written
  `any | any[] | WritableSignal<any[]>`, and a union containing `any` *is* `any`, so the published
  type accepted a number, a string or a plain object without a word from the compiler. It is now
  `T[] | WritableSignal<T[]> | SortableFormArrayLike<T>`, with `T` defaulting to `unknown`. A
  generic defaulting to `any` was considered and rejected for the same reason: it would have
  compiled everywhere and warned nowhere. Nothing changes at runtime; see
  [`BREAKING_CHANGES.md`](./BREAKING_CHANGES.md) for what stops compiling and what to write
  instead. `SortableBinding` is generic for the same reason, so the element type survives the
  round trip.

## [22.1.4] - 2026-09-06

### Added

- **`FUNCTIONALITIES.md`**, the coverage matrix the rest of the family ships. Nothing until now
  answered "is this supported, and is there a working example of it?" without reading the
  directive source, and twenty-four sibling libraries already answer it in one table.
- **`BREAKING_CHANGES.md`**. This package's major tracks the Angular major it targets, so a
  breaking change can never raise the major and SemVer cannot warn anybody — this file is the
  warning, and it is the only one a consumer gets.
- **The reference documents ship inside the tarball** — `CHANGELOG.md`, `MIGRATION.md` and
  `BREAKING_CHANGES.md`, the last of which the README now links from its Changelog section as the
  rest of the family does. All three are linked with repository-relative paths, which npm and
  GitHub rewrite but `node_modules` does not: a reader opening the packaged README followed those
  links to nothing.

### Changed

- **The library no longer writes into the consuming application's console.** Eight guard rails —
  the out-of-range check in `moveItemInArray`, the three in `transferArrayItem`, the three in
  `copyArrayItem` and the directive's `container` lookup — reported invalid input with
  `console.warn` / `console.error`. A dependency has no standing to put noise in an application's
  console, least of all in a production build, and the message was addressed to whoever wrote the
  call rather than to whoever runs the app. Every guard keeps the behaviour it always had: the
  call is a no-op and the arrays are left untouched. A `container` selector that matches nothing
  likewise leaves the directive inert, now without a message, so audit those selectors
  (see `MIGRATION.md`, 5.6) instead of waiting for the console to point at them.

### Fixed

- **The directive's JSDoc examples teach the `@for` block** rather than `*ngFor`. Those snippets
  ship in the published typings, so they are what a consumer's editor shows on hover over
  `hubSortable` — and they contradicted the README's Quick Start, leaving the reader to work out
  which surface of the same library to believe. Each `@for` sits on the line that opens the host
  element on purpose: TypeScript reads a line-initial `@for` inside a JSDoc comment as a tag and
  splits the example in two.

- **Four published releases the changelog never recorded** — 21.0.1, 21.1.0, 21.1.1 and 21.2.0 —
  are written up from the commits that cut them. Manual control mode, the array helpers and the
  move of `sortablejs` into `dependencies` all shipped in that window, so the file skipped the
  three releases a consumer is most likely to be looking for.
- **`22.0.0` says plainly that it was never published.** It sat between two published versions as
  if it were one of them, which made the rebranding look available under a version npm has never
  served.
- **The outputs are documented as `OutputEmitterRef`, not `EventEmitter`,** in both READMEs. The
  directive declares them with `output()`, and the two are not interchangeable: a reader who
  trusted the table would reach for `.pipe()` on `init` and find nothing there — an
  `OutputEmitterRef` has `subscribe()`, but it is not an `Observable`.
- **The installation instructions stop asking for `sortablejs`.** It has been a regular dependency
  since 21.2.0, so npm installs it unasked; telling the reader to add it by hand invites a second,
  unpinned copy in their manifest that nothing keeps aligned with the one this package resolves.
- **`README.es.md` gains the "Migrating from ngx-sortablejs" section**, the only part of the
  English README with no Spanish counterpart — and the part a reader arriving from the abandoned
  package needs first.

## [22.1.3] - 2026-09-01

### Changed

- **The `homepage` in the manifest points at this library's own documentation page** rather than at
  the site root. It is the link a registry shows beside the package and the one a reader clicks from
  it, and landing on a front page they then have to search is a worse answer than landing on the
  reference for the package they were already looking at.

- **Eleven keywords added to the manifest**, covering the vocabulary someone actually searches with
  when they do not already know this package's name: `dnd`, `drag-drop`, `reorder`, `reorderable`,
  `sortable-list`, `list`, `formarray`, `component`, `reusable`, `ui-library`. The previous set
  described what the library is built from rather than what it is for.

Metadata only — no code, no types, no styles change, and nothing a consumer imports is affected.

## [22.1.2] - 2026-08-08

### Fixed

- Documentation links now point at the canonical localized URLs. The README linked to `https://hubui.dev/<path>` with no locale prefix and no trailing slash, and both forms are 301-redirected, so every reader arriving from npm or GitHub landed on a redirect instead of the canonical page.

## [22.1.1] - 2026-07-28

### Added

- **Documented the pointer-only accessibility limitation.** SortableJS drag-and-drop has no keyboard or screen-reader path; the READMEs now state it explicitly and recommend pairing the directive with an alternative affordance (e.g. move up/down buttons operating on the same array) where reordering is essential. An `aria-live` announcer story is tracked as future work.

## [22.1.0] - 2026-06-29

### Added

- `provideSortable()` standalone provider function to register global SortableJS options without `SortableModule`.
- Public type exports for the directive payloads (`SortableData`, `SortableEventName`, `SortableMoveEventPayload`).
- `tsconfig.lib.prod.json` for optimized production builds.

### Changed

- Aligned package scaffolding with the rest of the ng-hub-ui ecosystem: removed legacy fork files (`tslint.json`, `angular.json`, `yarn.lock`, project-level lockfile, `browserslist`, app/server tsconfigs, `.htaccess`), added the `tslib` dependency, `sideEffects: false`, `declarationMap` and a normalized `repository` URL.
- Reworked the showcase documentation and example components to follow the shared library documentation standards.

### Deprecated

- `SortableModule` and `SortableModule.forRoot()`. Import the standalone `SortableDirective` directly and use `provideSortable()` for global options instead.

## [22.0.0] - 2026-06-17

> **Never published to npm.** The version was cut in the repository but no tarball was ever
> released under it; the rebranding below reached consumers with `22.1.0`. The registry goes
> straight from `21.3.0` to `22.1.0`.

### Changed

- Rebranded the package and standardized its metadata and README to match the ng-hub-ui family.

## [21.3.0] - 2026-03-31

### Added

- Enhanced sortable directive with improved binding support for signals and FormArrays.
- Comprehensive test coverage for the sortable directive.

## [21.2.0] - 2026-02-10

### Added

- **The library re-exports the SortableJS types from its own root** — `Sortable`, `SortableEvent`,
  `Options`, `MoveEvent`, `GroupOptions`, `PullResult` and `PutResult`. Typing a handler no longer
  means importing from two packages.

### Changed

- **`sortablejs` moved from `peerDependencies` to `dependencies`**, so it installs with this
  package instead of being one more thing to remember.

## [21.1.1] - 2026-02-10

### Fixed

- **Duplicate `update` and `add` emissions in manual mode.** SortableJS calls its own `onUpdate`
  and `onAdd` more than once for a single drop when the DOM is rearranged inside the handler; a
  guard now lets the first call through and drops the rest until the next drag starts.
- **The DOM and the bound array no longer disagree in manual mode.** SortableJS moves the element
  itself, but manual mode leaves the array to the consumer, so the directive reverts that move and
  lets Angular render from the array it was actually given.
- **Native SortableJS events no longer reach template listeners twice.** The container's own
  `start`, `update`, `add` and friends are CustomEvents with the same names as the directive's
  outputs, so `(update)` fired once for each.

## [21.1.0] - 2026-02-09

### Added

- **Manual control mode through the `autoUpdateArray` input** (default `true`). Set it to `false`
  and the directive stops mutating the bound array: it only reports what happened, which is what
  validation before the move, persistence, undo and immutable state all need.
- **The array helpers `moveItemInArray`, `transferArrayItem` and `copyArrayItem`**, so manual mode
  does not mean rewriting index arithmetic in every application.
- An events guide and a manual-control example covering a single list and a Kanban board.

## [21.0.1] - 2025-12-12

### Added

- **A README inside the package.** The npm page had been blank since the first release.

## [21.0.0] - 2025-12-12

### Added

- Writable signal support in sortable bindings alongside arrays and FormArrays.
- Hardened signal/FormArray detection to avoid TypeScript errors in bindings.

## [20.0.0] - 2025-12-10

### Added

- **First version published as `ng-hub-ui-sortable`**, with the groundwork for Angular 20
  compatibility. Everything the registry serves under this name starts here; the numbering
  continues the fork it came from.

## [19.0.0] - 2025-04-08

### Changed

- Upgraded to Angular 19.

## [18.0.0] - 2024-08-16

### Changed

- Upgraded to Angular 18.

## [17.0.0] - 2024-03-15

### Changed

- Upgraded to Angular 17.

## [16.0.0] - 2023-08-22

### Changed

- Upgraded to Angular 16.

---

### Earlier history

Versions prior to 16.0.0 belong to the upstream projects this library was forked from
([`@worktile/ngx-sortablejs`](https://github.com/worktile/ngx-sortablejs) and, before that,
[`SortableJS/ngx-sortablejs`](https://github.com/SortableJS/ngx-sortablejs)). Their changelogs
remain available in those repositories.
