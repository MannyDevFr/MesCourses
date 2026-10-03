import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Product } from '../models/Product';
import { colors } from '../constants/colors';
import { IconButton } from './common/IconButton';
import { EditableName } from './common/EditableName';
import { useTranslations } from '../hooks/useTranslations';
export function ProductItem({
  product,
  busy,
  onToggle,
  onQuantity,
  onEdit,
  onDelete,
}: {
  product: Product;
  busy: boolean;
  onToggle: () => void;
  onQuantity: (delta: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations();
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={product.name}
          accessibilityState={{ checked: product.isChecked, disabled: busy }}
          disabled={busy}
          onPress={onToggle}
          style={({ pressed }) => ({
            width: 48,
            minHeight: 48,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons
            name={product.isChecked ? 'checkbox' : 'square-outline'}
            size={24}
            color={colors.primary}
          />
        </Pressable>
        <EditableName
          name={product.name}
          checked={product.isChecked}
          disabled={busy}
          onEdit={onEdit}
        />
        <IconButton
          icon="trash-outline"
          label={`${t.remove}: ${product.name}`}
          color={colors.error}
          disabled={busy}
          onPress={onDelete}
        />
      </View>
      <View style={styles.quantity}>
        <IconButton
          icon="remove"
          label={`${t.decrease}: ${product.name}`}
          disabled={busy || product.quantity <= 1}
          onPress={() => onQuantity(-1)}
        />
        <Text accessibilityLabel={`${product.quantity}`} style={styles.count}>
          x{product.quantity}
        </Text>
        <IconButton
          icon="add"
          label={`${t.increase}: ${product.name}`}
          disabled={busy}
          onPress={() => onQuantity(1)}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  count: {
    color: colors.secondary,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    minWidth: 32,
    textAlign: 'center',
  },
});
