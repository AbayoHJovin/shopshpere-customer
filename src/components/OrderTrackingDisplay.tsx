import React from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface OrderTrackingDisplayProps {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    items: Array<{
      id: number;
      quantity: number;
      price: number;
      totalPrice: number;
      product: {
        id: string;
        name: string;
        images?: string[];
      };
      variant?: {
        id: number;
        name: string;
        images?: string[];
      };
    }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      latitude?: number;
      longitude?: number;
    };
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    total: number;
    createdAt: string;
  };
}

const OrderTrackingDisplay: React.FC<OrderTrackingDisplayProps> = ({ order }) => {
  const { shippingAddress } = order;
  const hasCoordinates = shippingAddress.latitude && shippingAddress.longitude;

  const formatAddress = () => {
    return `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country}`;
  };

  const getGoogleMapsUrl = () => {
    if (hasCoordinates) {
      return `https://www.google.com/maps?q=${shippingAddress.latitude},${shippingAddress.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress())}`;
  };

  const getDirectionsUrl = () => {
    if (hasCoordinates) {
      return `https://www.google.com/maps/dir/?api=1&destination=${shippingAddress.latitude},${shippingAddress.longitude}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatAddress())}`;
  };

  const getEmbedMapUrl = () => {
    if (hasCoordinates) {
      return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${shippingAddress.latitude},${shippingAddress.longitude}&zoom=15`;
    }
    return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(formatAddress())}&zoom=15`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-md shadow-lg">
      {/* Order Header */}
      <div className="border-b pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.orderNumber}</h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status}
          </span>
          <span className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <p><strong>Name:</strong> {order.customerInfo.name}</p>
          <p><strong>Email:</strong> {order.customerInfo.email}</p>
          <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-md">
              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                {(item.variant?.images?.[0] || item.product.images?.[0]) ? (
                  <img
                    src={item.variant?.images?.[0] || item.product.images?.[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{item.product.name}</h3>
                {item.variant && (
                  <p className="text-gray-600">Variant: {item.variant.name}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-gray-600">Qty: {item.quantity}</span>
                  <span className="text-gray-600">Price: ${item.price.toFixed(2)}</span>
                  <span className="font-semibold">Total: ${item.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Total */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Order Total:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address with Google Maps */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Address
        </h2>
        
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p className="font-medium">{formatAddress()}</p>
          {hasCoordinates && (
            <p className="text-sm text-gray-600 mt-1">
              Coordinates: {shippingAddress.latitude}, {shippingAddress.longitude}
            </p>
          )}
        </div>

        {/* Google Maps Integration */}
        <div className="space-y-4">
          {/* Embedded Map */}
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
            <div className="relative w-full h-64 rounded-md overflow-hidden border">
              <iframe
                src={getEmbedMapUrl()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Delivery Location"
              />
            </div>
          )}

          {/* Map Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <a
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Maps
            </a>
            
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </a>
          </div>

          {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                <strong>Note:</strong> Google Maps API key is not configured. Map display is limited.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingDisplay;
