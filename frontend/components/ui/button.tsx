import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 hover:shadow-[0_0_20px_-3px_rgba(38,208,124,0.4)]",
        emerald:
          "bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 hover:shadow-[0_0_20px_-3px_rgba(38,208,124,0.4)]",
        cyan:
          "bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.4)]",
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white border border-slate-700/60",
        outline:
          "border border-slate-700/80 bg-transparent text-slate-200 hover:bg-slate-800/80 hover:text-white hover:border-slate-600",
        ghost:
          "bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-slate-100",
        destructive:
          "bg-red-600 text-white font-semibold hover:bg-red-500 hover:shadow-[0_0_20px_-3px_rgba(239,68,68,0.4)]",
        glow:
          "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold hover:opacity-95 hover:shadow-[0_0_25px_-4px_rgba(38,208,124,0.5)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base font-medium",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
