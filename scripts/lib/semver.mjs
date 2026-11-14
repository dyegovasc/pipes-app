// Strict SemVer checks shared by the framework tools. They follow the Rust `semver` crate that Pipes
// Local uses: no leading zeros in numeric identifiers, including numeric pre-release identifiers.

const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

/**
 * True when `value` is a strict SemVer version. Build metadata is refused unless `allowBuild`,
 * because the Rust crate orders versions by build metadata and the framework tools do not.
 */
export function isStrictSemver(value, { allowBuild = false } = {}) {
  if (typeof value !== 'string') return false;
  const match = SEMVER.exec(value);
  if (!match) return false;
  if (match[4] && match[4].split('.').some((part) => /^\d+$/.test(part) && part.length > 1 && part.startsWith('0'))) return false;
  if (match[5] && !allowBuild) return false;
  return true;
}
