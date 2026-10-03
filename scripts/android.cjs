const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.dirname(require.resolve('../package.json'));
const candidates = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk'),
  'C:\\Program Files (x86)\\Android\\android-sdk',
];
const sdk = candidates.find(
  (candidate) =>
    candidate && fs.existsSync(path.join(candidate, 'platform-tools')),
);
if (!sdk) {
  console.error('Set ANDROID_HOME to your installed Android SDK.');
  process.exit(1);
}
let sdkPath = sdk;
if (process.platform === 'win32') {
  // NDK toolchain discovery fails for SDK paths containing spaces on Windows.
  sdkPath = path.join(root, '.android-sdk');
  if (!fs.existsSync(sdkPath))
    fs.symlinkSync(fs.realpathSync(sdk), sdkPath, 'junction');
}
const args = process.argv.slice(2);
const emulatorOnly = args.includes('--emulator-only');
const result = spawnSync(
  process.execPath,
  [
    require.resolve('expo/bin/cli'),
    'run:android',
    ...args.filter((arg) => arg !== '--emulator-only'),
  ],
  {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      ANDROID_HOME: sdkPath,
      ANDROID_SDK_ROOT: sdkPath,
      ...(emulatorOnly
        ? { ORG_GRADLE_PROJECT_reactNativeArchitectures: 'x86_64' }
        : {}),
    },
  },
);
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
