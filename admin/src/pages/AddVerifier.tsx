import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Camera, X, ShieldPlus, Loader2 } from "lucide-react";

const initialFormData = {
    firstName: "", lastName: "", email: "", phone: "", password: "",
    aadhaarCard: "", panCard: "", houseNumber: "", houseAddress: "",
    workplaceAddress: "", phone2: "", housePhone: "",
};

// Compress image using Canvas to stay under Vercel's payload limits
const compressImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context failed'));
                ctx.drawImage(img, 0, 0, width, height);
                const compressed = canvas.toDataURL('image/jpeg', quality);
                resolve(compressed);
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
    });
};

interface ImageState {
    preview: string;  // local preview URL or cloudinary URL
    url: string;      // cloudinary URL after upload
    uploading: boolean;
}

const emptyImage: ImageState = { preview: '', url: '', uploading: false };

export default function AddVerifier() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Separate image states with upload tracking
    const [photo, setPhoto] = useState<ImageState>(emptyImage);
    const [aadhaarFront, setAadhaarFront] = useState<ImageState>(emptyImage);
    const [aadhaarBack, setAadhaarBack] = useState<ImageState>(emptyImage);
    const [panCard, setPanCard] = useState<ImageState>(emptyImage);

    const fileInputRefPhoto = useRef<HTMLInputElement>(null);
    const fileInputRefAadhaarFront = useRef<HTMLInputElement>(null);
    const fileInputRefAadhaarBack = useRef<HTMLInputElement>(null);
    const fileInputRefPan = useRef<HTMLInputElement>(null);

    // Upload a single image: compress → upload to Cloudinary → store URL
    const handleImageUpload = (
        setter: React.Dispatch<React.SetStateAction<ImageState>>,
        folder: string
    ) => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        try {
            // Show local preview immediately & set uploading state
            const localPreview = URL.createObjectURL(file);
            setter({ preview: localPreview, url: '', uploading: true });

            // Compress the image client-side (reduces ~5MB → ~200-500KB)
            const compressed = await compressImage(file);

            // Upload single compressed image to Cloudinary via backend
            const cloudinaryUrl = await adminService.uploadImage(compressed, folder);

            setter({ preview: cloudinaryUrl, url: cloudinaryUrl, uploading: false });
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            setter(emptyImage);
            toast.error(error.response?.data?.message || "Failed to upload image");
        }

        // Reset file input so the same file can be re-selected
        e.target.value = '';
    };

    const removeImage = (setter: React.Dispatch<React.SetStateAction<ImageState>>) => () => {
        setter(emptyImage);
    };

    const anyUploading = photo.uploading || aadhaarFront.uploading || aadhaarBack.uploading || panCard.uploading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password) {
            toast.error("Please fill all required fields");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
            toast.error("Phone Number 1 must be exactly 10 digits");
            return;
        }
        if (formData.phone2 && (formData.phone2.length !== 10 || !/^\d+$/.test(formData.phone2))) {
            toast.error("Phone Number 2 must be exactly 10 digits");
            return;
        }
        if (formData.aadhaarCard && !/^\d{12}$/.test(formData.aadhaarCard)) {
            toast.error("Aadhaar Card must be exactly 12 digits");
            return;
        }
        if (formData.panCard && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCard.toUpperCase())) {
            toast.error("Invalid PAN Card format (e.g. ABCDE1234F)");
            return;
        }
        if (anyUploading) {
            toast.error("Please wait for all images to finish uploading");
            return;
        }

        try {
            setSubmitting(true);
            // Send only URLs (not base64) — keeps payload tiny
            await adminService.createVerifier({
                ...formData,
                panCard: formData.panCard.toUpperCase(),
                photoUrl: photo.url || '',
                aadhaarFrontUrl: aadhaarFront.url || '',
                aadhaarBackUrl: aadhaarBack.url || '',
                panCardUrl: panCard.url || '',
            });
            toast.success("Verifier created successfully");
            navigate("/verifiers");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create verifier");
        } finally {
            setSubmitting(false);
        }
    };

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData({ ...formData, [field]: e.target.value });

    const setPhoneField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 10) setFormData({ ...formData, [field]: val });
    };

    // Reusable image upload tile component
    const ImageUploadTile = ({
        label,
        state,
        inputRef,
        onUpload,
        onRemove,
        isCircle = false,
    }: {
        label: string;
        state: ImageState;
        inputRef: React.RefObject<HTMLInputElement>;
        onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onRemove: () => void;
        isCircle?: boolean;
    }) => (
        <div className="space-y-1.5">
            {!isCircle && <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 tracking-wide">{label}</label>}
            <div
                className={`relative ${isCircle ? 'h-28 w-28 rounded-full' : 'h-28 w-full rounded-xl'} border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 transition-colors bg-zinc-50 dark:bg-zinc-800/50 group/doc overflow-hidden`}
                onClick={() => !state.uploading && inputRef.current?.click()}
            >
                {state.uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
                        <span className="text-[10px] text-violet-500 font-semibold uppercase tracking-wider">Uploading...</span>
                    </div>
                ) : state.preview ? (
                    <>
                        <img src={state.preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/doc:opacity-100 transition-opacity flex flex-col items-center justify-center">
                            <Camera className="h-5 w-5 text-white mb-1" />
                            <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
                        </div>
                        {state.url && (
                            <div className="absolute top-1.5 right-1.5 bg-emerald-500 rounded-full p-0.5">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center p-2 text-center">
                        <Camera className="h-5 w-5 text-zinc-400 mb-1.5 group-hover/doc:text-violet-500 transition-colors" />
                        <span className="text-xs text-zinc-500 group-hover/doc:text-violet-500 font-medium">{label}</span>
                    </div>
                )}
            </div>
            {state.preview && !state.uploading && (
                <button type="button" onClick={onRemove} className="text-[10px] text-rose-500 hover:text-rose-600 flex items-center gap-1 mt-1 uppercase font-semibold">
                    <X className="w-3 h-3" /> Remove
                </button>
            )}
            <input ref={inputRef as any} type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Button variant="ghost" size="icon" className="relative z-10 shrink-0" onClick={() => navigate("/verifiers")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        Add New Verifier
                        <ShieldPlus className="h-6 w-6 text-violet-500 dark:text-violet-400" />
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1 font-medium tracking-wide">Fill in the details to register a new verification team member</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-8 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center gap-3 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                        <ImageUploadTile
                            label="Upload Photo"
                            state={photo}
                            inputRef={fileInputRefPhoto}
                            onUpload={handleImageUpload(setPhoto, 'verifier_photos')}
                            onRemove={removeImage(setPhoto)}
                            isCircle
                        />
                        <div className="text-center">
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upload Photo</p>
                            <p className="text-xs text-zinc-500">Click the circle to upload (max 5MB)</p>
                        </div>
                    </div>

                    {/* Section: Personal Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Personal Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">First Name *</label>
                                <Input placeholder="First name" value={formData.firstName} onChange={set('firstName')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Last Name *</label>
                                <Input placeholder="Last name" value={formData.lastName} onChange={set('lastName')} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                            <Input type="email" placeholder="E.g. john@example.com" value={formData.email} onChange={set('email')} />
                        </div>
                    </div>

                    {/* Section: Identity Documents */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Identity Documents</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Aadhaar Card Number</label>
                                <Input
                                    placeholder="12-digit Aadhaar No."
                                    maxLength={12}
                                    value={formData.aadhaarCard}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 12) setFormData({...formData, aadhaarCard: val});
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">PAN Card Number</label>
                                <Input
                                    placeholder="E.g. ABCDE1234F"
                                    maxLength={10}
                                    value={formData.panCard}
                                    onChange={(e) => setFormData({...formData, panCard: e.target.value.toUpperCase()})}
                                />
                            </div>
                        </div>

                        {/* Document Uploads */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                            <ImageUploadTile
                                label="Upload Front"
                                state={aadhaarFront}
                                inputRef={fileInputRefAadhaarFront}
                                onUpload={handleImageUpload(setAadhaarFront, 'verifier_documents')}
                                onRemove={removeImage(setAadhaarFront)}
                            />
                            <ImageUploadTile
                                label="Upload Back"
                                state={aadhaarBack}
                                inputRef={fileInputRefAadhaarBack}
                                onUpload={handleImageUpload(setAadhaarBack, 'verifier_documents')}
                                onRemove={removeImage(setAadhaarBack)}
                            />
                            <ImageUploadTile
                                label="Upload PAN"
                                state={panCard}
                                inputRef={fileInputRefPan}
                                onUpload={handleImageUpload(setPanCard, 'verifier_documents')}
                                onRemove={removeImage(setPanCard)}
                            />
                        </div>
                    </div>

                    {/* Section: Address */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Address Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">House Number</label>
                                <Input placeholder="E.g. 42-B" value={formData.houseNumber} onChange={set('houseNumber')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">House Address</label>
                                <Input placeholder="Full house address" value={formData.houseAddress} onChange={set('houseAddress')} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Workplace / Business Address</label>
                            <Input placeholder="Full workplace address" value={formData.workplaceAddress} onChange={set('workplaceAddress')} />
                        </div>
                    </div>

                    {/* Section: Contact */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Contact Numbers</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number 1 *</label>
                                <Input placeholder="10 digits" maxLength={10} value={formData.phone} onChange={setPhoneField('phone')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number 2</label>
                                <Input placeholder="10 digits" maxLength={10} value={formData.phone2} onChange={setPhoneField('phone2')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">House Phone (Optional)</label>
                                <Input placeholder="Optional" value={formData.housePhone} onChange={set('housePhone')} />
                            </div>
                        </div>
                    </div>

                    {/* Section: Password */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Login Credentials</h3>
                        <div className="space-y-1.5 max-w-sm">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password *</label>
                            <div className="relative">
                                <Input
                                    type={isPasswordVisible ? "text" : "password"}
                                    placeholder="Set a password (min 6 chars)"
                                    value={formData.password}
                                    onChange={set('password')}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                >
                                    {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                        <Button type="button" variant="outline" onClick={() => navigate("/verifiers")}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || anyUploading}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25 px-8"
                        >
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                            ) : anyUploading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading Images...</>
                            ) : (
                                "Create Verifier"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
