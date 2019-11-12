import { IntervalTree } from '../index';
test('empty', () => {
  let tree = IntervalTree.empty()
  expect(Object.keys(tree.children).length).toBe(0);
  expect(Object.keys(tree.index).length).toBe(0);
  expect(tree.root).toBe(null);
});

test('inorder-empty', () => {
  let tree = IntervalTree.empty()
  expect(IntervalTree.inorder(tree)).toHaveLength(0)
})

test('inorder-one', () => {
  const tree = IntervalTree.insert(IntervalTree.empty(), "first", 1, 2)
  const inorder = IntervalTree.inorder(tree)
  expect(inorder).toEqual([{ low: 1, high: 2 }])
})

test('add-first', () => {
  let tree = IntervalTree.empty()
  tree = IntervalTree.insert(tree, "first", 1, 2)
  expect(Object.keys(tree.children)).toHaveLength(1);
  expect(Object.keys(tree.index)).toHaveLength(1);
  expect(tree.root).toBe("first");
  expect(tree.children["first"]).toEqual({ left: null, right: null, low: 1, high: 2, height: 1 })
});

test('add-remove-root', () => {
  let tree = IntervalTree.empty()
  tree = IntervalTree.insert(tree, "first", 1, 2)
  tree = IntervalTree.remove(tree, "first")
  expect(Object.keys(tree.children).length).toBe(0);
  expect(Object.keys(tree.index).length).toBe(0);
  expect(tree.root).toBe(null);
});


  // private static test() {
  //     const ints = [
  //         [15, 20], [10, 30], [17, 19],
  //         [5, 20], [12, 15], [30, 40]
  //     ];
  //     const n = ints.length / ints[0].length
  //     let tree = IntervalTree.empty()

  //     tree = ints.reduce((it, int, idx) => IntervalTree.insert(it, idx.toString(), int[0], int[1]), tree)
  //     let inorder = this.inorder(tree)
  //     console.log(inorder)

  //     const search: IInterval = { low: 6, high: 7 }
  //     const result = IntervalTree.overlappingInterval(tree, search)
  //     if (result) {
  //         const child = tree.index[result]
  //         console.log(`Overlaps with [${child.low}, ${child.high}]: "${result}"`)
  //     } else {
  //         console.log("No overlap")
  //     }

  //     tree = IntervalTree.remove(tree, "5")

  //     inorder = this.inorder(tree)
  //     console.log(inorder)

  // }