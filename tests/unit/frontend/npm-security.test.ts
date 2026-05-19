import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type PackageLockEntry = {
  version?: string;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

type PackageLock = {
  packages: Record<string, PackageLockEntry>;
};

type PackageJson = {
  dependencies: Record<string, string>;
};

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(currentDirectory, "../../../frontend");

const packageJson = readJson<PackageJson>(
  resolve(frontendRoot, "package.json"),
);
const packageLock = readJson<PackageLock>(
  resolve(frontendRoot, "package-lock.json"),
);

const deniedVersions: Record<string, string[]> = {
  axios: ["0.30.4", "1.14.1"],
  "plain-crypto-js": ["4.2.1"],
};

const compromisedTanStackSetup =
  "github:tanstack/router#79ac49eedf774dd4b0cfa308722bc463cfe5885c";

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function packageNameFromLockPath(lockPath: string): string | null {
  const lastNodeModulesPart = lockPath.split("node_modules/").at(-1);

  if (!lastNodeModulesPart || lastNodeModulesPart === lockPath) {
    return null;
  }

  const parts = lastNodeModulesPart.split("/");
  return parts[0].startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0];
}

function findInstalledPackageVersions(packageName: string): string[] {
  return Object.entries(packageLock.packages)
    .filter(([lockPath]) => packageNameFromLockPath(lockPath) === packageName)
    .map(([, entry]) => entry.version)
    .filter((version): version is string => Boolean(version));
}

describe("frontend npm security posture", () => {
  it("enthält keine bekannten kompromittierten Versionen aus den aktuellen npm Supply-Chain-Vorfällen", () => {
    const findings = Object.entries(deniedVersions).flatMap(
      ([packageName, versions]) =>
        findInstalledPackageVersions(packageName)
          .filter((installedVersion) => versions.includes(installedVersion))
          .map((installedVersion) => `${packageName}@${installedVersion}`),
    );

    expect(findings).toEqual([]);
  });

  it("enthält keinen TanStack-Lockfile-Fingerprint des kompromittierten Router/Start-Vorfalls", () => {
    const findings = Object.entries(packageLock.packages)
      .filter(
        ([lockPath, entry]) =>
          packageNameFromLockPath(lockPath)?.startsWith("@tanstack/") &&
          entry.optionalDependencies?.["@tanstack/setup"] ===
            compromisedTanStackSetup,
      )
      .map(([lockPath]) => lockPath);

    expect(findings).toEqual([]);
  });

  it("pinnt alle produktiven Frontend-Abhängigkeiten im package.json exakt", () => {
    const floatingDependencies = Object.entries(packageJson.dependencies)
      .filter(([, version]) => !/^\d+\.\d+\.\d+/.test(version))
      .map(([packageName, version]) => `${packageName}@${version}`);

    expect(floatingDependencies).toEqual([]);
  });

  it("hält package.json und package-lock.json für produktive Abhängigkeiten synchron", () => {
    const mismatches = Object.entries(packageJson.dependencies)
      .filter(([packageName, expectedVersion]) => {
        const installedVersions = findInstalledPackageVersions(packageName);
        return !installedVersions.includes(expectedVersion);
      })
      .map(([packageName, expectedVersion]) => {
        const installedVersions = findInstalledPackageVersions(packageName);
        return `${packageName}: package.json=${expectedVersion}, lockfile=${installedVersions.join(", ")}`;
      });

    expect(mismatches).toEqual([]);
  });
});
