cask "pipes-local" do
  version "0.4.5"
  sha256 "cf028a0f6e685fbb7e540c62cdf5b3b149f4c4b0115efc3f1572a3c9441ec14c"

  github_token = ENV.fetch("HOMEBREW_GITHUB_API_TOKEN", "")

  url "https://api.github.com/repos/dyegovasc/homebrew-pipes/releases/assets/464341759",
      verified: "api.github.com/",
      header: [
        "Accept: application/octet-stream",
        "Authorization: Bearer #{github_token}",
        "X-GitHub-Api-Version: 2022-11-28",
      ]

  name "Pipes Local"
  desc "Local-first structured markdown workspace application"
  homepage "https://github.com/dyegovasc/homebrew-pipes"

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
