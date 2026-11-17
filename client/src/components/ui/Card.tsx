import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  ...props
}) => {
  return (
    <div className={`glass ${className}`} style={style} {...props}>
      {children}
    </div>
  );
};

export default Card;
