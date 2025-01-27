import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.roomconverse',
  appName: 'roomconversewithnextjs',
  webDir: 'out',

    plugins: {
      "FirebaseAuthentication": {
        "skipNativeAuth": false,
        "providers": ["google.com"]
      }
    }
};

export default config;
