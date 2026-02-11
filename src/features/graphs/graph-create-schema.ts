import { z } from "zod";
import { graphColorOptions, graphTypeOptions } from "../../shared/api/graph";

const GRAPH_ID_PATTERN = /^[a-z][a-z0-9-]{1,16}$/;

/**
 * グラフ作成フォームの入力検証スキーマ。
 */
export const graphCreateSchema = z.object({
  color: z.enum(graphColorOptions),
  id: z
    .string()
    .regex(
      GRAPH_ID_PATTERN,
      "idは英小文字で始まり、英小文字/数字/-で2〜17文字です"
    ),
  name: z.string().min(1, "グラフ名は必須です"),
  timezone: z.string().min(1, "タイムゾーンは必須です"),
  type: z.enum(graphTypeOptions),
  unit: z.string().min(1, "単位は必須です"),
});

/**
 * グラフ作成フォームで扱う値の型。
 */
export type GraphCreateFormValues = z.infer<typeof graphCreateSchema>;
