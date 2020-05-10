<template>
  <div>
    <h4>
      説明書
      <small class="text-muted">usage</small>
    </h4>
    <dl class="row">
      <dt class="col-sm-2">概要</dt>
      <dd class="col-sm-10">
        複数人がリアルタイムで同じ将棋盤を表示・操作できるWebアプリケーションです。
        ちょっとした自由対局や感想戦、研究会などにお使いいただけます。
      </dd>
      <dt class="col-sm-2">ルーム作成</dt>
      <dd class="col-sm-10">
        任意のルームIDを入力してください。盤面はルーム（URL）単位で同期されます。
        入力したルームIDはそのままURLに使われるため、半角英数字を推奨します。
      </dd>
      <dt class="col-sm-2">URL共有</dt>
      <dd class="col-sm-10">
        URLをコピーして、盤面を共有したい人に伝えてください。
        （チャット機能は未実装のため、他のアプリを併用ください。）
      </dd>
      <dt class="col-sm-2">盤面の同期</dt>
      <dd class="col-sm-10">
        誰かが駒を動かすと、同じURLを表示しているすべての人の盤面が自動で更新されます。
        （盤面単位で同期されるため、同時に動かすと直前の動作が上書きされる場合があります。）
      </dd>
      <dt class="col-sm-2">盤面の操作</dt>
      <dd class="col-sm-10">
        クリックとドラッグ＆ドロップの両方に対応しています。
        駒の動きはチェックしていないため、自由に動かすことができます。
      </dd>
      <dt class="col-sm-2">駒の成り方</dt>
      <dd class="col-sm-10">
        PCの場合は右クリックで成れます。
        タブレット等の場合、駒を選択状態（黄色背景）にしてから下部のボタンを押してください。
      </dd>
      <dt class="col-sm-2">問い合わせ</dt>
      <dd class="col-sm-10">
        Twitterでサポートを行っています。不明点などがありましたら、
        <a href="https://twitter.com/shogiwebroom">@shogiwebroom</a>
        までご連絡ください。
      </dd>
    </dl>
  </div>
</template>

<style>
</style>