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
export function ListsScreen() {
  const lists = useShoppingListStore((s) => s.lists),
    busy = useShoppingListStore((s) => s.busy),
    t = useTranslations();
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
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text
        style={{
          fontFamily: 'OpenSans-Semibold',
          fontSize: 28,
          color: colors.primary,
          marginBottom: 16,
        }}
      >
        MesCourses<Text style={{ color: colors.accent }}>+</Text>
      </Text>
      <AddProductInput
        label={t.newList}
        suggestions={t.listSuggestions}
        onAdd={add}
        busy={busy}
        max={200}
      />
      <Text style={{ color: colors.secondary, fontSize: 12, marginBottom: 12 }}>
        {t.hint}
      </Text>
      <FlatList
        data={lists}
        keyExtractor={(item) => String(item.id)}
        refreshing={busy}
        onRefresh={() => void useShoppingListStore.getState().refresh()}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text
            style={{
              color: colors.secondary,
              textAlign: 'center',
              padding: 24,
            }}
          >
            {t.noLists}
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 8,
              marginBottom: 10,
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
              label={item.name}
              onPress={() => void open(item.id)}
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
          busy={busy}
          onConfirm={deletion.confirm}
          onClose={deletion.close}
        />
      )}
    </View>
  );
}
