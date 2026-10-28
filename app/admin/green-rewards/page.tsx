"use client";

import { useEffect, useState } from "react";
import { 
  Recycle, 
  Package, 
  Coins, 
  Settings, 
  MapPin, 
  Scale, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MessageCircle,
  Phone,
  Plus,
  Edit2,
  Save,
  X,
  Search,
  RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'pickups' | 'redemptions' | 'locations' | 'categories' | 'settings'>('pickups');
  
  // Primary Data States
  const [pickups, setPickups] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [pickupFilter, setPickupFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('pending');
  const [redemptionFilter, setRedemptionFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Weighing Modal State
  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmittingWeigh, setIsSubmittingWeigh] = useState(false);

  // Hub / Location Modal State
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [locationForm, setLocationForm] = useState({
    name_en: '',
    name_kn: '',
    address_en: '',
    address_kn: '',
    operating_hours: '09:00 AM - 06:00 PM',
    is_active: true
  });

  // Waste Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    name_en: '',
    name_kn: '',
    points_per_kg: 10,
    is_active: true
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    enable_home_pickup: false,
    points_to_rupee_rate: 0.10,
    min_redemption_points: 100,
    allowed_time_slots: "09:00 AM - 12:00 PM, 02:00 PM - 05:00 PM"
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    try {
      const response = await fetch('/api/green-rewards/admin/settings');
      const data = await response.json();
      
      if (data.success) {
        setPickups(data.pickups || []);
        setRedemptions(data.redemptions || []);
        setLocations(data.locations || []);
        setCategories(data.categories || []);
        if (data.settings) {
          setSystemSettings(data.settings);
          setSettingsForm({
            enable_home_pickup: data.settings.enable_home_pickup ?? false,
            points_to_rupee_rate: data.settings.points_to_rupee_rate ?? 0.10,
            min_redemption_points: data.settings.min_redemption_points ?? 100,
            allowed_time_slots: Array.isArray(data.settings.allowed_time_slots) 
              ? data.settings.allowed_time_slots.join(', ') 
              : (data.settings.allowed_time_slots || "09:00 AM - 12:00 PM, 02:00 PM - 05:00 PM")
          });
        }
      } else {
        toast.error(data.error || "Failed to load admin data");
      }
    } catch (error: any) {
      toast.error(error.message || "Network error while loading admin panel");
    } finally {
      setLoading(false);
    }
  }

  // --- WEIGHING & COLLECTION LOGIC ---
  const handleOpenWeighModal = (pickup: any) => {
    setSelectedPickup(pickup);
    const initialWeights: Record<string, number> = {};
    categories.forEach(cat => {
      initialWeights[cat.id] = 0;
    });
    setWeights(initialWeights);
    setAdminNotes("");
  };

  const handleProcessWeighing = async () => {
    setIsSubmittingWeigh(true);
    try {
      const response = await fetch('/api/green-rewards/admin/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedPickup.id,
          weights: Object.entries(weights).map(([categoryId, weight]) => ({
            categoryId,
            weight: Number(weight) || 0
          })),
          notes: adminNotes
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Success! Awarded ${result.pointsAwarded} points.`);
        setSelectedPickup(null);
        fetchAdminData();
      } else {
        toast.error(result.error || "Failed to process weighing");
      }
    } catch (error) {
      toast.error("An error occurred during verification");
    } finally {
      setIsSubmittingWeigh(false);
    }
  };

  // --- REDEMPTION PAYOUT LOGIC ---
  const handleApproveRedemption = async (id: string) => {
    if (!confirm("Are you sure you have transferred the UPI payment and want to mark this complete?")) return;
    try {
      const response = await fetch('/api/green-rewards/admin/redemption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redemptionId: id, status: 'completed' })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Redemption marked as paid!");
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to update redemption");
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // --- LOCATION HUB CRUD LOGIC ---
  const handleOpenLocationModal = (location: any = null) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({
        name_en: location.name_en || '',
        name_kn: location.name_kn || '',
        address_en: location.address_en || '',
        address_kn: location.address_kn || '',
        operating_hours: location.operating_hours || '09:00 AM - 06:00 PM',
        is_active: location.is_active ?? true
      });
    } else {
      setEditingLocation(null);
      setLocationForm({
        name_en: '',
        name_kn: '',
        address_en: '',
        address_kn: '',
        operating_hours: '09:00 AM - 06:00 PM',
        is_active: true
      });
    }
    setLocationModalOpen(true);
  };

  const handleSaveLocation = async () => {
    if (!locationForm.name_en || !locationForm.address_en) {
      toast.error("English Name and Address are required");
      return;
    }
    try {
      const response = await fetch('/api/green-rewards/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_location',
          id: editingLocation?.id,
          data: locationForm
        })
      });
      const res = await response.json();
      if (res.success) {
        toast.success(editingLocation ? "Hub updated!" : "New Drop-Off Hub created!");
        setLocationModalOpen(false);
        fetchAdminData();
      } else {
        toast.error(res.error || "Failed to save location");
      }
    } catch (e) {
      toast.error("Error saving location");
    }
  };

  // --- CATEGORY CRUD LOGIC ---
  const handleOpenCategoryModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name_en: category.name_en || '',
        name_kn: category.name_kn || '',
        points_per_kg: category.points_per_kg || 10,
        is_active: category.is_active ?? true
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name_en: '',
        name_kn: '',
        points_per_kg: 10,
        is_active: true
      });
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name_en) {
      toast.error("Category name is required");
      return;
    }
    try {
      const response = await fetch('/api/green-rewards/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_category',
          id: editingCategory?.id,
          data: categoryForm
        })
      });
      const res = await response.json();
      if (res.success) {
        toast.success(editingCategory ? "Category updated!" : "New waste category created!");
        setCategoryModalOpen(false);
        fetchAdminData();
      } else {
        toast.error(res.error || "Failed to save category");
      }
    } catch (e) {
      toast.error("Error saving category");
    }
  };

  // --- SAVE SYSTEM SETTINGS ---
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const slotsArray = settingsForm.allowed_time_slots
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const response = await fetch('/api/green-rewards/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_settings',
          id: systemSettings?.id,
          data: {
            enable_home_pickup: settingsForm.enable_home_pickup,
            points_to_rupee_rate: Number(settingsForm.points_to_rupee_rate),
            min_redemption_points: Number(settingsForm.min_redemption_points),
            allowed_time_slots: slotsArray
          }
        })
      });
      const res = await response.json();
      if (res.success) {
        toast.success("System Settings saved successfully!");
        fetchAdminData();
      } else {
        toast.error(res.error || "Failed to save settings");
      }
    } catch (e) {
      toast.error("Error saving settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filtered lists
  const filteredPickups = pickups.filter(p => {
    const matchesFilter = pickupFilter === 'all' || p.status === pickupFilter;
    const matchesSearch = searchQuery === '' || 
      (p.request_number && p.request_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.user?.full_name && p.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.user?.phone && p.user.phone.includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  const filteredRedemptions = redemptions.filter(r => {
    const matchesFilter = redemptionFilter === 'all' || r.status === redemptionFilter;
    const matchesSearch = searchQuery === '' || 
      (r.user?.full_name && r.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.user?.phone && r.user.phone.includes(searchQuery)) ||
      (r.upi_id && r.upi_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="min-h-screen bg-black pt-32 flex flex-col items-center justify-center text-amber-500">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
      <p className="text-gray-400 font-mono text-sm">Loading Sampige Green Rewards Admin Portal...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-8">
      {/* Header Stats */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/20">
            Sampige Green Rewards Admin
          </span>
          <h1 className="text-3xl font-extrabold mt-2 tracking-tight">Waste Management & Rewards Control</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-[#141414] border border-white/10 p-3.5 rounded-xl min-w-[130px] text-center">
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Pending Pickups</p>
            <p className="text-2xl font-black text-amber-500">
              {pickups.filter(p => p.status === 'pending').length}
            </p>
          </div>
          <div className="bg-[#141414] border border-white/10 p-3.5 rounded-xl min-w-[130px] text-center">
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Pending Redemptions</p>
            <p className="text-2xl font-black text-amber-500">
              {redemptions.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <button 
            onClick={fetchAdminData}
            className="bg-[#141414] hover:bg-white/10 border border-white/10 p-3.5 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mb-8 bg-[#0A0A0A] p-1.5 rounded-xl border border-white/10">
        {[
          { id: 'pickups', label: 'Drop-Off & Pickups', icon: Recycle, badge: pickups.filter(p=>p.status==='pending').length },
          { id: 'redemptions', label: 'Redemptions', icon: Coins, badge: redemptions.filter(r=>r.status==='pending').length },
          { id: 'locations', label: `Drop-Off Hubs (${locations.length})`, icon: MapPin },
          { id: 'categories', label: `Waste Category Rates (${categories.length})`, icon: Scale },
          { id: 'settings', label: 'System Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all text-sm font-semibold ${
              activeTab === tab.id 
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
              : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab.id ? "bg-black text-amber-500" : "bg-amber-500 text-black"
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* TAB 1: DROP-OFF & PICKUP REQUESTS */}
        {activeTab === 'pickups' && (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header Controls */}
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-amber-500">
                  <Recycle size={22} /> Manage Drop-Off Appointments & Weighing
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Weigh member waste on arrival and automatically calculate & award green points to wallet.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search request # or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#141414] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 w-48 md:w-64"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex bg-[#141414] border border-white/10 rounded-lg p-1 text-xs font-semibold">
                  {(['all', 'pending', 'completed'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setPickupFilter(status)}
                      className={`px-3 py-1 rounded-md capitalize transition-colors ${
                        pickupFilter === status ? "bg-amber-500 text-black font-bold" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black/60 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">Request #</th>
                    <th className="px-6 py-4 font-bold">User Contact</th>
                    <th className="px-6 py-4 font-bold">Drop-Off Hub / Address</th>
                    <th className="px-6 py-4 font-bold">Scheduled Slot</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredPickups.map((pickup) => (
                    <tr key={pickup.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-amber-500">
                        {pickup.request_number || pickup.id.slice(0,8)}
                      </td>

                      {/* USER PHONE DISPLAY ONLY - NO EMAIL */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">
                            {pickup.user?.full_name || "Member"}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-300 font-mono flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              <Phone size={12} className="text-amber-500" />
                              {pickup.user?.phone || 'No phone recorded'}
                            </span>
                            {pickup.user?.phone && (
                              <a 
                                href={`https://wa.me/${pickup.user.phone.replace(/\D/g,'')}`} 
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 transition-colors p-1 bg-emerald-500/10 rounded hover:bg-emerald-500/20"
                                title="Open WhatsApp Chat"
                              >
                                <MessageCircle size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-amber-400 font-semibold block">{pickup.location?.name_en || 'Main Hub'}</span>
                        <span className="text-gray-500 text-xs line-clamp-1">{pickup.location?.address_en}</span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex flex-col">
                          <span className="text-gray-200 font-medium">{pickup.scheduled_date}</span>
                          <span className="text-gray-500 uppercase">{pickup.scheduled_slot}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${
                          pickup.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          pickup.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {pickup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {pickup.status === 'pending' ? (
                          <button 
                            onClick={() => handleOpenWeighModal(pickup)}
                            className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <Scale size={15} /> Weigh & Award Points
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 italic font-mono">
                            {pickup.status === 'completed' ? 'Points Awarded' : 'Processed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPickups.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                        No drop-off or pickup records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REDEMPTIONS & PAYOUTS */}
        {activeTab === 'redemptions' && (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-amber-500">
                  <Coins size={22} /> Payout & UPI Redemption Requests
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Verify member UPI IDs and mark payouts as paid after initiating transfer.
                </p>
              </div>

              <div className="flex bg-[#141414] border border-white/10 rounded-lg p-1 text-xs font-semibold">
                {(['all', 'pending', 'completed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setRedemptionFilter(status)}
                    className={`px-3 py-1 rounded-md capitalize transition-colors ${
                      redemptionFilter === status ? "bg-amber-500 text-black font-bold" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black/60 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">User Contact</th>
                    <th className="px-6 py-4 font-bold">Points Redeemed</th>
                    <th className="px-6 py-4 font-bold">Payout Amount</th>
                    <th className="px-6 py-4 font-bold">Member UPI ID</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredRedemptions.map((red) => (
                    <tr key={red.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* USER PHONE DISPLAY ONLY - NO EMAIL */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{red.user?.full_name || "Member"}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-300 font-mono flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              <Phone size={12} className="text-amber-500" />
                              {red.user?.phone || 'No phone'}
                            </span>
                            {red.user?.phone && (
                              <a 
                                href={`https://wa.me/${red.user.phone.replace(/\D/g,'')}`} 
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 p-1 bg-emerald-500/10 rounded"
                                title="WhatsApp User"
                              >
                                <MessageCircle size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-amber-500 font-mono">
                        {red.points_redeemed} pts
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-400 text-base font-mono">
                        ₹{red.amount_inr}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-300 bg-white/[0.02] px-3 py-1.5 rounded border border-white/5">
                        {red.upi_id}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${
                          red.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          red.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {red.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {red.status === 'pending' ? (
                          <button 
                            onClick={() => handleApproveRedemption(red.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all ml-auto"
                          >
                            Confirm Paid
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-500 font-bold uppercase font-mono">Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRedemptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                        No redemption requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DROP-OFF HUBS / LOCATIONS */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#0A0A0A] p-6 rounded-2xl border border-white/10">
              <div>
                <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2">
                  <MapPin size={22} /> Drop-Off Hubs & Collection Centers
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Manage operating centers where members can drop off segregated waste.
                </p>
              </div>
              <button
                onClick={() => handleOpenLocationModal()}
                className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add New Hub
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {locations.map((loc) => (
                <div key={loc.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:border-amber-500/30 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{loc.name_en}</h3>
                        <p className="text-xs text-amber-500 font-medium italic">{loc.name_kn}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        loc.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {loc.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mb-2">{loc.address_en}</p>
                    <p className="text-xs text-gray-500 mb-4">{loc.address_kn}</p>

                    <div className="bg-white/5 rounded-lg p-2.5 text-xs text-gray-400 flex items-center gap-2 mb-4">
                      <Clock size={14} className="text-amber-500" />
                      <span>{loc.operating_hours || "09:00 AM - 06:00 PM"}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                    <button
                      onClick={() => handleOpenLocationModal(loc)}
                      className="bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 size={14} /> Edit Hub
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WASTE CATEGORIES & RATES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#0A0A0A] p-6 rounded-2xl border border-white/10">
              <div>
                <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2">
                  <Scale size={22} /> Waste Categories & Reward Rates
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Set points per kilogram for each category of waste brought by members.
                </p>
              </div>
              <button
                onClick={() => handleOpenCategoryModal()}
                className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add New Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/30 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{cat.name_en}</h3>
                        <p className="text-xs text-amber-500 font-medium italic">{cat.name_kn}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        cat.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 my-4 flex justify-between items-center">
                      <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Reward Rate</span>
                      <span className="text-2xl font-black text-amber-500">
                        {cat.points_per_kg} <span className="text-xs font-normal text-gray-400">pts / kg</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                    <button
                      onClick={() => handleOpenCategoryModal(cat)}
                      className="bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 size={14} /> Edit Rate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-3xl mx-auto shadow-2xl">
            <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2 mb-2">
              <Settings size={22} /> Green Rewards System Settings
            </h2>
            <p className="text-xs text-gray-400 mb-8 border-b border-white/10 pb-4">
              Configure door-step pickup toggles, point exchange rates, and minimum redemption limits.
            </p>

            <div className="space-y-6">
              {/* Doorstep Toggle */}
              <div className="flex items-center justify-between bg-[#141414] border border-white/10 p-5 rounded-xl">
                <div>
                  <h4 className="font-bold text-white text-sm">Enable Doorstep Pickup Service</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    If disabled, portal defaults strictly to Self Drop-Off at designated Hubs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsForm({...settingsForm, enable_home_pickup: !settingsForm.enable_home_pickup})}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settingsForm.enable_home_pickup ? 'bg-amber-500' : 'bg-gray-800'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settingsForm.enable_home_pickup ? 'translate-x-7' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Conversion Rate */}
              <div className="bg-[#141414] border border-white/10 p-5 rounded-xl space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Points to INR Conversion Rate (1 Point = ₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settingsForm.points_to_rupee_rate}
                    onChange={(e) => setSettingsForm({...settingsForm, points_to_rupee_rate: parseFloat(e.target.value) || 0})}
                    className="w-full bg-black border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-sm font-mono text-amber-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[11px] text-gray-500 italic">
                  Default: 0.10 means 100 points = ₹10 INR.
                </p>
              </div>

              {/* Minimum Payout */}
              <div className="bg-[#141414] border border-white/10 p-5 rounded-xl space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Minimum Points Required for Payout Redemption
                </label>
                <input
                  type="number"
                  min="1"
                  value={settingsForm.min_redemption_points}
                  onChange={(e) => setSettingsForm({...settingsForm, min_redemption_points: parseInt(e.target.value) || 0})}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-amber-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Time Slots */}
              <div className="bg-[#141414] border border-white/10 p-5 rounded-xl space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Allowed Pickup & Drop-Off Time Slots (Comma Separated)
                </label>
                <input
                  type="text"
                  value={settingsForm.allowed_time_slots}
                  onChange={(e) => setSettingsForm({...settingsForm, allowed_time_slots: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSavingSettings ? "Saving Settings..." : "Save System Settings"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WEIGHING MODAL */}
      {selectedPickup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#141414] border border-white/15 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
              <div>
                <h2 className="text-xl font-extrabold text-white">Weigh Waste & Award Points</h2>
                <p className="text-xs text-amber-500 font-mono mt-1">
                  Request #{selectedPickup.request_number || selectedPickup.id.slice(0,8)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPickup(null)} 
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Enter Net Weight Received (Kilograms)
              </p>

              {categories.map((cat) => (
                <div key={cat.id} className="bg-black/50 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{cat.name_en}</p>
                    <p className="text-xs text-amber-500">{cat.points_per_kg} pts / kg</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      value={weights[cat.id] || 0}
                      onChange={(e) => setWeights({...weights, [cat.id]: parseFloat(e.target.value) || 0})}
                      className="w-28 bg-[#1a1a1a] border border-white/20 rounded-lg px-3 py-2 text-right font-mono text-base font-bold text-amber-500 focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-gray-400 text-sm font-bold">kg</span>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Collector Notes (Optional)
                </label>
                <textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Verification details, bag quality notes..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm h-20 outline-none focus:border-amber-500 transition-colors text-white"
                />
              </div>
            </div>

            <div className="p-6 bg-black/60 border-t border-white/10 flex gap-3">
              <button 
                onClick={() => setSelectedPickup(null)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleProcessWeighing}
                disabled={isSubmittingWeigh}
                className="flex-[2] py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isSubmittingWeigh ? "Calculating..." : (
                  <>
                    <CheckCircle2 size={18} /> Confirm & Award Points
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOCATION MODAL */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#141414] border border-white/15 w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-amber-500 mb-4">
              {editingLocation ? "Edit Drop-Off Hub" : "Add Drop-Off Hub"}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-bold uppercase">Hub Name (English)</label>
                <input
                  type="text"
                  value={locationForm.name_en}
                  onChange={(e) => setLocationForm({...locationForm, name_en: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold uppercase">Hub Name (Kannada - ಕನ್ನಡ)</label>
                <input
                  type="text"
                  value={locationForm.name_kn}
                  onChange={(e) => setLocationForm({...locationForm, name_kn: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold uppercase">Address (English)</label>
                <textarea
                  value={locationForm.address_en}
                  onChange={(e) => setLocationForm({...locationForm, address_en: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none h-16"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold uppercase">Operating Hours</label>
                <input
                  type="text"
                  value={locationForm.operating_hours}
                  onChange={(e) => setLocationForm({...locationForm, operating_hours: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setLocationModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLocation}
                className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 rounded-lg text-xs font-bold shadow-lg"
              >
                Save Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#141414] border border-white/15 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-amber-500 mb-4">
              {editingCategory ? "Edit Waste Category Rate" : "Add Waste Category"}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-bold uppercase">Category Name (English)</label>
                <input
                  type="text"
                  value={categoryForm.name_en}
                  onChange={(e) => setCategoryForm({...categoryForm, name_en: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold uppercase">Category Name (Kannada - ಕನ್ನಡ)</label>
                <input
                  type="text"
                  value={categoryForm.name_kn}
                  onChange={(e) => setCategoryForm({...categoryForm, name_kn: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold uppercase">Points Per Kilogram (pts/kg)</label>
                <input
                  type="number"
                  value={categoryForm.points_per_kg}
                  onChange={(e) => setCategoryForm({...categoryForm, points_per_kg: parseInt(e.target.value) || 0})}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-amber-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 rounded-lg text-xs font-bold shadow-lg"
              >
                Save Category Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}