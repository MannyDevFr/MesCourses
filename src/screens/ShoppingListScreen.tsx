import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import type { Product } from '../models/Product';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { useTranslations } from '../hooks/useTranslations';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { AddProductInput } from '../components/AddProductInput';
import { ProductList } from '../components/ProductList';
import { EditNameDialog } from '../components/common/EditNameDialog';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { colors } from '../constants/colors';
import { ModalCard } from '../components/common/ModalCard';
import {
  productSuggestions,
  categorySuggestions,
  categoryLabel,
} from '../utils/catalog';
export function ShoppingListScreen() {
  const busy = useShoppingListStore((s) => s.busy),
    products = useShoppingListStore((s) => s.products),
    t = useTranslations();
  const list = useShoppingListStore((s) =>
    s.lists.find((l) => l.id === s.activeListId),
  );
  const general = useShoppingListStore((s) => s.generalCatalog);
  const personal = useShoppingListStore((s) => s.personalCatalog);
  const category = list?.category ?? 'supermarket';
  const generalCategories = useShoppingListStore((s) => s.generalCategories);
  const personalCategories = useShoppingListStore((s) => s.personalCategories);
  const availableCategories = categorySuggestions(
    generalCategories,
    personalCategories,
  );
  const currentCategory = availableCategories.find((c) => c.id === category);
  const currentCategoryName = currentCategory
    ? categoryLabel(currentCategory, t.categoryNames)
    : t.categoryNames.supermarket;
  const suggestions = productSuggestions(category, general, personal);
  const [choosingCategory, setChoosingCategory] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null),
    deletion = useDeleteConfirmation('product');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'bought'>('all');
  const visibleProducts = products.filter(
    (p) =>
      p.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) &&
      (filter === 'all' || (filter === 'bought' ? p.isChecked : !p.isChecked)),
  );
  const checked = products.filter((p) => p.isChecked).length;
  const header = (
    <View>
      <Button
        label={`${t.category}: ${currentCategoryName}`}
        secondary
        onPress={() => setChoosingCategory(true)}
        style={{ alignSelf: 'flex-start', marginBottom: 8 }}
      />
      <AddProductInput
        label={t.newProduct}
        suggestions={suggestions}
        onAdd={(name) => useShoppingListStore.getState().addProduct(name)}
        busy={busy}
      />
      <Text style={{ color: colors.secondary, fontSize: 12, marginBottom: 8 }}>
        {general.some((p) => p.category === category)
          ? t.personalFirst
          : t.personalOnly}
      </Text>
      <Text
        accessibilityLiveRegion="polite"
        style={{ color: colors.secondary, fontSize: 14, marginBottom: 6 }}
      >
        {t.pending}: {products.length - checked} · {t.bought}: {checked}
      </Text>
      {products.length > 0 && (
        <>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={t.progress}
            accessibilityValue={{ min: 0, max: products.length, now: checked }}
            style={{
              height: 6,
              borderRadius: 4,
              backgroundColor: colors.border,
              overflow: 'hidden',
              marginBottom: 6,
            }}
          >
            <View
              style={{
                height: 8,
                width: `${(checked / products.length) * 100}%`,
                backgroundColor: colors.success,
              }}
            />
          </View>
          {checked === products.length && (
            <Text
              style={{
                color: colors.success,
                fontFamily: 'OpenSans-Semibold',
                marginBottom: 6,
              }}
            >
              {t.complete}
            </Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              paddingLeft: 12,
              marginBottom: 6,
            }}
          >
            <TextInput
              accessibilityLabel={t.search}
              placeholder={t.search}
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              style={{
                flex: 1,
                minWidth: 0,
                minHeight: 36,
                fontSize: 15,
                paddingVertical: 4,
                color: colors.text,
              }}
            />
            {!!query && (
              <IconButton
                icon="close"
                label={t.clearSearch}
                onPress={() => setQuery('')}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 6,
            }}
          >
            {(['all', 'pending', 'bought'] as const).map((key) => (
              <Button
                key={key}
                label={t[key]}
                selected={filter === key}
                secondary={filter !== key}
                onPress={() => setFilter(key)}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
        backgroundColor: colors.background,
      }}
    >
      <ProductList
        header={header}
        visibleProducts={visibleProducts}
        onEdit={setEditing}
        onDelete={(id) => void deletion.request(id)}
      />
      {choosingCategory && (
        <ModalCard
          onClose={() => {
            if (!busy) setChoosingCategory(false);
          }}
        >
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: 'OpenSans-Semibold',
              fontSize: 20,
              color: colors.primary,
              marginBottom: 12,
            }}
          >
            {t.category}
          </Text>
          <View style={{ gap: 8 }}>
            <AddProductInput
              autoFocus
              label={t.chooseCategory}
              suggestions={availableCategories.map((c) =>
                categoryLabel(c, t.categoryNames),
              )}
              max={200}
              busy={busy}
              onAdd={async (name) => {
                if (!list) return false;
                const success = await useShoppingListStore
                  .getState()
                  .setListCategoryByName(list.id, name);
                if (success) setChoosingCategory(false);
                return success;
              }}
            />
            <Button
              label={t.cancel}
              secondary
              disabled={busy}
              onPress={() => setChoosingCategory(false)}
            />
          </View>
        </ModalCard>
      )}
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
          name={products.find((item) => item.id === deletion.target)?.name}
          busy={busy}
          onConfirm={deletion.confirm}
          onClose={deletion.close}
        />
      )}
    </View>
  );
}
