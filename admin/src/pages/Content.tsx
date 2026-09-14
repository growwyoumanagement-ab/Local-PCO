import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface ContentItem {
    name: string;
    icon?: string;
    image?: string;
    subtitle?: string;
    ctaText?: string;
    backgroundColor?: string;
    priority: number;
    isActive: boolean;
}

interface ContentSection {
    _id: string;
    sectionType: 'home_services' | 'banner' | 'trending';
    title: string;
    items: ContentItem[];
    priority: number;
    isActive: boolean;
}

interface ServiceCategory {
    _id: string;
    name: string;
    icon: string;
}

export default function Content() {
    const [sections, setSections] = useState<ContentSection[]>([]);
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ContentSection>>({
        sectionType: 'home_services',
        title: '',
        items: [],
        priority: 0,
        isActive: true
    });
    const [newItem, setNewItem] = useState<Partial<ContentItem>>({
        name: '',
        icon: '',
        priority: 0,
        isActive: true
    });

    useEffect(() => {
        fetchContent();
        fetchServices();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllContent();
            setSections(data);
        } catch (error) {
            toast.error('Failed to fetch content');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const data = await adminService.getAllServices();
            setServiceCategories(data);
        } catch (error) {
            console.error('Failed to fetch services');
        }
    };

    const handleSave = async () => {
        if (!formData.title?.trim()) {
            toast.error('Title is required');
            return;
        }

        try {
            if (editingSection === 'new') {
                await adminService.createContent(formData);
                toast.success('Section created');
            } else if (editingSection) {
                await adminService.updateContent(editingSection, formData);
                toast.success('Section updated');
            }
            setEditingSection(null);
            setFormData({ sectionType: 'home_services', title: '', items: [], priority: 0, isActive: true });
            fetchContent();
        } catch (error) {
            toast.error('Failed to save section');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await adminService.deleteContent(id);
            toast.success('Section deleted');
            fetchContent();
        } catch (error) {
            toast.error('Failed to delete section');
        }
    };

    const startEdit = (section?: ContentSection) => {
        if (section) {
            setEditingSection(section._id);
            setFormData(section);
        } else {
            setEditingSection('new');
            setFormData({ sectionType: 'home_services', title: 'Home Services', items: [], priority: 0, isActive: true });
        }
    };

    // ... (keep middle code same) ...

    // Update the section type selector to auto-update title if empty or matching previous type
    // ... item toggle code ...

    const handleSectionTypeChange = (type: 'home_services' | 'banner' | 'trending') => {
        let defaultTitle = '';
        if (type === 'home_services') defaultTitle = 'Home Services';
        else if (type === 'trending') defaultTitle = 'Trending Searches';

        setFormData({
            ...formData,
            sectionType: type,
            title: formData.title ? formData.title : defaultTitle
        });
    };

    // ... rest of code ...


    const addItem = () => {
        if (!newItem.name?.trim()) return;
        setFormData({
            ...formData,
            items: [...(formData.items || []), { ...newItem as ContentItem }]
        });
        setNewItem({ name: '', icon: '', priority: 0, isActive: true });
    };

    const removeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items?.filter((_, i) => i !== index)
        });
    };

    const toggleItemStatus = (index: number) => {
        const updated = [...(formData.items || [])];
        updated[index].isActive = !updated[index].isActive;
        setFormData({ ...formData, items: updated });
    };

    const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        if (!selectedId) return;

        const service = serviceCategories.find(s => s._id === selectedId);
        if (service) {
            setNewItem({
                ...newItem,
                name: service.name,
                icon: service.icon || '🛠️'
            });
        }
    };

    const getSectionsByType = (type: string) => sections.filter(s => s.sectionType === type);

    const renderSectionCard = (section: ContentSection) => (
        <Card key={section._id} className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(section)}>
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(section._id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {section.items.filter(item => item.isActive).map((item, idx) => (
                        <span key={idx} className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                            {item.icon} {item.name}
                        </span>
                    ))}
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                    {section.items.length} items • Priority: {section.priority}
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Content</h1>
                    <p className="text-zinc-500 mt-1">Manage home services, banners, and trending searches</p>
                </div>
                <Button onClick={() => startEdit()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                </Button>
            </div>

            {editingSection && (
                <Card className="bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>{editingSection === 'new' ? 'New Section' : 'Edit Section'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium">Section Type</label>
                                <select
                                    className="w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
                                    value={formData.sectionType}
                                    onChange={(e) => handleSectionTypeChange(e.target.value as any)}
                                >
                                    <option value="home_services">Home Services</option>
                                    <option value="banner">Banner</option>
                                    <option value="trending">Trending Searches</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium">Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., HOME SERVICES"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Priority</label>
                                <Input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="space-y-3 pt-4 border-t">
                            <label className="text-sm font-semibold">Items</label>

                            {formData.items && formData.items.length > 0 && (
                                <div className="space-y-2">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                            <span className="text-lg">{item.icon || '📌'}</span>
                                            <span className="flex-1 text-sm font-medium">{item.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => toggleItemStatus(index)}
                                                className="text-xs px-2 py-1 rounded"
                                            >
                                                {item.isActive ? (
                                                    <span className="text-emerald-600">Active</span>
                                                ) : (
                                                    <span className="text-zinc-400">Inactive</span>
                                                )}
                                            </button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                                className="h-6 w-6 p-0 text-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add New Item */}
                            <div className="flex gap-2">
                                {formData.sectionType === 'banner' ? (
                                    <Input
                                        placeholder="Item name"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        className="flex-1"
                                    />
                                ) : (
                                    <div className="flex-1 flex gap-2">
                                        <select
                                            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
                                            onChange={handleServiceSelect}
                                            value="" // Always reset to empty to allow re-selecting same item if needed, but we typically want it to just fill the input
                                        >
                                            <option value="" disabled>Select a service...</option>
                                            {serviceCategories.map(service => (
                                                <option key={service._id} value={service._id}>
                                                    {service.name}
                                                </option>
                                            ))}
                                        </select>
                                        {/* Hidden or read-only input might be redundant if we just set state, but maybe user wants to edit name after selecting? 
                                            Let's keep the name input visible so they can edit it if they want, or just rely on the dropdown to populate it. 
                                            Actually, user wants "it shows existing services category to add there". 
                                            I'll show the dropdown AND the input so they can see what they picked and edit if necessary.
                                        */}
                                        <Input
                                            placeholder="Selected Name"
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            className="flex-1"
                                        />
                                    </div>
                                )}

                                <Input
                                    placeholder="Icon"
                                    value={newItem.icon}
                                    onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                                    className="w-20"
                                />
                                {formData.sectionType === 'banner' && (
                                    <>
                                        <Input
                                            placeholder="Subtitle"
                                            value={newItem.subtitle}
                                            onChange={(e) => setNewItem({ ...newItem, subtitle: e.target.value })}
                                            className="flex-1"
                                        />
                                        <Input
                                            placeholder="CTA Text"
                                            value={newItem.ctaText}
                                            onChange={(e) => setNewItem({ ...newItem, ctaText: e.target.value })}
                                            className="w-32"
                                        />
                                    </>
                                )}
                                <Button type="button" onClick={addItem} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
                            <Button onClick={handleSave}>Save</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="home_services">
                <TabsList>
                    <TabsTrigger value="home_services">Home Services</TabsTrigger>
                    <TabsTrigger value="banner">Banners</TabsTrigger>
                    <TabsTrigger value="trending">Trending</TabsTrigger>
                </TabsList>

                <TabsContent value="home_services" className="mt-4">
                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : getSectionsByType('home_services').length > 0 ? (
                        getSectionsByType('home_services').map(renderSectionCard)
                    ) : (
                        <div className="text-center py-12 text-zinc-500">No home services sections</div>
                    )}
                </TabsContent>

                <TabsContent value="banner" className="mt-4">
                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : getSectionsByType('banner').length > 0 ? (
                        getSectionsByType('banner').map(renderSectionCard)
                    ) : (
                        <div className="text-center py-12 text-zinc-500">No banner sections</div>
                    )}
                </TabsContent>

                <TabsContent value="trending" className="mt-4">
                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : getSectionsByType('trending').length > 0 ? (
                        getSectionsByType('trending').map(renderSectionCard)
                    ) : (
                        <div className="text-center py-12 text-zinc-500">No trending sections</div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
