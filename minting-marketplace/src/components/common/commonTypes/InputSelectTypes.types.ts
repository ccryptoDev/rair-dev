export type OptionsType = {
  label: string;
  value?: string;
};

export interface InputSelectProps<T = any> {
  getter: string | undefined;
  setter: (targetValue: T) => void;
  options?: OptionsType[];
  customCSS?: React.CSSProperties;
  customClass?: string;
  optionCSS?: React.CSSProperties;
  optionClass?: string;
  placeholder?: string;
  placeholderValue?: string;
  label?: string;
  labelCSS?: React.CSSProperties;
  labelClass?: string;
  required?: boolean;
  disabled?: boolean;
  requiredColor?: string;
}
