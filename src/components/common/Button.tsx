import {
  Pressable,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
export function Button({
  label,
  onPress,
  disabled,
  secondary,
  style,
  selected,
  accent,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  accent?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        accent && { backgroundColor: colors.accent },
        style,
        { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={22}
          color={
            accent
              ? colors.onAccent
              : secondary
                ? colors.primary
                : colors.surface
          }
        />
      ) : (
        <Text
          style={[
            styles.label,
            secondary && { color: colors.primary },
            accent && { color: colors.onAccent },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 32,
    minWidth: 48,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: colors.primarySoft },
  label: {
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    color: colors.surface,
  },
});
