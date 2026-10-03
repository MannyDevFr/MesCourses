export function validName(value: string, max: number) {
  const name = value.trim();
  if (!name || name.length > max) throw new Error('Invalid name');
  return name;
}
