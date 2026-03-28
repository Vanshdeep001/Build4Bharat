import React, { useState, useEffect, useRef } from 'react';

const SearchDialog = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  const districts = [
    'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 
    'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 
    'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi',
    'Uttarakhand'
  ];

  const filteredDistricts = districts.filter(d => 
    d.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#00113a]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-surface border border-outline-variant/20 rounded-3xl shadow-2xl shadow-primary/20 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center px-6 py-4 border-b border-outline-variant/10">
          <span className="material-symbols-outlined text-on-surface-variant mr-3">search</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search districts..."
            className="flex-1 bg-transparent border-none outline-none text-on-surface font-medium text-lg placeholder:text-on-surface-variant/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <kbd className="bg-surface-container-high border border-outline-variant/20 px-2 py-1 rounded text-[10px] text-on-surface-variant font-bold">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-4 custom-scrollbar">
          {filteredDistricts.length > 0 ? (
            <div className="grid grid-cols-1 gap-1">
              {filteredDistricts.map((district) => (
                <button
                  key={district}
                  onClick={() => {
                    onSelect(district);
                    onClose();
                  }}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-primary/5 group transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <span className="material-symbols-outlined text-xl">
                        {district === 'Uttarakhand' ? 'map' : 'location_on'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface group-hover:text-primary transition-colors">
                        {district}
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">
                        {district === 'Uttarakhand' ? 'Statewide View' : 'District Node'}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">search_off</span>
              <p className="text-on-surface-variant font-medium">No districts matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-surface-container-low/50 border-t border-outline-variant/10 flex items-center justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
          <span>{filteredDistricts.length} results found</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">keyboard_backspace</span>
              Select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
