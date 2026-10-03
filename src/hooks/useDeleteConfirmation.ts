import { useState } from 'react';
import { useShoppingListStore } from '../stores/shoppingListStore';
export function useDeleteConfirmation(kind: 'list' | 'product') {
  const [target, setTarget] = useState<number | null>(null);
  const skip = useShoppingListStore((s) =>
    kind === 'list' ? s.skipListDelete : s.skipProductDelete,
  );
  async function remove(id: number) {
    const s = useShoppingListStore.getState();
    return kind === 'list' ? s.deleteList(id) : s.deleteProduct(id);
  }
  async function request(id: number) {
    if (skip) await remove(id);
    else setTarget(id);
  }
  async function confirm(dontAsk: boolean) {
    if (target === null) return false;
    if (
      dontAsk &&
      !(await useShoppingListStore.getState().setSkipDelete(kind, true))
    )
      return false;
    const success = await remove(target);
    if (success) setTarget(null);
    return success;
  }
  return { target, request, confirm, close: () => setTarget(null) };
}
