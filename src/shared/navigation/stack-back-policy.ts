interface ResolveStandardStackBackOptionsInput {
  isIos: boolean;
  isRootScreen: boolean;
}

interface StandardStackBackOptions {
  headerBackButtonDisplayMode: "minimal" | undefined;
  headerBackVisible: boolean;
  headerLeft: undefined;
}

/**
 * スタック階層に応じてOS標準の戻る導線オプションを解決する。
 */
export const resolveStandardStackBackOptions = ({
  isIos,
  isRootScreen,
}: ResolveStandardStackBackOptionsInput): StandardStackBackOptions => {
  return {
    headerBackButtonDisplayMode: isIos ? "minimal" : undefined,
    headerBackVisible: !isRootScreen,
    headerLeft: undefined,
  };
};
