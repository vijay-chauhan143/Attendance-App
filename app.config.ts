import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const appConfig = config as ExpoConfig;
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  const mapsPlugin: NonNullable<ExpoConfig['plugins']> = [
    [
      'react-native-maps',
      googleMapsApiKey
        ? { androidGoogleMapsApiKey: googleMapsApiKey }
        : {},
    ],
  ];

  return {
    ...appConfig,
    extra: {
      ...appConfig.extra,
      googleMapsApiKeyConfigured: Boolean(googleMapsApiKey),
    },
    plugins: [...(appConfig.plugins ?? []), ...mapsPlugin],
  };
};