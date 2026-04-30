import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, style }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default SafeAreaWrapper;
