export type HLTextProps = {
  text: string;
  textColor?: string;
  variant?:
    | "primary"
    | "button"
    | "error"
    | "title"
    | "section"
    | "card"
    | "secondary"
    | "label"
    | "placeholder"
    | "input";
  containerStyle?: string;
};

export default function HLText({
  text,
  textColor,
  variant = "primary",
  containerStyle,
}: HLTextProps) {
  const getTextStyle = (): string => {
    switch (variant) {
      case "primary":
        return ["text-sm font-normal"].join(" ");
      case "button":
        return ["text-sm font-semibold"].join(" ");
      case "error":
        return ["text-sm font-normal text-text-error"].join(" ");
      case "title":
        return ["text-sm font-semibold"].join(" ");
      case "section":
        return ["text-sm font-semibold"].join(" ");
      case "card":
        return ["text-sm font-semibold"].join(" ");
      case "secondary":
        return ["text-sm font-normal"].join(" ");
      case "label":
        return ["text-sm font-normal"].join(" ");
      case "placeholder":
        return ["text-sm font-normal"].join(" ");
      case "input":
        return ["text-sm font-normal"].join(" ");
      default:
        return ["text-sm font-normal"].join(" ");
    }
  };

  return (
    <label
      className={`${
        containerStyle ? `${containerStyle} ` : ""
      }${getTextStyle()}`}
      style={{
        color: textColor ?? "text-text-secondary",
      }}
    >
      {text}
    </label>
  );
}
