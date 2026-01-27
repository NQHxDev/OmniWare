import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectOption = {
   label: string;
   value: string;
};

type SelectProps = {
   label?: string;
   placeholder?: string;
   options: SelectOption[];
   value?: string | number | null;
   onChange?: (value: number | string | null) => void;
};

const Select: React.FC<SelectProps> = ({
   label,
   placeholder = 'Chọn...',
   options,
   value,
   onChange,
}) => {
   const [isOpen, setIsOpen] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   const selectedOption = options.find((o) => o.value === value);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setIsOpen(false);
         }
      };
      if (options && options.length > 0 && !value) {
         onChange?.(options[0].value);
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [options, value, onChange]);

   return (
      <div ref={containerRef} className="w-full">
         {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

         <div className="relative">
            {/* Button */}
            <button
               type="button"
               onClick={() => setIsOpen((prev) => !prev)}
               className="
                  w-full px-3 py-2 text-left
                  bg-white border border-gray-300 rounded-lg
                  flex items-center justify-between
                  text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-900
               "
            >
               <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedOption?.label || placeholder}
               </span>

               <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                     isOpen ? 'rotate-180' : ''
                  }`}
               />
            </button>

            {isOpen && (
               <ul
                  className="
                     absolute z-50 mt-1 w-full
                     bg-white border border-gray-200 rounded-lg shadow-lg
                     /* Thay đổi ở đây: */
                     max-h-30 overflow-y-auto
                     scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
                  "
               >
                  {options.map((option) => (
                     <li
                        key={option.value}
                        onClick={() => {
                           onChange?.(option.value);
                           setIsOpen(false);
                        }}
                        className="
                           px-4 py-2.5 text-sm text-gray-700
                           cursor-pointer hover:bg-gray-50
                           transition
                        "
                     >
                        {option.label}
                     </li>
                  ))}
               </ul>
            )}
         </div>
      </div>
   );
};

export default Select;
