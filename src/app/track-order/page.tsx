'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Package, 
  Calendar, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Truck,
  Search,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  OrderService, 
  OrderSummary, 
  OrderTrackingRequest, 
  OrderListResponse 
} from '@/lib/orderService';

const TrackOrderPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token, currentPage]);

  const fetchOrders = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const data: OrderListResponse = await OrderService.getOrdersByToken(token, currentPage, 10);

      if (data.success) {
        setOrders(data.data);
        setTotalOrders(data.totalElements);
        setTotalPages(data.totalPages);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const requestTrackingAccess = async () => {
    if (!emailInput.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsRequestingAccess(true);

      const request: OrderTrackingRequest = {
        email: emailInput.trim()
      };

      const response = await OrderService.requestTrackingAccess(request);

      if (response.success) {
        toast.success('Tracking access email sent! Please check your inbox.');
        setEmailInput('');
      } else {
        throw new Error(response.message || 'Failed to send tracking email');
      }
    } catch (err) {
      console.error('Error requesting tracking access:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send tracking email';
      toast.error(errorMessage);
    } finally {
      setIsRequestingAccess(false);
    }
  };

  const viewOrderDetail = (orderId: number) => {
    router.push(`/track-order/${orderId}?token=${encodeURIComponent(token!)}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // If no token, show email request form
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-md shadow-lg p-8">
            <div className="text-center mb-6">
              <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Orders</h1>
              <p className="text-gray-600">
                Enter your email address to receive a secure tracking link
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && requestTrackingAccess()}
                  />
                </div>
              </div>

              <button
                onClick={requestTrackingAccess}
                disabled={isRequestingAccess}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRequestingAccess ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Search className="h-4 w-4" />
                    Get Tracking Access
                  </div>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Enter your email address</li>
                <li>2. Check your inbox for a secure tracking link</li>
                <li>3. Click the link to view all your orders</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">
            {totalOrders > 0 ? `Found ${totalOrders} order${totalOrders !== 1 ? 's' : ''}` : 'No orders found'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Orders</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-md shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                        {order.hasReturnRequest && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            Return Request
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <button
                        onClick={() => viewOrderDetail(order.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-2 text-sm rounded-md ${
                        currentPage === i
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find any orders associated with this tracking token.
            </p>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
