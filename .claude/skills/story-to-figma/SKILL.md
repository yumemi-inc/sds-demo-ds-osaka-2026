---
name: story-to-figma
description: StorybookのストーリーをキャプチャしてFigmaファイルに追加する
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Edit, Grep, Glob, Bash, WebFetch, mcp__figma__generate_figma_design
argument-hint: story-name-or-url
---

# Story to Figma

StorybookのストーリーをキャプチャしてFigmaファイルに追加する。

## 手順

### 1. 対象ストーリーの特定

`$ARGUMENTS` からキャプチャ対象を特定する。

- ストーリー名やコンポーネント名が指定された場合: `src/stories/` 配下のストーリーファイルを探し、ストーリーIDを導出する
- StorybookのURLが指定された場合: URLからストーリーIDを抽出する
- 導出ルールの詳細: https://storybook.js.org/docs/configure/sidebar-and-urls#permalinking-to-stories

### 2. Figmaファイルキーの特定

`figma.config.json` の `documentUrlSubstitutions` に含まれるURLからファイルキーを抽出する。

### 3. Storybookの起動確認

Storybookのポートを確認する（`lsof -i :6006`）。起動していなければユーザーに起動を依頼する。

### 4. キャプチャスクリプトの確認

`.storybook/preview-head.html` に以下があるか確認し、なければ追加する:

```html
<script
  src="https://mcp.figma.com/mcp/html-to-design/capture.js"
  async
></script>
```

### 5. セレクタの決定

`figmaselector` でキャプチャ対象を絞り込む。ページ全体ではなくコンポーネントだけをキャプチャするために必ず指定する。

以下の選択肢をユーザーに提示し、選んでもらう:

1. **手動選択** (`figmaselector=*`) — ブラウザ上で要素選択UIが表示され、ユーザーが自分でキャプチャ対象をクリックして選ぶ。最も確実。
2. **storybook-root** (`figmaselector=#storybook-root`) — Storybookのルートコンテナをキャプチャする。手軽だが、ライブラリが挿入する不要な要素やコンテナのスタイル（width: 100%等）を含む場合がある。不要な要素がある場合、その要素に `data-h2d-ignore="true"` 属性を付けるとキャプチャから除外できる（Storybookのデコレータで付与すると便利）。
3. **推論セレクタ** — コンポーネントの実装コードを読み、ルート要素の安定したセレクタ（`data-testid`、`role`、固有のクラス名等）を推論して提案する。セレクタが見つかるまで自動でポーリングされるので、レンダリング後に出現する要素でも問題ない。CSS Modulesの場合はクラス名が不安定なため使えない。

セレクタはURLフラグメント内に入るためURLエンコードが必要（`#`→`%23`, `>`→`%3E`, スペース→`%20`）

### 6. 配置先の決定

キャプチャ結果をFigmaファイル内のどこに追加するかを決める。以下の選択肢をユーザーに提示し、選んでもらう:

1. **元のコンポーネントの横** — `figma.config.json` の `documentUrlSubstitutions` から対象コンポーネントに対応するエントリを探し、そのURLの `node-id` を抽出して `nodeId` に指定する。元のFigmaコンポーネントと同じ場所に追加される。
2. **特定のページを指定** — ユーザーにFigma URLまたはnodeIdを指定してもらい、そのnodeIdを使用する。
3. **最初のページに追加** — `nodeId` を省略する。ファイルの最初のページに追加される。

### 7. キャプチャ実行

#### 7a. キャプチャIDの取得

`mcp__figma__generate_figma_design` を `outputMode: existingFile` と `fileKey` で呼ぶ。ステップ6で `nodeId` が決まっている場合はそれも指定する。
複数ストーリーをキャプチャする場合は必要数分を並列で呼ぶ。

#### 7b. ブラウザで開く

```
open "http://localhost:{port}/iframe.html?id={story-id}&viewMode=story#figmacapture={captureId}&figmaendpoint=https%3A%2F%2Fmcp.figma.com%2Fmcp%2Fcapture%2F{captureId}%2Fsubmit&figmadelay=1000&figmaselector={encoded-selector}"
```

複数の場合は `sleep 2` を挟んで順に開く。**キャプチャにはブラウザのタブがフォアグラウンドである必要がある**ので、ユーザーにタブを切り替えないよう伝える。

StorybookのURLパラメータで状態を制御できる:

- `args` — propsの制御（例: `&args=disabled:true`）
- `globals` — テーマ等のグローバル設定（例: `&globals=theme:dark`）
- 詳細: https://storybook.js.org/docs/writing-stories/args#setting-args-through-the-url

#### 7c. 完了確認

5秒待機後、`mcp__figma__generate_figma_design` を `captureId` 付きで呼ぶ。pendingなら5秒待って再試行（最大10回）。

### 8. Figmaで確認

```
open "https://www.figma.com/design/{fileKey}"
```

## トラブルシューティング

キャプチャが失敗する場合:

- ブラウザのタブがフォアグラウンドにあるか確認する
- `figmadelay` を増やす（例: `figmadelay=3000`）
- URLハッシュに `&figmalogpayload=true` を追加すると、送信ペイロードがDevToolsコンソールに出力され、何がキャプチャされたか確認できる

## 注意事項

- キャプチャIDは1回限り使い捨て
- nodeIdの指定による配置先の違いについてはステップ6を参照
- 既存ノードの上書き更新はできない。常に新規追加
- Figma上でのコンポーネント化・バリアント設定・レイヤー命名は手動で行う必要がある
- `data-h2d-ignore="true"` 属性を持つ要素はキャプチャから除外される
