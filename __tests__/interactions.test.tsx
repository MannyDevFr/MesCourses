import {
  render,
  screen,
  userEvent,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { AddProductInput } from '../src/components/AddProductInput';
import { ProductItem } from '../src/components/ProductItem';
import { EditNameDialog } from '../src/components/common/EditNameDialog';
import { EditableName } from '../src/components/common/EditableName';
import { DeleteDialog } from '../src/components/common/DeleteDialog';
jest.mock('../src/hooks/useTranslations', () => ({
  useTranslations: () =>
    // Jest hoists this factory; load the fixture inside it.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/constants/translations').translations.es,
}));
jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.useFakeTimers();

test('double tap edits without opening a list and single tap opens it', async () => {
  const edit = jest.fn(),
    open = jest.fn();
  await render(<EditableName name="Market" onEdit={edit} onPress={open} />);
  const name = screen.getByRole('button', { name: 'Market' });
  await fireEvent.press(name);
  await fireEvent.press(name);
  jest.runOnlyPendingTimers();
  expect(edit).toHaveBeenCalledTimes(1);
  expect(open).not.toHaveBeenCalled();
  jest.setSystemTime(Date.now() + 500);
  await fireEvent.press(name);
  jest.runOnlyPendingTimers();
  expect(open).toHaveBeenCalledTimes(1);
});

test('delete cancellation does not delete and failed confirmation stays recoverable', async () => {
  const close = jest.fn(),
    confirm = jest.fn().mockResolvedValue(false),
    user = userEvent.setup();
  await render(
    <DeleteDialog
      kind="list"
      busy={false}
      onConfirm={confirm}
      onClose={close}
    />,
  );
  await user.press(screen.getByRole('button', { name: 'Cancelar' }));
  expect(close).toHaveBeenCalledTimes(1);
  expect(confirm).not.toHaveBeenCalled();
  await user.press(screen.getByRole('button', { name: 'Eliminar' }));
  expect(confirm).toHaveBeenCalledWith(false);
  expect(screen.getByRole('alert')).toBeOnTheScreen();
});
test('quick add clears only after successful save and suggestions add products', async () => {
  const add = jest
    .fn()
    .mockResolvedValueOnce(false)
    .mockResolvedValueOnce(true);
  const user = userEvent.setup();
  await render(
    <AddProductInput
      label="Nuevo producto"
      suggestions={['Leche']}
      onAdd={add}
      busy={false}
    />,
  );
  const input = screen.getByLabelText('Nuevo producto');
  await user.type(input, 'Pan');
  await user.press(screen.getByRole('button', { name: 'Agregar' }));
  expect(input).toHaveDisplayValue('Pan');
  await user.press(screen.getByRole('button', { name: 'Agregar' }));
  expect(input).toHaveDisplayValue('');
  await user.type(input, 'Le', { skipBlur: true });
  await user.press(screen.getByRole('button', { name: 'Leche' }));
  expect(add).toHaveBeenLastCalledWith('Leche');
});
test('catalogue suggestions match without accents and clear the prefix after selection', async () => {
  const add = jest.fn().mockResolvedValue(true);
  const user = userEvent.setup();
  await render(
    <AddProductInput
      label="Nuevo producto"
      suggestions={['Œufs', 'Épinards surgelés', 'Café']}
      onAdd={add}
      busy={false}
    />,
  );
  await user.type(screen.getByLabelText('Nuevo producto'), 'epi', {
    skipBlur: true,
  });
  expect(
    screen.getByRole('button', { name: 'Épinards surgelés' }),
  ).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Café' })).not.toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: 'Épinards surgelés' }));
  expect(add).toHaveBeenCalledWith('Épinards surgelés');
  expect(screen.getByLabelText('Nuevo producto')).toHaveDisplayValue('');
  await user.type(screen.getByLabelText('Nuevo producto'), 'oe', {
    skipBlur: true,
  });
  expect(screen.getByRole('button', { name: 'Œufs' })).toBeOnTheScreen();
});

test('selector adds the highlighted completion with Enter and supports a custom name', async () => {
  const add = jest.fn().mockResolvedValue(true);
  const user = userEvent.setup();
  await render(
    <AddProductInput
      label="Nuevo producto"
      suggestions={['Lait demi-écrémé', 'Crème fraîche']}
      onAdd={add}
      busy={false}
    />,
  );
  const input = screen.getByLabelText('Nuevo producto');
  expect(
    screen.queryByRole('button', { name: 'Crème fraîche' }),
  ).not.toBeOnTheScreen();
  await user.type(input, 'creme', { skipBlur: true });
  expect(screen.getByRole('button', { name: 'Crème fraîche' })).toBeSelected();
  await fireEvent(input, 'submitEditing');
  expect(add).toHaveBeenLastCalledWith('Crème fraîche');
  expect(input).toHaveDisplayValue('');
  await user.type(input, 'creme', { skipBlur: true });
  await fireEvent(input, 'keyPress', { nativeEvent: { key: 'ArrowUp' } });
  await fireEvent(input, 'submitEditing');
  expect(add).toHaveBeenLastCalledWith('creme');
  await user.type(input, 'Mi producto nuevo', { skipBlur: true });
  await fireEvent(input, 'submitEditing');
  expect(add).toHaveBeenLastCalledWith('Mi producto nuevo');
});

test('rapid entry stays editable while saving and preserves the next draft', async () => {
  let finish!: (success: boolean) => void;
  const add = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValue(true);
  const user = userEvent.setup();
  const props = { label: 'Nuevo producto', suggestions: [], onAdd: add };
  await render(<AddProductInput {...props} busy={false} />);
  await user.type(screen.getByLabelText('Nuevo producto'), 'Pan');
  await fireEvent(screen.getByLabelText('Nuevo producto'), 'submitEditing');
  await screen.rerender(<AddProductInput {...props} busy />);
  await user.clear(screen.getByLabelText('Nuevo producto'));
  await user.type(screen.getByLabelText('Nuevo producto'), 'Leche');
  await fireEvent(screen.getByLabelText('Nuevo producto'), 'submitEditing');
  expect(add).toHaveBeenCalledTimes(1);
  finish(true);
  await waitFor(() =>
    expect(screen.getByLabelText('Nuevo producto')).toHaveDisplayValue('Leche'),
  );
  await screen.rerender(<AddProductInput {...props} busy={false} />);
  await fireEvent(screen.getByLabelText('Nuevo producto'), 'submitEditing');
  expect(add).toHaveBeenLastCalledWith('Leche');
  expect(screen.getByLabelText('Nuevo producto')).toHaveDisplayValue('');
});

test.each([1, 2])(
  'product quantity %i supports increment and decrement with a minimum of one',
  async (initialQuantity) => {
    const toggle = jest.fn(),
      quantity = jest.fn(),
      user = userEvent.setup();
    await render(
      <ProductItem
        product={{
          id: 1,
          listId: 1,
          name: 'Leche',
          quantity: initialQuantity,
          isChecked: false,
          sortOrder: 1,
        }}
        busy={false}
        onToggle={toggle}
        onQuantity={quantity}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    const decrease = screen.getByRole('button', {
      name: 'Reducir cantidad: Leche',
    });
    if (initialQuantity === 1) expect(decrease).toBeDisabled();
    else {
      await user.press(decrease);
      expect(quantity).toHaveBeenCalledWith(-1);
    }
    expect(screen.queryByText('Cantidad')).not.toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Aumentar cantidad: Leche' }),
    ).toHaveTextContent(`×${initialQuantity}`);
    await user.press(screen.getByRole('checkbox', { name: 'Leche' }));
    jest.runOnlyPendingTimers();
    expect(toggle).toHaveBeenCalledTimes(1);
    await user.press(
      screen.getByRole('button', { name: 'Aumentar cantidad: Leche' }),
    );
    expect(quantity).toHaveBeenCalledWith(1);
  },
);
test('blank rename is rejected without closing or persisting', async () => {
  const save = jest.fn(),
    close = jest.fn(),
    user = userEvent.setup();
  await render(
    <EditNameDialog
      name="Pan"
      max={300}
      busy={false}
      onSave={save}
      onClose={close}
    />,
  );
  await fireEvent.changeText(screen.getByLabelText('Nombre'), '   ');
  await user.press(screen.getByRole('button', { name: 'Guardar' }));
  expect(save).not.toHaveBeenCalled();
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toBeOnTheScreen();
});
