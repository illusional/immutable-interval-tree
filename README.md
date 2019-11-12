# Immutable Interval Tree

Similar to [davidisaaclee/interval-tree](https://github.com/davidisaaclee/interval-tree), I wanted an type-safe interval tree with immutable functional interface. 

The primary motivations for this project was to be:

- Immutable (to store in Redux)
- Use Typescript
- Dependency free

## Install

```
npm install immutable-interval-tree
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