# Requirements Document

## Introduction
本仕様は、Habit の記録状況をユーザーが短時間で理解できる Graph Detail 画面の要件を定義する。対象は Graph の詳細表示、期間切替、統計表示、および異常時の挙動であり、実装手段ではなく期待される振る舞いを規定する。

## Requirements

### Requirement 1: Graph 詳細の基本表示
**Objective:** As a habit tracker user, I want 選択した Graph の詳細情報を1画面で確認できる, so that 記録状況を即座に把握できる

#### Acceptance Criteria
1. When ユーザーが Graph 一覧または関連導線から Graph Detail 画面を開いたとき, the Graph Detail Screen shall 選択された Graph を識別できる情報を表示する
2. When Graph Detail 画面の初期表示が完了したとき, the Graph Detail Screen shall 日々の記録状況を時系列で把握できる主要な可視化領域を表示する
3. The Graph Detail Screen shall 画面タイトルまたは同等の識別要素で現在表示中の Graph を明示する

### Requirement 2: Short/Full 表示モード切替
**Objective:** As a habit tracker user, I want Short と Full の表示モードを切り替えて記録傾向を比較できる, so that 短期と長期の継続状況を振り返りやすくなる

#### Acceptance Criteria
1. The Graph Detail Screen shall ユーザーが Short 表示と Full 表示を選択できる操作手段を提供する
2. When ユーザーが Short 表示を選択したとき, the Graph Detail Screen shall Habits 画面と同じ 14 週分のヒートマップを表示する
3. When ユーザーが Full 表示を選択したとき, the Graph Detail Screen shall 53 週分のヒートマップを表示する
4. While Short または Full のいずれかが選択されている間, the Graph Detail Screen shall 現在選択中の表示モードを視覚的に判別できる状態で示す
5. When ユーザーが同一表示モードを再選択したとき, the Graph Detail Screen shall 不要な状態変更を行わず表示の一貫性を維持する
6. While Short または Full のヒートマップセルが表示されている間, the Graph Detail Screen shall セルタップによる記録追加操作を提供しない

### Requirement 3: 統計サマリー表示
**Objective:** As a habit tracker user, I want 現在の期間に対する要約統計を確認できる, so that 数値として進捗を理解できる

#### Acceptance Criteria
1. The Graph Detail Screen shall 統計情報をアイコン・値・ラベルで構成される KPI チップ群として表示する
2. The Graph Detail Screen shall KPI チップとして少なくとも 記録日数・累計・平均・今日 の 4 指標を表示する
3. When 表示モードが更新されたとき, the Graph Detail Screen shall 統計情報をヒートマップと同じ表示条件に同期して更新する
4. If 対象表示範囲に記録が存在しない場合, the Graph Detail Screen shall 欠損指標をプレースホルダ付きで誤解なく表示する

### Requirement 4: 読み込み・異常時のフィードバック
**Objective:** As a habit tracker user, I want データ取得状況や失敗理由を理解できる, so that 次に取るべき行動を判断できる

#### Acceptance Criteria
1. While Graph Detail 画面がデータ取得中の間, the Graph Detail Screen shall 読み込み中であることを示す状態を表示する
2. If Graph Detail に必要なデータ取得に失敗した場合, the Graph Detail Screen shall 失敗を明示するメッセージを表示する
3. If 一時的な失敗から再試行可能な場合, the Graph Detail Screen shall ユーザーが再取得を実行できる手段を提供する
4. When 再取得が成功したとき, the Graph Detail Screen shall エラー表示を解除して最新の表示状態へ遷移する

### Requirement 5: 画面遷移と整合性
**Objective:** As a habit tracker user, I want 他画面との往復でも文脈を維持したい, so that スムーズに記録確認を続けられる

#### Acceptance Criteria
1. When ユーザーが Graph Detail 画面から戻る操作を行ったとき, the Graph Detail Screen shall 直前の画面遷移文脈に従って遷移する
2. When 同一 Graph の Detail を再訪したとき, the Graph Detail Screen shall 前回の選択状態または既定状態のいずれか一貫したルールで表示する
3. Where Graph Detail への複数導線が含まれる場合, the Graph Detail Screen shall どの導線から遷移しても同等の主要情報を提供する
