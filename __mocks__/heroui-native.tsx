import type { PropsWithChildren } from "react";
import type { PressableProps, TextInputProps, ViewProps } from "react-native";
import { Pressable, Text, TextInput, View } from "react-native";

interface ButtonProps extends PropsWithChildren<PressableProps> {
  isDisabled?: boolean;
}

interface InputProps extends TextInputProps {
  className?: string;
  variant?: string;
}

type CardPartProps = PropsWithChildren<ViewProps>;

export const Button = ({ children, isDisabled, ...props }: ButtonProps) => {
  return (
    <Pressable accessibilityRole="button" disabled={isDisabled} {...props}>
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </Pressable>
  );
};

export const Input = (props: InputProps) => {
  const { className: _className, variant: _variant, ...textInputProps } = props;
  return <TextInput {...textInputProps} />;
};

const CardRoot = ({ children, ...props }: CardPartProps) => {
  return <View {...props}>{children}</View>;
};

const CardHeader = ({ children, ...props }: CardPartProps) => {
  return <View {...props}>{children}</View>;
};

const CardTitle = ({ children, ...props }: CardPartProps) => {
  return <Text {...props}>{children}</Text>;
};

const CardBody = ({ children, ...props }: CardPartProps) => {
  return <View {...props}>{children}</View>;
};

export const Card = Object.assign(CardRoot, {
  Body: CardBody,
  Header: CardHeader,
  Title: CardTitle,
});
