import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, CreditCard, User, Phone, X, Lock, FileText, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import MembershipForm from './MembershipForm';

interface Membership {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  membership_type: 'individual' | 'combo' | 'personalizada';
  plan_name: 'esencial' | 'completa' | 'platinum';
  areas: Array<{ category: string; name: string }>;
  monthly_payment: number;
  initial_payment: number;
  total_sessions: number;
  completed_sessions: number;
  start_date: string;
  end_date: string | null;
  status: 'activa' | 'pausada' | 'completada' | 'cancelada';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const MembershipsSection = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [membershipToEdit, setMembershipToEdit] = useState<Membership | null>(null);
  const [membershipToDelete, setMembershipToDelete] = useState<Membership | null>(null);
  const [actionType, setActionType] = useState<'edit' | 'delete'>('edit');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [membershipForNotes, setMembershipForNotes] = useState<Membership | null>(null);

  const fetchMemberships = async () => {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemberships(data || []);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
    
    // Verificar si hay un bloqueo activo al cargar
    const savedBlockEndTime = localStorage.getItem('pinBlockEndTime');
    if (savedBlockEndTime) {
      const endTime = parseInt(savedBlockEndTime);
      const now = Date.now();
      if (now < endTime) {
        setIsBlocked(true);
        setBlockEndTime(endTime);
        setRemainingTime(Math.ceil((endTime - now) / 1000));
      } else {
        localStorage.removeItem('pinBlockEndTime');
        localStorage.removeItem('pinAttempts');
      }
    }
    
    // Recuperar intentos guardados
    const savedAttempts = localStorage.getItem('pinAttempts');
    if (savedAttempts) {
      setPinAttempts(parseInt(savedAttempts));
    }
  }, []);

  // Timer para el bloqueo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBlocked && blockEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((blockEndTime - now) / 1000);
        
        if (remaining <= 0) {
          setIsBlocked(false);
          setBlockEndTime(null);
          setPinAttempts(0);
          setRemainingTime(0);
          localStorage.removeItem('pinBlockEndTime');
          localStorage.removeItem('pinAttempts');
        } else {
          setRemainingTime(remaining);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBlocked, blockEndTime]);

  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = membership.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         membership.client_phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || membership.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activa': return 'bg-green-100 text-green-800';
      case 'pausada': return 'bg-yellow-100 text-yellow-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'esencial': return 'bg-blue-100 text-blue-800';
      case 'completa': return 'bg-purple-100 text-purple-800';
      case 'platinum': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const handleViewMembership = (membership: Membership) => {
    setSelectedMembership(membership);
    setShowDetails(true);
  };

  const handleEditMembership = (membership: Membership) => {
    if (isBlocked) {
      alert(`Acceso bloqueado. Intenta nuevamente en ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')} minutos.`);
      return;
    }
    
    setMembershipToEdit(membership);
    setActionType('edit');
    setShowPinModal(true);
    setPinInput('');
    setPinError('');
  };

  const handleDeleteMembership = (membership: Membership) => {
    if (isBlocked) {
      alert(`Acceso bloqueado. Intenta nuevamente en ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')} minutos.`);
      return;
    }
    
    setMembershipToDelete(membership);
    setActionType('delete');
    setShowPinModal(true);
    setPinInput('');
    setPinError('');
  };

  const handlePinSubmit = () => {
    if (isBlocked) {
      return;
    }
    
    const correctPin = '9103784';
    
    if (pinInput === correctPin) {
      // PIN correcto - resetear intentos
      setPinAttempts(0);
      localStorage.removeItem('pinAttempts');
      
      if (actionType === 'edit') {
        setSelectedMembership(membershipToEdit);
        setShowForm(true);
        setMembershipToEdit(null);
      } else if (actionType === 'delete') {
        confirmDelete();
        setMembershipToDelete(null);
      }
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);
      localStorage.setItem('pinAttempts', newAttempts.toString());
      
      if (newAttempts >= 3) {
        // Bloquear por 15 minutos
        const blockEnd = Date.now() + (15 * 60 * 1000);
        setIsBlocked(true);
        setBlockEndTime(blockEnd);
        setRemainingTime(15 * 60);
        localStorage.setItem('pinBlockEndTime', blockEnd.toString());
        
        setPinError('Demasiados intentos fallidos. Acceso bloqueado por 15 minutos.');
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          handlePinCancel();
        }, 2000);
      } else {
        const remainingAttempts = 3 - newAttempts;
        setPinError(`PIN incorrecto. Te quedan ${remainingAttempts} intento${remainingAttempts !== 1 ? 's' : ''}.`);
      }
      
      setPinInput('');
    }
  };

  const handlePinCancel = () => {
    setShowPinModal(false);
    setPinInput('');
    setPinError('');
    setMembershipToEdit(null);
    setMembershipToDelete(null);
  };

  const confirmDelete = async () => {
    if (!membershipToDelete) return;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar la membresía de ${membershipToDelete.client_name}?`)) {
      try {
        const { error } = await supabase
          .from('memberships')
          .delete()
          .eq('id', membershipToDelete.id);

        if (error) throw error;
        
        await fetchMemberships();
        alert('Membresía eliminada correctamente');
      } catch (error) {
        console.error('Error deleting membership:', error);
        alert('Error al eliminar la membresía');
      }
    }
  };

  const handleNotesClick = (membership: Membership) => {
    setMembershipForNotes(membership);
    setNotesText(membership.notes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = async () => {
    if (!membershipForNotes) return;
    
    try {
      const { error } = await supabase
        .from('memberships')
        .update({ notes: notesText || null })
        .eq('id', membershipForNotes.id);

      if (error) throw error;
      
      await fetchMemberships();
      setShowNotesModal(false);
      setMembershipForNotes(null);
      setNotesText('');
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Error al guardar las notas');
    }
  };

  const handleCancelNotes = () => {
    setShowNotesModal(false);
    setMembershipForNotes(null);
    setNotesText('');
  };

  const exportToCSV = () => {
    // Preparar los datos para exportar
    const csvData = filteredMemberships.map(membership => ({
      'Nombre del Cliente': membership.client_name,
      'Teléfono': membership.client_phone,
      'Email': membership.client_email || '',
      'Tipo de Membresía': membership.membership_type,
      'Plan': membership.plan_name,
      'Áreas': membership.areas.map(area => area.name).join('; '),
      'Pago Mensual': `$${membership.monthly_payment}`,
      'Pago Inicial': `$${membership.initial_payment}`,
      'Total de Sesiones': membership.total_sessions,
      'Sesiones Completadas': membership.completed_sessions,
      'Progreso (%)': Math.round((membership.completed_sessions / membership.total_sessions) * 100),
      'Estado': membership.status,
      'Fecha de Inicio': new Date(membership.start_date).toLocaleDateString('es-MX'),
      'Fecha de Creación': new Date(membership.created_at).toLocaleDateString('es-MX'),
      'Notas': membership.notes || ''
    }));

    // Convertir a CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
          if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Crear y descargar el archivo
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `membresias_dermasilk_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const updateMembershipStatus = async (membershipId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('memberships')
        .update({ status: newStatus })
        .eq('id', membershipId);

      if (error) throw error;
      
      await fetchMemberships();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37b7ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Membresías</h2>
          <p className="text-gray-600">Gestiona las membresías de tus clientes</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            disabled={filteredMemberships.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exportar datos a Excel"
          >
            <Download size={20} />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#37b7ff] text-white px-4 py-2 rounded-lg hover:bg-[#2da7ef] transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nueva Membresía</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <User className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Membresías</p>
              <p className="text-2xl font-bold text-gray-900">{memberships.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-gray-900">
                {memberships.filter(m => m.status === 'activa').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <CreditCard className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  memberships
                    .filter(m => m.status === 'activa')
                    .reduce((sum, m) => sum + m.monthly_payment, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Phone className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {memberships.filter(m => m.status === 'completada').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#37b7ff] focus:border-[#37b7ff]"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#37b7ff] focus:border-[#37b7ff]"
            >
              <option value="all">Todos los estados</option>
              <option value="activa">Activas</option>
              <option value="pausada">Pausadas</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Memberships Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membresía
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago Mensual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMemberships.map((membership) => (
                <tr key={membership.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {membership.client_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {membership.client_phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(membership.plan_name)}`}>
                        {membership.plan_name}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        {membership.areas.map(area => area.name).join(', ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {membership.completed_sessions}/{membership.total_sessions} sesiones
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-[#37b7ff] h-2 rounded-full"
                          style={{
                            width: `${getProgressPercentage(membership.completed_sessions, membership.total_sessions)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(membership.monthly_payment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(membership.status)}`}>
                      {membership.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(membership.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewMembership(membership)}
                        className="text-[#37b7ff] hover:text-[#2da7ef] transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleNotesClick(membership)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Notas"
                      >
                        <FileText size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditMembership(membership)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMembership(membership)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMemberships.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron membresías con los filtros aplicados'
                : 'No hay membresías registradas'
              }
            </div>
          </div>
        )}
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Lock className="mr-2 text-[#37b7ff]" size={20} />
                {actionType === 'edit' ? 'Editar Membresía' : 'Eliminar Membresía'}
              </h2>
              <button
                onClick={handlePinCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#37b7ff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="text-[#37b7ff]" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ingresa el PIN de administrador
                </h3>
                <p className="text-gray-600 text-sm">
                  {actionType === 'edit' 
                    ? 'Se requiere autorización para editar membresías'
                    : 'Se requiere autorización para eliminar membresías'
                  }
                </p>
              </div>

              <div className="space-y-4">
                {isBlocked && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <Lock className="text-white" size={16} />
                      </div>
                      <div>
                        <p className="text-red-800 font-medium">Acceso bloqueado</p>
                        <p className="text-red-600 text-sm">
                          Tiempo restante: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => {
                      if (isBlocked) return;
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isBlocked) {
                        handlePinSubmit();
                      }
                    }}
                    className={`w-full px-4 py-3 text-center text-2xl font-mono border rounded-lg focus:ring-[#37b7ff] focus:border-[#37b7ff] ${
                      pinError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                    maxLength={7}
                    autoFocus
                    disabled={isBlocked}
                  />
                  {pinError && (
                    <p className={`mt-2 text-sm text-center ${
                      pinError.includes('bloqueado') ? 'text-red-700 font-medium' : 'text-red-600'
                    }`}>
                      {pinError}
                    </p>
                  )}
                  
                  {!isBlocked && pinAttempts > 0 && (
                    <div className="mt-2 text-center">
                      <div className="flex justify-center space-x-1">
                        {[1, 2, 3].map((attempt) => (
                          <div
                            key={attempt}
                            className={`w-3 h-3 rounded-full ${
                              attempt <= pinAttempts ? 'bg-red-500' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Intentos utilizados: {pinAttempts}/3
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handlePinCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePinSubmit}
                    disabled={!pinInput || isBlocked}
                    className="flex-1 px-4 py-2 bg-[#37b7ff] text-white rounded-lg hover:bg-[#2da7ef] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBlocked ? 'Bloqueado' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && membershipForNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="mr-2 text-green-600" size={20} />
                Notas - {membershipForNotes.client_name}
              </h2>
              <button
                onClick={handleCancelNotes}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Cliente:</span>
                    <p className="text-gray-900">{membershipForNotes.client_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Teléfono:</span>
                    <p className="text-gray-900">{membershipForNotes.client_phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Plan:</span>
                    <p className="text-gray-900 capitalize">{membershipForNotes.plan_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Estado:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(membershipForNotes.status)}`}>
                      {membershipForNotes.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas y Observaciones
                  </label>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#37b7ff] focus:border-[#37b7ff] resize-none"
                    placeholder="Escribe aquí comentarios, observaciones, adeudos, recordatorios, etc.&#10;&#10;Ejemplos:&#10;• Debe $500 de la sesión anterior&#10;• Prefiere citas por la mañana&#10;• Alérgica a ciertos productos&#10;• Cliente VIP - descuento especial&#10;• Próxima cita: [fecha]"
                  />
                </div>
                
                <div className="text-sm text-gray-500">
                  <p className="font-medium mb-1">💡 Sugerencias de uso:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Adeudos pendientes y pagos realizados</li>
                    <li>Preferencias de horarios o tratamientos</li>
                    <li>Alergias o condiciones especiales</li>
                    <li>Descuentos aplicados o promociones</li>
                    <li>Recordatorios para próximas sesiones</li>
                    <li>Observaciones del progreso del tratamiento</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelNotes}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <FileText size={16} />
                  <span>Guardar Notas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Membership Form Modal */}
      {showForm && (
        <MembershipForm
          membership={selectedMembership}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchMemberships();
            setSelectedMembership(null);
          }}
        />
      )}

      {/* Membership Details Modal */}
      {showDetails && selectedMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Detalles de Membresía</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Cliente</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-gray-900">{selectedMembership.client_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="text-gray-900">{selectedMembership.client_phone}</p>
                  </div>
                  {selectedMembership.client_email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedMembership.client_email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Membresía */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalles de Membresía</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="text-gray-900 capitalize">{selectedMembership.membership_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan</label>
                    <p className="text-gray-900 capitalize">{selectedMembership.plan_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pago Mensual</label>
                    <p className="text-gray-900">{formatCurrency(selectedMembership.monthly_payment)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pago Inicial</label>
                    <p className="text-gray-900">{formatCurrency(selectedMembership.initial_payment)}</p>
                  </div>
                </div>
              </div>

              {/* Áreas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Áreas de Tratamiento</label>
                <div className="flex flex-wrap gap-2">
                  {selectedMembership.areas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#37b7ff] text-white rounded-full text-sm"
                    >
                      {area.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progreso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Progreso</label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{selectedMembership.completed_sessions} de {selectedMembership.total_sessions} sesiones</span>
                    <span>{getProgressPercentage(selectedMembership.completed_sessions, selectedMembership.total_sessions)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#37b7ff] h-2 rounded-full"
                      style={{
                        width: `${getProgressPercentage(selectedMembership.completed_sessions, selectedMembership.total_sessions)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={selectedMembership.status}
                  onChange={(e) => updateMembershipStatus(selectedMembership.id, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                >
                  <option value="activa">Activa</option>
                  <option value="pausada">Pausada</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Fechas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Fechas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                    <p className="text-gray-900">{formatDate(selectedMembership.start_date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Creada</label>
                    <p className="text-gray-900">{formatDate(selectedMembership.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {selectedMembership.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedMembership.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipsSection;