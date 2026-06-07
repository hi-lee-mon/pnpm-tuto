# React UI Library 作成手順

このリポジトリは、pnpm で管理する React UI ライブラリの最小構成です。今は `Button` と `TextField` を公開 API として用意しています。

2026 年時点の React UI ライブラリとしては、単にコンポーネントを build するだけでなく、React 19、TypeScript 6、pnpm 11 を前提にして、以下を最初から決めておくと後で崩れにくくなります。

- package の root import と component ごとの subpath import を用意する
- React は bundle に含めず `peerDependencies` に置く
- CSS は JS に暗黙同梱せず、明示的な `styles.css` として配布する
- theme は CSS variables で上書きできるようにする
- publish 前に `pnpm pack` で package の中身を確認する

参考にした現行ライブラリの考え方:

- Base UI: single package だが tree-shakable で、`@base-ui/react/popover` のような subpath import を使う
- Base UI: CSS を bundle せず、利用側の CSS レイヤーを尊重する
- Chakra UI: CSS variables を theme の基盤として扱う
- Radix UI / Chakra UI: `exports`、`sideEffects`、React peer dependencies を明示する

pnpm 11 では dependency の build scripts がより明示的に扱われます。このリポジトリでは `tsup` が内部で使う `esbuild` だけを `pnpm-workspace.yaml` の `allowBuilds` で許可しています。

## 1. 初期化

```bash
pnpm init
```

`package.json` では、ライブラリとして利用される入口を定義します。

- `main`: CommonJS 用の入口
- `module`: ES Modules 用の入口
- `types`: TypeScript 型定義の入口
- `exports`: root import、subpath import、CSS import の公開 API
- `files`: npm package に含めるファイルを `dist` と `styles.css` に限定

このリポジトリでは以下を公開します。

```ts
import { Button } from "@hokori/ui";
import { Button } from "@hokori/ui/button";
import { TextField } from "@hokori/ui/text-field";
import "@hokori/ui/styles.css";
```

## 2. 依存関係

```bash
pnpm add -D typescript@^6.0.3 tsup@^8.5.1 react@^19.2.7 react-dom@^19.2.7 @types/react@^19.2.17 @types/react-dom@^19.2.3
```

React と React DOM は、ライブラリに同梱せず `peerDependencies` に置きます。これにより、利用側アプリの React と重複してバンドルされることを避けられます。

```json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

React 18 までサポートしたいライブラリなら `^18 || ^19` に広げる選択もあります。ただし、このリポジトリでは最新寄せを優先して React 19 を peer の下限にしています。

## 3. TypeScript 設定

`tsconfig.json` では React JSX と bundler 向けの module resolution を有効にします。

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "ignoreDeprecations": "6.0",
    "strict": true,
    "noEmit": true
  }
}
```

## 4. フォルダ構成

コンポーネントは `src` 直下ではなく、`src/components/<component-name>` に置きます。UI ライブラリが大きくなると、実装、型、テスト、story、補助ファイルをコンポーネント単位で管理したくなるためです。

```txt
src/
  components/
    button/
      button.tsx
      index.ts
    text-field/
      text-field.tsx
      index.ts
  utils/
    cx.ts
  index.ts
```

`src/index.ts` は root import 用の公開入口です。

```ts
export { Button } from "./components/button";
export { TextField } from "./components/text-field";
```

各コンポーネントの `index.ts` は subpath import 用の入口です。

```ts
export { Button } from "./button";
export type { ButtonProps } from "./button";
```

## 5. コンポーネント

`src/components/button/button.tsx` に `Button` を実装しています。

```tsx
import { Button } from "@hokori/ui";
import "@hokori/ui/styles.css";

export function Example() {
  return <Button variant="primary">Click me</Button>;
}
```

この Button は通常の HTML button props を受け取れるため、`onClick`、`disabled`、`aria-*` などもそのまま渡せます。

`src/components/text-field/text-field.tsx` には `TextField` を実装しています。

```tsx
import { TextField } from "@hokori/ui/text-field";
import "@hokori/ui/styles.css";

export function Example() {
  return <TextField label="Name" placeholder="Your name" description="Displayed on your profile." />;
}
```

`TextField` は `label`、`description`、`error` を受け取り、`aria-describedby` と `aria-invalid` を内部でつなぎます。

スタイルは `styles.css` に置き、コンポーネントは `data-variant` と `data-size` を出します。これにより、variant や state の CSS を利用側で上書きしやすくなります。

```css
:root {
  --hui-color-primary: #111827;
  --hui-color-primary-foreground: #ffffff;
  --hui-radius-md: 0.5rem;
}
```

## 6. ビルド

```bash
pnpm build
```

`dist` の出力は `package.json` の build script で指定しています。

```json
{
  "scripts": {
    "build": "tsup src/index.ts src/components/*/index.ts --format esm,cjs --dts --clean --out-dir dist"
  }
}
```

`--out-dir dist` が出力先の指定です。`tsup` は entrypoint のパス構造を保ったまま、`dist` 配下に ESM、CommonJS、型定義を出力します。

- ESM: `dist/index.js`
- CommonJS: `dist/index.cjs`
- subpath: `dist/components/button/index.js`
- subpath: `dist/components/text-field/index.js`
- 型定義: `dist/index.d.ts`

## 7. 公開前チェック

publish はまだ実行しません。公開前に package として固められるか確認する場合は、`pnpm pack` を使います。

```bash
pnpm pack --json --out .pack/%s-%v.tgz
```

このリポジトリでは、ビルド込みで確認するための script も用意しています。

```bash
pnpm pack:preview
```

このコマンドは `.pack` 配下に tarball を作るだけで、registry への publish は行いません。

## 8. GitHub Packages に publish するとき

このリポジトリは GitHub Packages に publish する前提です。npmjs.com ではなく、GitHub の npm registry に package を置きます。

```txt
https://npm.pkg.github.com
```

`package.json` では publish 先を固定しています。

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

GitHub Packages の npm package は GitHub owner の scope が必要です。GitHub ユーザー名または Organization が `hokori` なら、package 名は以下のようにします。

```json
{
  "name": "@hokori/ui"
}
```

GitHub の owner が違う場合は、`package.json` の `name`、`.npmrc`、`.github/workflows/publish.yml` の `scope` を同じ owner に変更してください。

```ini
@hokori:registry=https://npm.pkg.github.com
```

ローカルから publish する場合は、GitHub の personal access token classic を使います。token はリポジトリに保存せず、ユーザーの npm 設定または環境変数で渡します。

```bash
npm login --scope=@hokori --auth-type=legacy --registry=https://npm.pkg.github.com
pnpm publish
```

GitHub Actions から publish する場合は、release を published にしたときに `.github/workflows/publish.yml` が実行されます。この workflow は `GITHUB_TOKEN` を使うため、リポジトリに token を追加する必要はありません。

```yaml
permissions:
  contents: read
  packages: write
```

注意点として、`"private": true` は入れません。これは private package にする設定ではなく、npm publish 自体を拒否する設定です。GitHub Packages で private にするかどうかは、GitHub repository/package の visibility と access control で管理します。
