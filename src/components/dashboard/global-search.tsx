'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FolderKanban, FileText, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { globalSearch } from '@/app/actions'

interface SearchResult {
    projects: Array<{
        id: string
        name: string
        description: string | null
        workspace: {
            name: string
        }
    }>
    tasks: Array<{
        id: string
        title: string
        projectId: string
        project: {
            id: string
            name: string
        }
        assignee: {
            name: string | null
            avatarUrl: string | null
        } | null
    }>
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<SearchResult>({ projects: [], tasks: [] })
    const router = useRouter()

    // Debounced search
    useEffect(() => {
        // Reset results if query is too short
        if (!query || query.trim().length < 2) {
            setResults({ projects: [], tasks: [] })
            setLoading(false)
            return
        }

        setLoading(true)
        const timer = setTimeout(async () => {
            try {
                const result = await globalSearch(query.trim())
                if (result.status === 'success') {
                    setResults(result.data as SearchResult)
                } else {
                    console.error('Search error:', result.message)
                    setResults({ projects: [], tasks: [] })
                }
            } catch (error) {
                console.error('Search exception:', error)
                setResults({ projects: [], tasks: [] })
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => {
            clearTimeout(timer)
        }
    }, [query])

    // Clear state when dialog closes
    useEffect(() => {
        if (!open) {
            // Reset all state when dialog closes
            setQuery('')
            setResults({ projects: [], tasks: [] })
            setLoading(false)
        }
    }, [open])

    // Keyboard shortcut (Cmd+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const handleSelect = (type: 'project' | 'task', id: string, projectId?: string) => {
        setOpen(false)
        // State will be cleared by useEffect when open becomes false

        if (type === 'project') {
            router.push(`/app/project/${id}`)
        } else {
            router.push(`/app/project/${projectId}?taskId=${id}`)
        }
    }

    const hasResults = results.projects.length > 0 || results.tasks.length > 0
    const showEmpty = !loading && query.trim().length >= 2 && !hasResults

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors w-full max-w-md"
            >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Search projects and tasks...</span>
                <kbd className="ml-auto text-xs text-gray-500 bg-slate-700 px-2 py-1 rounded">
                    ⌘K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 overflow-hidden max-w-[500px]">
                    <DialogTitle className="sr-only">Global Search</DialogTitle>
                    <DialogDescription className="sr-only">
                        Search projects and tasks across your workspace
                    </DialogDescription>
                    <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                        <CommandInput
                            placeholder="Search projects and tasks..."
                            value={query}
                            onValueChange={setQuery}
                        />
                        <CommandList>
                            {loading && (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            )}

                            {showEmpty && (
                                <CommandEmpty>No results found.</CommandEmpty>
                            )}

                            {!loading && hasResults && (
                                <>
                                    {results.projects.length > 0 && (
                                        <CommandGroup heading="Projects">
                                            {results.projects.map((project) => (
                                                <CommandItem
                                                    key={project.id}
                                                    // Use value prop to match unique ID to avoid any potential internal key conflicts,
                                                    // although filter is disabled.
                                                    value={project.id}
                                                    onSelect={() => handleSelect('project', project.id)}
                                                    className="cursor-pointer"
                                                >
                                                    <FolderKanban className="mr-2 h-4 w-4 text-blue-400" />
                                                    <div className="flex flex-col">
                                                        <span>{project.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {project.workspace.name}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}

                                    {results.tasks.length > 0 && (
                                        <CommandGroup heading="Tasks">
                                            {results.tasks.map((task) => (
                                                <CommandItem
                                                    key={task.id}
                                                    value={task.id}
                                                    onSelect={() => handleSelect('task', task.id, task.projectId)}
                                                    className="cursor-pointer"
                                                >
                                                    <FileText className="mr-2 h-4 w-4 text-purple-400" />
                                                    <div className="flex flex-col">
                                                        <span>{task.title}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {task.project.name}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}
                                </>
                            )}
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    )
}
