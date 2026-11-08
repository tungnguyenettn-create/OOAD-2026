export default function InputField({
  id,
  label,
  icon: Icon,
  children,
  ...inputProps
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>

      <div className="input-wrapper">
        <Icon size={19} />
        <input id={id} {...inputProps} />
        {children}
      </div>
    </div>
  );
}