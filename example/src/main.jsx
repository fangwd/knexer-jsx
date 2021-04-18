/** @jsx h */
import { h, mount, useState } from "knexer-jsx";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>Click</button>
    </div>
  );
}

mount(document.getElementById('root'), <Counter/>);
