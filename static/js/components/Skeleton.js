export const Skeleton = ({ className }) => (
    <div className={`skeleton ${className}`}></div>
);

export const SkeletonRow = ({ cols = 5 }) => (
    <tr className="animate-pulse">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
        ))}
    </tr>
);

export const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-4 mb-4">
            <div className="skeleton skeleton-circle h-12 w-12"></div>
            <div className="space-y-2 flex-1">
                <div className="skeleton skeleton-text w-1/2"></div>
                <div className="skeleton skeleton-text w-1/3"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="skeleton skeleton-text w-full"></div>
            <div className="skeleton skeleton-text w-full"></div>
            <div className="skeleton skeleton-text w-2/3"></div>
        </div>
    </div>
);
