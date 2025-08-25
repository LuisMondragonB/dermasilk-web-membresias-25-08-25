import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Settings, 
  LogOut, 
  BarChart3,
  UserPlus,
  Crown,
  Shield,
  Home
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import MembershipsSection from '../components/Admin/MembershipsSection';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('memberships');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAuthenticated');
      // Forzar actualización del estado en App.tsx
      window.dispatchEvent(new Event('storage'));
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'memberships',
      name: 'Membresías',
      icon: Crown,
      description: 'Gestionar membresías de clientes'
    },
    {
      id: 'clients',
      name: 'Clientes',
      icon: Users,
      description: 'Base de datos de clientes'
    },
    {
      id: 'rewards',
      name: 'Recompensas',
      icon: Award,
      description: 'Sistema de puntos y recompensas'
    },
    {
      id: 'appointments',
      name: 'Citas',
      icon: Calendar,
      description: 'Programar y gestionar citas'
    },
    {
      id: 'payments',
      name: 'Pagos',
      icon: CreditCard,
      description: 'Control de pagos y facturación'
    },
    {
      id: 'analytics',
      name: 'Reportes',
      icon: BarChart3,
      description: 'Estadísticas y análisis'
    },
    {
      id: 'settings',
      name: 'Configuración',
      icon: Settings,
      description: 'Ajustes del sistema'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'memberships':
        return <MembershipsSection />;
      case 'clients':
        return (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Clientes</h3>
            <p className="text-gray-600">Funcionalidad en desarrollo</p>
          </div>
        );
      case 'rewards':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Recompensas</h2>
              <p className="text-gray-600">Gestiona puntos, transacciones y catálogo de recompensas</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Award className="text-yellow-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Puntos Totales</p>
                    <p className="text-2xl font-bold text-gray-900">12,450</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clientes con Puntos</p>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CreditCard className="text-blue-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Canjes del Mes</p>
                    <p className="text-2xl font-bold text-gray-900">23</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <BarChart3 className="text-purple-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Puntos Canjeados</p>
                    <p className="text-2xl font-bold text-gray-900">3,200</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button className="border-b-2 border-[#37b7ff] text-[#37b7ff] py-4 px-1 text-sm font-medium">
                    Transacciones Recientes
                  </button>
                  <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
                    Catálogo de Recompensas
                  </button>
                  <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
                    Configuración
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {/* Ejemplo de transacciones */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">+</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">María González</p>
                        <p className="text-sm text-gray-500">Referir amiga - Ana López</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+100 pts</p>
                      <p className="text-sm text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold">-</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Carmen Ruiz</p>
                        <p className="text-sm text-gray-500">Canje: Sesión de retoque GRATIS</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">-300 pts</p>
                      <p className="text-sm text-gray-500">Ayer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">+</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Laura Mendoza</p>
                        <p className="text-sm text-gray-500">Reseña 5 estrellas en Google</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+50 pts</p>
                      <p className="text-sm text-gray-500">Hace 3 días</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <button className="text-[#37b7ff] hover:text-[#2da7ef] font-medium">
                    Ver todas las transacciones →
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="font-medium text-gray-900">Otorgar Puntos Manualmente</div>
                    <div className="text-sm text-gray-500">Agregar puntos a un cliente específico</div>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="font-medium text-gray-900">Procesar Canje</div>
                    <div className="text-sm text-gray-500">Canjear puntos por recompensas</div>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="font-medium text-gray-900">Agregar Recompensa</div>
                    <div className="text-sm text-gray-500">Crear nueva recompensa en el catálogo</div>
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recompensas Populares</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">30% descuento nueva zona</span>
                    <span className="text-[#37b7ff] font-medium">200 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">Sesión retoque GRATIS</span>
                    <span className="text-[#37b7ff] font-medium">300 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">Kit productos exclusivos</span>
                    <span className="text-[#37b7ff] font-medium">150 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">Status VIP permanente</span>
                    <span className="text-[#37b7ff] font-medium">500 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'appointments':
        return (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Citas</h3>
            <p className="text-gray-600">Funcionalidad en desarrollo</p>
          </div>
        );
      case 'payments':
        return (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Control de Pagos</h3>
            <p className="text-gray-600">Funcionalidad en desarrollo</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reportes y Análisis</h3>
            <p className="text-gray-600">Funcionalidad en desarrollo</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración</h3>
            <p className="text-gray-600">Funcionalidad en desarrollo</p>
          </div>
        );
      default:
        return <MembershipsSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="p-2 bg-[#37b7ff] rounded-lg mr-3">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900">Derma</span>
                    <span className="text-2xl font-bold text-[#37b7ff]">silk</span>
                    <span className="text-xs font-normal text-gray-500 ml-1">®</span>
                  </div>
                  <div className="text-xs text-gray-500">Panel de Administración</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
              >
                <Home size={20} />
                <span>Ver Sitio</span>
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <LogOut size={16} />
                <span>{loading ? 'Cerrando...' : 'Cerrar Sesión'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-[#37b7ff] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${
                      activeSection === item.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;