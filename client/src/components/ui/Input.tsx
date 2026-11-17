import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly className?: string;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  ...props
}) => {
  return (
    <input
      className={`input ${className}`}
      {...props}
    />
  );
};

export default Input;
