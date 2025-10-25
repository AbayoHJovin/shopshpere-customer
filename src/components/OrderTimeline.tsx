"use client";

import React, { useState } from "react";
import { format } from "date-fns";

interface OrderActivity {
  id: number;
  orderId: number;
  activityType: string;
  title: string;
  description: string;
  timestamp: string;
  actorType: string;
  actorId: string | null;
  actorName: string | null;
  metadata: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
}

interface OrderTimelineProps {
  activities: OrderActivity[];
}

// Color mapping for different activity types
const getActivityColor = (activityType: string): string => {
  const colorMap: Record<string, string> = {
    // Order Creation (Green)
    ORDER_PLACED: "#10B981",
    PAYMENT_COMPLETED: "#10B981",
    ORDER_CONFIRMED: "#10B981",
    
    // Processing (Blue)
    ORDER_PROCESSING: "#3B82F6",
    READY_FOR_DELIVERY: "#3B82F6",
    
    // Delivery Setup (Purple)
    ADDED_TO_DELIVERY_GROUP: "#8B5CF6",
    REMOVED_FROM_DELIVERY_GROUP: "#8B5CF6",
    DELIVERY_AGENT_ASSIGNED: "#8B5CF6",
    DELIVERY_AGENT_CHANGED: "#8B5CF6",
    
    // In Transit (Amber)
    DELIVERY_STARTED: "#F59E0B",
    OUT_FOR_DELIVERY: "#F59E0B",
    
    // Notes (Gray)
    DELIVERY_NOTE_ADDED: "#6B7280",
    ADMIN_NOTE_ADDED: "#6B7280",
    CUSTOMER_NOTE_ADDED: "#6B7280",
    
    // Success (Emerald)
    DELIVERY_COMPLETED: "#059669",
    
    // Customer Actions (Red)
    RETURN_REQUESTED: "#EF4444",
    APPEAL_SUBMITTED: "#EF4444",
    
    // Approvals (Green)
    RETURN_APPROVED: "#10B981",
    APPEAL_APPROVED: "#10B981",
    
    // Denials (Dark Red)
    RETURN_DENIED: "#DC2626",
    APPEAL_DENIED: "#DC2626",
    
    // Financial (Teal)
    REFUND_INITIATED: "#14B8A6",
    REFUND_COMPLETED: "#14B8A6",
    
    // Failures (Crimson)
    ORDER_CANCELLED: "#991B1B",
    DELIVERY_FAILED: "#991B1B",
    PAYMENT_FAILED: "#991B1B",
  };
  
  return colorMap[activityType] || "#6B7280"; // Default gray
};

const OrderTimeline: React.FC<OrderTimelineProps> = ({ activities }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Timeline</h2>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-center font-medium">No activity recorded for this order yet</p>
          <p className="text-gray-400 text-sm text-center mt-1">Activity will appear here as your order progresses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Order Timeline</h2>
      
      {/* Timeline Container */}
      <div className="relative">
        {/* Horizontal Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300" style={{ zIndex: 0 }} />
        
        {/* Activity Points */}
        <div className="relative flex justify-between items-start" style={{ minHeight: "120px" }}>
          {activities.map((activity, index) => {
            const color = getActivityColor(activity.activityType);
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={activity.id}
                className="relative flex flex-col items-center"
                style={{ 
                  flex: 1,
                  maxWidth: `${100 / activities.length}%`,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Activity Point (Circle) */}
                <div
                  className="relative rounded-full cursor-pointer transition-all duration-200 z-10"
                  style={{
                    width: isHovered ? "20px" : "16px",
                    height: isHovered ? "20px" : "16px",
                    backgroundColor: color,
                    border: `3px solid white`,
                    boxShadow: isHovered 
                      ? `0 0 0 4px ${color}33, 0 4px 6px rgba(0,0,0,0.1)` 
                      : "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                
                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute top-10 bg-gray-900 text-white text-sm rounded-lg shadow-xl p-4 z-20 animate-fadeIn"
                    style={{
                      minWidth: "280px",
                      maxWidth: "320px",
                      left: index < activities.length / 2 ? "0" : "auto",
                      right: index >= activities.length / 2 ? "0" : "auto",
                    }}
                  >
                    <div className="font-semibold mb-2 text-base">{activity.title}</div>
                    <div className="text-gray-300 mb-2 text-xs">{activity.description}</div>
                    <div className="text-gray-400 text-xs mb-1">
                      {format(new Date(activity.timestamp), "MMM dd, yyyy 'at' hh:mm a")}
                    </div>
                    {activity.actorName && (
                      <div className="text-gray-400 text-xs">
                        By: {activity.actorName}
                      </div>
                    )}
                    
                    {/* Arrow pointing to the circle */}
                    <div
                      className="absolute w-3 h-3 bg-gray-900 transform rotate-45"
                      style={{
                        top: "-6px",
                        left: index < activities.length / 2 ? "20px" : "auto",
                        right: index >= activities.length / 2 ? "20px" : "auto",
                      }}
                    />
                  </div>
                )}
                
                {/* Date Label Below */}
                <div className="mt-3 text-center">
                  <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {format(new Date(activity.timestamp), "MMM dd")}
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {format(new Date(activity.timestamp), "hh:mm a")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2 font-medium">Activity Types:</div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10B981" }} />
            <span className="text-xs text-gray-600">Order/Payment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#8B5CF6" }} />
            <span className="text-xs text-gray-600">Delivery Setup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F59E0B" }} />
            <span className="text-xs text-gray-600">In Transit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#059669" }} />
            <span className="text-xs text-gray-600">Delivered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EF4444" }} />
            <span className="text-xs text-gray-600">Returns/Appeals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#14B8A6" }} />
            <span className="text-xs text-gray-600">Refunds</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OrderTimeline;
