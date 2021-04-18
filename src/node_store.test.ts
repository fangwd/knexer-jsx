import {
    NodeStore,
    NodeType,
    ElementNode,
    TextNode,
    RealNode,
    VirtualNode,
    VirtualTextNode,
    VirtualElementNode,
    VirtualComponentNode,
    update
} from './index'

const clone = (value: any) => JSON.parse(JSON.stringify(value));

test('store.shift (elements)', () => {
    const fake = buildFakeElementNode();
    const store = fake.store!;
    const node = {
        type: NodeType.Element,
        name: 'p',
        attributes: {},
        children: []
    } as VirtualElementNode;
    expect((store.shift(node) as ElementNode).attributes.id).toBe(2);
    expect((store.shift(node) as ElementNode).attributes.id).toBe(5);
    expect((store.shift(node) as ElementNode)).toBe(undefined);
});

test('store.shift (components)', () => {
    const f1 = jest.fn();
    const nodes = [
        {
            type: NodeType.Component,
            f1,
            props: { children: [] },
        },
        {
            type: NodeType.Component,
            f1,
            key: "2",
            props: { children: [] },
        },
        {
            type: NodeType.Component,
            f1,
            props: { children: [] },
        },

    ];
    const store = new NodeStore(nodes as unknown as RealNode[]);
    const node = nodes[0] as any as VirtualNode;
    expect(store.shift(node)).toBe(nodes[0])
    expect(store.shift(node)).toBe(nodes[2])
});

test('store.shift (text)', () => {
    const fake = buildFakeElementNode();
    const store = fake.store!;
    const node = { type: NodeType.Text, data: '' } as VirtualTextNode;
    expect((store.shift(node) as TextNode).data).toBe('1');
    expect((store.shift(node) as TextNode).data).toBe('2');
    expect((store.shift(node) as TextNode)).toBe(undefined);
});

test('store.shift (keyed)', () => {
    const fake = buildFakeElementNode();
    const store = fake.store!;
    const node = {
        type: NodeType.Element,
        key: '1',
        name: 'p',
        attributes: {},
        children: []
    } as VirtualElementNode;
    expect((store.shift(node) as ElementNode).attributes.id).toBe(1);
    expect((store.shift(node) as ElementNode)).toBe(undefined);
    expect((store.shift({ ...node, key: '3' }) as ElementNode).attributes.id).toBe(3);
});

test('store.shift (unchanged)', () => {
    const fake = buildFakeElementNode();
    const store = fake.store!;
    for (const node of fake.children) {
        expect(store.shift(node)).toBe(node);
    }
});

const nodesEqual = (a: VirtualNode, b: VirtualNode) => {
    if (a.type === b.type) {
        if (a.type === NodeType.Text) {
            return a.data === (b as VirtualTextNode).data;
        }
    }
    else if (a.type === NodeType.Element) {
        if (a.key !== undefined) {
            return a.key === (b as VirtualElementNode).key;
        }
        return a.attributes.id === (b as VirtualElementNode).attributes.id;
    }
    else {
        if ((a as VirtualComponentNode).key !== undefined) {
            return (a as VirtualComponentNode).key === (b as VirtualComponentNode).key;
        }
        return (a as VirtualComponentNode).props.id === (b as VirtualComponentNode).props.id;
    }
};

test('update (element.children)', () => {
    const fake = buildFakeElementNode();
    const next = clone(fake) as ElementNode;
    for (let i = 0; i < next.children.length; i++) {
        const node = next.children[i];
        if (node.type === NodeType.Component) {
            node.factory = jest.fn();
        }
        expect(nodesEqual(node, fake.children[i]))
    }
    next.store = new NodeStore(next.children);
    const fn = jest.fn();
    fake.element.insertBefore = fn;
    update(next, fake);
    expect(fn).not.toBeCalled();
});

function buildFakeElementNode() {
    const factory = jest.fn();

    const nodes: VirtualNode[] = [
        {
            type: NodeType.Element,
            name: 'p',
            key: "1",
            attributes: { id: 1 },
            children: [],
        },
        {
            type: NodeType.Element,
            name: 'p',
            attributes: { id: 2 },  // 1st p non-keyed
            children: [],
        },
        {
            type: NodeType.Element,
            name: 'p',
            key: "3",
            attributes: { id: 3 },
            children: [],
        },
        {
            type: NodeType.Element,
            name: 'b',
            attributes: { id: 4 },
            children: [],
        },
        {
            type: NodeType.Text,
            data: '1'
        },
        {
            type: NodeType.Element,
            name: 'p',
            attributes: { id: 5 }, // 2nd p non-keyed
            children: [],
        },
        {
            type: NodeType.Component,
            factory,
            key: "2",
            props: { children: [] },
        },
        {
            type: NodeType.Text,
            data: '2'
        },
    ];

    const fake: ElementNode = {
        type: NodeType.Element,
        name: 'p',
        attributes: {},
        children: clone(nodes),
        element: document.createElement('p'),
    };

    let before = null;
    for (let i = fake.children.length - 1; i >= 0; i--) {
        const node = fake.children[i];
        if (node.type === NodeType.Element) {
            node.element = document.createElement(node.name);
            before = fake.element.insertBefore(node.element, before);
        }
        else if (node.type === NodeType.Text) {
            node.element = document.createTextNode(node.data);
            before = fake.element.insertBefore(node.element, before);
        }
        else {
            node.result = [
                {
                    type: NodeType.Element,
                    name: 'div',
                    attributes: {},
                    children: [],
                    element: document.createElement('div'),
                }
            ];
            node.factory = factory;
            before = fake.element.insertBefore((node.result[0] as ElementNode).element, before);
        }
    }
    fake.store = new NodeStore(fake.children);
    return fake;
}
