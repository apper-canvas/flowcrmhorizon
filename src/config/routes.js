import Dashboard from '@/components/pages/Dashboard';
import Contacts from '@/components/pages/Contacts';
import Companies from '@/components/pages/Companies';
import Leads from '@/components/pages/Leads';
import Tasks from '@/components/pages/Tasks';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  contacts: {
    id: 'contacts',
    label: 'Contacts',
    path: '/contacts',
    icon: 'Users',
    component: Contacts
  },
  companies: {
    id: 'companies',
    label: 'Companies',
    path: '/companies',
    icon: 'Building2',
    component: Companies
  },
  leads: {
    id: 'leads',
    label: 'Leads',
    path: '/leads',
    icon: 'TrendingUp',
    component: Leads
  },
  tasks: {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: 'CheckSquare',
    component: Tasks
  }
};

export const routeArray = Object.values(routes);