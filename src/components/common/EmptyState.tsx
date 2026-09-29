import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

type EmptyStateProps = {
  title: string;
  message?: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText preset="subtitle" style={styles.title}>
        {title}
      </AppText>
      {message ? <AppText style={styles.message}>{message}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#475569',
  },
});
