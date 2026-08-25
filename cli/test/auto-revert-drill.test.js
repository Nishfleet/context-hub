import { test, expect } from 'vitest';

// AUTO-REVERT DRILL fixture. Intentionally failing assertion to prove the
// auto-revert mechanism restores green main. This file is a pure addition;
// it touches no shipped code, config, or content. It will be auto-reverted.
test('auto-revert drill: intentionally failing to trigger revert', () => {
  expect(1).toBe(2);
});
