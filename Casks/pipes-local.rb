cask "pipes-local" do
  version "0.4.5"
  sha256 "bd700208a9b1a977c657e77e2ebc5857c6d760471017762cf95e0ff7933257e2"

  github_token = ENV.fetch("HOMEBREW_GITHUB_API_TOKEN", "")

  url "https://api.github.com/repos/dyegovasc/pipes-local/releases/assets/464166506",
      verified: "api.github.com/",
      header: [
        "Accept: application/octet-stream",
        "Authorization: Bearer #{github_token}",
        "X-GitHub-Api-Version: 2022-11-28",
      ]

  name "Pipes Local"
  desc "Local-first structured markdown workspace application"
  homepage "https://github.com/dyegovasc/pipes-local"

  depends_on arch: :arm64

  app "Pipes Local.app"

  caveats <<~EOS
    Installing Pipes Local from this private tap requires HOMEBREW_GITHUB_API_TOKEN
    with read access to the private GitHub Release asset.
  EOS

  postflight do
    system_command "/usr/bin/xattr",
                   args: ["-dr", "com.apple.quarantine", "#{appdir}/Pipes Local.app"],
                   sudo: false
  end

  uninstall quit: "com.pipes.local"
end
