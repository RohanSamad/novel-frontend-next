import React from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large' | 'full';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface BaseButtonProps {
  children: React.ReactNode;
  className?: string;
  // any other shared props
}

// Remove `children` from the native types when extending
interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>, BaseButtonProps {
  href?: never; // Ensures href can't be used with button props
}

interface LinkButtonProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>, BaseButtonProps {
  href: string;
}


const ButtonComponent: React.FC<ButtonProps | LinkButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  href,
  ...props
}) => {
  // Base styles for all buttons
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Variant styles
  const variantStyles = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
    secondary: "bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500",
    accent: "bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-400",
    success: "bg-success-600 hover:bg-success-700 text-white focus:ring-success-500",
    warning: "bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-400",
    error: "bg-error-600 hover:bg-error-700 text-white focus:ring-error-500",
    outline: "bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
    ghost: "bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
  };
  
  // Size styles
  const sizeStyles = {
    small: "text-xs px-3 py-1",
    medium: "text-sm px-4 py-2",
    large: "text-base px-6 py-3",
    full: "text-sm px-4 py-2 w-full",
  };
  
  // Loading and disabled styles
  const stateStyles = (disabled || isLoading) 
    ? "opacity-70 cursor-not-allowed" 
    : "cursor-pointer";

  // Content including icon and loading state
  const content = (
    <>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  );

  const classNames = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${stateStyles} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={classNames}
        passHref
        legacyBehavior
      >
        <a className={classNames} {...props as React.AnchorHTMLAttributes<HTMLAnchorElement>}>
          {content}
        </a>
      </Link>
    );
  }

  return (
    <button
      className={classNames}
      disabled={disabled || isLoading}
      {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}
    >
      {content}
    </button>
  );
};

export default ButtonComponent;