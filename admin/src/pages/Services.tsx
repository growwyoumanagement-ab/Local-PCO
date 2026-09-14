import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit2, Trash2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

const IONICONS_LIST = [
    { value: 'home', label: 'Home' },
    { value: 'hammer', label: 'Hammer' },
    { value: 'construct', label: 'Tools' },
    { value: 'brush', label: 'Brush' },
    { value: 'snow', label: 'AC / Cooling' },
    { value: 'settings', label: 'Mechanic' },
    { value: 'sparkles', label: 'Cleaning' },
    { value: 'business', label: 'Hotel / Office' },
    { value: 'medical', label: 'Health' },
    { value: 'car', label: 'Auto' },
    { value: 'water', label: 'Plumbing' },
    { value: 'flash', label: 'Electrician' },
    { value: 'cut', label: 'Salon' },
    { value: 'shirt', label: 'Laundry' },
    { value: 'restaurant', label: 'Food' },
    { value: 'medkit', label: 'First Aid' },
    { value: 'camera', label: 'Camera' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'wifi', label: 'Internet' },
    { value: 'key', label: 'Locksmith' },
    { value: 'bug', label: 'Pest Control' },
    { value: 'leaf', label: 'Gardening' },
    { value: 'color-palette', label: 'Design' },
    { value: 'desktop', label: 'Computer' },
    { value: 'briefcase', label: 'Professional' },
    { value: 'bicycle', label: 'Bicycle / Delivery' }
];

interface Subcategory {
    name: string;
    icon?: string;
    isActive: boolean;
}

interface ServiceCategory {
    _id: string;
    name: string;
    icon?: string;
    description?: string;
    subcategories?: Subcategory[];
    priority: number;
    isActive: boolean;
    createdAt: string;
}

export default function Services() {
    const [services, setServices] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Persist Grid / Table view preference in localStorage
    const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
        const saved = localStorage.getItem('services_view_mode');
        return (saved === 'table' || saved === 'grid') ? saved : 'grid';
    });

    const [searchQuery, setSearchQuery] = useState('');

    // Edit/Create State
    const [isEditing, setIsEditing] = useState<string | null>(null); // null = not editing, 'new' = creating, id = editing
    const [formData, setFormData] = useState<Partial<ServiceCategory>>({
        name: '',
        icon: '',
        description: '',
        subcategories: [],
        priority: 0,
        isActive: true
    });
    const [newSubcategory, setNewSubcategory] = useState({ name: '', icon: '' });

    const handleViewModeChange = (mode: 'grid' | 'table') => {
        setViewMode(mode);
        localStorage.setItem('services_view_mode', mode);
    };

    const fetchServices = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllServices();
            setServices(data || []);
        } catch (error) {
            toast.error('Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const data = await adminService.updateService(id, { isActive: !currentStatus });
            setServices(services.map(s => s._id === id ? data : s));
            toast.success(`Service ${!currentStatus ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await adminService.deleteService(id);
            setServices(services.filter(s => s._id !== id));
            toast.success('Category deleted');
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const validateRawIcon = (iconStr?: string) => {
        if (!iconStr || !iconStr.trim()) return true;
        return /^[a-z0-9-]+$/i.test(iconStr.trim());
    };

    const handleSave = async () => {
        const trimmedName = formData.name ? formData.name.trim() : '';
        if (!trimmedName) {
            toast.error('Please enter a category name');
            return;
        }

        // Case-insensitive duplicate check on frontend
        const isDuplicate = services.some(s =>
            s.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
            (isEditing === 'new' ? true : s._id !== isEditing)
        );

        if (isDuplicate) {
            toast.error('A service category with this name already exists');
            return;
        }

        // Validate Raw code / icon format
        if (formData.icon && !validateRawIcon(formData.icon)) {
            toast.error('Raw code icon must contain only letters, numbers, and hyphens (e.g. "home", "construct")');
            return;
        }

        try {
            const payload = {
                ...formData,
                name: trimmedName,
                icon: formData.icon ? formData.icon.trim() : undefined,
                description: formData.description ? formData.description.trim() : '',
                priority: Number(formData.priority) || 0
            };

            if (isEditing === 'new') {
                const data = await adminService.createService(payload);
                setServices([...services, data]);
                toast.success('Category created successfully');
            } else if (isEditing) {
                const data = await adminService.updateService(isEditing, payload);
                setServices(services.map(s => s._id === isEditing ? data : s));
                toast.success('Category updated successfully');
            }
            setIsEditing(null);
            setFormData({ name: '', icon: '', description: '', subcategories: [], priority: 0, isActive: true });
            setNewSubcategory({ name: '', icon: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    const startEdit = (service?: ServiceCategory) => {
        if (service) {
            setIsEditing(service._id);
            setFormData({
                name: service.name || '',
                icon: service.icon || '',
                description: service.description || '',
                subcategories: service.subcategories ? [...service.subcategories] : [],
                priority: service.priority || 0,
                isActive: service.isActive !== undefined ? service.isActive : true
            });
        } else {
            setIsEditing('new');
            setFormData({ name: '', icon: '', description: '', subcategories: [], priority: 0, isActive: true });
        }
        setNewSubcategory({ name: '', icon: '' });
    };

    const addSubcategory = () => {
        const subName = newSubcategory.name.trim();
        if (!subName) return;

        if (newSubcategory.icon && !validateRawIcon(newSubcategory.icon)) {
            toast.error('Subcategory raw code must contain only letters, numbers, and hyphens');
            return;
        }

        setFormData({
            ...formData,
            subcategories: [
                ...(formData.subcategories || []),
                { name: subName, icon: newSubcategory.icon.trim() || undefined, isActive: true }
            ]
        });
        setNewSubcategory({ name: '', icon: '' });
    };

    const removeSubcategory = (index: number) => {
        setFormData({
            ...formData,
            subcategories: formData.subcategories?.filter((_, i) => i !== index)
        });
    };

    const toggleSubcategoryStatus = (index: number) => {
        const updated = [...(formData.subcategories || [])];
        updated[index].isActive = !updated[index].isActive;
        setFormData({ ...formData, subcategories: updated });
    };

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent flex items-center gap-2">
                        Services & Categories
                        <Sparkles className="w-5 h-5 text-violet-500" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                        Manage service categories, subcategories, priorities, and icons
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-48 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-sm"
                        />
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
                        <button
                            type="button"
                            onClick={() => handleViewModeChange('grid')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                        >
                            Grid
                        </button>
                        <button
                            type="button"
                            onClick={() => handleViewModeChange('table')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                        >
                            Table
                        </button>
                    </div>
                    <Button onClick={() => startEdit()} className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 shadow-md shadow-violet-500/20">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Category
                    </Button>
                </div>
            </div>

            {loading && services.length === 0 ? (
                <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">Loading services...</p>
                </div>
            ) : (
                <>
                    {/* Inline Edit / Create Form */}
                    {isEditing && (
                        <Card className="bg-white dark:bg-zinc-900 border-violet-500/30 shadow-lg animate-in fade-in zoom-in-95 duration-300">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                    {isEditing === 'new' ? 'Create New Category' : 'Edit Category'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category Name *</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Appliance Repair"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Icon / Raw Code</label>
                                        <div className="flex gap-2">
                                            <Select
                                                value={IONICONS_LIST.find(i => i.value === formData.icon) ? formData.icon : ""}
                                                onValueChange={(val) => setFormData({ ...formData, icon: val })}
                                            >
                                                <SelectTrigger className="w-1/2">
                                                    <SelectValue placeholder="Preset Icons" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-56">
                                                    {IONICONS_LIST.map(icon => (
                                                        <SelectItem key={icon.value} value={icon.value}>
                                                            {icon.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={formData.icon || ''}
                                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                                placeholder="Raw Code (e.g. 'home')"
                                                className="w-1/2"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Short description"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Priority (Higher shows first)</label>
                                        <Input
                                            type="number"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                {/* Subcategories Section */}
                                <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Subcategories</label>

                                    {/* Existing Subcategories */}
                                    {formData.subcategories && formData.subcategories.length > 0 && (
                                        <div className="space-y-2">
                                            {formData.subcategories.map((sub, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                                    <span className="text-sm font-mono bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-violet-600 dark:text-violet-400 font-semibold">{sub.icon || '📌'}</span>
                                                    <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">{sub.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSubcategoryStatus(index)}
                                                        className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                                    >
                                                        {sub.isActive ? (
                                                            <span className="text-emerald-600 font-semibold">Active</span>
                                                        ) : (
                                                            <span className="text-zinc-400">Inactive</span>
                                                        )}
                                                    </button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeSubcategory(index)}
                                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New Subcategory */}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Subcategory name (e.g. Split AC Repair)"
                                            value={newSubcategory.name}
                                            onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategory())}
                                            className="flex-1"
                                        />
                                        <div className="flex w-64 gap-2">
                                            <Select
                                                value={IONICONS_LIST.find(i => i.value === newSubcategory.icon) ? newSubcategory.icon : ""}
                                                onValueChange={(val) => setNewSubcategory({ ...newSubcategory, icon: val })}
                                            >
                                                <SelectTrigger className="w-1/2">
                                                    <SelectValue placeholder="Icon" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-56">
                                                    {IONICONS_LIST.map(icon => (
                                                        <SelectItem key={icon.value} value={icon.value}>
                                                            {icon.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                placeholder="Raw code"
                                                value={newSubcategory.icon}
                                                onChange={(e) => setNewSubcategory({ ...newSubcategory, icon: e.target.value })}
                                                className="w-1/2"
                                            />
                                        </div>
                                        <Button type="button" onClick={addSubcategory} size="sm" className="bg-violet-600 text-white">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <Button variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
                                    <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white">Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredServices.map(service => (
                                <Card key={service._id} className={`group hover:border-violet-500/40 transition-all ${!service.isActive ? 'opacity-60' : ''}`}>
                                    <CardContent className="p-4 flex items-start justify-between gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center overflow-hidden border border-violet-200 dark:border-violet-800 shrink-0">
                                            {service.icon ? (
                                                <span className={`${service.icon.length > 3 ? 'text-[9px] truncate px-1 font-mono uppercase text-violet-700 dark:text-violet-300 font-semibold' : 'text-xl'}`}>
                                                    {service.icon}
                                                </span>
                                            ) : (
                                                <span className="text-xl">📦</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                                    {service.name}
                                                </h3>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
                                                    P{service.priority}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                                                {service.description || 'No description'}
                                            </p>
                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                                <Switch
                                                    checked={service.isActive}
                                                    onCheckedChange={() => handleToggleStatus(service._id, service.isActive)}
                                                    className="data-[state=checked]:bg-emerald-500 scale-75 origin-left"
                                                />
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-zinc-500 hover:text-violet-600 rounded-lg"
                                                        onClick={() => startEdit(service)}
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-zinc-500 hover:text-red-600 rounded-lg"
                                                        onClick={() => handleDelete(service._id)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Table View */}
                    {viewMode === 'table' && (
                        <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                                    <TableRow className="border-zinc-200 dark:border-white/5">
                                        <TableHead className="text-xs font-bold uppercase tracking-widest text-zinc-500 h-12 pl-6">Category</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-widest text-zinc-500 h-12">Raw Code / Icon</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-widest text-zinc-500 h-12">Priority</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-widest text-zinc-500 h-12">Subcategories</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-widest text-zinc-500 h-12">Status</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-widest text-zinc-500 h-12 text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredServices.map(service => (
                                        <TableRow key={service._id} className="border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                                            <TableCell className="pl-6 py-4 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                                                {service.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-violet-600 dark:text-violet-400">
                                                {service.icon || '-'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {service.priority}
                                            </TableCell>
                                            <TableCell className="text-xs text-zinc-500">
                                                {service.subcategories?.length || 0} subcategories
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={service.isActive}
                                                    onCheckedChange={() => handleToggleStatus(service._id, service.isActive)}
                                                    className="data-[state=checked]:bg-emerald-500 scale-90"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-zinc-500 hover:text-violet-600 rounded-lg"
                                                        onClick={() => startEdit(service)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-600 rounded-lg"
                                                        onClick={() => handleDelete(service._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
