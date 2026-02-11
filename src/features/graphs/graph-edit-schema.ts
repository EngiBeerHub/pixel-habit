import { z } from "zod";
import { graphColorOptions } from "../../shared/api/graph";

/**
 * グラフ編集フォームの入力検証スキーマ。
 */
export const graphEditSchema = z.object({
  color: z.enum(graphColorOptions),
  name: z.string().min(1, "グラフ名は必須です"),
  timezone: z.string().min(1, "タイムゾーンは必須です"),
  unit: z.string().min(1, "単位は必須です"),
});

/**
 * グラフ編集フォームで扱う値の型。
 */
export type GraphEditFormValues = z.infer<typeof graphEditSchema>;
