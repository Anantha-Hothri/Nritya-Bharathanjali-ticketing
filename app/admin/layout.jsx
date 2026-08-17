import AdminNavbar from '../../components/AdminNavbar';

export const metadata = {
  title: 'Admin Control Panel | Nritya Bharathanjali 2026',
  description: 'Organizers and Inventory Management Portal for Skanda 2026',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <AdminNavbar />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
