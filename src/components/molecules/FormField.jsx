import Input from '@/components/atoms/Input';

const FormField = ({ label, name, register, error, type = 'text', ...props }) => {
  return (
    <div className="space-y-1">
      <Input
        label={label}
        type={type}
        error={error?.message}
        {...(register ? register(name) : {})}
        {...props}
      />
    </div>
  );
};

export default FormField;