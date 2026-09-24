export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative z-50">
      {/* Gold Loading Spinner */}
      <div className="w-12 h-12 border-4 border-[#FFB300]/20 border-t-[#FFB300] rounded-full animate-spin mb-4" />
      <p className="text-[#FFB300] font-semibold text-xs tracking-widest uppercase animate-pulse">
        Loading Sampige...
      </p>
    </div>
  )
}