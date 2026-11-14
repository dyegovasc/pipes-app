# Pipes App

Public distribution repository for the Pipes Local desktop app.

This repository publishes the packaged macOS app and the Homebrew cask used to install it. The application source code lives separately; this repo is only for distribution artifacts, release assets, and installer metadata.

## Pipes Local

Pipes Local is a local-first desktop workspace for Pipes-organized repositories. It gives teams a native UI for browsing project memory, editing structured Markdown records, running local terminal workflows, and coordinating agent-assisted delivery pipelines against a selected local workspace.

Pipes Local is built for repositories that treat planning, decisions, outcomes, instructions, team roles, and pipeline workflows as versioned project memory.

## Install

The distribution repo is public, so installation does not require a GitHub token.

```sh
brew tap dyegovasc/pipes https://github.com/dyegovasc/pipes-app.git
brew install --cask dyegovasc/pipes/pipes-local
```

## Update

```sh
brew update
brew upgrade --cask dyegovasc/pipes/pipes-local
```

When Pipes Local is running during an upgrade, the cask closes it before replacing the app bundle and reopens it after the new version is installed.

## Reinstall

Use reinstall when the cask metadata changed but the app version stayed the same.

```sh
brew reinstall --cask dyegovasc/pipes/pipes-local
```

## Uninstall

```sh
brew uninstall --cask pipes-local
```

## Distribution Contents

- `Casks/pipes-local.rb` is the Homebrew cask for `Pipes Local.app`.
- GitHub Releases store versioned zip assets for the app bundle.
- The app source repository owns builds and release packaging; this repository stores the public installer surface.

## Pipes Framework Source

This repository is also the source of the Pipes framework, which Pipes Local installs into workspaces. Framework versions are published here independently of app releases.

- `.pipes.example/` is the framework source. Framework changes are made only here.
- `framework-releases/` holds the manifest and baseline archive of earlier versions.
- `frameworks/compatibility.json` records the oldest app version (`minAppVersion`) for each framework version.
- `frameworks/index.json` and `frameworks/index.json.minisig` are the signed index that Pipes Local reads to find framework versions.
- Each framework version is a GitHub release with the tag `pipes-framework-v{version}` and one asset, `pipes-starter-{version}.json.gz`. A framework release is never the latest release, so the app update check keeps reporting the latest app release.

The framework is frozen until Pipes Local reads framework versions from this repository: do not change `.pipes.example/` until then.

### Release A Framework Version

The scripts use Node 22 (`.nvmrc`) and have no npm dependencies.

1. Change `.pipes.example/`, then run `npm run framework:release -- --version X --min-app-version Y --dry-run`, and then without `--dry-run`. Raise `--min-app-version` when the release changes the ownership policy, the manifest schema, or the project layout.
2. Pin the printed entries in `scripts/check-pipes-framework-release-assets.mjs`, then run `npm run check` and `npm run framework:test`.
3. Prove the release with `npm run framework:evals`. A real run calls a model and costs tokens.
4. Commit the change to `main`, then push the tag `pipes-framework-vX`. The `framework-release` workflow checks the source, builds the bundle, and creates the release without making it latest.
5. Run `npm run framework:publish-index -- --version X --secret-key PATH --public-key PATH --commit`, then push `main`. The script downloads and verifies the released bundle, adds it to the index, and signs the index with the `minisign` CLI.

### Signing Keys

Two minisign keys exist at one time: active and standby. Both public keys are compiled into Pipes Local.

- The active secret key stays on the maintainer's machine, with its password in the macOS Keychain. The standby secret key is only in the password manager and on one encrypted offline copy. Neither key is ever stored on GitHub.
- Rotate at least every 24 months, on a machine change, or on a suspected exposure: sign with the standby key, and compile a new standby key into the next app release.
- After a compromise, restore the standby secret key from the password manager to `~/.minisign/pipes-framework-standby.key` (`chmod 600`), and publish an index signed by it: `npm run framework:publish-index -- --revoke-key <compromised key id> --secret-key ~/.minisign/pipes-framework-standby.key --public-key frameworks/keys/standby.pub --public-key frameworks/keys/active.pub --commit`. Add `--drop-version X` only for versions you cannot vouch for (those published after the suspected exposure). Then delete the restored key file again, release a new app with a new key pair, and post a notice here.

Create the keys in a separate Terminal window at the repository root, never through an automated session:

```sh
brew install minisign            # 0.11 or later
mkdir -p ~/.minisign frameworks/keys && chmod 700 ~/.minisign
minisign -G -p frameworks/keys/active.pub -s ~/.minisign/pipes-framework-active.key
minisign -G -p frameworks/keys/standby.pub -s ~/.minisign/pipes-framework-standby.key
chmod 600 ~/.minisign/pipes-framework-*.key
security add-generic-password -s pipes-framework-active -a "$USER" -w
```

Keep the standby secret key and its password only in the password manager and one encrypted offline copy, then delete `~/.minisign/pipes-framework-standby.key`. Commit only the two `.pub` files.

### Fix Forward

Never delete a release, a tag, or an asset, and never revert `frameworks/index.json`: Pipes Local rejects an index with an older `generatedAt`. To stop a wrong version, publish a newer index with `--withdraw X`, then release a fixed version.
