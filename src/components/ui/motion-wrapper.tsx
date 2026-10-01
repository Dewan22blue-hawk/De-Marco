"use client"

import { motion, HTMLMotionProps, type Variants } from "framer-motion"

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
}

export function MotionDiv({ children, ...props }: HTMLMotionProps<"div">) {
  return <motion.div {...props}>{children}</motion.div>
}

export function MotionSection({ children, ...props }: HTMLMotionProps<"section">) {
  return <motion.section {...props}>{children}</motion.section>
}
