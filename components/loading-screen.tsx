"use client"

import { motion } from "framer-motion"
import { Building2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="relative"
        >
          <motion.div
            animate={{
              boxShadow: ["0 0 0 0 rgba(249, 115, 22, 0.4)", "0 0 0 20px rgba(249, 115, 22, 0)"],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600"
          >
            <Building2 className="h-10 w-10 text-white" />
          </motion.div>
        </motion.div>

        {/* Company Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900">CorporateHub</h2>
          <p className="text-sm text-gray-500">Loading your workspace...</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-48 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }}
            className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
          />
        </div>

        {/* Loading Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
              className="h-2 w-2 rounded-full bg-orange-500"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
