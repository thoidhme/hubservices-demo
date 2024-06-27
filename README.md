# lowcoder comp lib

## IMPORTANT: Before build and publish
Replace changeMe to component name at src/index.ts and package.json
```bash
import mainComp from "./mainComp";

export default {
  changeMe: mainComp
};
```

## Start

Start dev server to develop your comp lib.

```bash
yarn start

# or

npm start
```

## Build

Build current comp lib into a .tgz file that you can upload it to the Lowcoder Comp Market.

Before build you should change the version in package.json file.

```bash
yarn build

# or

npm run build
```

## Publish
Before publish
```bash
npm login
```

To publish your plugin on NPM, use following command.
```bash
yarn build_publish

# or

npm run build_publish
```
