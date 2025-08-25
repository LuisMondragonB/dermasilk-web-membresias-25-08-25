import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Award, Star, Gift, Crown, Sparkles, Users, TrendingUp, Calendar, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RewardItem {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  category: string;
  active: boolean;
  created_at: string;
}

interface RewardTransaction {
  id: string;
  client_id: string;
  points: number;
  transaction_type: 'earned' | 'redeemed';
  reason: string;
  description: string | null;
  created_at: string;
  client?: {
    name: string;
    email: string;
  };
}

const RewardsSection = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    points_required: 0,
    category: 'descuentos',
    active: true
  });

  const categories = [
    { value: 'descuentos', label: 'Descuentos', icon: Star, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'servicios', label: 'Servicios Gratis', icon: Gift, color: 'bg-green-100 text-green-800' },
    { value: 'productos', label: 'Productos', icon: Sparkles, color: 'bg-purple-100 text-purple-800' },
    { value: 'vip', label: 'Beneficios VIP', icon: Crown, color: 'bg-blue-100 text-blue-800' }
  ];

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards_catalog')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards_transactions')
        .select(`
          *,
          clients!inner(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRewards(), fetchTransactions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reward.description && reward.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || reward.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitReward = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const rewardData = {
        name: rewardForm.name,
        description: rewardForm.description || null,
        points_required: rewardForm.points_required,
        category: rewardForm.category,
        active: rewardForm.active
      };

      let error;
      if (selectedReward) {
        ({ error } = await supabase
          .from('rewards_catalog')
          .update(rewardData)
          .eq('id', selectedReward.id));
      } else {
        ({ error } = await supabase
          .from('rewards_catalog')
          .insert([rewardData]));
      }

      if (error) throw error;

      await fetchRewards();
      setShowRewardForm(false);
      setSelectedReward(null);
      setRewardForm({
        name: '',
        description: '',
        points_required: 0,
        category: 'descuentos',
        active: true
      });
    } catch (error) {
      console.error('Error saving reward:', error);
      alert('Error al guardar la recompensa');
    }
  };

  const handleEditReward = (reward: RewardItem) => {
    setSelectedReward(reward);
    setRewardForm({
      name: reward.name,
      description: reward.description || '',
      points_required: reward.points_required,
      category: reward.category,
      active: reward.active
    });
    setShowRewardForm(true);
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta recompensa?')) {
      try {
        const { error } = await supabase
          .from('rewards_catalog')
          .delete()
          .eq('id', rewardId);

        if (error) throw error;
        await fetchRewards();
      } catch (error) {
        console.error('Error deleting reward:', error);
        alert('Error al eliminar la recompensa');
      }
    }
  };

  const toggleRewardStatus = async (rewardId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('rewards_catalog')
        .update({ active: !currentStatus })
        .eq('id', rewardId);

      if (error) throw error;
      await fetchRewards();
    } catch (error) {
      console.error('Error updating reward status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Recompensas</h2>
          <p className="text-gray-600">Gestiona puntos, transacciones y catálogo de recompensas</p>
        </div>
        {activeTab === 'catalog' && (
          <button
            onClick={() => setShowRewardForm(true)}
            className="bg-[#37b7ff] text-white px-4 py-2 rounded-lg hover:bg-[#2da7ef] transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nueva Recompensa</span>
          </button>
        )}
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
              <p className="text-2xl font-bold text-gray-900">
                {transactions
                  .filter(t => t.transaction_type === 'earned')
                  .reduce((sum, t) => sum + t.points, 0) -
                 transactions
                  .filter(t => t.transaction_type === 'redeemed')
                  .reduce((sum, t) => sum + t.points, 0)
                }
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {new Set(transactions.map(t => t.client_id)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Canjes del Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.filter(t => 
                  t.transaction_type === 'redeemed' && 
                  new Date(t.created_at).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Gift className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recompensas Activas</p>
              <p className="text-2xl font-bold text-gray-900">
                {rewards.filter(r => r.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'border-[#37b7ff] text-[#37b7ff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Catálogo de Recompensas
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'border-[#37b7ff] text-[#37b7ff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Transacciones Recientes
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-[#37b7ff] text-[#37b7ff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Configuración
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar recompensas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rewards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => {
                  const categoryInfo = getCategoryInfo(reward.category);
                  return (
                    <div
                      key={reward.id}
                      className={`bg-white border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
                        reward.active ? 'border-gray-200' : 'border-gray-300 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                          {React.createElement(categoryInfo.icon, { size: 24 })}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            reward.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {reward.active ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">{reward.name}</h3>
                      {reward.description && (
                        <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-[#37b7ff]">
                          {reward.points_required} pts
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditReward(reward)}
                          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Edit size={16} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => toggleRewardStatus(reward.id, reward.active)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            reward.active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {reward.active ? 'Pausar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDeleteReward(reward.id)}
                          className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredRewards.length === 0 && (
                <div className="text-center py-12">
                  <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recompensas</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || categoryFilter !== 'all' 
                      ? 'No se encontraron recompensas con los filtros aplicados'
                      : 'Comienza creando tu primera recompensa'
                    }
                  </p>
                  {!searchTerm && categoryFilter === 'all' && (
                    <button
                      onClick={() => setShowRewardForm(true)}
                      className="bg-[#37b7ff] text-white px-4 py-2 rounded-lg hover:bg-[#2da7ef] transition-colors"
                    >
                      Crear Primera Recompensa
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Puntos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Razón
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.client?.name || 'Cliente no encontrado'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.client?.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.transaction_type === 'earned'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.transaction_type === 'earned' ? 'Ganados' : 'Canjeados'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${
                            transaction.transaction_type === 'earned'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'earned' ? '+' : '-'}{transaction.points} pts
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{transaction.reason}</div>
                          {transaction.description && (
                            <div className="text-sm text-gray-500">{transaction.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
                  <p className="text-gray-600">Las transacciones de puntos aparecerán aquí</p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Formas de Ganar Puntos</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Referir amigas</span>
                      <span className="font-bold text-[#37b7ff]">+100 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Reseñas 5 estrellas</span>
                      <span className="font-bold text-[#37b7ff]">+50 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Fotos antes/después</span>
                      <span className="font-bold text-[#37b7ff]">+40 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Completar membresía</span>
                      <span className="font-bold text-[#37b7ff]">+200 pts</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                      <div className="font-medium text-gray-900">Otorgar Puntos Manualmente</div>
                      <div className="text-sm text-gray-500">Agregar puntos a un cliente específico</div>
                    </button>
                    <button className="w-full text-left p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                      <div className="font-medium text-gray-900">Procesar Canje</div>
                      <div className="text-sm text-gray-500">Canjear puntos por recompensas</div>
                    </button>
                    <button className="w-full text-left p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                      <div className="font-medium text-gray-900">Historial de Cliente</div>
                      <div className="text-sm text-gray-500">Ver puntos y transacciones por cliente</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reward Form Modal */}
      {showRewardForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedReward ? 'Editar Recompensa' : 'Nueva Recompensa'}
              </h2>
              <button
                onClick={() => {
                  setShowRewardForm(false);
                  setSelectedReward(null);
                  setRewardForm({
                    name: '',
                    description: '',
                    points_required: 0,
                    category: 'descuentos',
                    active: true
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitReward} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la recompensa *
                  </label>
                  <input
                    type="text"
                    required
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                    placeholder="Ej: 30% descuento en nueva zona"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puntos requeridos *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={rewardForm.points_required}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, points_required: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                    placeholder="200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                  placeholder="Descripción detallada de la recompensa..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={rewardForm.category}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={rewardForm.active.toString()}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, active: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowRewardForm(false);
                    setSelectedReward(null);
                    setRewardForm({
                      name: '',
                      description: '',
                      points_required: 0,
                      category: 'descuentos',
                      active: true
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#37b7ff] text-white rounded-lg hover:bg-[#2da7ef] transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>{selectedReward ? 'Actualizar' : 'Crear'} Recompensa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsSection;
  );
};

export default RewardsSection;