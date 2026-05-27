import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Providers } from './Providers'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { ToastContainer } from '@/components/ui/Toast'

export default function App() {
  return (
    <Providers>
      <SplashScreen>
        <RouterProvider router={router} />
      </SplashScreen>
      <ToastContainer />
    </Providers>
  )
}
