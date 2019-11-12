// immutable interval tree

export interface IInterval {
    low: number
    high: number
}

interface IIntervalNode extends IInterval {
    identifier: string
    data?: any
}

interface IPotentialChildren extends IInterval {
    left: string | null
    right: string | null

    height: number

    [id: string]: any
}

export interface IIntervalTree {
    index: { [identifier: string]: IIntervalNode }

    root: string | null
    children: { [identifier: string]: IPotentialChildren }
}

export class IntervalTree {

    static empty(): IIntervalTree {
        return { index: {}, root: null, children: {} }
    }

    static hasOverlap(tree: IIntervalTree, interval: IInterval, inclusive: boolean = false): boolean {
        return !!this.overlappingInterval(tree, interval, inclusive)
    }

    static overlappingInterval(tree: IIntervalTree, interval: IInterval, inclusive: boolean = false): string | null {
        if (!tree) return null
        const identifier = IntervalTree.recursiveOverlap(tree, tree.root, interval, inclusive)
        return identifier
    }

    static insert(tree: IIntervalTree, identifier: string, low: number, high: number, data?: any): IIntervalTree {

        const newNode: IIntervalNode = { identifier, low, high, data }
        const newIT = IntervalTree.copy(tree)

        newIT.index[newNode.identifier] = newNode
        newIT.children[newNode.identifier] = { high: newNode.high, low: newNode.low, left: null, right: null, height: 0 }

        const root = newIT.root
        if (root) {
            IntervalTree.recursiveSet(tree, root, newNode)
        } else {
            // First node, so set root
            newIT.root = newNode.identifier
            newIT.children[newNode.identifier].high = newNode.high
            newIT.children[newNode.identifier].low = newNode.low


        }
        return newIT
    }

    static remove(tree: IIntervalTree, identifier: string): IIntervalTree {
        if (!tree.root) return tree
        if (!(identifier in tree.index)) return tree // couldn't find it

        const newIT = IntervalTree.copy(tree)
        var replacement = this.recursiveDeleteNoRotate(newIT, identifier, newIT.root as string)
        delete newIT.index[identifier]
        delete newIT.children[identifier]

        if (!replacement) return newIT

        if (newIT.root == identifier) tree.root = replacement


        // update the height
        this.immutative_calculateHeight(newIT, replacement)
        const children = newIT.children[replacement]
        const balance = this.balance(newIT, replacement)

        if (balance > 1 && this.balance(newIT, children.left) >= 0) {
            // left left
            this.mutate_rotateRight(newIT, replacement)
        }
        else if (balance > 1 && this.balance(newIT, children.left) < 0) {
            // left right
            this.mutate_rotateRight(newIT, replacement)
        }
        else if (balance < -1 && this.balance(newIT, children.right) <= 0) {
            // right right
            this.mutate_rotateLeft(newIT, replacement)
        }
        else if (balance < -1 && this.balance(newIT, children.right) > 0) {
            // right left
            this.mutate_rotateLeft(newIT, replacement)
        }

        return newIT
    }

    private static minValueNode(tree: IIntervalTree, root: string): string {
        var current = root
        while (!!tree.children[current]?.left) {
            current = tree.children[current].left as string
        }
        return current
    }

    private static copy(tree: IIntervalTree) {
        return {
            index: { ...tree.index },
            children: { ...tree.children },
            root: tree.root,

        }
    }

    private static recursiveSet(tree: IIntervalTree, currentIdentifier: string, node: IIntervalNode) {
        const low = tree.index[currentIdentifier].low

        const child = tree.children[currentIdentifier]
        if (node.low < low) {
            const left = child.left
            if (left) {
                IntervalTree.recursiveSet(tree, left, node)
            } else {
                tree.children[currentIdentifier].left = node.identifier
            }
        } else {
            const right = child.right
            if (right) {
                IntervalTree.recursiveSet(tree, right, node)
            } else {
                tree.children[currentIdentifier].right = node.identifier
            }
        }

        if (node.high > child.high) {
            tree.children[currentIdentifier].high = node.high
        }
        if (node.low < child.low) {
            tree.children[currentIdentifier].low = node.low

        }
    }

    private static recursiveDeleteNoRotate(tree: IIntervalTree, removeIdentifier: string, currentIdentifier: string, parent?: string, direction?: string): string | null {
        // center hit
        const children = tree.children[currentIdentifier]
        if (removeIdentifier !== currentIdentifier) {
            const interval = tree.index[removeIdentifier]

            var removed: string | null = null
            if (children.left && IntervalTree.isOverlap(tree.children[children.left], interval)) {
                removed = this.recursiveDeleteNoRotate(tree, removeIdentifier, children.left, currentIdentifier, "left")
            }
            if (!removed && children.right && IntervalTree.isOverlap(tree.children[children.right], interval)) {
                removed = this.recursiveDeleteNoRotate(tree, removeIdentifier, children.right, currentIdentifier, "right")
            }
            return removed
        }

        // we can easy shortcut to the correct node
        // as we store the children separately
        if (!children) return null

        var successor: string | null = null

        if (!children.left && !children.right) {
            // no children, just delete from parent and delete
            if (parent) {
                const pchilds = tree.children[parent]
                delete tree.children[parent][direction as string]
            }
            successor = null
        }
        else if (!!children.left && !!children.right) {
            // two children
            successor = this.minValueNode(tree, children.right)
            // then we move this value up, then delete the "successor" in the subtree
            if (children.left && children.left != successor) this.recursiveDeleteNoRotate(tree, successor, children.left, removeIdentifier, "left")
            if (children.right && children.right != successor) this.recursiveDeleteNoRotate(tree, successor, children.left, removeIdentifier, "right")

            // now that the successor has been deleted from the subgraph, we can overwrite
            // the current removeIdentifier.
            if (parent) tree.children[parent][direction as string] = successor
            children[successor] = {
                ...children
            }
        } else {
            // one child
            successor = children.left || children.right
            if (parent) {
                children[parent] = successor
            }
        }
        return null
    }

    private static balance(tree: IIntervalTree, identifier?: string | null) {
        if (!identifier) return 0
        const left = tree.children[identifier].left
        const right = tree.children[identifier].right

        return (left ? tree.children[left]?.height : 0) - (right ? tree.children[right]?.height : 0)

    }

    private static immutative_calculateHeight(tree: IIntervalTree, identifier?: string | null): number {
        if (!identifier) return 0
        const children = tree.children[identifier]
        children.height = 1 + Math.max(
            this.immutative_calculateHeight(tree, children.left),
            this.immutative_calculateHeight(tree, children.right)
        )

        return children.height
    }

    private static mutate_rotateRight(tree: IIntervalTree, root: string) {
        const children = tree.children[root]
        const x = children.left
        const T2 = x ? tree.children[x]?.right : null

        if (x) tree.children[x].right = root
        children.left = T2

        return x
    }

    private static mutate_rotateLeft(tree: IIntervalTree, root: string): string | null {
        const children = tree.children[root]
        const y = children.right
        const T2 = y ? tree.children[y]?.left : null

        if (y) tree.children[y].left = root
        children.right = T2

        return y
    }

    private static recursiveOverlap(tree: IIntervalTree, identifier: string | null | undefined, interval: IInterval, inclusive: boolean): string | null {

        if (!identifier) return null

        const rootInterval = tree.index[identifier]
        if (IntervalTree.isOverlap(rootInterval, interval, inclusive)) return identifier

        const child = tree.children[identifier]
        if (!!child.left && tree.index[child.left].high >= interval.low) {
            return IntervalTree.recursiveOverlap(tree, child.left, interval, inclusive)
        }

        return IntervalTree.recursiveOverlap(tree, child.right, interval, inclusive)
    }

    private static isOverlap(int1: IInterval, int2: IInterval, inclusive: boolean = false) {
        if (!int1 || !int2) return false
        if (inclusive) return (int1.low <= int2.high && int2.low <= int1.high)
        return (int1.low < int2.high && int2.low < int1.high)
    }

    static inorder(tree: IIntervalTree, identifier?: string): IInterval[] {
        if (!tree.root) return []
        if (!identifier) return this.inorder(tree, tree.root)

        const self = tree.index[identifier]
        const child = tree.children[identifier]

        const ordered: IInterval[] = []
        if (child.left) ordered.push(...this.inorder(tree, child.left))
        ordered.push({ low: self.low, high: self.high })
        if (child.right) ordered.push(...this.inorder(tree, child.right))

        return ordered
    }

    static test() {
        const ints = [
            [15, 20], [10, 30], [17, 19],
            [5, 20], [12, 15], [30, 40]
        ];
        const n = ints.length / ints[0].length
        var tree = IntervalTree.empty()

        tree = ints.reduce((it, int, idx) => IntervalTree.insert(it, idx.toString(), int[0], int[1]), tree)
        var inorder = this.inorder(tree)
        console.log(inorder)

        const search: IInterval = { low: 6, high: 7 }
        const result = IntervalTree.overlappingInterval(tree, search)
        if (result) {
            const child = tree.index[result]
            console.log(`Overlaps with [${child.low}, ${child.high}]: "${result}"`)
        } else {
            console.log("No overlap")
        }

        tree = IntervalTree.remove(tree, "5")

        inorder = this.inorder(tree)
        console.log(inorder)

    }

}