import React from "react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-black text-white hover:bg-gray-800 border border-transparent shadow-sm",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-transparent",
            outline: "bg-transparent text-black border border-gray-300 hover:bg-gray-50",
            ghost: "bg-transparent text-black hover:bg-gray-100",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-6 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
