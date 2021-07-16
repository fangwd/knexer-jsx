import {
  ComponentNode,
  StringVirtualNode,
  Hook,
  StateHook,
  EffectHook,
  MemoHook,
  RealNode,
  ElementNode,
} from './types';
import { updateAll } from './update';

function createHooksManager() {
  const queue: ComponentNode[] = [];
  let current: ComponentNode;
  let index: number = 0;
  return {
    push(node: ComponentNode) {
      queue.push(node);
      current = node;
      index = 0;
    },
    getHook(): Hook {
      let hook = current.hooks[index];
      if (!hook) {
        hook = current.hooks[index] = {} as Hook;
      }
      index++;
      return hook;
    },
    pop() {
      queue.pop();
    },
    current: () => current,
  };
}

export const hooksManager = createHooksManager();

export function useState<S>(initial: S): [S, (s: S) => void] {
  const hook = hooksManager.getHook() as StateHook;
  if (hook.state === undefined) {
    hook.state = initial;
  }
  const current = hooksManager.current();
  return [
    hook.state,
    (next: S) => {
      hook.state = next;
      current.result = updateAll(
        execute(current),
        current.result,
        getLast(current.result[current.result.length - 1]),
      );
    },
  ];
}

export function useEffect(effect: () => any, deps: any[]) {
  const hook = hooksManager.getHook() as EffectHook;
  hook.effect = effect;
  if (!hook.deps || !arraysEqual(deps, hook.deps)) {
    hook.deps = deps;
    hook.cleanup && hook.cleanup();
    hook.cleanup = hook.effect();
  }
}

export function useMemo<T>(callback: () => T, args: any[]) {
  const hook = hooksManager.getHook() as MemoHook<T>;
  if (!hook.args || !arraysEqual(args, hook.args)) {
    hook.callback = callback;
    hook.args = args;
    hook.result = callback();
  }
  return hook.result;
}

export function useRef(initial?: any) {
  return useMemo(() => ({ current: initial }), []);
}

function arraysEqual(next: any[], prev: any[]) {
  return (
    next.length === prev.length &&
    !next.some((arg, index) => arg !== prev[index])
  );
}

export function execute(node: ComponentNode): StringVirtualNode[] {
  if (!node.hooks) {
    node.hooks = [];
  }
  hooksManager.push(node);
  let result = node.name(node.props);
  if (!Array.isArray(result)) {
    result = result ? [result] : [];
  }
  hooksManager.pop();
  return result;
}

export function cleanup(node: ComponentNode) {
  for (const effect of node.hooks) {
    (effect as EffectHook).cleanup && (effect as EffectHook).cleanup!();
  }
}

function getLast(node: RealNode): {
  parent: HTMLElement;
  before: HTMLElement | null;
} {
  const result = (node as ComponentNode).result;
  if (result) {
    return getLast(result[result.length - 1]);
  }
  const element = (node as ElementNode).element;
  return {
    parent: element.parentElement!,
    before: element.nextSibling as HTMLElement,
  };
}