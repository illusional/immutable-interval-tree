# Immutable Interval Tree (Pre-alpha)

> This repository is still in development. Intervals can be inserted and queried, but there is still work to be done to remove nodes.

Similar to [davidisaaclee/interval-tree](https://github.com/davidisaaclee/interval-tree), I wanted an type-safe interval tree with immutable functional interface. 

The primary motivations for this project was to be:

- Immutable (to store in Redux)
- Use Typescript
- Dependency free

## Install

```bash
# proposed
# npm install immutable-interval-tree
```


### Common usage patterns

- Add / remove a number of intervals

```typescript
const intervalsToAdd: IIntervalNode[] = []
const intervalsToRemove: string[] = []

let tree: IIntervalTree = IntervalTree.empty()

// insert intervals
tree = intervalsToAdd
    .reduce((tr, int) => IntervalTree.insert_node(tr, int), tree)

// remove intervals
tree = intervalsToRemove
    .reduce((tr, identifier) => IntervalTree.remove(tr, identifier), tree)
```

## Types

The primary types you must consider are:

```typescript
export interface IInterval {
    low: number;
    high: number;
}

/*
    Note that the IIntervalNode doesn't store children, this is stored on the IIntervalTree
*/
interface IIntervalNode extends IInterval {
    identifier: string;
    data?: any;
}

export interface IIntervalTree {
    index: { [identifier: string]: IIntervalNode };

    root: string | null;
    children: { [identifier: string]: IPotentialChildren };
}
```

## Other notes

- Based on the [Geeks for Geek guide](https://www.geeksforgeeks.org/interval-tree/).
- The repository was setup using: [Step by step: Building and publishing an NPM Typescript package.](https://itnext.io/step-by-step-building-and-publishing-an-npm-typescript-package-44fe7164964c)

