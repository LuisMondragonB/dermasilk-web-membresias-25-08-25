import React, { useState } from 'react';
import { X, Plus, Trash2, Calculator, User, Phone, Mail, Calendar, CreditCard, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import MembershipCalculator from './MembershipCalculator';

interface MembershipFormProps {
  membership?: Membership | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface Area {
  category: 'grandes' | 'medianas' | 'chicas';
  name: string;
}

const MembershipForm: React.FC<MembershipFormProps> = ({ membership, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [errors, setErrors] = useState({
    phone: '',
    email: '',
    name: ''
  });
  const [formData, setFormData] = useState({
    client_name: membership?.client_name || '',
    client_phone: membership?.client_phone || '',
    client_email: membership?.client_email || '',
    membership_type: membership?.membership_type || 'individual' as 'individual' | 'combo' | 'personalizada',
    plan_name: membership?.plan_name || 'completa' as 'esencial' | 'completa' | 'platinum',
    areas: membership?.areas || [] as Area[],
    monthly_payment: membership?.monthly_payment || 0,
    initial_payment: membership?.initial_payment || 0,
    total_sessions: membership?.total_sessions || 9,
    start_date: membership?.start_date || new Date().toISOString().split('T')[0],
    notes: membership?.notes || ''
  });

  const handleCalculatorChange = (calculation: {
    areas: Area[];
    membershipType: 'individual' | 'personalizada' | 'combo';
    planName: 'esencial' | 'completa' | 'platinum';
    monthlyPayment: number;
    initialPayment: number;
    totalSessions: number;
  }) => {
    setFormData(prev => ({
      ...prev,
      areas: calculation.areas,
      membership_type: calculation.membershipType,
      plan_name: calculation.planName,
      monthly_payment: calculation.monthlyPayment,
      initial_payment: calculation.initialPayment,
      total_sessions: calculation.totalSessions
    }));
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) {
      return 'El teléfono es obligatorio';
    }
    if (!phoneRegex.test(phone)) {
      return 'El teléfono debe tener exactamente 10 dígitos';
    }
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'El email es obligatorio';
    }
    if (!emailRegex.test(email)) {
      return 'Ingresa un email válido';
    }
    return '';
  };

  const validateFullName = (name: string) => {
    if (!name.trim()) {
      return 'El nombre completo es obligatorio';
    }
    
    // Dividir por espacios y filtrar elementos vacíos
    const nameParts = name.trim().split(/\s+/);
    
    if (nameParts.length < 3) {
      return 'Ingresa nombre completo (nombre + 2 apellidos mínimo)';
    }
    
    // Verificar que cada parte tenga al menos 2 caracteres
    for (const part of nameParts) {
      if (part.length < 2) {
        return 'Cada nombre/apellido debe tener al menos 2 caracteres';
      }
    }
    
    return '';
  };
  const handlePhoneChange = (value: string) => {
    // Solo permitir números
    const numericValue = value.replace(/\D/g, '');
    // Limitar a 10 dígitos
    const limitedValue = numericValue.slice(0, 10);
    
    setFormData(prev => ({ ...prev, client_phone: limitedValue }));
    
    const phoneError = validatePhone(limitedValue);
    setErrors(prev => ({ ...prev, phone: phoneError }));
  };

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, client_email: value }));
    
    const emailError = validateEmail(value);
    setErrors(prev => ({ ...prev, email: emailError }));
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, client_name: value }));
    
    const nameError = validateFullName(value);
    setErrors(prev => ({ ...prev, name: nameError }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar antes de enviar
    const phoneError = validatePhone(formData.client_phone);
    const emailError = validateEmail(formData.client_email);
    const nameError = validateFullName(formData.client_name);
    
    setErrors({
      phone: phoneError,
      email: emailError,
      name: nameError
    });
    
    if (phoneError || emailError || nameError) {
      return;
    }
    
    setLoading(true);

    try {
      const membershipData = {
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          client_email: formData.client_email || null,
          membership_type: formData.membership_type,
          plan_name: formData.plan_name,
          areas: formData.areas,
          monthly_payment: formData.monthly_payment,
          initial_payment: formData.initial_payment,
          total_sessions: formData.total_sessions,
          start_date: formData.start_date,
          notes: formData.notes || null
      };

      let error;
      if (membership) {
        // Actualizar membresía existente
        ({ error } = await supabase
          .from('memberships')
          .update(membershipData)
          .eq('id', membership.id));
      } else {
        // Crear nueva membresía
        ({ error } = await supabase.from('memberships').insert([membershipData]));
      }

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating membership:', error);
      alert('Error al crear la membresía');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {membership ? 'Editar Membresía' : 'Nueva Membresía'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Cliente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Información del Cliente
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.client_name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff] ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: María González López"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Nombre + 2 apellidos mínimo</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="text"
                  required
                  value={formData.client_phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff] ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="4433110777"
                  maxLength={10}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Solo números, 10 dígitos</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.client_email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="cliente@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                />
              </div>
            </div>
          </div>

          {/* Tipo de Membresía */}
          {/* Calculadora de Membresías */}
          {!membership && (
            <MembershipCalculator
              onCalculationChange={handleCalculatorChange}
              initialAreas={formData.areas}
              initialPlan={formData.plan_name}
            />
          )}

          {/* Información para edición */}
          {membership && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-blue-100 rounded-full">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Editando membresía existente
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Para mantener un mejor control del progreso, no se pueden modificar las áreas de una membresía existente. 
                    Si el cliente desea agregar una nueva área, crea una nueva membresía separada.
                  </p>
                  
                  {/* Mostrar información actual */}
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Tipo:</span>
                        <span className="ml-2 capitalize">{formData.membership_type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Plan:</span>
                        <span className="ml-2 capitalize">{formData.plan_name}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-blue-800">Áreas:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.areas.map((area, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {area.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información de Precios */}
          {(formData.areas.length > 0 || membership) && (
            <div className="bg-[#37b7ff]/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calculator className="mr-2" size={20} />
                Resumen de Precios
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pago mensual
                  </label>
                  <input
                    type="number"
                    value={formData.monthly_payment}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_payment: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pago inicial
                  </label>
                  <input
                    type="number"
                    value={formData.initial_payment}
                    onChange={(e) => setFormData(prev => ({ ...prev, initial_payment: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total de sesiones
                  </label>
                  <input
                    type="number"
                    value={formData.total_sessions}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_sessions: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#37b7ff] focus:border-[#37b7ff]"
              placeholder="Observaciones, descuentos especiales, etc."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (!membership && formData.areas.length === 0) || errors.phone || errors.email || errors.name}
              className="px-6 py-2 bg-[#37b7ff] text-white rounded-lg hover:bg-[#2da7ef] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>{membership ? 'Actualizar Membresía' : 'Crear Membresía'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembershipForm;