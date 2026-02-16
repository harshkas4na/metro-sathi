"use client";

import { useState } from "react";
import {
  AlertTriangle,
  UserX,
  MessageSquareOff,
  Ban,
  ShieldAlert,
  HelpCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { ReportReason } from "@/lib/types";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
}

const REPORT_REASONS: {
  value: ReportReason;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "fake_profile",
    label: "Fake Profile",
    icon: <UserX size={16} />,
  },
  {
    value: "harassment",
    label: "Harassment",
    icon: <MessageSquareOff size={16} />,
  },
  {
    value: "inappropriate",
    label: "Inappropriate Content",
    icon: <Ban size={16} />,
  },
  {
    value: "spam",
    label: "Spam",
    icon: <AlertTriangle size={16} />,
  },
  {
    value: "safety",
    label: "Safety Concern",
    icon: <ShieldAlert size={16} />,
  },
  {
    value: "other",
    label: "Other",
    icon: <HelpCircle size={16} />,
  },
];

export function ReportModal({
  open,
  onClose,
  reportedUserId,
  reportedUserName,
}: ReportModalProps) {
  const [step, setStep] = useState<"reason" | "details" | "done">("reason");
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null
  );
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep("reason");
    setSelectedReason(null);
    setDescription("");
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectReason = (reason: ReportReason) => {
    setSelectedReason(reason);
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setSubmitting(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reported_user_id: reportedUserId,
        reason: selectedReason,
        description: description.trim() || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      if (res.status === 409) {
        toast.error("You have already reported this user");
      } else {
        toast.error(data.error || "Failed to submit report");
      }
      setSubmitting(false);
      return;
    }

    setStep("done");
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">
            {step === "done" ? "Report Submitted" : "Report User"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Select Reason */}
        {step === "reason" && (
          <div className="space-y-2">
            <p className="text-sm text-[#666666]">
              Why are you reporting{" "}
              <span className="font-medium text-[#1A1A1A]">
                {reportedUserName}
              </span>
              ?
            </p>
            <div className="space-y-1.5 pt-1">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => handleSelectReason(reason.value)}
                  className="flex w-full items-center gap-3 rounded-lg border border-[#E0E0E0] px-4 py-3 text-left text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#EF4444] hover:bg-[#FEF2F2]"
                >
                  <span className="text-[#666666]">{reason.icon}</span>
                  {reason.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Additional Details */}
        {step === "details" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#666666]">
                Reporting for:{" "}
                <span className="font-medium text-[#EF4444]">
                  {REPORT_REASONS.find((r) => r.value === selectedReason)
                    ?.label}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A1A1A]">
                Additional details{" "}
                <span className="font-normal text-[#999999]">(optional)</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional context that will help us review this report..."
                maxLength={500}
                rows={3}
                className="resize-none bg-[#F8F9FA]"
              />
              <p className="text-right text-xs text-[#999999]">
                {description.length}/500
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("reason")}
                disabled={submitting}
              >
                Back
              </Button>
              <Button
                className="flex-1 gap-2 bg-[#EF4444] hover:bg-[#DC2626]"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <AlertTriangle size={16} />
                )}
                Submit Report
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === "done" && (
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7]">
              <CheckCircle size={32} className="text-[#16A34A]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#1A1A1A]">
                Thank you for reporting
              </p>
              <p className="mt-1 text-xs text-[#666666]">
                We&apos;ll review this report and take appropriate action. Your
                safety is our priority.
              </p>
            </div>
            <Button
              className="w-full bg-[#0066CC] hover:bg-[#0052A3]"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
