import { useState } from 'react';
import { View, Text } from 'react-native';
import type { Product } from '../models/Product';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { useTranslations } from '../hooks/useTranslations';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { AddProductInput } from '../components/AddProductInput';
import { ProductList } from '../components/ProductList';
import { EditNameDialog } from '../components/common/EditNameDialog';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { colors } from '../constants/colors';
export function ShoppingListScreen() {
  const busy = useShoppingListStore((s) => s.busy),
    products = useShoppingListStore((s) => s.products),
    t = useTranslations();
  const [editing, setEditing] = useState<Product | null>(null),
    deletion = useDeleteConfirmation('product');
  const checked = products.filter((p) => p.isChecked).length;
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <AddProductInput
        label={t.newProduct}
        suggestions={t.productSuggestions}
        onAdd={(name) => useShoppingListStore.getState().addProduct(name)}
        busy={busy}
      />
      <Text style={{ color: colors.secondary, fontSize: 14, marginBottom: 12 }}>
        {t.pending}: {products.length - checked} · {t.bought}: {checked}
      </Text>
      <ProductList
        onEdit={setEditing}
        onDelete={(id) => void deletion.request(id)}
      />
      {editing && (
        <EditNameDialog
          name={editing.name}
          max={300}
          busy={busy}
          onSave={(name) =>
            useShoppingListStore.getState().renameProduct(editing.id, name)
          }
          onClose={() => setEditing(null)}
        />
      )}
      {deletion.target !== null && (
        <DeleteDialog
          kind="product"
          busy={busy}
          onConfirm={deletion.confirm}
          onClose={deletion.close}
        />
      )}
    </View>
  );
}
