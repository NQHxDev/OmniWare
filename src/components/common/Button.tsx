import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
   variant?: ButtonVariant;
   size?: ButtonSize;
   isLoading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
   children,
   variant = 'primary',
   size = 'md',
   isLoading = false,
   className = '',
   disabled,
   ...props
}) => {
   const baseStyles =
      'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';

   const variants: Record<ButtonVariant, string> = {
      primary: 'bg-gray-900 text-white hover:bg-gray-800',
      secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      success: 'bg-green-600 text-white hover:bg-green-700',
      ghost: 'text-gray-700 hover:bg-gray-100',
   };

   const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
   };

   return (
      <button
         className={`
            ${baseStyles}
            ${variants[variant]}
            ${sizes[size]}
            ${className}
            ${isLoading ? 'opacity-80 cursor-wait' : ''}
         `}
         disabled={disabled || isLoading}
         {...props}
      >
         {isLoading ? (
            <span className="flex items-center justify-center">
               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
               Đang xử lý...
            </span>
         ) : (
            children
         )}
      </button>
   );
};

export default Button;
