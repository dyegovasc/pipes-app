cask "pipes-local" do
  version "0.4.6"
  sha256 "a3829bd1663c5693936e9f5df3c38e5fff499066231176fe7591d56db8563fef"

  url "https://api.github.com/repos/dyegovasc/homebrew-pipes/releases/assets/464365392",
      verified: "api.github.com/",
      header: [
        "Accept: application/octet-stream",
        "X-GitHub-Api-Version: 2022-11-28",
      ]

  name "Pipes Local"
  desc "Local-first structured markdown workspace application"
  homepage "https://github.com/dyegovasc/homebrew-pipes"

  depends_on arch: :arm64

  app "Pipes Local.app"

  preflight do
    system_command "/usr/bin/pkill",
                   args: ["-TERM", "-x", "Pipes Local"],
                   sudo: false,
                   must_succeed: false

    system_command "/bin/sleep",
                   args: ["2"],
                   sudo: false
  end

  postflight do
    system_command "/usr/bin/xattr",
                   args: ["-dr", "com.apple.quarantine", "#{appdir}/Pipes Local.app"],
                   sudo: false

    system_command "/usr/bin/open",
                   args: ["#{appdir}/Pipes Local.app"],
                   sudo: false
  end

  uninstall quit: "com.pipes.local"
end
