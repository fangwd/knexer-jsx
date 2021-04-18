import {
  Props,
  VirtualComponentNode,
  VirtualElementNode,
  VirtualNode,
} from './types';
import {  isString } from './util';

function h(
  name: string | ((props: Props) => VirtualNode[]),
  attributes: { [key: string]: any } | null,
  ...children: any[]
): VirtualElementNode | VirtualComponentNode {
  attributes = attributes || {};
  let key, ref;
  if ('key' in attributes) {
    key = attributes['key'];
    delete attributes['key'];
  } else if ('ref' in attributes) {
    ref = attributes['ref'];
    delete attributes['ref'];
  }
  // Note: IE doesn't support flat()
  children = children.flat();
  return isString(name)
    ? ({ key, name, ref, attributes, children } as VirtualElementNode)
    : ({
        key,
        name,
        props: { ...attributes, children },
      } as VirtualComponentNode);
}

function Fragment(props: Props) {
  return props.children;
}

export { h, Fragment };
