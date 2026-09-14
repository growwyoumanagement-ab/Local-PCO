import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function Settings() {
    const handleSave = () => {
        toast.success("Settings saved successfully");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Platform Settings
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage system configurations and preferences
                </p>
            </div>

            <div className="space-y-6">
                {/* General Settings */}
                <Card className="bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>General Configuration</CardTitle>
                        <CardDescription>Basic platform settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Platform Name</label>
                                <Input defaultValue="Local PCO" disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Support Email</label>
                                <Input defaultValue="support@localpco.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Platform Fee (%)</label>
                                <Input type="number" defaultValue="10" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Toggles */}
                <Card className="bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Feature Management</CardTitle>
                        <CardDescription>Enable or disable platform features</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Partner Registration</label>
                                <p className="text-xs text-zinc-500">Allow new partners to sign up</p>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Auto-Assign Bookings</label>
                                <p className="text-xs text-zinc-500">Automatically assign bookings to nearest partner</p>
                            </div>
                            <Switch checked={false} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Maintenance Mode</label>
                                <p className="text-xs text-zinc-500">Disable all client features</p>
                            </div>
                            <Switch checked={false} />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 opacity-60">
                    <CardHeader>
                        <CardTitle>Notifications (Coming Soon)</CardTitle>
                        <CardDescription>Manage email and SMS alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-500">This section is currently under development.</p>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button size="lg" onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
