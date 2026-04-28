import { useState, useEffect } from 'react';
import { get, put } from '../lib/apiClient';
import { toast } from 'sonner';

const Settings = () => {
  const [exchangeRate, setExchangeRate] = useState<number | ''>('');
  const [currentRate, setCurrentRate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    get('/api/exchange-rate')
      .then((res) => {
        setCurrentRate(res.data);
        setExchangeRate(res.data?.usdToKhr ?? '');
      })
      .catch(() => toast.error('Failed to load exchange rate'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (exchangeRate === '' || Number(exchangeRate) <= 0) {
      toast.error('Please enter a valid exchange rate');
      return;
    }
    try {
      setSaving(true);
      await put('/api/exchange-rate', { usdToKhr: Number(exchangeRate) });
      toast.success('Exchange rate updated');
      const res = await get('/api/exchange-rate');
      setCurrentRate(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update exchange rate');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage application configuration</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Exchange Rate</h2>
          <p className="text-sm text-gray-500 mb-4">Set the USD to KHR (Khmer Riel) conversion rate</p>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {currentRate && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <p>
                    Current rate:{' '}
                    <span className="font-semibold text-gray-900">
                      1 USD = ៛{currentRate.usdToKhr?.toLocaleString()}
                    </span>
                  </p>
                  {currentRate.updatedBy?.name && (
                    <p className="mt-1">
                      Last updated by {currentRate.updatedBy.name} on{' '}
                      {new Date(currentRate.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    USD to KHR Rate
                  </label>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) =>
                      setExchangeRate(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 4100"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
