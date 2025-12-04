'use client'
import { OverlayScrollbarsComponent, OverlayScrollbarsComponentProps } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

export function ScrollArea({ className, children, ...props }: OverlayScrollbarsComponentProps) {
  return (
    <OverlayScrollbarsComponent
      element="div"
      options={{ scrollbars: { autoHide: 'scroll', theme: 'os-theme-dark' } }}
      className={className}
      defer
      {...props}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}
