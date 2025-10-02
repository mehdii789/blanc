import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

const ClientLoginPage: React.FC = () => {
  const { clientAccess, customers, updateClientAccess } = useApp();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulation d'une vérification d'accès
    setTimeout(() => {
      const foundAccess = clientAccess.find(
        access => access.accessCode === accessCode.toUpperCase() && access.isActive
      );

      if (foundAccess) {
        const customer = customers.find(c => c.id === foundAccess.customerId);
        if (customer) {
          // Stocker les informations de session
          sessionStorage.setItem('clientAccess', JSON.stringify(foundAccess));
          sessionStorage.setItem('clientCustomer', JSON.stringify(customer));
          
          // Mettre à jour la dernière connexion via le contexte
          updateClientAccess({ ...foundAccess, lastLogin: new Date() });
          
          navigate('/client-portal');
        } else {
          setError('Client non trouvé');
        }
      } else {
        setError('Code d\'accès invalide ou inactif');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Portail Client Blanchisserie
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accédez à votre espace personnel avec votre code d'accès
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <div>
              <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-2">
                Code d'accès
              </label>
              <input
                id="access-code"
                name="access-code"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Entrez votre code d'accès"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading || !accessCode.trim()}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Codes d'accès de démonstration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Jean Dupont:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">JEAN2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Marie Martin:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">MARIE789</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Robert Bernard:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">ROBERT456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLoginPage;
