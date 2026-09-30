import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type SkeletonProps = {
  height?: number;
  width?: ViewStyle['width'];
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  height = 16,
  width = '100%',
  borderRadius = 4,
  style,
}: SkeletonProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.skeleton, { width, height, borderRadius }, style]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e2e8f0',
  },
});