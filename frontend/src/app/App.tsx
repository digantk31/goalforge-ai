import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Providers } from './Providers'
import { SplashScreen } from '@/components/ui/SplashScreen'

export default function App() {
  return (
    <Providers>
      <SplashScreen>
        <RouterProvider router={router} />
      </SplashScreen>
    </Providers>
  )
}
