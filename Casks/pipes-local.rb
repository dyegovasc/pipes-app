cask "pipes-local" do
  version "0.6.0"
  sha256 "e23ba9fd2ac114d107a3c4d361dc7867e32ee6edc4a125bd97d7eba89bc46b45"

  url "https://api.github.com/repos/dyegovasc/pipes-app/releases/assets/714626344",
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
