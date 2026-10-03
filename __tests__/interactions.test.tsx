import {
  render,
  screen,
  userEvent,
  fireEvent,
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
  await user.press(screen.getByRole('button', { name: 'Leche' }));
  expect(add).toHaveBeenLastCalledWith('Leche');
});
test('product checkbox and quantity controls expose meaningful actions and minimum quantity', async () => {
  const toggle = jest.fn(),
    quantity = jest.fn(),
    user = userEvent.setup();
  await render(
    <ProductItem
      product={{
        id: 1,
        listId: 1,
        name: 'Leche',
        quantity: 1,
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
  expect(
    screen.getByRole('button', { name: 'Reducir cantidad: Leche' }),
  ).toBeDisabled();
  await user.press(screen.getByRole('checkbox', { name: 'Leche' }));
  expect(toggle).toHaveBeenCalledTimes(1);
  await user.press(
    screen.getByRole('button', { name: 'Aumentar cantidad: Leche' }),
  );
  expect(quantity).toHaveBeenCalledWith(1);
});
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
