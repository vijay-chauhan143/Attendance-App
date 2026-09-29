import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

type AppErrorProps = {
  message: string;
};

export function AppError({ message }: AppErrorProps) {
  return (
    <View style={styles.container}>
      <AppText preset="subtitle" style={styles.title}>
        Something went wrong
      </AppText>
      <AppText style={styles.message}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  title: {
    color: '#b91c1c',
    marginBottom: 8,
  },
  message: {
    color: '#7f1d1d',
  },
});
