// src/components/index.ts
// Feature components barrel export

export { default as RequestCard } from './RequestCard';
export { default as ServiceCard } from './ServiceCard';
export { default as AddressCard } from './AddressCard';
export { default as StatusBadge } from './StatusBadge';
export { default as PrimaryButton } from './PrimaryButton';
export { default as ImagePicker } from './ImagePicker';
export { default as SearchBar } from './SearchBar';
export { default as CategoryGrid, type ServiceCategory } from './CategoryGrid';
export { default as PromoBanner } from './PromoBanner';
export { default as ServiceProviderCard, type ServiceProvider } from './ServiceProviderCard';
export { default as FilterChips, type FilterOption } from './FilterChips';

export { default as ActiveRequestBanner } from './ActiveRequestBanner';
export { default as BannerCarousel } from './BannerCarousel';
export { default as Skeleton, CategoryGridSkeleton, ProviderCardSkeleton, RequestCardSkeleton } from './Skeleton';

// Re-export UI components
export * from './ui';



