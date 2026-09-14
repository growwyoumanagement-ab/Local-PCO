import fs from 'fs';
import path from 'path';
import 'dotenv/config';

export default ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDT-WL_Mra97by-7R7O44ASb4oCyS8Ak7A';

  const androidConfig = { ...config.android };
  const iosConfig = { ...config.ios };

  // Check if Firebase configuration files are physically present.
  // These are gitignored and absent on EAS servers, so we conditionally
  // add the Firebase Expo plugin only when the files exist.
  // Without this guard, @react-native-firebase/app crashes Prebuild on EAS.
  const googleServicesJsonExists = fs.existsSync(path.join(__dirname, 'google-services.json'));
  const googleServicesPlistExists = fs.existsSync(path.join(__dirname, 'GoogleService-Info.plist'));

  if (!googleServicesJsonExists) {
    delete androidConfig.googleServicesFile;
  }

  if (!googleServicesPlistExists) {
    delete iosConfig.googleServicesFile;
  }

  // Start from the existing plugins defined in app.json (Firebase plugin is NOT in app.json).
  // Add Firebase plugin conditionally when google-services.json is present on disk.
  const plugins = [...(config.plugins || [])];
  if (googleServicesJsonExists) {
    plugins.push('@react-native-firebase/app');
  }

  return {
    ...config,
    plugins,
    ios: {
      ...iosConfig,
      config: {
        ...iosConfig.config,
        googleMapsApiKey
      }
    },
    android: {
      ...androidConfig,
      config: {
        ...androidConfig.config,
        googleMaps: {
          ...androidConfig.config?.googleMaps,
          apiKey: googleMapsApiKey
        }
      }
    }
  };
};
