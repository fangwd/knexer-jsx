import { cleanup } from './hooks';
import { create, update, insert } from './update';
import { isString } from './util';
import {
  VirtualNode,
  RealNode,
  TextNode,
  ElementNode,
  ComponentNode,
} from './types';

// `any` to shush vscode from complaining about JSX.Element
export function mount(
  parent: HTMLElement,
  node: VirtualNode | any,
  prev?: RealNode,
): RealNode {
  if (prev && (node as VirtualNode).name === (prev as ElementNode).name) {
    node = update(node, prev);
  } else {
    prev && unmount(prev);
    node = create(node);
  }
  insert(parent, node, null);
  return node;
}

export function unmount(node: RealNode) {
  if (!(node as VirtualNode).name) {
    (node as TextNode).element.parentNode!.removeChild(
      (node as TextNode).element,
    );
  } else if (isString((node as ElementNode).name)) {
    (node as ElementNode).element.parentNode!.removeChild(
      (node as ElementNode).element,
    );
  } else {
    (node as ComponentNode).result.forEach((node) => unmount(node));
    cleanup(node as ComponentNode);
  }
}
