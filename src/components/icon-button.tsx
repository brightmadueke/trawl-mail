// IconButton
import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority"; // Get the button props type from the button component

// Get the button props type from the button component
// Using React.ComponentPropsWithoutRef to get the props of the Button component
export interface IconButtonProps
  extends
    React.ComponentPropsWithoutRef<typeof Button>,
    VariantProps<typeof buttonVariants> {
  /**
   * The icon element to display
   */
  icon: React.ReactNode;
  /**
   * Tooltip text to display on hover
   */
  tooltip?: string | React.ReactNode;
  /**
   * Position of the tooltip
   * @default 'top'
   */
  tooltipSide?: "top" | "right" | "bottom" | "left";
  /**
   * Additional className for the tooltip content
   */
  tooltipClassName?: string;
  /**
   * Whether to show the tooltip arrow
   * @default true
   */
  tooltipShowArrow?: boolean;
  /**
   * Delay in ms before showing the tooltip
   * @default 200
   */
  tooltipDelay?: number;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      tooltip,
      tooltipSide = "top",
      tooltipClassName,
      tooltipShowArrow = false,
      tooltipDelay = 200,
      className,
      size = "icon",
      variant = "outline",
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    // Generate default aria-label from tooltip or use provided one
    const defaultAriaLabel =
      typeof tooltip === "string" ? tooltip : "icon button";
    const finalAriaLabel = ariaLabel || defaultAriaLabel;

    const buttonElement = (
      <Button
        ref={ref}
        size={size}
        variant={variant}
        className={cn("inline-flex items-center justify-center", className)}
        aria-label={finalAriaLabel}
        {...props}
      >
        {icon}
      </Button>
    );

    // If tooltip is provided, wrap with Tooltip
    if (tooltip) {
      return (
        <Tooltip delayDuration={tooltipDelay}>
          <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
          <TooltipContent
            side={tooltipSide}
            className={tooltipClassName}
            sideOffset={5}
          >
            {tooltip}
            {tooltipShowArrow && (
              <span className="block -mt-1 h-2 w-2 rotate-45 bg-popover border border-popover" />
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    // Return button without tooltip
    return buttonElement;
  },
);

IconButton.displayName = "IconButton";

export default IconButton;
