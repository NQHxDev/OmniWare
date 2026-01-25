import React from 'react';

type TableProps<T> = {
   headers: string[];
   data: T[];
   renderRow: (item: T, index: number) => React.ReactNode;
   emptyMessage?: string;
   className?: string;
};

const Table = <T,>({
   headers,
   data,
   renderRow,
   emptyMessage = 'Không có dữ liệu',
   className = '',
}: TableProps<T>) => {
   return (
      <div className={`overflow-x-auto bg-white rounded-lg shadow ${className}`}>
         <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
               <tr>
                  {headers.map((header, index) => (
                     <th
                        key={index}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        {header}
                     </th>
                  ))}
               </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
               {data.length > 0 ? (
                  data.map((item, index) => renderRow(item, index))
               ) : (
                  <tr>
                     <td colSpan={headers.length} className="px-6 py-8 text-center text-gray-500">
                        {emptyMessage}
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
   );
};

export default Table;
