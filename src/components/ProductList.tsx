import { FlatList, Text } from 'react-native';
import type { Product } from '../models/Product';
import { ProductItem } from './ProductItem';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { useTranslations } from '../hooks/useTranslations';
import { colors } from '../constants/colors';
export function ProductList({
  onEdit,
  onDelete,
}: {
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}) {
  const products = useShoppingListStore((s) => s.products),
    busy = useShoppingListStore((s) => s.busy),
    t = useTranslations();
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item.id)}
      keyboardShouldPersistTaps="handled"
      refreshing={busy}
      onRefresh={() => void useShoppingListStore.getState().refresh()}
      contentContainerStyle={{ paddingBottom: 32 }}
      ListEmptyComponent={
        <Text
          style={{ color: colors.secondary, padding: 24, textAlign: 'center' }}
        >
          {t.noProducts}
        </Text>
      }
      renderItem={({ item }) => (
        <ProductItem
          product={item}
          busy={busy}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
          onToggle={() =>
            void useShoppingListStore.getState().toggleProduct(item.id)
          }
          onQuantity={(delta) =>
            void useShoppingListStore.getState().changeQuantity(item.id, delta)
          }
        />
      )}
    />
  );
}
