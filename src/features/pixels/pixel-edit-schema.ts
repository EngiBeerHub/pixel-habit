import { z } from "zod";

const PIXEL_QUANTITY_PATTERN = /^\d+(\.\d+)?$/;

/**
 * ピクセル編集フォームの入力検証スキーマ。
 */
export const pixelEditSchema = z.object({
  quantity: z
    .string()
    .regex(PIXEL_QUANTITY_PATTERN, "数量は0以上の数値で入力してください"),
});

/**
 * ピクセル編集フォームで扱う値の型。
 */
export type PixelEditFormValues = z.infer<typeof pixelEditSchema>;
