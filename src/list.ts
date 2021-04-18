export type List<Type> = {
  first?: Node<Type>;
  last?: Node<Type>;
};

type Node<Type> = {
  data: Type;
  next?: Node<Type>;
};

export function push<Type>(list: List<Type>, data: Type) {
  if (!list.first) {
    const node = { data };
    list.first = list.last = node;
  } else {
    list.last!.next = { data };
    list.last = list.last!.next;
  }
}

export function shift<Type>(list: List<Type>) {
  if (list.first) {
    const node = list.first;
    if (list.first === list.last) {
      list.first = list.last = undefined;
    } else {
      list.first = list.first.next;
    }
    return node.data;
  }
}

export function forEach<Type>(
  list: List<Type>,
  callback: (data: Type) => void,
) {
  let first = list.first;
  while (first) {
    callback(first.data);
    first = first.next;
  }
}
