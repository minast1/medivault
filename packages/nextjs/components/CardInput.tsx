import { Input } from "~~/components/ui/input";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const CardInput = ({ name, value, className, onChange, ...props }: InputProps) => {
  return <Input name={name} onChange={onChange} className={className} value={value} maxLength={15} {...props} />;
};

export default CardInput;
