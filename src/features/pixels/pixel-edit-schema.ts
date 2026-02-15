import { z } from "zod";

const PIXEL_POSITIVE_QUANTITY_PATTERN = /^(?:[1-9]\d*)(?:\.\d+)?$/;

/**
 * ピクセル編集フォームの入力検証スキーマ。
 */
export const pixelEditSchema = z.object({
  optionalData: z.string().optional(),
  quantity: z
    .string()
    .regex(
      PIXEL_POSITIVE_QUANTITY_PATTERN,
      "数量は1以上の数値で入力してください"
    ),
});

/**
 * ピクセル編集フォームで扱う値の型。
 */
export type PixelEditFormValues = z.infer<typeof pixelEditSchema>;
