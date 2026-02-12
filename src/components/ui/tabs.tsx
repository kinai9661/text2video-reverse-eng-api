import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ children, defaultValue, ...props }: any) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue)
  return (
    <div {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  )
}

const TabsList = ({ children, className, activeTab, setActiveTab }: any) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1", className)}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
)

const TabsTrigger = ({ children, value, activeTab, setActiveTab, className }: any) => (
  <button
    onClick={() => setActiveTab(value)}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
      activeTab === value ? "bg-white shadow-sm" : "text-gray-600",
      className
    )}
  >
    {children}
  </button>
)

const TabsContent = ({ children, value, activeTab, className }: any) => (
  activeTab === value ? <div className={className}>{children}</div> : null
)

export { Tabs, TabsList, TabsTrigger, TabsContent }