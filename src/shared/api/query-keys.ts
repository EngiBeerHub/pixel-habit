/**
 * 画面間で共有する React Query key 定義。
 *
 * key を1か所へ集約し、invalidate漏れやタイポを防ぐ。
 */
export const queryKeys = {
  /**
   * 認証情報キャッシュのquery key。
   */
  authCredentials: () => ["authCredentials"] as const,

  /**
   * グラフ一覧のquery key。
   */
  graphs: (username: string | null) => ["graphs", username] as const,

  /**
   * グラフ一覧のプレフィックスquery key。
   */
  graphsAll: () => ["graphs"] as const,

  /**
   * Graph詳細画面の期間内ピクセル一覧query key。
   */
  graphDetailPixels: (
    username: string | null,
    graphId: string,
    mode: "month" | "year"
  ) => ["graphDetailPixels", username, graphId, mode] as const,

  /**
   * Graph詳細ピクセル一覧のプレフィックスkey。
   */
  graphDetailPixelsAll: () => ["graphDetailPixels"] as const,

  /**
   * Homeカードのcompactヒートマップquery key。
   */
  graphPixelsCompact: (
    username: string | null,
    graphId: string,
    from: string,
    to: string
  ) => ["graphPixelsCompact", username, graphId, from, to] as const,

  /**
   * Homeカードのcompactヒートマップquery key（ユーザー単位プレフィックス）。
   */
  graphPixelsCompactByUser: (username: string | null) =>
    ["graphPixelsCompact", username] as const,

  /**
   * Homeカードのcompactヒートマップquery key（全体プレフィックス）。
   */
  graphPixelsCompactAll: () => ["graphPixelsCompact"] as const,

  /**
   * Homeで今日の未入力判定などに使う日次query key（将来互換を維持）。
   */
  graphPixelsToday: (username: string | null) =>
    ["graphPixelsToday", username] as const,
} as const;
