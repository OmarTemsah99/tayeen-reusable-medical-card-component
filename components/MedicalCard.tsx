"use client";

import React, { useState, useCallback } from "react";
import { Card, CardBody, Avatar, Button, Chip, Divider } from "@heroui/react";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
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
    icon: CheckCircle2,
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

  return (
    <Card className="w-full max-w-lg shadow-sm border border-gray-200">
      <CardBody className="p-5">
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
              <p className="text-sm text-gray-500">{worker.role}</p>
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
            <p className="text-xs text-blue-950  font-bold mb-1">
              Current location
            </p>
            <p className="text-xs text-gray-400 font-semibold">
              {worker.location}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-950  font-bold mb-1">Job Offer</p>
            <p className="text-xs text-gray-400 font-semibold">
              {worker.jobOffer}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-950  font-bold mb-1">Age</p>
            <p className="text-xs text-gray-400 font-semibold">{worker.age}</p>
          </div>
        </div>

        {/* File Sections */}
        <div className="grid grid-cols-2 gap-4">
          {/* Medical Result */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {uploadLabel}
            </h4>
            {uploadedFile ? (
              <div className="relative">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                  <div className="w-full h-24 bg-white border border-gray-200 rounded mb-2 flex items-center justify-center">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium text-center ${
                      status === "accepted"
                        ? "bg-green-500 text-white"
                        : status === "failed"
                          ? "bg-red-500 text-white"
                          : "bg-gray-500 text-white"
                    }`}>
                    KSA Medical Result For Drivers
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <CheckCircle2 size={12} className="text-green-500 mr-1" />
                  PDF, DOCX — up to 10MB
                </div>
              </div>
            ) : (
              <div>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-2 ${
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() =>
                    document.getElementById("file-input")?.click()
                  }>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload size={20} className="text-blue-600" />
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-100 text-blue-600 hover:bg-blue-200 mb-2 text-xs px-4 py-1 h-7">
                    Add Files
                  </Button>
                  <p className="text-xs text-gray-500">
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
                <div className="flex items-center text-xs text-gray-600">
                  <CheckCircle2 size={12} className="text-green-500 mr-1" />
                  PDF, DOCX — up to 10MB
                </div>
              </div>
            )}
          </div>

          {/* Medical Requirements */}
          {requirements && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {requirementLabel}
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                <div className="w-full h-24 bg-white border border-gray-200 rounded mb-2 flex items-center justify-center">
                  <FileText size={32} className="text-gray-400" />
                </div>
                <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium text-center mb-2">
                  KSA Medical Requirements For Drivers
                </div>
                <Button
                  size="sm"
                  className="w-full bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs h-7 flex items-center justify-center gap-1"
                  onPress={() =>
                    window.open(requirements.downloadUrl, "_blank")
                  }>
                  <Download size={12} />
                  Download
                </Button>
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
