'use client';
import { AvatarBadge } from "@/components/AvatarBadge";
import { useAuth } from "@/context/AuthContext";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {

    const { user } = useAuth();

    return (
        <>
            <nav className="flex justify-between items-center px-6 py-4">
                <div className="text-xl font-extrabold tracking-tight flex items-center gap-3">
                    <LayoutGrid size={32} />
                    Gestor de Tareas
                </div>

                {user && (
                    <Link
                        href="/profile"
                    >
                        <AvatarBadge
                            name={user.name}
                            avatar_url={user.avatar_url} />

                    </Link>
                )}


            </nav>
        </>
    )
}
