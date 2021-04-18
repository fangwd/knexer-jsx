/** @jsx h */
/** @jsxFrag Fragment */

import { h, Fragment } from '../h';
import { useState, useEffect, useMemo, useRef } from '../hooks';
import { mount } from '../mount';
import { ComponentNode, ElementNode } from '../types';

test('useState #1', () => {
  const App = ({ initial }: { initial: number }) => {
    const [count, setCount] = useState(initial);
    return (
      <p>
        {count}
        <button
          className="increase"
          onClick={() => setCount(count + 1)}
        ></button>
        <button
          className="decrease"
          onClick={() => setCount(count - 1)}
        ></button>
      </p>
    );
  };
  const root = document.createElement('div');
  const p = ((mount(root, <App initial={1} />) as ComponentNode)
    .result[0] as ElementNode).element;
  expect(p.firstChild!.nodeType).toBe(3);
  expect(p.firstChild!.nodeValue).toBe('1');
  (p.firstChild!.nextSibling as HTMLButtonElement).click();
  expect(p.firstChild!.nodeValue).toBe('2');
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
    );
  };
  const root = document.createElement('div');
  const prev = mount(root, <App initial={0} />);
  const span = (id: string) => root.querySelector(id) as HTMLSpanElement;
  const button = (id: string) => root.querySelector(id) as HTMLButtonElement;
  button('#b1').click();
  button('#b1').click();
  expect(span('#s1').innerHTML).toBe('2');
  expect(span('#s2').innerHTML).toBe('0');
  button('#b2').click();
  expect(span('#s1').innerHTML).toBe('2');
  expect(span('#s2').innerHTML).toBe('1');
  const b1 = button('#b1');
  const s2 = span('#s2');
  const next = mount(root, <App initial={10} />, prev);
  expect(span('#s1').innerHTML).toBe('2');
  button('#b1').click();
  button('#b2').click();
  // https://stackoverflow.com/questions/54865764/react-usestate-does-not-reload-state-from-props
  expect(span('#s1').innerHTML).toBe('3');
  expect(span('#s2').innerHTML).toBe('2');
  expect(button('#b1')).toBe(b1);
  expect(button('#s2')).toBe(s2);
});

test('useEffec', (done) => {
  const cleanup = jest.fn();
  const App = ({ initial }: { initial: number }) => {
    const [count, setCount] = useState(initial);
    useEffect(() => {
      setTimeout(() => setCount(10), 0);
      return cleanup;
    }, [initial]);
    return (
      <p>
        <span id="span">{count}</span>
        <button id="button" onClick={() => setCount(count + 1)}></button>
      </p>
    );
  };
  const root = document.createElement('div');
  const prev = mount(root, <App initial={1} />);
  const span = root.querySelector('#span') as HTMLSpanElement;
  expect(span.innerHTML).toBe('1');
  setTimeout(() => {
    expect(span.innerHTML).toBe('10');
    expect(cleanup).not.toBeCalled();
    mount(root, <App initial={2} />, prev);
    expect(cleanup).toBeCalled();

    done();
  }, 100);
});

test('useMemo', () => {
  const App = ({ x, y }: { x: number; y: number }) => {
    const z = useMemo(() => x + y, [y / x]);
    return (
      <p>
        <span id="span">{z}</span>
      </p>
    );
  };
  const root = document.createElement('div');
  let prev = mount(root, <App x={1} y={2} />);
  const span = root.querySelector('#span') as HTMLSpanElement;
  expect(span.innerHTML).toBe('3');
  prev = mount(root, <App x={2} y={4} />, prev);
  expect(span.innerHTML).toBe('3');
  prev = mount(root, <App x={2} y={8} />, prev);
  expect(span.innerHTML).toBe('10');
});

test('useRef', () => {
  const App = ({ message }: { message: string }) => {
    const ref = useRef();
    return (
      <p>
        <span id="span" ref={ref}>
          {message + (ref.current || '')}
        </span>
      </p>
    );
  };
  const root = document.createElement('div');
  let prev = mount(root, <App message={'hello'} />);
  const span = root.querySelector('#span') as HTMLSpanElement;
  expect(span.innerHTML).toBe('hello');
  prev = mount(root, <App message={'world'} />, prev);
  expect(span.innerHTML.length).toBeGreaterThan('world'.length);
});
