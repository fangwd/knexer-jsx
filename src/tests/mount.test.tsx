/** @jsx h */

import { h } from '../h';
import { useEffect } from '../hooks';
import { mount, unmount } from '../mount';
import { ElementNode } from '../types';

describe('mount()', () => {
  test('create', () => {
    const root = document.createElement('div');
    const prev = mount(root, <h1>hello</h1>);
    mount(root, <h2>world</h2>, prev);
    expect(root.innerHTML).toBe('<h2>world</h2>');
  });
  test('update', () => {
    const root = document.createElement('div');
    const prev = mount(root, <h1>hello</h1>) as ElementNode;
    const next = mount(root, <h1>world</h1>, prev) as ElementNode;
    expect(prev).toBe(next);
    expect(root.innerHTML).toBe('<h1>world</h1>');
  });
});

describe('unmount()', () => {
  test('text nodes', () => {
    const root = document.createElement('div');
    const node = mount(root, <h1>hello</h1>);
    mount(root, <h1></h1>, node);
    expect(root.innerHTML).toBe('<h1></h1>');
  });

  test('element nodes', () => {
    const root = document.createElement('div');
    const prev = mount(root, <h1>hello</h1>);
    unmount(prev);
    expect(root.innerHTML).toBe('');
  });

  test('component nodes', () => {
    const root = document.createElement('div');
    const App = () => <h1>hello</h1>;
    const prev = mount(root, <App />);
    mount(root, <h2>world</h2>, prev);
    expect(root.innerHTML).toBe('<h2>world</h2>');
  });

  test('effect', () => {
    const root = document.createElement('div');
    const cleanup = jest.fn();
    const App = () => {
      useEffect(() => cleanup, []);
      return <h1>hello</h1>;
    };
    const prev = mount(root, <App />);
    mount(root, <h2>world</h2>, prev);
    expect(cleanup).toBeCalled();
  });
});
