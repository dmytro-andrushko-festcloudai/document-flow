import * as React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full w-75 flex-col border-r bg-background fixed left-0 top-0 z-50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-2 p-8', className)} {...props} />
  )
);
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-auto p-8', className)} {...props} />
  )
);
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('border-t p-4', className)} {...props} />
  )
);
SidebarFooter.displayName = 'SidebarFooter';

const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-col gap-3', className)} {...props} />
  )
);
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />
);
SidebarMenuItem.displayName = 'SidebarMenuItem';

const SidebarMenuButton = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    isActive?: boolean;
    asChild?: boolean;
  }
>(({ className, isActive, asChild, children, ...props }, ref) => {
  const buttonClassName = cn(
    'flex items-center gap-3 rounded-lg p-3 text-sm font-[500] transition-all duration-200 hover:bg-accent/90 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none cursor-pointer',
    isActive && 'bg-accent text-accent-foreground',
    className
  );

  if (asChild && children && React.isValidElement(children)) {
    // When asChild is true, clone the child element and add the className
    const childProps = children.props as { className?: string };
    return React.cloneElement(children, {
      ...props,
      className: cn(buttonClassName, childProps.className),
    } as React.Attributes);
  }

  return (
    <a ref={ref} className={buttonClassName} {...props}>
      {children}
    </a>
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
};
