// immutable interval tree

export interface IInterval {
    low: number;
    high: number;
}

interface IIntervalNode extends IInterval {
    identifier: string;
    data?: any;
}

interface IPotentialChildren extends IInterval {
    left: string | null;
    right: string | null;

    height: number;

    [id: string]: any;
}

export interface IIntervalTree {
    index: { [identifier: string]: IIntervalNode };

    root: string | null;
    children: { [identifier: string]: IPotentialChildren };
}

export class IntervalTree {
    public static empty(): IIntervalTree {
        return { index: {}, root: null, children: {} };
    }

    public static get(tree: IIntervalTree, identifier: string): IIntervalNode | null {
        return tree.index[identifier]
    }

    public static hasOverlap(tree: IIntervalTree, interval: IInterval, inclusive: boolean = false): boolean {
        return !!this.overlappingInterval(tree, interval, inclusive);
    }

    public static overlappingInterval(
        tree: IIntervalTree,
        interval: IInterval,
        inclusive: boolean = false,
    ): string | null {
        if (!tree) {
            return null;
        }
        const identifier = IntervalTree.recursiveOverlap(tree, tree.root, interval, inclusive);
        return identifier;
    }

    public static insert(tree: IIntervalTree, identifier: string, low: number, high: number, data?: any): IIntervalTree {
        const node: IIntervalNode = { identifier, low, high, data };
        return this.insert_node(tree, node)
    }

    public static insert_node(tree: IIntervalTree, node: IIntervalNode): IIntervalTree {

        // sanity check
        if (node.identifier in tree.index || node.identifier in tree.children) {
            throw new Error(`Node with identifier "${node.identifier}" already found in tree`)
        }

        const newIT = IntervalTree.copy(tree);

        newIT.index[node.identifier] = node;
        newIT.children[node.identifier] = { high: node.high, low: node.low, left: null, right: null, height: 0 };

        const root = newIT.root;
        if (root) {
            IntervalTree.recursiveSet(newIT, root, node);
        } else {
            // First node, so set root
            newIT.root = node.identifier;
            newIT.children[node.identifier].high = node.high;
            newIT.children[node.identifier].low = node.low;
        }
        this.mutate_calculateHeight(newIT, node.identifier)

        return newIT;
    }

    public static remove(tree: IIntervalTree, identifier: string): IIntervalTree {
        if (!tree.root) {
            return tree;
        }
        if (!(identifier in tree.index)) {
            return tree;
        } // couldn't find it

        const newIT = IntervalTree.copy(tree);
        const replacement = this.recursiveDeleteNoRotate(newIT, identifier, newIT.root as string);
        delete newIT.index[identifier];
        delete newIT.children[identifier];

        if (newIT.root === identifier) {
            newIT.root = replacement;
        }

        if (!replacement) {
            return newIT;
        }

        // update the height
        this.mutate_calculateHeight(newIT, replacement);
        const children = newIT.children[replacement];
        const balance = this.balance(newIT, replacement);

        if (balance > 1 && this.balance(newIT, children.left) >= 0) {
            // left left
            this.mutate_rotateRight(newIT, replacement);
        } else if (balance > 1 && this.balance(newIT, children.left) < 0) {
            // left right
            this.mutate_rotateRight(newIT, replacement);
        } else if (balance < -1 && this.balance(newIT, children.right) <= 0) {
            // right right
            this.mutate_rotateLeft(newIT, replacement);
        } else if (balance < -1 && this.balance(newIT, children.right) > 0) {
            // right left
            this.mutate_rotateLeft(newIT, replacement);
        }

        return newIT;
    }

    public static inorder(tree: IIntervalTree, identifier?: string): IInterval[] {
        if (!tree.root) {
            return [];
        }
        if (!identifier) {
            return this.inorder(tree, tree.root);
        }

        const self = tree.index[identifier];
        const child = tree.children[identifier];

        const ordered: IInterval[] = [];
        if (child.left) {
            ordered.push(...this.inorder(tree, child.left));
        }
        ordered.push({ low: self.low, high: self.high });
        if (child.right) {
            ordered.push(...this.inorder(tree, child.right));
        }

        return ordered;
    }

    private static minValueNode(tree: IIntervalTree, root: string): string {
        let current = root;
        while (!!tree.children[current]?.left) {
            current = tree.children[current].left as string;
        }
        return current;
    }

    private static copy(tree: IIntervalTree) {
        return {
            index: { ...tree.index },
            children: { ...tree.children },
            root: tree.root,
        };
    }

    private static recursiveSet(tree: IIntervalTree, currentIdentifier: string, node: IIntervalNode) {
        const low = tree.index[currentIdentifier].low;

        const child = tree.children[currentIdentifier];
        if (node.low < low) {
            const left = child.left;
            if (left) {
                IntervalTree.recursiveSet(tree, left, node);
            } else {
                tree.children[currentIdentifier].left = node.identifier;
            }
        } else {
            const right = child.right;
            if (right) {
                IntervalTree.recursiveSet(tree, right, node);
            } else {
                tree.children[currentIdentifier].right = node.identifier;
            }
        }

        if (node.high > child.high) {
            tree.children[currentIdentifier].high = node.high;
        }
        if (node.low < child.low) {
            tree.children[currentIdentifier].low = node.low;
        }
    }

    private static recursiveDeleteNoRotate(
        tree: IIntervalTree,
        removeIdentifier: string,
        currentIdentifier: string,
        parent?: string,
        direction?: string,
    ): string | null {
        // center hit
        const children = tree.children[currentIdentifier];
        if (removeIdentifier !== currentIdentifier) {
            const interval = tree.index[removeIdentifier];

            let removed: string | null = null;
            if (children.left && IntervalTree.isOverlap(tree.children[children.left], interval)) {
                removed = this.recursiveDeleteNoRotate(tree, removeIdentifier, children.left, currentIdentifier, 'left');
            }
            if (!removed && children.right && IntervalTree.isOverlap(tree.children[children.right], interval)) {
                removed = this.recursiveDeleteNoRotate(tree, removeIdentifier, children.right, currentIdentifier, 'right');
            }
            return removed;
        }

        // we can easy shortcut to the correct node
        // as we store the children separately
        if (!children) {
            return null;
        }

        let successor: string | null = null;

        if (!children.left && !children.right) {
            // no children, just delete from parent and delete
            if (parent) {
                const pchilds = tree.children[parent];
                delete tree.children[parent][direction as string];
            }
            successor = null;
        } else if (!!children.left && !!children.right) {
            // two children
            successor = this.minValueNode(tree, children.right);
            // then we move this value up, then delete the "successor" in the subtree
            if (children.left && children.left !== successor) {
                this.recursiveDeleteNoRotate(tree, successor, children.left, removeIdentifier, 'left');
            }
            if (children.right && children.right !== successor) {
                this.recursiveDeleteNoRotate(tree, successor, children.left, removeIdentifier, 'right');
            }

            // now that the successor has been deleted from the subgraph, we can overwrite
            // the current removeIdentifier.
            if (parent) {
                tree.children[parent][direction as string] = successor;
            }
            children[successor] = {
                ...children,
            };
        } else {
            // one child
            successor = children.left || children.right;
            if (parent) {
                children[parent] = successor;
            }
        }
        return null;
    }

    private static balance(tree: IIntervalTree, identifier?: string | null) {
        if (!identifier) {
            return 0;
        }
        const left = tree.children[identifier].left;
        const right = tree.children[identifier].right;

        return (left ? tree.children[left]?.height : 0) - (right ? tree.children[right]?.height : 0);
    }

    private static mutate_calculateHeight(tree: IIntervalTree, identifier?: string | null): number {
        if (!identifier) {
            return 0;
        }
        const children = tree.children[identifier];
        children.height =
            1 +
            Math.max(
                this.mutate_calculateHeight(tree, children.left),
                this.mutate_calculateHeight(tree, children.right),
            );

        return children.height;
    }

    private static mutate_rotateRight(tree: IIntervalTree, root: string) {
        const children = tree.children[root];
        const x = children.left;
        const T2 = x ? tree.children[x]?.right : null;

        if (x) {
            tree.children[x].right = root;
        }
        children.left = T2;

        return x;
    }

    private static mutate_rotateLeft(tree: IIntervalTree, root: string): string | null {
        const children = tree.children[root];
        const y = children.right;
        const T2 = y ? tree.children[y]?.left : null;

        if (y) {
            tree.children[y].left = root;
        }
        children.right = T2;

        return y;
    }

    private static recursiveOverlap(
        tree: IIntervalTree,
        identifier: string | null | undefined,
        interval: IInterval,
        inclusive: boolean,
    ): string | null {
        if (!identifier) {
            return null;
        }

        const rootInterval = tree.index[identifier];
        if (IntervalTree.isOverlap(rootInterval, interval, inclusive)) {
            return identifier;
        }

        const child = tree.children[identifier];
        if (!!child.left && tree.index[child.left].high >= interval.low) {
            return IntervalTree.recursiveOverlap(tree, child.left, interval, inclusive);
        }

        return IntervalTree.recursiveOverlap(tree, child.right, interval, inclusive);
    }

    private static isOverlap(int1: IInterval, int2: IInterval, inclusive: boolean = false) {
        if (!int1 || !int2) {
            return false;
        }
        if (inclusive) {
            return int1.low <= int2.high && int2.low <= int1.high;
        }
        return int1.low < int2.high && int2.low < int1.high;
    }
}
