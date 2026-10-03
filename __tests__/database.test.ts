import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initialSchema } from '../src/database/schema';

test('persists products across reopening and deletes children with their list', () => {
  const folder = mkdtempSync(join(tmpdir(), 'mescourses-test-'));
  const file = join(folder, 'test.db');
  let db = new DatabaseSync(file);
  try {
    db.exec('PRAGMA foreign_keys=ON');
    db.exec(initialSchema);
    db.prepare('INSERT INTO shopping_lists(name,createdAt) VALUES (?,?)').run(
      'Courses',
      '2026-10-04',
    );
    db.prepare(
      'INSERT INTO products(listId,name,quantity,isChecked,sortOrder) VALUES (?,?,?,?,?)',
    ).run(1, 'Lait', 2, 0, 1);
    db.close();
    db = new DatabaseSync(file);
    db.exec('PRAGMA foreign_keys=ON');
    expect(db.prepare('SELECT name,quantity FROM products').get()).toEqual({
      name: 'Lait',
      quantity: 2,
    });
    db.prepare('DELETE FROM shopping_lists WHERE id=?').run(1);
    expect(db.prepare('SELECT COUNT(*) AS count FROM products').get()).toEqual({
      count: 0,
    });
  } finally {
    db.close();
    rmSync(folder, { recursive: true, force: true });
  }
});

test('database enforces names, quantities, parent lists and purchased ordering', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys=ON');
    db.exec(initialSchema);
    expect(() =>
      db
        .prepare('INSERT INTO shopping_lists(name,createdAt) VALUES (?,?)')
        .run(' ', 'now'),
    ).toThrow();
    db.prepare('INSERT INTO shopping_lists(name,createdAt) VALUES (?,?)').run(
      'Market',
      'now',
    );
    const insert = db.prepare(
      'INSERT INTO products(listId,name,quantity,isChecked,sortOrder) VALUES (?,?,?,?,?)',
    );
    expect(() => insert.run(1, 'Milk', 0, 0, 1)).toThrow();
    expect(() => insert.run(999, 'Milk', 1, 0, 1)).toThrow();
    insert.run(1, 'Bought first', 1, 1, 1);
    insert.run(1, 'Pending', 1, 0, 2);
    expect(
      db
        .prepare('SELECT name FROM products ORDER BY isChecked,id')
        .all()
        .map((r) => r.name),
    ).toEqual(['Pending', 'Bought first']);
  } finally {
    db.close();
  }
});
