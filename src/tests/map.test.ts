import { NodeMap } from '../map';
import {
  ComponentNode,
  ElementNode,
  TextNode,
  RealNode,
  VirtualElementNode,
  VirtualComponentNode,
  StringVirtualNode,
} from '../types';
import { update } from '../update';
import { isString } from '../util';

const clone = (value: any) => JSON.parse(JSON.stringify(value));

test('store.remove (elements)', () => {
  const fake = buildFakeElementNode();
  const map = NodeMap(fake.children);
  const node = {
    name: 'p',
    attributes: {},
    children: [],
  } as VirtualElementNode;
  expect((map.remove(node) as ElementNode).attributes.id).toBe(2);
  expect((map.remove(node) as ElementNode).attributes.id).toBe(5);
  expect(map.remove(node) as ElementNode).toBe(undefined);
});

test('store.remove (components)', () => {
  const f1 = jest.fn();
  const nodes: VirtualComponentNode[] = [
    {
      name: f1,
      props: { children: [] },
    },
    {
      name: f1,
      key: '2',
      props: { children: [] },
    },
    {
      name: f1,
      props: { children: [] },
    },
  ];
  const map = NodeMap((nodes as unknown) as RealNode[]);
  const node = nodes[0];
  expect(map.remove(node)).toBe(nodes[0]);
  expect(map.remove(node)).toBe(nodes[2]);
});

test('store.remove (text)', () => {
  const fake = buildFakeElementNode();
  const map = NodeMap(fake.children);
  const node = '';
  expect((map.remove(node) as TextNode).data).toBe('1');
  expect((map.remove(node) as TextNode).data).toBe('2');
  expect(map.remove(node) as TextNode).toBe(undefined);
});

test('store.remove (keyed)', () => {
  const fake = buildFakeElementNode();
  const map = NodeMap(fake.children);
  const node = {
    key: '1',
    name: 'p',
    attributes: {},
    children: [],
  } as VirtualElementNode;
  expect((map.remove(node) as ElementNode).attributes.id).toBe(1);
  expect(map.remove(node) as ElementNode).toBe(undefined);
  expect((map.remove({ ...node, key: '3' }) as ElementNode).attributes.id).toBe(
    3,
  );
});

test('store.remove (unchanged)', () => {
  const fake = buildFakeElementNode();
  const map = NodeMap(fake.children);
  for (const node of fake.children) {
    if (isTextNode(node)) {
      expect(map.remove(node.data)).toBe(node);
    } else {
      expect(map.remove(node as VirtualElementNode)).toBe(node);
    }
  }
});

test('update (element.children)', () => {
  const fake = buildFakeElementNode();
  const next = clone(fake) as VirtualElementNode;
  for (let i = 0; i < next.children.length; i++) {
    const prev = fake.children[i];
    const node = next.children[i];
    if (typeof (prev as ComponentNode).name === 'function') {
      // JSON.stringify(() => '') -> undefined
      (node as ComponentNode).name = (prev as ComponentNode).name;
    } else if (isTextNode(node as any)) {
      next.children[i] = (node as any).data;
    }
  }
  const fn = jest.fn();
  fake.element.insertBefore = fn;
  update(next, fake);
  expect(fn).not.toBeCalled();
});

function buildFakeElementNode() {
  const factory = jest.fn();

  const nodes: StringVirtualNode[] = [
    {
      name: 'p',
      key: '1',
      attributes: { id: 1 },
      children: [],
    },
    {
      name: 'p',
      attributes: { id: 2 }, // 1st p non-keyed
      children: [],
    },
    {
      name: 'p',
      key: '3',
      attributes: { id: 3 },
      children: [],
    },
    {
      name: 'b',
      attributes: { id: 4 },
      children: [],
    },
    '1',
    {
      name: 'p',
      attributes: { id: 5 }, // 2nd p non-keyed
      children: [],
    },
    {
      name: factory,
      key: '2',
      props: { children: [] },
    },
    '2',
  ];

  const fake: ElementNode = {
    name: 'p',
    attributes: {},
    children: clone(nodes),
    element: document.createElement('p'),
  };

  let before = null;
  for (let i = fake.children.length - 1; i >= 0; i--) {
    const node = fake.children[i];
    if (isString((node as ElementNode).name)) {
      (node as ElementNode).element = document.createElement(
        (node as ElementNode).name,
      );
      before = fake.element.insertBefore((node as ElementNode).element, before);
    } else if (isString(node)) {
      const text = {
        data: node,
        element: document.createTextNode(node),
      };
      before = fake.element.insertBefore(text.element, before);
      fake.children[i] = text;
    } else {
      (node as ComponentNode).result = [
        {
          name: 'div',
          attributes: {},
          children: [],
          element: document.createElement('div'),
        },
      ];
      (node as ComponentNode).name = factory;
      before = fake.element.insertBefore(
        ((node as ComponentNode).result[0] as ElementNode).element,
        before,
      );
    }
  }
  return fake;
}

function isTextNode(node: RealNode): node is TextNode {
  return (node as ElementNode).name === undefined;
}
