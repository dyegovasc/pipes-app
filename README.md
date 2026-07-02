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
