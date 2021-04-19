import {
  List,
  push as _push,
  shift as _shift,
  forEach as _forEach,
} from './list';
import {
  ElementNode,
  ComponentNode,
  ComponentFactory,
  TextNode,
  RealNode,
  StringVirtualNode,
  VirtualElementNode,
} from './types';
import { isString } from './util';
import { unmount } from './mount';

function push<K, V>(map: Map<K, List<V>>, key: K, data: V) {
  let list = map.get(key);
  if (!list) {
    list = {};
    map.set(key, list);
  }
  _push(list, data);
}

function shift<K, V>(map: Map<K, List<V>>, key: K) {
  const list = map.get(key);
  return list && _shift(list);
}

type NonTextNode = ElementNode | ComponentNode;

export function NodeMap(nodes: RealNode[]) {
  const keyMap: Map<string, NonTextNode> = new Map();
  const elementMap: Map<string, List<ElementNode>> = new Map();
  const componentMap: Map<ComponentFactory, List<ComponentNode>> = new Map();
  const textList: List<TextNode> = {};

  const add = (node: RealNode) => {
    if (!(node as ElementNode).name) {
      _push(textList, node);
    } else if ((node as NonTextNode).key !== undefined) {
      const prev = keyMap.get((node as NonTextNode).key);
      if (prev) {
        unmount(prev);
      }
      keyMap.set((node as NonTextNode).key, node as NonTextNode);
    } else {
      if (isString((node as NonTextNode).name)) {
        push(elementMap, (node as ElementNode).name, node);
      } else {
        push(componentMap, (node as ComponentNode).name, node);
      }
    }
  };

  const remove = (node: StringVirtualNode): RealNode | undefined => {
    if (!(node as VirtualElementNode).name) {
      return _shift(textList);
    } else if ((node as NonTextNode).key !== undefined) {
      const existing = keyMap.get((node as NonTextNode).key);
      if (existing) {
        keyMap.delete((node as NonTextNode).key);
      }
      return existing;
    } else {
      return isString((node as NonTextNode).name)
        ? shift(elementMap, (node as ElementNode).name)
        : shift(componentMap, (node as ComponentNode).name);
    }
  };

  const destroy = () => {
    keyMap.forEach(unmount);
    _forEach(textList, unmount);
    elementMap.forEach((nodes) => _forEach(nodes, unmount));
    componentMap.forEach((nodes) => _forEach(nodes, unmount));
  };

  for (const node of nodes) {
    add(node);
  }
  return { add, remove, destroy };
}
