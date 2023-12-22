import {
  Props,
  VirtualComponentNode,
  VirtualElementNode,
  VirtualNode,
} from './types';
import { isString } from './util';

function h(
  name: string | ((props: Props) => VirtualNode[]),
  attributes: { [key: string]: any } | null,
): VirtualElementNode | VirtualComponentNode {
  attributes = attributes || {};
  let key, ref;
  if ('key' in attributes) {
    key = attributes['key'];
    delete attributes['key'];
  }
  if ('ref' in attributes) {
    ref = attributes['ref'];
    delete attributes['ref'];
  }
  let children = [];
  for (let i = 2; i < arguments.length; i++) {
    if (arguments[i]) {
      children.push(arguments[i]);
    }
  }
  // Note: IE doesn't support flat()
  children = children.flat();
  if (isString(name)) {
    return { key, name, ref, attributes, children } as VirtualElementNode;
  }
  attributes.children = children;
  return {
    key,
    name,
    props: attributes,
  } as VirtualComponentNode;
}

function Fragment(props: Props) {
  return props.children;
}

export { h, Fragment };
