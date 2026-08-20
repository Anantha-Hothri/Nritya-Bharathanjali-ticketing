import AdminLayoutClient from '../../components/AdminLayoutClient';

export const metadata = {
  title: 'Admin Control Panel | Nritya Bharathanjali 2026',
  description: 'Organizers and Inventory Management Portal for Skanda 2026',
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
