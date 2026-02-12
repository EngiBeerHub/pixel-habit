import { Card } from "heroui-native";
import type { ReactNode } from "react";
import { colorTokens, typographyTokens } from "../config/ui-tokens";
import { mergeClassNames } from "../lib/class-name";

/**
 * SectionCardの表示トーン。
 */
type SectionCardTone = "danger" | "neutral";

/**
 * SectionCardコンポーネントの入力値。
 */
export interface SectionCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  tone?: SectionCardTone;
}

/**
 * セクション単位のコンテンツをカード枠で表示する。
 */
export const SectionCard = ({
  children,
  className,
  title,
  tone = "neutral",
}: SectionCardProps) => {
  const toneClassNames =
    tone === "danger"
      ? {
          root: "bg-red-50",
          title: colorTokens.dangerTextClass,
          variant: "secondary" as const,
        }
      : {
          root: undefined,
          title: typographyTokens.sectionTitleClass,
          variant: "default" as const,
        };

  return (
    <Card
      className={mergeClassNames(toneClassNames.root, className)}
      variant={toneClassNames.variant}
    >
      {title ? (
        <Card.Header>
          <Card.Title className={mergeClassNames("mb-1", toneClassNames.title)}>
            {title}
          </Card.Title>
        </Card.Header>
      ) : null}
      <Card.Body>{children}</Card.Body>
    </Card>
  );
};
