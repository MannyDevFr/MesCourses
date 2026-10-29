import { FlatList, Text } from 'react-native';
import type { Product } from '../models/Product';
import { ProductItem } from './ProductItem';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { useTranslations } from '../hooks/useTranslations';
import { colors } from '../constants/colors';
export function ProductList({
  onEdit,
  onDelete,
  header,
  visibleProducts,
}: {
  header?: React.ReactElement;
  visibleProducts?: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}) {
  const products = useShoppingListStore((s) => s.products),
    busy = useShoppingListStore((s) => s.busy),
    t = useTranslations();
  return (
    <FlatList
      data={visibleProducts ?? products}
      ListHeaderComponent={header}
      keyboardDismissMode="on-drag"
      keyExtractor={(item) => String(item.id)}
      keyboardShouldPersistTaps="handled"
      refreshing={busy}
      onRefresh={() => void useShoppingListStore.getState().refresh()}
      contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      ListEmptyComponent={
        <Text
          style={{ color: colors.secondary, padding: 24, textAlign: 'center' }}
        >
          {products.length ? t.noResults : `${t.noProducts}\n\n${t.emptyHint}`}
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
