/** @jsx h */

import { h } from '../h';
import { useEffect, useState } from '../hooks';
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
  test('component', () => {
    const Item = ({ title }: { title: string }) => <div>{title}</div>;
    const List = ({ items }: { items: Array<{ title: string }> }) => (
      <div>
        {items.map((item) => (
          <Item key={item.title} title={item.title} />
        ))}
      </div>
    );
    const items = [{ title: 'hello' }, { title: 'world' }];
    const root = document.createElement('div');
    mount(root, <List items={items} />);
    expect(root.innerHTML).toBe('<div><div>hello</div><div>world</div></div>');
  });

  test('updateAll', (done) => {
    const Item = ({ message }: { message: string }) => <p>{message}</p>;
    const Main = () => {
      const [message, setMessage] = useState('hello');
      useEffect(() => {
        setTimeout(() => setMessage('world'), 100);
      }, []);
      // A function component must return either a node or a non-empty string
      if (message === 'hello') return <span/>;
      return <h3><Item message={message} /></h3>;
    };
    const root = document.createElement('div');
    mount(root, <Main />);
    setTimeout(() => {
      expect(root.innerHTML).toBe('<h3><p>world</p></h3>');
      done();
    }, 500);
  });
});


describe('unmount()', () => {
  test('text nodes #1', () => {
    const root = document.createElement('div');
    const node = mount(root, 'hello');
    expect(root.innerHTML).toBe('hello');
    unmount(node);
    expect(root.innerHTML).toBe('');
  });

  test('text nodes #2', () => {
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
