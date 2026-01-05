export type HLButtonProps = {
  text: string;
  variant?: "default" | "outlined" | "text";
  isDisabled?: boolean;
  containerStyle?: string;
  onPress: () => void;
  suffixIcon?: React.ReactNode;
  prefixIcon?: React.ReactNode;
};

export default function HLButton({
  text,
  variant = "default",
  containerStyle,
  isDisabled = false,
  onPress,
  prefixIcon,
  suffixIcon,
}: HLButtonProps) {
  const getButtonStyle = (): string => {
    const style: string[] = [];

    if (isDisabled) {
      style.push("bg-bg-disabled");

      return style.join(" ");
    }

    switch (variant) {
      case "default":
        style.push("bg-bg-primary");
        break;
      case "outlined":
        style.push("border border-bg-primary");
        break;
    }

    return style.join(" ");
  };

  const getTextStyle = (): string => {
    const style: string[] = ["text-sm font-semibold"];

    if (isDisabled) {
      style.push("text-text-muted");
      return style.join(" ");
    }

    switch (variant) {
      case "default":
        style.push("text-text-on-primary");
        break;
      case "outlined":
        style.push("text-text-primary");
        break;
      case "text":
        style.push("text-text-primary");
        break;
    }

    return style.join(" ");
  };

  return (
    <button
      onClick={() => {
        onPress();
      }}
      className={`flex flex-row items-center justify-center py-4 px-3 rounded-sm ${
        isDisabled ? "cursor-not-allowed" : "cursor-pointer"
      } ${containerStyle ? `${containerStyle} ` : ""}${getButtonStyle()}`}
      disabled={isDisabled}
    >
      {prefixIcon && <span className="mr-2">{prefixIcon}</span>}
      <span className={getTextStyle()}>{text}</span>
      {suffixIcon && <span className="ml-2">{suffixIcon}</span>}
    </button>
  );
}
