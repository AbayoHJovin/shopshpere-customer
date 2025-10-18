"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
} from "lucide-react";
import { OrderService, DeliveryNote } from "@/lib/orderService";
import { format } from "date-fns";

interface DeliveryNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  title: string;
}

export function DeliveryNotesDialog({
  open,
  onOpenChange,
  orderId,
  title,
}: DeliveryNotesDialogProps) {
  const [notes, setNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    if (open && orderId) {
      fetchNotes(currentPage);
    }
  }, [open, orderId, currentPage]);

  const fetchNotes = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.getOrderDeliveryNotes(
        orderId,
        page,
        pageSize
      );
      setNotes(response.data.notes);
      setTotalPages(response.data.totalPages);
      setTotalNotes(response.data.totalNotes);
    } catch (err: any) {
      console.error("Error fetching delivery notes:", err);
      setError(err.message || "Failed to load delivery notes");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toUpperCase()) {
      case "DELAY":
        return "bg-yellow-100 text-yellow-800";
      case "ISSUE":
        return "bg-red-100 text-red-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {totalNotes > 0
              ? `Showing ${notes.length} of ${totalNotes} delivery notes`
              : "No delivery notes available"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">
                Loading notes...
              </span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : notes.length === 0 ? (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                No delivery notes have been added for this order yet.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Notes List */}
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="border rounded-md p-4 space-y-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {note.agentName}
                        </span>
                      </div>
                      <Badge className={getCategoryColor(note.noteCategory)}>
                        {note.noteCategory}
                      </Badge>
                    </div>

                    {/* Note Text */}
                    <p className="text-sm text-gray-700">{note.noteText}</p>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
