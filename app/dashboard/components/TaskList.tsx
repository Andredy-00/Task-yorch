'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, GetTasksParams } from '@/interfaces/task';
import { getTasks } from '@/actions/tasks/get-task';
import { deleteTask } from '@/actions/tasks/delete-task';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskForm } from './TaskForm';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        priority: 'all',
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastTaskElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const fetchTasks = useCallback(async (isInitial = false) => {
        if (isInitial) {
            setLoading(true);
            setPage(1);
        } else {
            setLoadingMore(true);
        }

        try {
            const params: GetTasksParams = {
                page: isInitial ? 1 : page,
                limit: 10,
                ...filters
            };
            const response = await getTasks(params);

            setTasks(prev => isInitial ? response.tasks : [...prev, ...response.tasks]);
            setHasMore(response.hasMore);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            toast.error("Error al cargar las tareas");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchTasks(true);
    }, [filters]);

    useEffect(() => {
        if (page > 1) {
            fetchTasks(false);
        }
    }, [page]);

    const handleSearchChange = (search: string) => {
        setFilters(prev => ({ ...prev, search }));
    };

    const handleStatusChange = (status: string) => {
        setFilters(prev => ({ ...prev, status }));
    };

    const handlePriorityChange = (priority: string) => {
        setFilters(prev => ({ ...prev, priority }));
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleDelete = async (task: Task) => {
        try {
            await deleteTask(task.id);
            setTasks(prev => prev.filter(t => t.id !== task.id));
            toast.success('Tarea eliminada correctamente');
        } catch (error) {
            toast.error('Error al eliminar la tarea');
        }
    };

    const handleCreate = () => {
        setEditingTask(null);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        fetchTasks(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Mis Tareas</h2>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus size={18} /> Nueva Tarea
                </Button>
            </div>

            <TaskFilters
                onSearchChange={handleSearchChange}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                currentFilters={filters}
            />

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">No se encontraron tareas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                    {tasks.map((task, index) => {
                        if (tasks.length === index + 1) {
                            return (
                                <div ref={lastTaskElementRef} key={task.id}>
                                    <TaskCard
                                        task={task}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            );
                        } else {
                            return (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            );
                        }
                    })}
                </div>
            )}

            {loadingMore && (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-primary" size={24} />
                </div>
            )}

            <TaskForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                task={editingTask}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
}
