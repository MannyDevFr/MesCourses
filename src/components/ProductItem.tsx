import { View, Text, Pressable, StyleSheet } from 'react-native';
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
    <View
      style={[
        styles.card,
        product.isChecked && { backgroundColor: colors.successSoft },
      ]}
    >
      <View style={styles.row}>
        <EditableName
          singleLine
          name={product.name}
          checked={product.isChecked}
          disabled={busy}
          onEdit={onEdit}
          onPress={onToggle}
        />
        <IconButton
          icon="remove"
          label={`${t.decrease}: ${product.name}`}
          disabled={busy || product.quantity <= 1}
          onPress={() => onQuantity(-1)}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t.increase}: ${product.name}`}
          accessibilityValue={{ now: product.quantity, min: 1 }}
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={() => onQuantity(1)}
          hitSlop={{ top: 4, bottom: 4 }}
          style={({ pressed }) => [
            styles.quantity,
            { opacity: busy ? 0.4 : pressed ? 0.6 : 1 },
          ]}
        >
          <Text numberOfLines={1} style={styles.count}>
            ×{product.quantity}
          </Text>
        </Pressable>
        <IconButton
          icon="trash-outline"
          label={`${t.remove}: ${product.name}`}
          color={colors.error}
          disabled={busy}
          onPress={onDelete}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  quantity: {
    minWidth: 40,
    minHeight: 36,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: colors.secondary,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    minWidth: 32,
    textAlign: 'center',
  },
});
