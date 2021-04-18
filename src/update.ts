import {
  VirtualNode,
  VirtualElementNode,
  RealNode,
  StringVirtualNode,
  VirtualComponentNode,
  TextNode,
  ElementNode,
  ComponentNode,
  Props,
} from './types';
import { NodeMap } from './map';
import { isString } from './util';
import { unmount } from './mount';
import { execute } from './hooks';

export function updateAll(
  next: StringVirtualNode[],
  prev: RealNode[],
): RealNode[] {
  const map = NodeMap(prev);
  for (let i = 0; i < next.length; i++) {
    next[i] = update(next[i], map.remove(next[i])) as StringVirtualNode;
  }
  map.destroy();
  return next as RealNode[];
}

export function update(
  next: StringVirtualNode | any,
  prev?: RealNode,
): RealNode {
  if (
    !prev ||
    (prev as VirtualComponentNode).name !== (next as VirtualNode).name
  ) {
    prev && unmount(prev);
    return create(next);
  }

  // name === undefined -> TextNode
  if (!(prev as ElementNode).name) {
    if ((prev as TextNode).data !== next) {
      (prev as TextNode).data = next;
      (prev as TextNode).element.nodeValue = next;
    }
    return prev;
  }

  if (isString((next as VirtualNode).name)) {
    prev = prev as ElementNode;
    for (const name in (prev as ElementNode).attributes) {
      if (
        prev.attributes[name] !== (next as VirtualElementNode).attributes[name]
      ) {
        setAttribute(prev, name, (next as VirtualElementNode).attributes[name]);
      }
    }
    for (const name in (next as VirtualElementNode).attributes) {
      if (!(name in prev.attributes)) {
        setAttribute(prev, name, (next as VirtualElementNode).attributes[name]);
      }
    }
    prev.attributes = (next as VirtualElementNode).attributes;
    prev.children = updateAll(
      (next as VirtualElementNode).children,
      prev.children,
    );
    if ((prev.ref = (next as VirtualElementNode).ref)) {
      prev.ref.current = prev.element;
    }
    insertAll(prev.element, prev.children, null);
    return prev;
  }

  prev = prev as ComponentNode;

  if (shouldCall((next as VirtualComponentNode).props, prev.props)) {
    prev.props = (next as VirtualComponentNode).props;
    prev.result = updateAll(execute(prev), prev.result);
  }

  return prev;
}

function shouldCall(next: Props, prev: Props) {
  if (next.children.length > 0 || prev.children.length > 0) {
    return true;
  }
  for (const key in next) {
    if (key !== 'children' && next[key] !== prev[key]) {
      return true;
    }
  }
  for (const key in prev) {
    if (key !== 'children' && !(key in next)) {
      return true;
    }
  }
  return false;
}

export function create(data: StringVirtualNode | any): RealNode {
  if (!data.name) {
    return { data, element: document.createTextNode(data) };
  }

  let node: RealNode;
  if (isString(data.name)) {
    node = data as ElementNode;
    node.element = document.createElement(data.name);
    node.children = (data as VirtualElementNode).children.map((child) =>
      create(child),
    );
    node.ref && (node.ref.current = node.element);
    for (const key in node.attributes) {
      setAttribute(node, key, node.attributes[key]);
    }
    insertAll(node.element, node.children, null);
  } else {
    node = data as ComponentNode;
    node.result = execute(node).map((entry) => create(entry));
  }
  return node;
}

export function setAttribute(
  node: ElementNode,
  name: string,
  value?: string | { [key: string]: string } | ((event: any) => void),
) {
  if (name.startsWith('on')) {
    const event = name.substring(2).toLocaleLowerCase();
    node.handlers = node.handlers || {};
    if (node.handlers[event]) {
      node.element.removeEventListener(event, node.handlers[event]);
    }
    value &&
      node.element.addEventListener(event, value as (event: any) => void);
    node.handlers[event] = value as (event: any) => void;
    return;
  }
  if (name == 'className') {
    name = 'class';
  }
  if (value === undefined) {
    node.element.removeAttribute(name);
  } else if (name === 'style') {
    const object = value as { [key: string]: string };
    value = '';
    for (const key in object) {
      value += `${key.replace(/([A-Z])/, '-$1')}: ${object[key]};`;
    }
    node.element.style.cssText = value;
  } else {
    if (isString(value)) {
      node.element.setAttribute(name, value as string);
    }
  }
}

type HtmlNode = Node;

function insertAll(
  parent: HTMLElement,
  nodes: RealNode[],
  before: HtmlNode | null,
): HtmlNode | null {
  for (let i = nodes.length - 1; i >= 0; i--) {
    before = insert(parent, nodes[i], before);
  }
  return before;
}

export function insert(
  parent: HTMLElement,
  node: RealNode,
  before: HtmlNode | null,
): HtmlNode | null {
  const element = (node as ElementNode).element;
  if (element) {
    if (element.nextSibling !== before || element.parentNode !== parent) {
      (node as ElementNode).element = before = parent.insertBefore(
        element,
        before,
      );
    } else {
      before = element;
    }
  } else {
    before = insertAll(parent, (node as ComponentNode).result, before);
  }
  return before;
}
