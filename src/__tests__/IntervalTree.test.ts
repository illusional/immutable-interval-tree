import { IntervalTree, IIntervalNode } from '../index';

const triTree = [
  { identifier: "1st", low: 1, high: 2 },
  { identifier: "3rd", low: 3, high: 4 },
  { identifier: "2nd", low: 0, high: 1 },
].reduce((tr, int) => IntervalTree.insert_node(tr, int), IntervalTree.empty())

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

test('add-two-children', () => {
  expect(triTree.root).toBe("1st")
  expect(triTree.children["1st"].left).toBe("2nd")
  expect(triTree.children["1st"].right).toBe("3rd")
  // expect(triTree.children["1st"].height).toBe(2)
  expect(triTree.children["2nd"].left).toBeNull()
  expect(triTree.children["2nd"].right).toBeNull()
  expect(triTree.children["3rd"].left).toBeNull()
  expect(triTree.children["3rd"].right).toBeNull()

  const inorder = IntervalTree.inorder(triTree)
  expect(inorder).toHaveLength(3)
  expect(inorder).toEqual([
    { low: 0, high: 1 },
    { low: 1, high: 2 },
    { low: 3, high: 4 }
  ])
})

test('remove-left-empty-child', () => {
  const tree = IntervalTree.remove(triTree, "2nd")
  expect(tree.index["2nd"]).toBeUndefined()
  expect(tree.children["1st"].left).toBeNull()
})

test('remove-right-empty-child', () => {
  const tree = IntervalTree.remove(triTree, "3rd")
  expect(tree.index["3rd"]).toBeUndefined()
  expect(tree.children["1st"].right).toBeNull()
})

test('remove-left-one-descendent', () => {
  var tree = [
    // notice reordered tree array
    { identifier: "1st", low: 3, high: 4 },
    { identifier: "2nd", low: 1, high: 2 },
    { identifier: "3rd", low: 0, high: 1 },
  ].reduce((tr, int) => IntervalTree.insert_node(tr, int), IntervalTree.empty())

  expect(tree.children["1st"].left).toBe("2nd")
  expect(tree.children["2nd"].left).toBe("3rd")

  const shortTree = IntervalTree.remove(tree, "2nd")

  expect(shortTree.index["2nd"]).toBeUndefined()
  expect(shortTree.children["1st"].left).toBe("3rd")
})

test('remove-right-one-descendent', () => {
  var tree = [
    // notice reordered tree array
    { identifier: "1st", low: 0, high: 1 },
    { identifier: "2nd", low: 1, high: 2 },
    { identifier: "3rd", low: 3, high: 4 },
  ].reduce((tr, int) => IntervalTree.insert_node(tr, int), IntervalTree.empty())

  expect(tree.children["1st"].right).toBe("2nd")
  expect(tree.children["2nd"].right).toBe("3rd")

  const shortTree = IntervalTree.remove(tree, "2nd")

  expect(shortTree.index["2nd"]).toBeUndefined()
  expect(shortTree.children["1st"].right).toBe("3rd")
})

test('remove-root-two-children', () => {
  let tree = [
    { identifier: "1st", low: 1, high: 2 },
    { identifier: "3rd", low: 3, high: 4 },
    { identifier: "2nd", low: 0, high: 1 },
  ].reduce((tr, int) => IntervalTree.insert_node(tr, int), IntervalTree.empty())
  tree = IntervalTree.remove(tree, "1st")
  expect(tree.index["1st"]).toBeUndefined()
  expect(tree.children["1st"]).toBeUndefined()
  expect(tree.root).toBe("3rd")

  expect(tree.children["3rd"].left).toBe("2nd")
})


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