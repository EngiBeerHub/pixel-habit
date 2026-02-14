import { z } from "zod";

/**
 * 日付入力が yyyyMMdd 形式かを検証する正規表現。
 */
const PIXEL_DATE_PATTERN = /^\d{8}$/;
/**
 * 数量入力が1以上の数値かを検証する正規表現。
 */
const PIXEL_QUANTITY_PATTERN = /^(?:[1-9]\d*)(?:\.\d+)?$/;

/**
 * 日次記録追加フォームの入力検証スキーマ。
 */
export const pixelAddSchema = z.object({
  date: z
    .string()
    .regex(PIXEL_DATE_PATTERN, "日付は yyyyMMdd 形式で入力してください"),
  quantity: z
    .string()
    .regex(PIXEL_QUANTITY_PATTERN, "数量は1以上の数値で入力してください"),
});

/**
 * 日次記録追加フォームで扱う値の型。
 */
export type PixelAddFormValues = z.infer<typeof pixelAddSchema>;
