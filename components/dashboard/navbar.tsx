"use client"

import { Bell, MessageSquare, Settings, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border/50 bg-card/80 px-8 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-10">
        <div className="animate-fade-in">
          <h2 className="bg-gradient-to-r from-sidebar-primary to-sidebar-primary/70 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            Orchestra AI
          </h2>
        </div>
        
        {/* Search */}
        <div className="relative hidden md:block animate-fade-in stagger-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search for faculty, schedules, or insights..."
            className="h-11 w-96 rounded-xl border-0 bg-muted/40 pl-11 pr-4 text-sm font-medium placeholder:text-muted-foreground/50 transition-all duration-300 focus:bg-muted/60 focus:ring-2 focus:ring-sidebar-primary/20"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground animate-fade-in stagger-2">
          <Bell className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
        </button>

        {/* Messages */}
        <button className="group flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground animate-fade-in stagger-3">
          <MessageSquare className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
        </button>

        {/* Settings */}
        <button className="group flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground animate-fade-in stagger-4">
          <Settings className="h-[18px] w-[18px] transition-transform duration-200 group-hover:rotate-45" />
        </button>

        {/* Divider */}
        <div className="mx-3 h-8 w-px bg-border/60" />

        {/* User */}
        <div className="flex items-center gap-3.5 animate-fade-in stagger-5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold tracking-tight text-foreground">Dr. Elena Vance</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-primary">Chief Admin</p>
          </div>
          <div className="relative">
            <Avatar className="h-11 w-11 ring-2 ring-accent/30 ring-offset-2 ring-offset-card transition-all duration-300 hover:ring-accent/50 hover:scale-105">
              <AvatarImage src="/avatar.png" alt="Dr. Elena Vance" />
              <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-sm font-bold text-accent-foreground">EV</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-accent" />
          </div>

          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" size="sm">Sign out</Button>
          </form>
        </div>
      </div>
    </header>
  )
}
