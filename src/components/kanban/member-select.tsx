'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@prisma/client"

interface MemberSelectProps {
  members: User[];
  value: string | null;
  onChange: (value: string | null) => void;
}

const getInitials = (name: string | undefined | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

export function MemberSelect({ members, value, onChange }: MemberSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedMember = members.find(
    (member) => member.supabaseId === value
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-800 border-slate-700 hover:bg-slate-700"
        >
          {selectedMember ? (
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedMember.avatarUrl ?? undefined} />
                    <AvatarFallback>{getInitials(selectedMember.name)}</AvatarFallback>
                </Avatar>
                <span>{selectedMember.name || selectedMember.email}</span>
            </div>
          ) : (
            "Unassigned"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 bg-slate-900 border-slate-800 text-white">
        <Command>
          <CommandInput placeholder="Search member..." />
          <CommandList>
            <CommandEmpty>No member found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="unassign"
                value="unassign"
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === null ? "opacity-100" : "opacity-0"
                  )}
                />
                Unassigned
              </CommandItem>
              {members.map((member) => (
                <CommandItem
                  key={member.id}
                  value={member.name || member.email}
                  onSelect={() => {
                    onChange(member.supabaseId === value ? null : member.supabaseId)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === member.supabaseId ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatarUrl ?? undefined} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <span>{member.name || member.email}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
