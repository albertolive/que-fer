const { memo } = require("react");

const RadioInput = ({
  id,
  name,
  value,
  checkedValue,
  onChange,
  label,
  disabled,
}) => {
  return (
    <div className="flex justify-center items-center gap-2">
      <input
        id={id}
        name={name}
        type="checkbox"
        className="h-4 w-4 rounded-md text-primary border border-primary focus:outline-none focus:ring-0 focus:ring-whiteCorp"
        checked={checkedValue === value}
        onClick={() => onChange(value)}
        readOnly
        disabled={disabled}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default memo(RadioInput);
