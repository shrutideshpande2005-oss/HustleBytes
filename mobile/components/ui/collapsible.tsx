import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: React.PropsWithChildren<{ title: string }>) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isOpen ? 'chevron-down' : 'chevron-forward'}
          size={18}
          color={theme === 'light' ? COLORS.textSecondary : COLORS.textMuted}
        />
        <Text style={[styles.title, { color: theme === 'light' ? COLORS.textPrimary : COLORS.textOnDark }]}>
          {title}
        </Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.content}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
