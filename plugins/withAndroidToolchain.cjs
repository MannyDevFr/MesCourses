const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withAndroidToolchain(config) {
  return withAppBuildGradle(config, (mod) => {
    const marker =
      '// MesCourses: use long-path capable CMake and Ninja on Windows';
    if (!mod.modResults.contents.includes(marker)) {
      mod.modResults.contents += `
${marker}
android {
  externalNativeBuild {
    cmake {
      version "3.31.6"
    }
  }
}
`;
    }
    return mod;
  });
};
