'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: ButtonProps) {
  const baseStyle = 'px-4 py-2 rounded text-white font-semibold';
  const buttonStyle = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700',
    danger: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <button
      className={`${baseStyle} ${buttonStyle[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
