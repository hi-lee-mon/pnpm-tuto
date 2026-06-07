TypeScript / React のライブラリをnpm packageとして配布できる形にビルドするツール。

tsupを実行することでsrc配下をdistに変換できる。

```bash
  tsup src/index.ts src/components/*/index.ts \
    --format esm,cjs \
    --dts \
    --clean \
    --out-dir dist
```
build対象を1行目で指定。
formatで出力を決定
dtsで.d.ts型定義を出力
cleanでbuild実行前にout-dirを削除する
out-dirで出力先をdistという名前のフォルダに指定

全体像は以下の通り
1. tsup が dist を作る
2. package.json の exports が dist を公開する
3. 利用者が @hokori/ui を import する