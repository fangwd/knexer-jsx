export interface VirtualNode {
  name: string | ComponentFactory;
  key?: any;
}

export interface VirtualElementNode extends VirtualNode {
  name: string;
  ref?: { current: any };
  attributes: { [key: string]: any };
  children: StringVirtualNode[];
}

export interface VirtualComponentNode extends VirtualNode {
  name: ComponentFactory;
  props: Props;
}

export type ComponentFactory = (props: Props) => StringVirtualNode[];
export type Props = { children: StringVirtualNode[]; [key: string]: any };

export type StringVirtualNode =
  | string
  | VirtualElementNode
  | VirtualComponentNode;

export interface TextNode {
  data: string;
  element: Text;
}

export interface ElementNode extends Omit<VirtualElementNode, 'children'> {
  element: HTMLElement;
  children: RealNode[];
  handlers?: { [key: string]: (event: any) => void };
}

export interface ComponentNode extends VirtualComponentNode {
  result: RealNode[];
  hooks: Hook[];
}

export type RealNode = TextNode | ElementNode | ComponentNode;

export type StateHook = {
  state: any;
};

export type EffectHook = {
  effect: () => (() => void) | undefined;
  deps: any[];
  cleanup?: () => void;
};

export type MemoHook<T> = {
  callback: () => T;
  args: any[];
  result: T;
};

export type Hook = StateHook | EffectHook | MemoHook<any>;
