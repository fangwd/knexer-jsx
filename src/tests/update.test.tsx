/** @jsx h */
/** @jsxFrag Fragment */

import { h, Fragment } from '../h';
import {
  TextNode,
  ElementNode,
  VirtualElementNode,
  ComponentNode,
} from '../types';
import { create, update, setAttribute, insert } from '../update';

describe('create()', () => {
  test('text nodes', () => {
    const node = create('hello') as TextNode;
    expect(node.element.nodeType).toBe(3);
    expect(node.element.nodeValue).toBe('hello');
  });

  test('element nodes', () => {
    const fn = jest.fn();
    const data: VirtualElementNode = {
      name: 'p',
      attributes: {
        className: 'p1',
        onClick: fn,
      },
      children: [
        'hello',
        {
          name: 'span',
          attributes: {
            id: 'span-1',
          },
          children: ['world'],
        },
      ],
    };

    const node = create(data) as ElementNode;
    expect(node).toBe(data);

    expect(node.element.nodeType).toBe(1);
    expect(node.element.tagName).toBe('P');

    const text = node.element.firstChild as Text;
    expect(text.nodeType).toBe(3);
    expect(text.nodeValue).toBe('hello');

    const span = text.nextSibling as HTMLSpanElement;
    expect(span.nodeType).toBe(1);
    expect(span.tagName).toBe('SPAN');
    expect(span.getAttribute('id')).toBe('span-1');
    expect(span.firstChild!.nodeType).toBe(3);
    expect(span.firstChild!.nodeValue).toBe('world');
    expect(span.nextSibling).toBe(null);
  });

  test('component nodes', () => {
    const App = () => <h1>hello</h1>;
    const data = <App />;
    const node = create(data) as ComponentNode;
    expect(node).toBe(data);
    expect(node.name).toBe(App);
    expect(node.result.length).toBe(1);
    const { element } = node.result[0] as ElementNode;
    expect(element.tagName).toBe('H1');
    expect(element.firstChild!.nodeValue).toBe('hello');
  });

  test('empty nodes', () => {
    const App = () => null;
    const data = <App />;
    const node = create(data) as ComponentNode;
    expect(node).toBe(data);
    expect(node.name).toBe(App);
    expect(node.result.length).toBe(0);
  });
});

describe('setAttribute()', () => {
  test('setting className', () => {
    const data = <p className="link">hello</p>;
    const node = create(data) as ElementNode;
    expect(node.element.getAttribute('class')).toBe('link');
    setAttribute(node, 'className', 'link2');
    expect(node.element.getAttribute('class')).toBe('link2');
  });

  test('setting style', () => {
    const data = <p style={{ color: 'blue' }}>hello</p>;
    const node = create(data) as ElementNode;
    expect(node.element.style.cssText).toBe('color: blue;');
    setAttribute(node, 'style', { color: 'green' });
    expect(node.element.style.cssText).toBe('color: green;');
  });

  test('setting event handler', () => {
    const fn = jest.fn();
    const data = <p onClick={fn}>hello</p>;
    const node = create(data) as ElementNode;

    node.element.click();
    expect(fn).toBeCalled();
    fn.mockClear();
    expect(fn).not.toBeCalled();

    const fn2 = jest.fn();
    setAttribute(node, 'onClick', fn2);
    node.element.click();
    expect(fn2).toBeCalled();
    expect(fn).not.toBeCalled();
  });

  test('resetting event handler', () => {
    const f1 = jest.fn();
    const first = create(<h1 onClick={f1}></h1>) as ElementNode;
    first.element.click();
    expect(f1).toBeCalled();
    const f2 = jest.fn();
    update(<h1 onClick={f2}></h1>, first);
    const f3 = jest.fn();
    update(<h1 onClick={f3}></h1>, first);
    first.element.click();
    expect(f2).not.toBeCalled();
    expect(f3).toBeCalled();
  });

  test('removing attributes', () => {
    const fn = jest.fn();
    const data = (
      <a href="#" style={{ color: 'blue' }} className="link" onClick={fn}>
        hello
      </a>
    );

    const node = create(data) as ElementNode;
    expect(node.element.getAttribute('href')).toBe('#');

    setAttribute(node, 'href', undefined);
    expect(!!node.element.getAttribute('href')).toBe(false);

    setAttribute(node, 'style', undefined);
    expect(!!node.element.getAttribute('style')).toBe(false);

    setAttribute(node, 'onClick', undefined);

    node.element.click();
    expect(fn).not.toBeCalled();

    setAttribute(node, 'onClick', fn);

    node.element.click();
    expect(fn).toBeCalled();
  });

  test('using invalid value', () => {
    const src = new Date() as any;
    const data = <img src={src} />;
    const node = create(data) as ElementNode;
    expect(node.element.getAttribute('src')).toBe(null);
  });

  test('setting value', () => {
    const data = <input />;
    const node = create(data) as ElementNode;
    setAttribute(node, 'value', 'hello');
    expect((node.element as HTMLInputElement).value).toBe('hello');
    setAttribute(node, 'value', '');
    expect((node.element as HTMLInputElement).value).toBe('');
  });

  test('setting checked', () => {
    const data = <input type="checkbox" />;
    const node = create(data) as ElementNode;
    setAttribute(node, 'checked', true);
    expect((node.element as HTMLInputElement).checked).toBe(true);
    setAttribute(node, 'checked', false);
    expect((node.element as HTMLInputElement).checked).toBe(false);
  });

  test('dangerouslySetInnerHTML (html)', () => {
    const data = <div contentEditable="true" />;
    const node = create(data) as ElementNode;
    setAttribute(node, 'dangerouslySetInnerHTML', {
      __html: '<span>hello</span>',
    });
    expect(node.element.innerHTML).toBe('<span>hello</span>');
  });

  test('dangerouslySetInnerHTML (text)', () => {
    const data = (
      <div
        contentEditable="true"
        dangerouslySetInnerHTML={{ __html: '' }}
      ></div>
    );
    const node = create(data) as ElementNode;
    expect(node.element.innerHTML).toBe('');
  });
});

describe('update()', () => {
  test('text nodes', () => {
    const prev = create('hello');
    const spy = spyOn(document, 'createTextNode');
    const next = update('world', prev) as TextNode;
    expect(spy).not.toBeCalled();
    expect(next).toBe(prev);
    expect(next.element.nodeValue).toBe('world');
  });

  test('element nodes', () => {
    const app = (
      <h1>
        <h2 key={1}>hello</h2>?
      </h1>
    );
    const first = create(app) as ElementNode;
    const elem1 = first.children[0] as ElementNode;
    expect(first.element.nodeType).toBe(1);
    const second = update(
      <h1>
        <h2 key={2}>world</h2>!
      </h1>,
      first,
    ) as ElementNode;
    expect(second.element).toBe(first.element);
    expect(first.children.length).toBe(2);
    expect(second.children.length).toBe(2);
    const elem2 = second.children[0] as ElementNode;
    expect(elem1.element).not.toBe(elem2.element);
    const text1 = first.children[1] as TextNode;
    const text2 = second.children[1] as TextNode;
    expect(text1.element).toBe(text2.element);
    expect(second.element.outerHTML).toEqual('<h1><h2>world</h2>!</h1>');
  });

  test('unmount', () => {
    const root = document.createElement('div');
    const prev = create('hello') as TextNode;
    insert(root, prev, null);
    const next = update(<h1>world</h1>, prev) as ElementNode;
    expect(next).not.toBe(prev);
    expect(next.element.tagName).toBe('H1');
    insert(root, next, null);
    expect(root.innerHTML).toBe('<h1>world</h1>');
  });

  test('component nodes', () => {
    const fn = jest.fn();
    const App = ({ title }: { title: string; id?: number }) => {
      fn();
      return (
        <h1>
          <h2>{title}</h2>?
        </h1>
      );
    };
    const prev = create(<App title={'hello'} id={1} />) as ElementNode;
    expect(fn).toBeCalled();
    fn.mockClear();
    update(<App title={'hello'} id={1} />, prev);
    expect(fn).not.toBeCalled();
    update(<App title={'hello'} />, prev);
    expect(fn).toBeCalled();
  });

  test('fragment', () => {
    const App = ({ normal }: { normal: boolean }) =>
      normal ? (
        <>
          <h1 key="1">hello</h1>
          <h2 key="2">world</h2>
          <h5 id="h5">!</h5>
        </>
      ) : (
        <>
          <h2 key="2">world</h2>
          <h3>,</h3>
          <h1 key="1">hello</h1>
        </>
      );
    const root = document.createElement('div');
    const prev = create(<App normal={true} />) as ComponentNode;
    const frag = prev.result[0] as ComponentNode;
    expect(frag.name).toBe(Fragment);
    const h1 = (frag.result[0] as ElementNode).element;
    const h2 = (frag.result[1] as ElementNode).element;
    const h5 = (frag.result[2] as ElementNode).element;
    insert(root, prev, null);
    const spy = spyOn(root, 'removeChild');
    const next = update(<App normal={false} />, prev) as ComponentNode;
    const frag2 = prev.result[0] as ComponentNode;
    expect((frag2.result[0] as ElementNode).element).toBe(h2);
    expect((frag2.result[1] as ElementNode).element.tagName).toBe('H3');
    expect((frag2.result[1] as ElementNode).element.textContent).toBe(',');
    expect((frag2.result[2] as ElementNode).element).toBe(h1);
    expect(frag2.result.length).toBe(3);
    insert(root, next, null);
    expect(spy).toBeCalledWith(h5);
  });

  test('attributes', () => {
    const prev = create(
      <a href="#" className="link">
        hello
      </a>,
    ) as ElementNode;
    const elem = prev.element;
    const spy = spyOn(elem, 'removeAttribute');
    const next = update(
      <a href="/" style={{ color: 'blue' }}>
        world
      </a>,
      prev,
    );
    expect(next).toBe(prev);
    expect(spy).toBeCalledWith('class');
    expect(elem.style.cssText).toBe('color: blue;');
    expect(elem.getAttribute('href')).toBe('/');
  });
});
