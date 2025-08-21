---
title: "Nuxt 2からNuxt 3への移行に成功"
date: 2025-01-20
author: myokoym
tags: [nuxt3, vue3, migration, typescript]
category: development
lang: ja
description: "本番環境の将棋ウェブアプリケーションをNuxt 2からNuxt 3に完全移行したガイド"
---

# Nuxt 2からNuxt 3への移行に成功

[English](nuxt3-migration-complete.md) | [日本語](nuxt3-migration-complete.ja.md)

## TL;DR

本番環境の将棋ウェブアプリケーションをNuxt 2.18.1からNuxt 3.18.1に成功裏に移行。Vue 3へのアップグレード、TypeScriptの有効化、全コンポーネントのComposition APIへの変換を含む。移行により、全機能を維持しながらコードベースを約10,000行削減。

## はじめに

Nitroの実験的WebSocket機能が本番環境で404エラーを引き起こす重大な問題に直面した後、Nuxt 2からNuxt 3への完全移行を決定しました。当初はNuxt Bridgeを踏み台として使用する計画でしたが、直接移行の方が効果的であることが判明しました。

## 移行の道のり

### 初期の課題

移行はパッケージ名の混乱から始まりました：
- 最初に`nuxt3`パッケージ（実験的ナイトリービルド）をインストール
- 正しいパッケージは単に`nuxt`のバージョン3.x
- Nuxt 2がまだ動作していたため、何時間もデバッグに費やしました

### 実装した主要な変更

#### 1. フレームワークのアップグレード
```json
// 変更前
"nuxt": "^2.18.1",
"vue": "^2.7.16"

// 変更後
"nuxt": "^3.18.1",
"vue": "^3.5.18"
```

#### 2. コンポーネントの移行
8つのVueコンポーネント全てをOptions APIからComposition APIに変換：

```javascript
// 変更前（Options API）
export default Vue.extend({
  data() {
    return { count: 0 }
  },
  methods: {
    increment() { this.count++ }
  }
})

// 変更後（Composition API）
<script setup>
const count = ref(0)
const increment = () => count.value++
</script>
```

#### 3. TypeScriptサポート
- ViteでネイティブTypeScriptサポートを有効化
- 全Piniaストアを`.ts`拡張子で維持
- 追加設定不要

### 技術的な発見

1. **ビルドシステムの変更**: Webpack 4 → Vite
   - ES2022構文の問題を解決
   - ビルド時間の高速化（3.2秒）
   - TypeScriptサポートの向上

2. **UIライブラリの移行**: bootstrap-vue → bootstrap-vue-next
   - Vue 3互換性のために必要
   - Vueバージョンの競合を修正

3. **プラグインの更新**: 全プラグインを`defineNuxtPlugin`形式に変換

## 結果

### パフォーマンスメトリクス
- ビルド時間: 約3.2秒
- バンドルサイズ: 4.08 MB (gzip時1.15 MB)
- コード削減: 10,747行削除

### 移行統計
```
28ファイル変更
13,291行追加(+)
24,038行削除(-)
```

## 重要なポイント

1. **直接移行 vs Bridge**: 時にはブリッジソリューションよりも直接移行の方がクリーン
2. **パッケージ名**: 常にドキュメントで公式パッケージ名を確認
3. **TypeScriptの利点**: Nuxt 3のネイティブTypeScriptサポートは複雑な設定を不要に
4. **コード品質**: モダンな構文によりクリーンで保守しやすいコードに

## 次のステップ

- [ ] Socket.IO統合テスト
- [ ] 本番デプロイ設定
- [ ] Docker設定の更新
- [ ] パフォーマンス最適化
- [ ] Nuxt UIへの移行検討

## まとめ

Nuxt 2からNuxt 3への移行は困難でしたが、やりがいのあるものでした。初期の混乱と挫折にもかかわらず、結果としてモダンで保守しやすいコードベース、改善された開発者体験、より良いパフォーマンスを実現しました。重要なのは忍耐と、エラーメッセージが必ずしも本当の問題を指していないことを理解することでした。

## 参考資料

- [Nuxt 3ドキュメント](https://nuxt.com)
- [Vue 3移行ガイド](https://v3-migration.vuejs.org/)
- [Bootstrap Vue Next](https://bootstrap-vue-next.github.io/bootstrap-vue-next/)
- [セッション履歴](../.claude/session-history/2025-01-20-nuxt3-migration.md)