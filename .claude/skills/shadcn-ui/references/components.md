# shadcn UI Components Reference

This reference contains detailed information about available shadcn UI components and their usage patterns.

## Available Components

### Accordions
- **Purpose**: Vertically stacked interactive headings
- **Import**: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"`
- **Props**:
  - `type`: "single" | "multiple" - Whether multiple items can be opened at once
  - `collapsible`: boolean - Whether an open item can be collapsed

### Alerts
- **Purpose**: Displays callout for user attention
- **Import**: `import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"`
- **Props**:
  - `variant`: "default" | "destructive" - Style variant

### Alert Dialogs
- **Purpose**: Modal dialog interrupting user flow
- **Import**: `import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"`

### Buttons
- **Purpose**: Displays button or button-like element
- **Import**: `import { Button } from "@/components/ui/button"`
- **Props**:
  - `variant`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" - Visual style
  - `size`: "default" | "sm" | "lg" | "icon" - Size variant

### Cards
- **Purpose**: Displays card with header, content, footer
- **Import**: `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"`

### Checkboxes
- **Purpose**: Toggle between checked/unchecked states
- **Import**: `import { Checkbox } from "@/components/ui/checkbox"`
- **Props**:
  - `checked`: boolean | "indeterminate" - Current state
  - `onCheckedChange`: (checked: boolean) => void - Callback when checked state changes

### Dialogs
- **Purpose**: Overlaid window on primary interface
- **Import**: `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"`

### Inputs
- **Purpose**: Form input field component
- **Import**: `import { Input } from "@/components/ui/input"`
- **Props**:
  - `type`: string - Input type (text, email, password, etc.)
  - `placeholder`: string - Placeholder text
  - `disabled`: boolean - Whether input is disabled

### Labels
- **Purpose**: Accessible label associated with controls
- **Import**: `import { Label } from "@/components/ui/label"`
- **Props**:
  - `htmlFor`: string - Associated input ID

### Textareas
- **Purpose**: Form textarea component
- **Import**: `import { Textarea } from "@/components/ui/textarea"`
- **Props**:
  - `placeholder`: string - Placeholder text
  - `rows`: number - Number of rows
  - `disabled`: boolean - Whether textarea is disabled

### Selects
- **Purpose**: Options list triggered by button
- **Import**: `import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"`

### Switches
- **Purpose**: Toggle checked/unchecked states
- **Import**: `import { Switch } from "@/components/ui/switch"`
- **Props**:
  - `checked`: boolean - Current state
  - `onCheckedChange`: (checked: boolean) => void - Callback when checked state changes

### Tables
- **Purpose**: Responsive table component
- **Import**: `import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table"`

### Tabs
- **Purpose**: Layered tab panels display
- **Import**: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"`
- **Props**:
  - `value`: string - Currently active tab
  - `onValueChange`: (value: string) => void - Callback when tab changes

### Tooltips
- **Purpose**: Popup with element-related info
- **Import**: `import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"`

### Avatars
- **Purpose**: Image element with fallback representation
- **Import**: `import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"`

### Badges
- **Purpose**: Displays badge or badge-like component
- **Import**: `import { Badge } from "@/components/ui/badge"`
- **Props**:
  - `variant`: "default" | "secondary" | "destructive" | "outline" - Style variant

### Skeletons
- **Purpose**: Loading state placeholder
- **Import**: `import { Skeleton } from "@/components/ui/skeleton"`

### Progress Bars
- **Purpose**: Completion progress indicator
- **Import**: `import { Progress } from "@/components/ui/progress"`
- **Props**:
  - `value`: number - Current progress value

### Sliders
- **Purpose**: Value selection from given range
- **Import**: `import { Slider } from "@/components/ui/slider"`
- **Props**:
  - `value`: number[] - Current value(s)
  - `onValueChange`: (value: number[]) => void - Callback when value changes
  - `min`: number - Minimum value
  - `max`: number - Maximum value
  - `step`: number - Step size

### Toggles
- **Purpose**: Two-state on/off button
- **Import**: `import { Toggle } from "@/components/ui/toggle"`
- **Props**:
  - `pressed`: boolean - Current pressed state
  - ` onPressedChange`: (pressed: boolean) => void - Callback when pressed state changes

### Hover Cards
- **Purpose**: Previews content behind links
- **Import**: `import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"`

### Popovers
- **Purpose**: Rich content in portal triggered by button
- **Import**: `import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"`

### Separators
- **Purpose**: Visually/sementically separate content
- **Import**: `import { Separator } from "@/components/ui/separator"`

### Sheets
- **Purpose**: Extends Dialog for complementary content
- **Import**: `import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "@/components/ui/sheet"`
- **Props**:
  - `side`: "top" | "right" | "bottom" | "left" - Side to open from

### Radio Groups
- **Purpose**: Mutually exclusive radio buttons
- **Import**: `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"`

### Forms
- **Purpose**: Building forms with React Hook Form
- **Import**: `import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"`

### Breadcrumbs
- **Purpose**: Shows path using hierarchy of links
- **Import**: `import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbEllipsis } from "@/components/ui/breadcrumb"`

### Pagination
- **Purpose**: Page navigation with next/previous
- **Import**: `import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"`

### Calendar
- **Purpose**: Date field component for editing dates
- **Import**: `import { Calendar } from "@/components/ui/calendar"`

### Date Pickers
- **Purpose**: Date selection with range/presets
- **Import**: `import { DatePicker } from "@/components/ui/date-picker"`

### Carousels
- **Purpose**: Swipe-enabled carousel using Embla
- **Import**: `import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"`

### Charts
- **Purpose**: Beautiful charts built with Recharts
- **Import**: `import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from "@/components/ui/chart"`

### Spinners
- **Purpose**: Loading state indicator
- **Import**: `import { Spinner } from "@/components/ui/spinner"`

### Toasts
- **Purpose**: Temporary succinct message
- **Import**: `import { Toaster, toast } from "@/components/ui/toast"`

### Context Menus
- **Purpose**: Menu triggered by button interaction
- **Import**: `import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup } from "@/components/ui/context-menu"`

### Dropdown Menus
- **Purpose**: Menu triggered by button action
- **Import**: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from "@/components/ui/dropdown-menu"`

### Navigation Menus
- **Purpose**: Collection of navigation links
- **Import**: `import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu"`

### Collapsibles
- **Purpose**: Expand/collapse panel component
- **Import**: `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"`

### Comboboxes
- **Purpose**: Autocomplete input with suggestions
- **Import**: `import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from "@/components/ui/command"`

### Scroll Areas
- **Purpose**: Custom cross-browser scrolling
- **Import**: `import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"`

### Resizables
- **Purpose**: Accessible panel groups with keyboard support
- **Import**: `import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"`

### Sidebars
- **Purpose**: Composable, themeable sidebar
- **Import**: `import { Sidebar, SidebarTrigger, SidebarRail, SidebarInset, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarProvider, useSidebar } from "@/components/ui/sidebar"`

### Drawers
- **Purpose**: Sliding panel component for React
- **Import**: `import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"`

### Sonner
- **Purpose**: Opinionated toast component
- **Import**: `import { Toaster } from "sonner"`