const Input = ({
  label,
  error,
  helperText,
  id,
  className = "",
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 border rounded-lg text-sm bg-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-100"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
