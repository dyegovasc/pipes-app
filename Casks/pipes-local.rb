cask "pipes-local" do
  version "0.5.11"
  sha256 "2435ae372fd39cbcce5d3d9f514dc324ec4d6dd90a2c608d67bb13762e928243"

  url "https://api.github.com/repos/dyegovasc/pipes-app/releases/assets/501721729",
      verified: "api.github.com/",
      header: [
        "Accept: application/octet-stream",
        "X-GitHub-Api-Version: 2022-11-28",
      ]

  name "Pipes Local"
  desc "Local-first structured markdown workspace application"
  homepage "https://github.com/dyegovasc/pipes-app"

  depends_on arch: :arm64

  app "Pipes Local.app"

  preflight do
    if system_command("/usr/bin/pgrep",
                      args: ["-x", "Pipes Local"],
                      sudo: false,
                      must_succeed: false).success?
      system_command "/usr/bin/touch",
                     args: ["/tmp/pipes-local-homebrew-relaunch"],
                     sudo: false

      system_command "/usr/bin/pkill",
                     args: ["-TERM", "-x", "Pipes Local"],
                     sudo: false,
                     must_succeed: false

      system_command "/bin/sleep",
                     args: ["2"],
                     sudo: false
    else
      system_command "/bin/rm",
                     args: ["-f", "/tmp/pipes-local-homebrew-relaunch"],
                     sudo: false,
                     must_succeed: false
    end
  end

  postflight do
    system_command "/usr/bin/xattr",
                   args: ["-dr", "com.apple.quarantine", "#{appdir}/Pipes Local.app"],
                   sudo: false

    if system_command("/usr/bin/test",
                      args: ["-f", "/tmp/pipes-local-homebrew-relaunch"],
                      sudo: false,
                      must_succeed: false).success?
      system_command "/usr/bin/open",
                     args: ["#{appdir}/Pipes Local.app"],
                     sudo: false

      system_command "/bin/rm",
                     args: ["-f", "/tmp/pipes-local-homebrew-relaunch"],
                     sudo: false,
                     must_succeed: false
    end
  end

  uninstall quit: "com.pipes.local"
end
