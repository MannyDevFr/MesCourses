import { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { router } from 'expo-router';

import type { ShoppingList } from '../models/ShoppingList';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { useTranslations } from '../hooks/useTranslations';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { AddProductInput } from '../components/AddProductInput';
import { EditableName } from '../components/common/EditableName';
import { IconButton } from '../components/common/IconButton';
import { EditNameDialog } from '../components/common/EditNameDialog';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { colors } from '../constants/colors';
import { categorySuggestions, categoryLabel } from '../utils/catalog';
export function ListsScreen() {
  const lists = useShoppingListStore((s) => s.lists),
    busy = useShoppingListStore((s) => s.busy),
    t = useTranslations();
  const generalCategories = useShoppingListStore((s) => s.generalCategories);
  const personalCategories = useShoppingListStore((s) => s.personalCategories);
  const suggestions = categorySuggestions(
    generalCategories,
    personalCategories,
  ).map((c) => categoryLabel(c, t.categoryNames));
  const [editing, setEditing] = useState<ShoppingList | null>(null),
    deletion = useDeleteConfirmation('list');
  async function add(name: string) {
    const list = await useShoppingListStore.getState().createList(name);
    if (list)
      router.push({ pathname: '/shopping-list', params: { listId: list.id } });
    return !!list;
  }
  async function open(id: number) {
    if (await useShoppingListStore.getState().openList(id))
      router.push({ pathname: '/shopping-list', params: { listId: id } });
  }
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
      <FlatList
        ListHeaderComponent={
          <View>
            <Text
              style={{
                color: colors.secondary,
                fontSize: 14,
                lineHeight: 20,
                marginBottom: 8,
              }}
            >
              {t.subtitle}
            </Text>
            <AddProductInput
              label={t.newList}
              suggestions={suggestions}
              onAdd={add}
              busy={busy}
              max={200}
            />
            <Text
              style={{
                color: colors.secondary,
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              {t.yourLists} · {lists.length}
            </Text>
          </View>
        }
        data={lists}
        keyExtractor={(item) => String(item.id)}
        refreshing={busy}
        onRefresh={() => void useShoppingListStore.getState().refresh()}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={
          <Text
            style={{
              color: colors.secondary,
              textAlign: 'center',
              padding: 24,
            }}
          >
            {t.noLists}
            {'\n\n'}
            {t.emptyHint}
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 8,
              paddingVertical: 0,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <EditableName
              name={item.name}
              onPress={() => void open(item.id)}
              onEdit={() => setEditing(item)}
              disabled={busy}
            />
            <IconButton
              icon="chevron-forward"
              label={`${t.openList}: ${item.name}`}
              onPress={() => void open(item.id)}
              disabled={busy}
            />
            <IconButton
              icon="create-outline"
              label={`${t.edit}: ${item.name}`}
              onPress={() => setEditing(item)}
              disabled={busy}
            />
            <IconButton
              icon="trash-outline"
              label={`${t.remove}: ${item.name}`}
              color={colors.error}
              onPress={() => void deletion.request(item.id)}
              disabled={busy}
            />
          </View>
        )}
      />
      {editing && (
        <EditNameDialog
          name={editing.name}
          max={200}
          busy={busy}
          onSave={(name) =>
            useShoppingListStore.getState().renameList(editing.id, name)
          }
          onClose={() => setEditing(null)}
        />
      )}
      {deletion.target !== null && (
        <DeleteDialog
          kind="list"
          name={lists.find((item) => item.id === deletion.target)?.name}
          busy={busy}
          onConfirm={deletion.confirm}
          onClose={deletion.close}
        />
      )}
    </View>
  );
}
