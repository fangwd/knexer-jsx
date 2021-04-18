# knexer-jsx

A tiny (1.8kb gzipped) React-like library that supports function components and hooks.

## Usage

We'll show the usage of knexer-jsx by using a simple javascript app. The app shows the number of times a button has been clicked.

First, create an empty javascript app and add `knexer-jsx` as a dependency:

```
mkdir knexer-jsx-example && cd $_
npm init -y
npm i knexer-jsx
```

Next, create a javascript file:

```
mkdir src
touch src/main.jsx
```

Paste the following code into `src/main.jsx`:

```js
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
```

Lastly, bundle the app into a standalone javascript file. This requires a few development dependencies and config files for babel and webpack.

- Install webpack and babel

```
npm i -D webpack webpack-cli @babel/core babel-loader @babel/preset-env @babel/plugin-transform-react-jsx
```

- Create a file called `babel.config.json` with the following content:

```js
{
  "plugins": ["@babel/plugin-transform-react-jsx"],
  "presets": ["@babel/preset-env"]
}
```

- Create a file called `webpack.config.js` with the following content:

```js
const path = require("path");

module.exports = {
  entry: "./src/main.jsx",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".jsx", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};

```

- Finally, add a new script entry in the `package.json`:
```js
 "scripts": {
    "build": "webpack --mode development"
  }
```

That's it!

Now we can bundle our app into a standalone file with the following command:
```
npm run build
```

You can test the new app with an html file like below:
```html
<!doctype html>
<html>
  <body>
    <div id="root"></div>
    <script src="./dist/bundle.js"></script>
  </body>
</html>
```

The source code of the final app can be found [here](https://github.com/fangwd/knexer-jsx/tree/master/example).


## License

MIT
