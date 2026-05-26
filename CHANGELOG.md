# Changelog

## [12.0.0] - 2026-05-26

### Breaking Changes
- **Node.js >= 18 required** — dropped support for Node 14/16
- **ESM-only package** — added `"type": "module"`, CJS `require()` no longer works
- **CLI flag `-ss` renamed to `-s`** — commander v14 enforces single-char short flags

### Added
- Native `worker_threads` for parallel builds/dev server (replaces `worker-farm`)
- Google Spreadsheet v4 API support (modern auth patterns)
- 50+ new CSS polyfills via `postcss-preset-env` 11 (nesting, `@scope`, `light-dark()`, `color-mix()`, cascade layers, etc.)
- Version logging in CLI output for QA verification

### Changed
- **Phase 1:** 18 dependencies bumped to latest within-major versions
- **Phase 2:** 13 major version bumps — `archiver` 5→7, `commander` 10→14, `css-loader` 6→7, `esbuild-loader` 3→4, `html-loader` 4→5, `image-size` 1→2, `postcss-preset-env` 8→11, `postcss-loader` 7→8, `sharp` 0.31→0.34, `subset-font` 2→2.4
- **Phase 3:** Full ESM migration — all source files converted from CommonJS to ES modules
- **Phase 4:** Upgraded ESM-only packages — `chalk` 4→5, `inquirer` 8→9, `open` 8→9
- **Phase 5:** `google-spreadsheet` 3→4 — rewritten auth and row access
- **Phase 6:** Replaced `worker-farm` with native `worker_threads` — zero external dependency, faster startup, ESM-native

### Removed
- `worker-farm` dependency (unmaintained)
- `devSubServer.cjs` and `webpackRun.cjs` CJS workaround files

### Performance
- ~35% fewer transitive dependencies — faster `npm install`
- `sharp` 0.34 — ARM64/Apple Silicon native support, libvips 8.15+
- `esbuild-loader` 4 — faster JS/TS minification
- `archiver` 7 — reduced memory footprint for parallel ZIP operations
- `worker_threads` — lower latency messaging vs IPC, no child process overhead

## [11.9.0] - 2025-02-07
### Changed
- Updated media handling and preview functionality
- Version alignment in package.json and package-lock.json

### Fixed
- Version inconsistency between package files

## [11.8.0] - 2024-09-10

### Added
- Enhanced animation control features:
  - Keyboard shortcuts for play/pause (Space)
  - Reload functionality (R key)
  - Skip to end (Right arrow)
  - Forward 250ms (. key)
  - Mouse click controls
  - Animation time tracker
- New configuration option `controlsOff` to toggle visual controls

### Changed
- Improved animation control accessibility for non-technical users
- Enhanced preview interface with time tracking display

## [11.7.0] - 2024-03-27

### Added
- Custom info chips for banner metadata
- GSDevTools keyboard toggle (G+S)
- SASS support
- Favicon and brand logo integration

### Improved
- URL parameter handling
- SVG optimization settings

### Technical
- Updated GitHub Actions workflow
- Improved CI/CD pipeline configuration