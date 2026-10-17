# Hearthsound plugin template (JavaScript)

A starting point for writing a [Hearthsound](https://github.com/hearthsound) plugin
in JavaScript. It is a WebAssembly component that implements the `catalog`
provider interface, built with [jco](https://github.com/bytecodealliance/jco)
(`@bytecodealliance/jco`), and it answers every search with a greeting.

Copy the repository, rename the plugin, and replace the example behavior with
your own. The example needs no external service, account, API key or extra
configuration.

## Before you start

Change these things in `manifest.json`:

- `id`: your own reverse-DNS identifier, for example `com.example.my-catalog`.
- `name`: the name users will see.
- `homepage`: the URL of your project.

Then update `name` in `package.json` and the plugin id in this README.

## Requirements

- Node.js 24 (LTS) or newer, with npm. CI uses Node 24.
- The Hearthsound plugin CLI, `hsplugin`, from the SDK repository. It is
  installed with Cargo, so a Rust toolchain is needed once:

  ```console
  cargo install --locked --git https://github.com/hearthsound/plugin-sdk --tag v0.2.1 hearthsound-plugin-cli
  ```

## Build

```console
npm ci
npm run build
```

`npm ci` installs the exact dependency versions from `package-lock.json`,
including `@bytecodealliance/jco`, which is pinned to 1.39.0. `npm run build`
runs:

```console
jco componentize src/plugin.js --wit wit --world-name catalog-provider --disable http fetch-event -o build/plugin.wasm
```

The component lands at `build/plugin.wasm`. It is large (about 12 MB)
because jco embeds the JavaScript engine in the component.

The build is not byte-reproducible. Two builds of the same source produce
components that differ by about sixty bytes, in the embedded pre-initialized
heap and in temporary path strings. Do not compare component hashes to check
that a build is current; compare the behavior instead, for example with
`hsplugin test catalog`.

## Check, test and pack

Run these from the repository root:

```console
hsplugin check
```

It validates `manifest.json` and `build/plugin.wasm` and prints
`ok: <id> <version> (provides <layers>)` on success.

```console
hsplugin test catalog
```

It runs the catalog conformance suite against the built component and prints
one `ok <n>: <check>` line per check. It exits with status 1 when any check
fails, and each failure prints `error <n>: <check>: <detail>`.

```console
hsplugin pack --out-dir dist
```

It writes `dist/<id>-<version>.hsplugin`, the archive that a server installs.

## Install into a server

Install the archive with the server's CLI:

```console
hearthsound plugins install dist/com.example.hello-catalog-0.1.0.hsplugin
```

If the server reports that the plugin is pending approval, approve it before
enabling it:

```console
hearthsound plugins approve com.example.hello-catalog
```

`hearthsound plugins list` shows the installed plugins and their state. To
remove the plugin again, run `hearthsound plugins remove com.example.hello-catalog`.

## Settings

The plugin has one server setting, `greeting` (default `Hello`), which
prefixes the title of the track it returns. It is declared in the `config`
section of `manifest.json` as a JSON Schema, so a server can show it as a form.

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on every pull
request. It installs Node 24, runs `npm ci` and `npm run build`, installs
`hsplugin` from the `v0.2.1` tag, runs `hsplugin check`,
`hsplugin test catalog` and `hsplugin pack --out-dir dist`, and uploads the
`.hsplugin` archive as a workflow artifact. The workflow does not compare
component hashes, for the reason given in the Build section.

## Layout

| Path | Contents |
|---|---|
| `manifest.json` | The plugin manifest the server reads. |
| `package.json`, `package-lock.json` | The npm project and the pinned jco dependency. |
| `src/plugin.js` | The plugin implementation. |
| `wit/` | A copy of the `hearthsound:plugin@0.2.0` WIT package from the plugin SDK. Keep the files flat, exactly as they are. |
| `.github/workflows/ci.yml` | Build, check, test, pack and upload. |

## License

Licensed under either of Apache License, Version 2.0 or MIT license at your
option.
