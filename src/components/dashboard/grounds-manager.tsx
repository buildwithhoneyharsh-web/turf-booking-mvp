"use client";

import { useState } from "react";
import { Plus, Power, Edit3 } from "lucide-react";
import { addGround, toggleGroundStatus } from "@/app/dashboard/grounds/actions";

type Ground = {
  id: string;
  name: string;
  code: string;
  surface_type: string | null;
  environment: string | null;
  is_active: boolean;
};

export function GroundsManager({ initialGrounds, turfId }: { initialGrounds: Ground[], turfId: string }) {
  const [grounds, setGrounds] = useState<Ground[]>(initialGrounds);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    surface_type: "Synthetic",
    environment: "Outdoor"
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const newGround = await addGround(turfId, formData);
    if (newGround) {
      setGrounds([...grounds, newGround]);
      setIsAdding(false);
      setFormData({ name: "", code: "", surface_type: "Synthetic", environment: "Outdoor" });
    }
  };

  const handleToggle = async (groundId: string, currentStatus: boolean) => {
    const success = await toggleGroundStatus(groundId, !currentStatus);
    if (success) {
      setGrounds(grounds.map(g => g.id === groundId ? { ...g, is_active: !currentStatus } : g));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00d4a4] hover:bg-[#00b38a] text-black font-semibold rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Add New Ground</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-lg font-bold text-white mb-4">Add Ground / Pitch</h3>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#a8a8aa]">Name (e.g. Court 1)</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white focus:border-[#00d4a4] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#a8a8aa]">Short Code (e.g. C1)</label>
              <input 
                required
                type="text" 
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white focus:border-[#00d4a4] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#a8a8aa]">Surface Type</label>
              <select 
                value={formData.surface_type}
                onChange={e => setFormData({...formData, surface_type: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white focus:border-[#00d4a4] outline-none"
              >
                <option>Synthetic</option>
                <option>Turf</option>
                <option>Wooden</option>
                <option>Clay</option>
                <option>Hard Court</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#a8a8aa]">Environment</label>
              <select 
                value={formData.environment}
                onChange={e => setFormData({...formData, environment: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white focus:border-[#00d4a4] outline-none"
              >
                <option>Outdoor</option>
                <option>Indoor</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-[#a8a8aa] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Save Ground
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grounds.map(ground => (
          <div key={ground.id} className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-2xl p-5 hover:border-[#4d4d4d] transition-colors relative group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {ground.name}
                  {!ground.is_active && (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">Inactive</span>
                  )}
                </h3>
                <p className="text-sm text-[#a8a8aa] mt-0.5">Code: {ground.code}</p>
              </div>
              <button className="text-[#a8a8aa] hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                <Edit3 size={16} />
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              {ground.surface_type && (
                <span className="text-xs font-medium bg-[#2d2d2d] text-[#e5e5e5] px-2 py-1 rounded-md">
                  {ground.surface_type}
                </span>
              )}
              {ground.environment && (
                <span className="text-xs font-medium bg-[#2d2d2d] text-[#e5e5e5] px-2 py-1 rounded-md">
                  {ground.environment}
                </span>
              )}
            </div>

            <div className="pt-4 border-t border-[#2d2d2d] flex justify-between items-center">
              <span className="text-sm text-[#a8a8aa]">Status</span>
              <button 
                onClick={() => handleToggle(ground.id, ground.is_active)}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${ground.is_active ? 'bg-[#00d4a4]/10 text-[#00d4a4] hover:bg-[#00d4a4]/20' : 'bg-[#2d2d2d] text-[#a8a8aa] hover:text-white'}`}
              >
                <Power size={14} />
                {ground.is_active ? 'Active' : 'Turn On'}
              </button>
            </div>
          </div>
        ))}

        {grounds.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center border border-dashed border-[#2d2d2d] rounded-2xl">
            <p className="text-[#a8a8aa] mb-2">No grounds set up yet.</p>
            <button onClick={() => setIsAdding(true)} className="text-[#00d4a4] font-medium hover:underline">
              Add your first ground
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
