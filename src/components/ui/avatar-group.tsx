/**
 * AvatarGroup Component
 * 
 * Hiển thị nhóm avatar xếp chồng lên nhau (stacking)
 * Nếu >3 người, avatar cuối cùng hiển thị "+N" để báo số người còn lại
 * Hover vào group sẽ hiện tooltip danh sách đầy đủ
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "@prisma/client";

interface AvatarGroupProps {
    users: (User | null)[];
    max?: number;
}

export function AvatarGroup({ users, max = 3 }: AvatarGroupProps) {
    const validUsers = users.filter((u): u is User => u !== null);
    const displayUsers = validUsers.slice(0, max);
    const remaining = validUsers.length - max;

    if (validUsers.length === 0) {
        return (
            <div className="text-xs text-muted-foreground">Unassigned</div>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex -space-x-2">
                        {displayUsers.map((user, index) => (
                            <Avatar
                                key={user.id}
                                className="h-6 w-6 border-2 border-background ring-1 ring-white/10"
                                style={{ zIndex: displayUsers.length - index }}
                            >
                                <AvatarImage src={user.avatarUrl || undefined} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-blue-500">
                                    {user.name?.charAt(0).toUpperCase() || "?"}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {remaining > 0 && (
                            <Avatar
                                className="h-6 w-6 border-2 border-background bg-slate-700"
                                style={{ zIndex: 0 }}
                            >
                                <AvatarFallback className="text-xs">
                                    +{remaining}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-900 border-white/10">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold">Assignees:</p>
                        {validUsers.map((user) => (
                            <p key={user.id} className="text-xs">
                                {user.name || user.email}
                            </p>
                        ))}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
