/** @jsx h */
/** @jsxFrag Fragment */

import { h, mount, NodeType, ElementNode, ComponentNode, TextNode, Fragment, useState, useEffect,useMemo, useRef } from './index'

test('h', () => {
  const root = document.createElement('div');
  const app = <h1>hello</h1>;
  mount(root, app);
  expect(root.innerHTML).toEqual('<h1>hello</h1>');
});

test('mount', () => {
  const root = document.createElement('div');
  const app = <h1>hello</h1>;
  const first = mount(root, app);
  const Second = () => <h1>world</h1>;
  mount(root, <Second />, first);
  expect(root.innerHTML).toEqual('<h1>world</h1>');
});

test('set attributes', () => {
  const root = document.createElement('div');
  const app = <h1 id="1">hello</h1>;
  const first = mount(root, app);
  mount(root, <h1 id="2">world</h1>, first);
  expect(root.innerHTML).toEqual('<h1 id="2">world</h1>');
});

test('set styles', () => {
  const root = document.createElement('div');
  const app = <h1 style={{ color: 'blue' }}>hello</h1>;
  const first = mount(root, app) as ElementNode;
  const second = mount(root, <h1 style={{ color: 'green' }}>world</h1>, first) as ElementNode;
  expect(first.element).toBe(second.element);
  expect(root.innerHTML).toEqual('<h1 style="color: green;">world</h1>');
});

test('fragment', () => {
  const root = document.createElement('div');
  const App = ({ normal }: { normal: boolean }) => (
    normal
      ? <>
        <h1 key="1">hello</h1>
        <h2 key="2">world</h2>
      </>
      : <>
        <h2 key="2">world</h2>
        <h1 key="1">hello</h1>
      </>
  );
  const first = mount(root, <App normal={true} />);
  const second = mount(root, <App normal={false} />, first);
  expect(root.innerHTML).toEqual('<h2>world</h2><h1>hello</h1>');
});

test('updating', () => {
  const root = document.createElement('div');
  const app = <h1>hello</h1>;
  const first = mount(root, app) as ElementNode;
  expect(first.type).toEqual(NodeType.Element);
  const second = mount(root, <h1>world</h1>, first) as ElementNode;
  expect(second.element).toBe(first.element);
  expect((second.children[0] as TextNode).element).toBe((first.children[0] as TextNode).element);
  expect(root.innerHTML).toEqual('<h1>world</h1>');
});

test('recreating', () => {
  const root = document.createElement('div');
  const app = <h1><h2 key={1}>hello</h2>?</h1>;
  const first = mount(root, app) as ElementNode;
  expect(first.type).toEqual(NodeType.Element);
  const second = mount(root, <h1><h2 key={2}>world</h2>!</h1>, first) as ElementNode;
  expect(second.element).toBe(first.element);
  expect(first.children.length).toBe(2);
  expect(second.children.length).toBe(2);
  const elem1 = first.children[0] as ElementNode;
  const elem2 = second.children[0] as ElementNode;
  expect(elem1.element).not.toBe(elem2.element)
  const text1 = first.children[1] as TextNode;
  const text2 = second.children[1] as TextNode;
  expect(text1.element).toBe(text2.element)
  expect(root.innerHTML).toEqual('<h1><h2>world</h2>!</h1>');
});

test('handler', () => {
  const root = document.createElement('div');
  const f1 = jest.fn();
  const first = mount(root, <h1 onClick={f1}></h1>) as ElementNode;
  first.element.click();
  expect(f1).toBeCalled();
  const f2 = jest.fn();
  mount(root, <h1 onClick={f2}></h1>, first);
  const f3 = jest.fn();
  mount(root, <h1 onClick={f3}></h1>, first);
  first.element.click();
  expect(f2).not.toBeCalled();
  expect(f3).toBeCalled();
});

test('useState #1', () => {
  const App = ({ initial }: { initial: number }) => {
    const [count, setCount] = useState(initial);
    return <p>
      {count}
      <button className="increase" onClick={() => setCount(count + 1)}></button>
      <button className="decrease" onClick={() => setCount(count - 1)}></button>
    </p>
  }
  const root = document.createElement('div');
  const p = ((mount(root, <App initial={1} />) as ComponentNode).result[0] as ElementNode).element;
  expect(p.firstChild!.nodeType).toBe(3);
  expect(p.firstChild!.nodeValue).toBe("1");
  (p.firstChild!.nextSibling as HTMLButtonElement).click();
  expect(p.firstChild!.nodeValue).toBe("2");
});

test('useState #2', () => {
  const App = ({ initial }: { initial: number }) => {
    const [count, setCount] = useState(initial);
    const [count2, setCount2] = useState(initial);
    return (
      <>
        <div key="1">
          <span id="s1">{count}</span>
          <button id="b1" onClick={() => setCount(count + 1)}></button>
        </div>
        <div key="2">
          <span id="s2">{count2}</span>
          <button id="b2" onClick={() => setCount2(count2 + 1)}></button>
        </div>
      </>
    )
  }
  const root = document.createElement('div');
  const prev = mount(root, <App initial={0} />);
  const span = (id:string) => root.querySelector(id) as HTMLSpanElement;
  const button = (id:string) => root.querySelector(id) as HTMLButtonElement;
  button("#b1").click();
  button("#b1").click();
  expect(span('#s1').innerHTML).toBe("2");
  expect(span('#s2').innerHTML).toBe("0");
  button("#b2").click();
  expect(span('#s1').innerHTML).toBe("2");
  expect(span('#s2').innerHTML).toBe("1");
  const b1 = button('#b1');
  const s2 = span('#s2');
  const next = mount(root, <App initial={10} />, prev);
  expect(span('#s1').innerHTML).toBe("2");
  button("#b1").click();
  button("#b2").click();
  // https://stackoverflow.com/questions/54865764/react-usestate-does-not-reload-state-from-props
  expect(span('#s1').innerHTML).toBe("3");
  expect(span('#s2').innerHTML).toBe("2");
  expect(button('#b1')).toBe(b1);
  expect(button('#s2')).toBe(s2);
});

test('useEffect #1', (done) => {
  const cleanup = jest.fn;
  const App = ({ initial }: { initial: number }) => {
    const [count, setCount] = useState(initial);
    useEffect(() => {
      setTimeout(() => setCount(10), 0);
      return cleanup;
    }, [])
    return (
      <p>
        <span id="span">{count}</span>
        <button id="button" onClick={() => setCount(count + 1)}></button>
      </p>);
  }
  const root = document.createElement('div');
  mount(root, <App initial={1} />);
  const span = root.querySelector('#span') as HTMLSpanElement;
  expect(span.innerHTML).toBe("1");
  setTimeout(() => {
    expect(span.innerHTML).toBe("10");
    done();
  }, 100)
  // todo: test cleanup's been called
});

test('useMemo', () => {
  const App = ({ x, y }: { x: number, y: number }) => {
    const z = useMemo(() => x + y, [y / x])
    return (
      <p>
        <span id="span">{z}</span>
      </p>);
  }
  const root = document.createElement('div');
  let prev = mount(root, <App x={1} y={2} />);
  const span = root.querySelector('#span') as HTMLSpanElement;
  expect(span.innerHTML).toBe("3");
  prev = mount(root, <App x={2} y={4} />, prev);
  expect(span.innerHTML).toBe("3");
  prev = mount(root, <App x={2} y={8} />, prev);
  expect(span.innerHTML).toBe("10");
});

test('useRef', () => {
  const App = ({ message }: { message: string }) => {
    const ref = useRef();
    return (
      <p>
        <span id="span" ref={ref}>{message + (ref.current || '')}</span>
      </p>);
  }
  const root = document.createElement('div');
  let prev = mount(root, <App message={'hello'} />);
  const span = root.querySelector('#span') as HTMLSpanElement;
  expect(span.innerHTML).toBe("hello");
  prev = mount(root, <App message={'world'} />, prev);
  expect(span.innerHTML.length).toBeGreaterThan("world".length);
});
