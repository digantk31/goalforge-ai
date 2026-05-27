import { createBrowserRouter } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { NewGoalPage } from '@/pages/NewGoalPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { WorkflowRunPage } from '@/pages/WorkflowRunPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'new',
        element: <NewGoalPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'run/:goalId',
        element: <WorkflowRunPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
