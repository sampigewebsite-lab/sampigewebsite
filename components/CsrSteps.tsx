'use client'

import React, { useState, useEffect } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Step {
  title: string
  description: string
  image?: string
}

export interface CsrStepsProps {
  steps: Step[]
  activityTitle?: string
}

export default function CsrSteps({ steps, activityTitle }: CsrStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [steps, activityTitle])

  if (!steps || steps.length === 0) return null

  const activeStep = steps[activeIndex] || steps[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── LEFT: Interactive Step Cards ── */}
      <div className="lg:col-span-5 space-y-4">
        {steps.map((step, idx) => {
          const isActive = activeIndex === idx
          return (
            <motion.div
              key={`${step.title}-${idx}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => setActiveIndex(idx)}
              whileHover={{ scale: 1.02, x: 6 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`rounded-2xl p-6 border transition-colors duration-300 cursor-pointer flex gap-5 relative overflow-hidden ${
                isActive
                  ? 'bg-[#1A1A1A] border-gold-500/60 shadow-[0_0_25px_rgba(255,179,0,0.18)]'
                  : 'bg-[#0A0A0A] border-gray-800/80 opacity-75 hover:opacity-100 hover:border-gray-700'
              }`}
            >
              {/* Active Sliding Gold Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeStepGlow"
                  className="absolute left-0 top-0 bottom-0 w-1.5 bg-gold-500 shadow-[0_0_12px_#FFB300]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-extrabold text-base transition-all duration-300 ${
                  isActive
                    ? 'bg-gold-500 text-black shadow-md shadow-gold-500/40'
                    : 'bg-gold-500/10 border border-gold-500/30 text-gold-500'
                }`}
              >
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className={`font-bold text-lg mb-1.5 transition-colors duration-300 ${
                    isActive ? 'text-gold-500' : 'text-white'
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-[#B0B0B0] text-sm md:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── RIGHT: Animated Image Stage ── */}
      <div className="lg:col-span-7 lg:sticky lg:top-28">
        <motion.div 
          className="rounded-3xl overflow-hidden aspect-[16/10] border-2 border-gold-500/30 bg-[#0A0A0A] relative shadow-[0_15px_50px_rgba(0,0,0,0.85)] group cursor-pointer"
          whileHover={{ borderColor: 'rgba(255, 179, 0, 0.6)' }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {activeStep?.image ? (
              <motion.div
                key={`img-${activeIndex}-${activeStep.image}`}
                initial={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#050505]"
              >
                <img
                  src={activeStep.image}
                  alt={activeStep.title || activityTitle || 'CSR activity step'}
                  className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#111] to-black"
              >
                <div className="w-20 h-20 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4">
                  <ImageIcon className="w-10 h-10 text-gold-500/60" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">
                  {activeStep?.title || 'Step Preview'}
                </h4>
                <p className="text-[#B0B0B0] text-sm max-w-sm">
                  No photo uploaded for this step yet. Upload one in Admin → CSR → Activities.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Overlay Caption Bar */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`caption-${activeIndex}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-6 pt-16 pointer-events-none z-10"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-gold-500 text-black text-sm font-extrabold flex items-center justify-center shrink-0 shadow-lg shadow-gold-500/30">
                  {activeIndex + 1}
                </span>
                <span className="text-white text-base md:text-lg font-bold truncate">
                  {activeStep?.title}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Animated Dot Pills */}
        <div className="flex items-center justify-center gap-2.5 mt-5">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="relative p-1 focus:outline-none"
              aria-label={`Go to step ${idx + 1}`}
            >
              <motion.div
                className="h-2 rounded-full"
                animate={{
                  width: activeIndex === idx ? 32 : 8,
                  backgroundColor: activeIndex === idx ? '#FFB300' : '#374151',
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export { CsrSteps }