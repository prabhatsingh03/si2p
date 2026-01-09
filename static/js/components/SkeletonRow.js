import React from 'react';

const SkeletonRow = ({ cols }) => (
    <tr className="animate-pulse">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
        ))}
    </tr>
);

export default SkeletonRow;
