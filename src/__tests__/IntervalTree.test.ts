import { IntervalTree } from '../index';
test('test-empty', () => {
  let it = IntervalTree.empty()
  expect(Object.keys(it.children).length).toBe(0);
});