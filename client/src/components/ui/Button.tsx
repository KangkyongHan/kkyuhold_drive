import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  isLoading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn btn-primary ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? '처리 중...' : children}
    </button>
  );
};

export default Button;
