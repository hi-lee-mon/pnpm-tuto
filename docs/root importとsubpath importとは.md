root importは
```tsx
import { Button } from "@hokori/ui";
```
package.jsonのexportsに"."で書くことで設定できる。

exportsは配信されたpackageの中で、外からimportしてよいものを決める設定。つまり利用者側はexportsになるものだけをimportできると理解すればOK.

exportsを書く理由としては
1. 公開API
2. import,require,typesの出し分けができる
3. 後述するsubpath importができる
の3つがある。

subpath importは
```tsx
import { Button } from "@hokori/ui/button";
```
subpathはワイルドカードにするか。自動生成するのが良いかも。
※ワイルドカードだとpublic APIの範囲がわからなくなるので注意。