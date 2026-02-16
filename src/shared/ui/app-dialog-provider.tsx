import { Button, Dialog } from "heroui-native";
import { createContext, type ReactNode, useContext, useState } from "react";
import { Alert, View } from "react-native";

/**
 * AppDialogで利用するアクション定義。
 */
interface AppDialogAction {
  label: string;
  onPress?: () => void | Promise<void>;
  role?: "cancel" | "default" | "destructive";
}

/**
 * Dialog表示時に受け取る入力値。
 */
interface AppDialogParams {
  actions: AppDialogAction[];
  description?: string;
  dismissible?: boolean;
  title: string;
}

/**
 * アプリ共通Dialog操作の公開インターフェース。
 */
interface AppDialogContextValue {
  close: () => void;
  open: (params: AppDialogParams) => void;
}

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

/**
 * HeroUI Dialogをアプリ共通で提供するProvider。
 */
export const AppDialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogParams, setDialogParams] = useState<AppDialogParams | null>(
    null
  );

  const close = () => {
    setDialogParams(null);
  };

  const open = (params: AppDialogParams) => {
    setDialogParams(params);
  };

  const contextValue: AppDialogContextValue = { close, open };

  return (
    <AppDialogContext.Provider value={contextValue}>
      {children}
      <Dialog
        isOpen={Boolean(dialogParams)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            close();
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            isCloseOnPress={dialogParams?.dismissible ?? true}
            testID="app-dialog-overlay"
          />
          <Dialog.Content className="gap-4">
            {dialogParams ? (
              <>
                <View className="gap-1">
                  <Dialog.Title>{dialogParams.title}</Dialog.Title>
                  {dialogParams.description ? (
                    <Dialog.Description>
                      {dialogParams.description}
                    </Dialog.Description>
                  ) : null}
                </View>
                <View className="gap-2">
                  {dialogParams.actions.map((action) => (
                    <Button
                      key={`${action.role ?? "default"}-${action.label}`}
                      onPress={async () => {
                        await action.onPress?.();
                        close();
                      }}
                      variant={resolveDialogActionVariant(action.role)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </View>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </AppDialogContext.Provider>
  );
};

/**
 * アプリ共通Dialogを利用するhook。
 *
 * Provider外ではAlertへフォールバックし、テストと段階移行を壊さない。
 */
export const useAppDialog = (): AppDialogContextValue => {
  const context = useContext(AppDialogContext);
  if (context) {
    return context;
  }

  return {
    close: () => undefined,
    open: ({ actions, description, title }) => {
      Alert.alert(
        title,
        description,
        actions.map((action) => ({
          onPress: action.onPress,
          style: resolveNativeAlertActionStyle(action.role),
          text: action.label,
        }))
      );
    },
  };
};

/**
 * DialogアクションをButton variantへ変換する。
 */
const resolveDialogActionVariant = (
  role: AppDialogAction["role"] | undefined
): "danger-soft" | "ghost" | "primary" => {
  if (role === "destructive") {
    return "danger-soft";
  }
  if (role === "cancel") {
    return "ghost";
  }
  return "primary";
};

/**
 * DialogロールをRN Alertのbutton styleへ変換する。
 */
const resolveNativeAlertActionStyle = (
  role: AppDialogAction["role"] | undefined
): "cancel" | "default" | "destructive" => {
  if (role === "destructive") {
    return "destructive";
  }
  if (role === "cancel") {
    return "cancel";
  }
  return "default";
};
