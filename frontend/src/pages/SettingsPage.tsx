import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Eye, EyeOff, Key, Database, ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from '@/hooks/useTheme'

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const [showGemini, setShowGemini] = useState(false)
  const [showMongo, setShowMongo] = useState(false)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-zinc-400 mt-1">Manage your GoalForge AI preferences and API keys.</p>
      </div>

      <div className="space-y-6">
        <Card className="glass border-zinc-800/50">
          <CardHeader>
            <h3 className="text-lg font-medium">Appearance</h3>
            <p className="text-sm text-zinc-400">Customize how GoalForge looks on your device.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded-md">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-xs text-zinc-500 capitalize">{theme} mode active</p>
                </div>
              </div>
              <button 
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-700 transition-colors focus:outline-none"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-zinc-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-lg font-medium">API Configuration</h3>
                 <p className="text-sm text-zinc-400">Connect your services to enable autonomous execution.</p>
              </div>
              <Badge variant="success" dot>Connected</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
               <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand-400" /> Gemini API Key
               </label>
               <div className="relative">
                 <Input 
                   type={showGemini ? "text" : "password"} 
                   defaultValue="AIzaSyXXXXXXXXXXXXXXXXXXXX" 
                   className="font-mono bg-zinc-950 pr-10" 
                 />
                 <button onClick={() => setShowGemini(!showGemini)} className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300">
                    {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
               <p className="text-xs text-zinc-500">Required for planning and executing steps.</p>
            </div>

            <div className="space-y-1.5 pt-2">
               <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" /> MongoDB URI
               </label>
               <div className="relative">
                 <Input 
                   type={showMongo ? "text" : "password"} 
                   defaultValue="mongodb+srv://admin:xxxx@cluster0.mongodb.net" 
                   className="font-mono bg-zinc-950 pr-10" 
                 />
                 <button onClick={() => setShowMongo(!showMongo)} className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300">
                    {showMongo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
               <p className="text-xs text-zinc-500">Required for storing goals, state, and history.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-lg text-gradient-brand">GoalForge AI</h3>
              <p className="text-sm text-zinc-400">Version 0.1.0-alpha</p>
              <p className="text-xs text-zinc-500 mt-1">Built for the Google Cloud Rapid Agent Hackathon.</p>
            </div>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors text-sm font-medium">
              <ExternalLink className="w-4 h-4" /> View Source
            </a>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
