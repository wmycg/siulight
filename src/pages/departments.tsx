import { Navigate, useLocation } from 'react-router-dom';
export function DepartmentsPage() {
  const { hash } = useLocation();
  return <Navigate to={`/about${hash || '#departments'}`} replace />;
}
