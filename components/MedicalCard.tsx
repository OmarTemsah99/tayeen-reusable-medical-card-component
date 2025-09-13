"use client";

import React, { useState, useCallback } from "react";
import { Card, CardBody, Avatar, Button, Chip, Divider } from "@heroui/react";
import {
  ArrowUp,
  CircleArrowDown,
  FileText,
  AlertCircle,
  Check,
  Clock,
  UserX,
  CornerDownRight,
  CornerUpLeft,
  UserRound,
} from "lucide-react";

type Worker = {
  name: string;
  role: string;
  photo: string;
  location: string;
  jobOffer: string | number;
  age: string | number;
};

type FileData = {
  name: string;
  size: number;
  type: string;
  uploadedAt?: string;
};

type Requirement = {
  title: string;
  downloadUrl: string;
};

type Status = "accepted" | "pending" | "failed" | "replace" | "unknown";

interface MedicalCardProps {
  worker: Worker;
  status?: Status;
  resultFile?: FileData | null;
  requirements?: Requirement;
  rejectionNote?: string | null;
  onFileUpload?: (file: FileData) => void;
  onStatusChange?: (status: Status) => void;

  /** Customization */
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  uploadLabel?: string;
  requirementLabel?: string;
}

const statusMap: Record<
  Status,
  {
    color: "success" | "warning" | "danger" | "default";
    label: string;
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
  }
> = {
  accepted: {
    color: "success",
    label: "Accepted",
    icon: Check,
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  pending: {
    color: "warning",
    label: "Pending",
    icon: Clock,
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  failed: {
    color: "danger",
    label: "Failed",
    icon: AlertCircle,
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
  replace: {
    color: "danger",
    label: "Replace Worker",
    icon: UserX,
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
  unknown: {
    color: "default",
    label: "Unknown",
    icon: AlertCircle,
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  },
};

const MedicalCard: React.FC<MedicalCardProps> = ({
  worker,
  status = "pending",
  resultFile = null,
  requirements,
  rejectionNote,
  onFileUpload = () => {},
  onStatusChange = () => {},

  allowedFileTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ],
  maxFileSizeMB = 10,
  uploadLabel = "Medical Result",
  requirementLabel = "Medical Requirements",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(resultFile);

  /** File handlers */
  const handleFileUpload = (file: File) => {
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxFileSizeMB}MB`);
      return;
    }
    if (!allowedFileTypes.includes(file.type)) {
      alert(`Allowed file types: PDF, DOCX, DOC`);
      return;
    }

    const fileData: FileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };

    setUploadedFile(fileData);
    onFileUpload(fileData);
    onStatusChange("pending");
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) handleFileUpload(files[0]);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const statusConfig = statusMap[status] ?? statusMap.unknown;
  const StatusIcon = statusConfig.icon;
  // Map status to exact colors for the preview area (borders and info bar)
  const previewColor: { border: string; infoBg: string; infoText: string } =
    status === "accepted"
      ? { border: "#16a34a", infoBg: "#16a34a", infoText: "#ffffff" } // green-500
      : status === "pending"
        ? { border: "#9E9100", infoBg: "#FEF9C2", infoText: "#938700" } // pending (pale yellow + dark text)
        : status === "failed" || status === "replace"
          ? { border: "#ef4444", infoBg: "#ef4444", infoText: "#ffffff" } // red-500
          : { border: "#3592E6", infoBg: "#3592E6", infoText: "#ffffff" }; // custom blue

  // Badge classes for result status (reuses header color concept)
  const resultBadgeClass =
    status === "accepted"
      ? "px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-500 border border-green-300"
      : status === "pending"
        ? "px-2 py-1 rounded text-xs font-medium bg-[#FEF9C2] text-[#938700] border border-[#9E9100]"
        : status === "replace"
          ? "px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-500 border border-red-300 flex items-center gap-1"
          : "px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-500 border border-red-300";

  return (
    <Card className="w-full max-w-2xl shadow-sm border border-gray-200">
      <CardBody className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              radius="sm"
              src={worker.photo}
              alt={worker.name}
              size="md"
              className="w-12 h-12"
            />
            <div>
              <h3 className="font-semibold text-base text-gray-900">
                {worker.name}
              </h3>
              <p className="text-sm text-gray-400">{worker.role}</p>
            </div>
          </div>
          <div
            className={`px-9 py-2 inline-block rounded-md border text-base font-medium
    ${
      status === "accepted"
        ? "bg-green-100 text-green-500 border-green-300"
        : status === "pending"
          ? "bg-[#FEF9C2] text-[#938700] border border-[#9E9100]"
          : status === "replace"
            ? "bg-red-100 text-red-500 border-red-300 flex items-center gap-1"
            : "bg-red-100 text-red-500 border-red-300"
    }`}>
            {status === "replace" && <CustomReplaceIcon size={16} />}
            {statusConfig.label}
          </div>
        </div>

        {/* Worker Info Grid */}
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div>
            <p className="text-xs text-blue-950 font-bold mb-1">
              Current location
            </p>
            <p className="text-xs text-gray-400 font-semibold">
              {worker.location}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-950 font-bold mb-1">Job Offer</p>
            <p className="text-xs text-gray-400 font-semibold">
              {worker.jobOffer}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-950 font-bold mb-1">Age</p>
            <p className="text-xs text-gray-400 font-semibold">{worker.age}</p>
          </div>
        </div>

        {/* Divider between worker info and file sections */}
        <div className="my-4">
          <div className="h-px bg-gray-300 w-full"></div>
        </div>

        {/* File Sections - Updated to match image exactly */}
        <div className="grid grid-cols-2 gap-6">
          {/* Medical Result */}
          <div>
            <h4 className="text-[13px] font-bold text-[#1e3a8a] mb-4 leading-tight">
              {uploadLabel}
            </h4>
            {uploadedFile ? (
              <div className="relative">
                <div
                  className="bg-white rounded-lg border h-[200px] flex flex-col shadow-sm overflow-hidden"
                  style={{ borderColor: previewColor.border }}>
                  {/* Document preview area (same as requirements) */}
                  <div className="flex-1 bg-gray-50 relative p-3">
                    <div className="space-y-2">
                      <div className="h-0.5 bg-gray-400 rounded w-4/5"></div>
                      <div className="h-0.5 bg-gray-400 rounded w-3/5"></div>
                      <div className="h-0.5 bg-gray-400 rounded w-full"></div>
                      <div className="h-0.5 bg-gray-400 rounded w-2/3"></div>
                      <div className="h-0.5 bg-gray-400 rounded w-4/5"></div>
                      <div className="h-0.5 bg-gray-400 rounded w-1/2"></div>
                    </div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>

                  {/* Document info and download section with hex blue */}
                  <div
                    className="p-3 border-t flex items-center justify-between"
                    style={{
                      background: previewColor.infoBg,
                      borderTopColor: previewColor.infoBg,
                    }}>
                    <div
                      className="text-sm font-medium"
                      style={{ color: previewColor.infoText }}>
                      {uploadedFile.name || "Uploaded Medical Result"}
                    </div>
                    <div className="flex items-center">
                      <button
                        className="flex items-center gap-1 bg-white rounded-md px-3 py-1 text-[12px] font-medium shadow-sm transition-colors"
                        style={{ color: previewColor.border }}
                        aria-hidden>
                        {status === "replace" && (
                          <CustomReplaceIcon size={12} />
                        )}
                        <span>{statusConfig.label}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Check
                    size={12}
                    className="text-green-500 mr-1.5 flex-shrink-0"
                  />
                  <span>PDF, DOCX — up to 10MB</span>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className={`border-2 border-dashed rounded-lg h-[200px] text-center cursor-pointer mb-2 transition-colors flex flex-col items-center justify-center ${
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() =>
                    document.getElementById("file-input")?.click()
                  }>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                    <ArrowUp size={20} className="text-white" />
                  </div>
                  <button className="bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 rounded px-4 py-2 text-xs font-medium mb-2 transition-colors">
                    Add Files
                  </button>
                  <p className="text-xs text-gray-500 leading-tight">
                    Or drag files to upload
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept={allowedFileTypes.join(",")}
                    onChange={handleFileInputChange}
                  />
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Check
                    size={12}
                    className="text-green-500 mr-1.5 flex-shrink-0"
                  />
                  <span>PDF, DOCX — up to 10MB</span>
                </div>
              </div>
            )}
          </div>

          {/* Medical Requirements */}
          {requirements && (
            <div className="relative">
              <h4 className="text-[13px] font-bold text-[#1e3a8a] mb-4 leading-tight">
                {requirementLabel}
              </h4>
              <div
                className="bg-white rounded-lg shadow-sm border h-[200px] flex flex-col overflow-hidden"
                style={{ borderColor: "#3592E6" }}>
                {/* Document preview area */}
                <div className="flex-1 bg-gray-50 relative p-3">
                  {/* Mock document lines */}
                  <div className="space-y-2">
                    <div className="h-0.5 bg-gray-400 rounded w-4/5"></div>
                    <div className="h-0.5 bg-gray-400 rounded w-3/5"></div>
                    <div className="h-0.5 bg-gray-400 rounded w-full"></div>
                    <div className="h-0.5 bg-gray-400 rounded w-2/3"></div>
                    <div className="h-0.5 bg-gray-400 rounded w-4/5"></div>
                    <div className="h-0.5 bg-gray-400 rounded w-1/2"></div>
                  </div>
                  {/* Red dot indicator */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>

                {/* Document info and download section with blue background */}
                <div
                  className="p-3 border-t flex items-center justify-between"
                  style={{ background: "#3592E6", borderTopColor: "#3592E6" }}>
                  <div className="text-white text-[11px] font-medium">
                    KSA Medical Requirements For Drivers
                  </div>
                  <button
                    className="flex items-center gap-1 bg-white rounded-md px-3 py-1 text-[12px] font-medium shadow-sm hover:bg-sky-50 transition-colors"
                    style={{ color: "#3592E6" }}
                    onClick={() =>
                      window.open(requirements.downloadUrl, "_blank")
                    }>
                    <CircleArrowDown size={14} style={{ color: "#3592E6" }} />
                    <span style={{ color: "#3592E6" }}>Download</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rejection Note */}
        {(status === "failed" || status === "replace") && rejectionNote && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  {status === "replace"
                    ? "Worker Replacement Required"
                    : "Medical Review Failed"}
                </p>
                <p className="text-xs text-red-600 mt-1">{rejectionNote}</p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default MedicalCard;

const CustomReplaceIcon = ({ size = 24, strokeSize = 4, className = "" }) => {
  const userSize = size * 0.5;
  const arrowSize = size * 0.5;
  const userStroke = strokeSize;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}>
      {/* Top-left user */}
      <UserRound
        size={userSize}
        strokeWidth={userStroke}
        className="absolute top-0 left-0 text-red-500 font-medium"
      />

      {/* Bottom-right user */}
      <UserRound
        size={userSize}
        strokeWidth={userStroke}
        className="absolute bottom-0 right-0 text-red-500 font-medium"
      />

      {/* Arrow going from bottom-right user → top-left user */}
      <CornerUpLeft
        size={arrowSize}
        strokeWidth={userStroke}
        className="absolute top-0 right-0 text-red-500 font-medium"
      />

      {/* Arrow going from top-left user → bottom-right user */}
      <CornerDownRight
        size={arrowSize}
        strokeWidth={userStroke}
        className="absolute bottom-0 left-0 text-red-500 font-medium"
      />
    </div>
  );
};
