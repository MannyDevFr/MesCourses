import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../constants/colors';
export function IconButton({
  icon,
  label,
  onPress,
  disabled,
  color = colors.primary,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: 48,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
}
