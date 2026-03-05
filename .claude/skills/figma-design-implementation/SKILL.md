---
name: figma-design-implementation
description: This skill should be used when the user provides a Figma URL and wants to implement the design, "FigmaのURLを実装して", "このデザインを実装して", "implement this Figma design", "build from Figma URL", "Figmaのコンポーネントを実装してStoryを作って". Covers full workflow: design analysis, SDS component implementation, Storybook story creation with play-function tests, vitest execution, Playwright visual verification, and optional Code Connect mapping. Requires Figma MCP server and Playwright MCP server connections.
version: 0.1.0
---

# Figma デザイン実装スキル

Figma URL からデザインを受け取り、このプロジェクト（SDS: Simple Design System）の慣習に従って実装する完全なワークフロー。メタデータ解析・実装・Storybook story 作成・vitest テスト・Playwright 視覚確認・Code Connect まで一貫して行う。

## 前提条件

- Figma MCP サーバーが接続済みであること（`get_metadata`, `get_design_context`, `get_screenshot`, `get_code_connect_suggestions` が使えること）
- Playwright MCP サーバーが接続済みであること（`browser_navigate`, `browser_take_screenshot` が使えること）
- ユーザーが Figma URL を提供すること: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`

## ワークフロー

以下のフェーズを順番に実行する。スキップしない。

---

## フェーズ 1: デザイン解析

### ステップ 1 — URL をパース

Figma URL から以下を抽出する:
- **fileKey**: `/design/` 直後のセグメント
- **nodeId**: `node-id` クエリパラメータの値（`get_metadata`・`get_design_context` ではハイフン形式 `1-2` のまま、Code Connect ツールではコロン形式 `1:2` に変換）

### ステップ 2 — メタデータで構造を把握

最初に `get_metadata` を呼び出し、全体のコンポーネントツリーを把握する:

```
get_metadata(fileKey=":fileKey", nodeId="1-2")
```

メタデータから確認すること:
- コンポーネントの種類（primitive / composition / layout / ページセクション）
- 複雑なデザインの場合は子ノード ID のリスト
- 新規コンポーネントか既存 SDS コンポーネントの拡張か
- ノード名に現れるバリアントや状態

### ステップ 3 — デザインコンテキストを取得

対象ノードの `get_design_context` を呼び出す（複雑な場合は子ノードを個別に取得）:

```
get_design_context(fileKey=":fileKey", nodeId="1-2")
```

レスポンスが切れる場合は、ステップ 2 で確認した子ノード ID を使って個別に取得する。

レスポンスで確認すること:
- `codeDependencies` — 再利用すべき既存 SDS コンポーネントへのマッピング
- デザイントークン参照（`--sds-color-*`, `--sds-size-space-*` など）
- アノテーション（`data-content-annotations`, `data-interaction-annotations`）— インタラクション実装の根拠
- バリアントと状態
- 非表示ノード（`hidden: true`）— 無視する

### ステップ 4 — 視覚的参照をキャプチャ

```
get_screenshot(fileKey=":fileKey", nodeId="1-2")
```

このスクリーンショットを実装全体を通じて視覚的な正解として保持する。

---

## フェーズ 2: 実装

`.github/copilot-instructions.md` の SDS プロジェクト規約に従う。

### コンポーネントの配置先

| 種類 | ディレクトリ |
|------|-------------|
| アトミックコンポーネント | `src/ui/primitives/<Name>/` |
| 複合パターン | `src/ui/compositions/<Name>/` |
| レイアウトヘルパー | `src/ui/layout/<Name>/` |

### SDS の必須ルール

- **SDS エイリアスからのみインポートする**: `primitives`, `compositions`, `layout`, `icons`, `images`, `data`, `hooks`
- **色・スペース・タイポグラフィを直書きしない**: 必ず `var(--sds-color-*)`, `var(--sds-size-space-*)`, `var(--sds-typography-*)` などの CSS 変数を使う
- **カスタムレイアウト CSS を書かない**: `<Flex>`, `<Section>`, `<Grid>` コンポーネントを使う
- **`@react-aria` や `@react-stately` を直接インポートしない**: SDS のラッパーを使う
- **既存コンポーネントの TypeScript ファイルを事前に読む**: props 名と型を確認してから使う

### 翻訳手順

1. デザインコンテキストの `codeDependencies` を確認し、既存 SDS コンポーネントを直接再利用する
2. TypeScript コンポーネントファイルを読んで利用可能な props を確認する
3. Figma デザイントークンを SDS CSS 変数にマッピングする
4. SDS の primitives / compositions / layout コンポーネントを使って実装する
5. `data-interaction-annotations` に基づいて動的な振る舞いを実装する

### Figma との照合

実装後、ステップ 4 のスクリーンショットと比較する:
- レイアウト・スペーシング・アライメント
- タイポグラフィ（サイズ・ウェイト・行間）
- 色
- インタラクティブな状態（hover, disabled, active）
- レスポンシブな挙動

---

## フェーズ 3: Storybook Story の作成

`src/stories/<category>/<ComponentName>.stories.tsx` に story ファイルを作成する。

### Story ファイルの規約

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "@storybook/test";
import { ComponentName } from "primitives"; // または "compositions", "layout"

const meta: Meta<typeof ComponentName> = {
  component: ComponentName,
  title: "SDS <Category>/<ComponentName>",
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ComponentName>;

// 基本 story
export const StoryDefault: Story = {
  name: "Default",
  args: {
    // デフォルト props
  },
  render: (args) => <ComponentName {...args} />,
};

// play 関数によるインタラクションテスト
export const StoryInteractive: Story = {
  name: "Interactive",
  render: () => <ComponentName />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /submit/i });
    await userEvent.click(button);
    await expect(canvas.getByText("Success")).toBeInTheDocument();
  },
};
```

### `play` 関数を書くタイミング

デザインに以下がある場合は `play` 関数を追加する:
- `data-interaction-annotations` がある
- トグル状態（開閉・選択など）
- フォームの送信やバリデーション
- モーダル / ダイアログの開閉
- タブの切り替え
- クリック・入力・ホバーで変化する要素

`@storybook/test` から: `userEvent`, `expect`, `within`, `waitFor`, `fn` を使う。

### title の命名規則

- `"SDS Primitives/<Name>"` — primitives
- `"SDS Compositions/<Name>"` — compositions
- `"SDS Layout/<Name>"` — layout

---

## フェーズ 4: vitest でテスト実行

Story 作成後、vitest で Storybook インタラクションテストを実行する:

```bash
npx vitest --project=storybook
```

特定の story ファイルだけ実行する場合:

```bash
npx vitest --project=storybook src/stories/<category>/<ComponentName>.stories.tsx
```

失敗した場合の対処:
- アクセシブルな名前がない要素 → `aria-label` 属性を追加する
- 非同期タイミング → `@storybook/test` の `waitFor` を使う
- 要素のクエリが間違っている → `canvas.debug()` でレンダリングされた HTML を確認する

すべてのテストが通るまで修正してから次のフェーズに進む。

---

## フェーズ 5: Playwright で視覚確認

Playwright MCP サーバーを使って Storybook の描画結果を確認する。

### ステップ 1 — Story URL を構築

Storybook は `http://localhost:6006` で動作する。title から story ID を生成する:

- title `"SDS Primitives/Button"` → `sds-primitives-button`
- story 名 `"Default"` → `sds-primitives-button--story-default`

URL 形式: `http://localhost:6006/iframe.html?id=<story-id>&viewMode=story`

### ステップ 2 — ナビゲートしてスクリーンショット

```
browser_navigate(url="http://localhost:6006/iframe.html?id=<story-id>&viewMode=story")
browser_take_screenshot()
```

### ステップ 3 — フェーズ 1 のスクリーンショットと比較

- 視覚的な忠実度（レイアウト・色・タイポグラフィ）
- インタラクティブな要素の存在と動作
- コンソールエラーがないこと（必要なら `browser_console_messages` を使う）

差異があれば実装を修正して再確認する。

---

## フェーズ 6: Code Connect（任意）

Figma コンポーネントが公開済みライブラリコンポーネントであれば Code Connect を試みる。ユーザーが要求していない場合や一時的なコンポジションの場合はスキップする。

`figma:code-connect-components` スキルのワークフローに従う:

1. nodeId をコロン形式に変換: `1-2` → `1:2`
2. `get_code_connect_suggestions(fileKey=":fileKey", nodeId="1:2")` を呼び出す
3. 返されたコンポーネントを実装したコードファイルと照合する
4. 一致候補をユーザーに提示して確認を取る
5. 承認されたマッピングで `send_code_connect_mappings` を呼び出す

このプロジェクトでの Code Connect ファイルの配置先:
- `src/figma/primitives/<Name>.figma.tsx` — primitives
- `src/figma/compositions/<Name>.figma.tsx` — compositions
- `src/figma/icons/<Name>.figma.tsx` — icons

---

## 完了チェックリスト

- [ ] Figma URL をパース済み（fileKey + nodeId）
- [ ] `get_metadata` 実行済み — コンポーネント構造を把握
- [ ] `get_design_context` 実行済み — デザインデータとアノテーションを確認
- [ ] `get_screenshot` 実行済み — 視覚的参照をキャプチャ
- [ ] `codeDependencies` から既存 SDS コンポーネントを特定
- [ ] SDS エイリアスと CSS 変数を使って実装完了
- [ ] `src/stories/` に story ファイルを作成
- [ ] インタラクティブな story には `play` 関数を追加
- [ ] `npx vitest --project=storybook` が通る
- [ ] Playwright スクリーンショットが Figma デザインと一致
- [ ] Code Connect マッピングを作成（該当する場合）

## 参考ファイル

- **`.github/copilot-instructions.md`** — SDS プロジェクト規約・コンポーネントカテゴリ・CSS 変数リファレンス
- **`src/stories/`** — 既存の story ファイルの例
- **`src/figma/`** — 既存の Code Connect ファイルの例
- **`figma:implement-design` スキル** — Figma-to-code 翻訳の詳細ワークフロー
- **`figma:code-connect-components` スキル** — Code Connect の詳細ワークフロー
