import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Diamond, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex p-5 bg-zinc-800/30 rounded-2xl">
          <Diamond className="w-12 h-12 text-zinc-600" />
        </div>
        <div>
          <h1 className="text-6xl font-bold text-zinc-200 tabular-nums">404</h1>
          <p className="text-zinc-500 mt-2 text-lg">Page not found</p>
        </div>
        <Link to="/">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
