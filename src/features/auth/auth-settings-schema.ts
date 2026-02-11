import { z } from "zod";

/**
 * 接続設定フォームの入力検証スキーマ。
 */
export const authSettingsSchema = z.object({
  token: z.string().min(8, "tokenは8文字以上で入力してください"),
  username: z
    .string()
    .min(2, "usernameは2文字以上で入力してください")
    .regex(
      /^[a-z][a-z0-9-]{1,32}$/,
      "usernameは英小文字で始まり、英小文字/数字/-のみ利用できます"
    ),
});

/**
 * 接続設定フォームで扱う値の型。
 */
export type AuthSettingsFormValues = z.infer<typeof authSettingsSchema>;
