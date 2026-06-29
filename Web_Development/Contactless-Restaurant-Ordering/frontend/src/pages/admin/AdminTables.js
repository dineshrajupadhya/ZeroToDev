import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiPlus, FiPrinter, FiEdit2, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: '', section: '' });
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get('/qr/tables');
      setTables(response.data.tables || response.data || []);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTable = async (e) => {
    e.preventDefault();
    try {
      await api.post('/qr/table/generate', {
        tableId: parseInt(newTable.tableNumber),
      });
      toast.success('Table generated successfully');
      setShowGenerateModal(false);
      setNewTable({ tableNumber: '', capacity: '', section: '' });
      fetchTables();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate table';
      toast.error(message);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTable) return;
    try {
      await api.put(`/qr/tables/${selectedTable.id}/status`, { status: newStatus });
      toast.success('Table status updated');
      setShowStatusModal(false);
      setSelectedTable(null);
      fetchTables();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
    }
  };

  const openStatusModal = (table) => {
    setSelectedTable(table);
    setNewStatus(table.status || 'available');
    setShowStatusModal(true);
  };

  const getQRUrl = (tableNumber) => {
    return `${window.location.origin}/scan?table=${tableNumber}`;
  };

  const handlePrint = (tableNumber) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Table ${tableNumber} QR Code</title></head>
        <body style="text-align:center; padding:50px;">
          <h1>Table ${tableNumber}</h1>
          <div id="qr"></div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
          <script>
            QRCode.toCanvas(document.createElement('canvas'), '${getQRUrl(tableNumber)}', {width: 300}, function(err, canvas) {
              if(err) return console.error(err);
              document.getElementById('qr').appendChild(canvas);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    reserved: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary-900">Tables & QR Codes</h2>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiPlus />
          <span>Generate Table</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-6 bg-secondary-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div key={table.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary-900">Table {table.table_number}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[table.status] || 'bg-gray-100 text-gray-800'}`}>
                  {table.status?.charAt(0).toUpperCase() + table.status?.slice(1) || 'Available'}
                </span>
              </div>
              <div className="text-sm text-secondary-600 space-y-1 mb-4">
                <p>Capacity: {table.capacity || 'N/A'} people</p>
                <p>Section: {table.section || 'N/A'}</p>
              </div>
              <div className="flex justify-center mb-4 p-4 bg-white border-2 border-secondary-200 rounded-lg">
                <QRCodeSVG value={getQRUrl(table.table_number)} size={150} />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePrint(table.table_number)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  <FiPrinter />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => openStatusModal(table)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  <FiEdit2 />
                  <span>Status</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowGenerateModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Generate New Table</h3>
                <button onClick={() => setShowGenerateModal(false)} className="text-secondary-400 hover:text-secondary-600">
                  <FiPlus className="text-xl" />
                </button>
              </div>
              <form onSubmit={handleGenerateTable} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Table Number</label>
                  <input
                    type="number"
                    value={newTable.tableNumber}
                    onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="e.g. 4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={newTable.section}
                    onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="e.g. Indoor, Outdoor"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && selectedTable && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowStatusModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Update Table {selectedTable.table_number} Status</h3>
                <button onClick={() => setShowStatusModal(false)} className="text-secondary-400 hover:text-secondary-600">
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
                  <div className="space-y-2">
                    {['available', 'occupied', 'reserved'].map((status) => (
                      <label key={status} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-secondary-50">
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={newStatus === status}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="text-primary-500 focus:ring-primary-500"
                        />
                        <span className="capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTables;
