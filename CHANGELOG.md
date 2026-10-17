# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The hello-catalog plugin: a manifest, a JavaScript implementation of the
  `catalog-provider` world built with `@bytecodealliance/jco`, and the
  vendored `hearthsound:plugin@0.2.0` WIT package.
- GitHub Actions workflow that builds the component, runs `hsplugin check`,
  `hsplugin test catalog` and `hsplugin pack`, and uploads the `.hsplugin`
  archive.
