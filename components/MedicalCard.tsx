"use client";

import { Avatar, Card, CardBody, Button } from "@heroui/react";
import {
  ArrowUp,
  Check,
  CircleArrowDown,
  CornerDownRight,
  CornerUpLeft,
  UserRound,
} from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";

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

type Status = "accepted" | "pending" | "replace";

interface MedicalCardProps {
  worker: Worker;
  status?: Status;
  resultFile?: FileData | null;
  requirements?: Requirement;
  rejectionNote?: string | null;
  onFileUpload?: (file: FileData) => void;
  onStatusChange?: (status: Status) => void;

  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  uploadLabel?: string;
  requirementLabel?: string;
}

const statusMap: Record<
  Status,
  {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  accepted: {
    label: "Accepted",
    bgColor: "bg-green-100",
    textColor: "text-green-500",
    borderColor: "border-green-300",
  },
  pending: {
    label: "Pending",
    bgColor: "bg-[#FEF9C2]",
    textColor: "text-[#938700]",
    borderColor: "border-[#9E9100]",
  },
  replace: {
    label: "Replace Worker",
    bgColor: "bg-red-100",
    textColor: "text-red-500",
    borderColor: "border-red-300",
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
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  /** Load saved file info from localStorage */
  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;
    const storageKey = `medical_result_${worker.name.replace(/\s+/g, "_")}`;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedFile = JSON.parse(saved);
        if (
          parsedFile &&
          parsedFile.name &&
          parsedFile.size &&
          parsedFile.type
        ) {
          setUploadedFile(parsedFile);
        }
      } else if (resultFile) {
        setUploadedFile(resultFile);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [worker.name, resultFile, isClient]);

  /** File upload handler */
  const handleFileUpload = useCallback(
    (file: File) => {
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        alert(`File size must be less than ${maxFileSizeMB}MB`);
        return;
      }
      if (!allowedFileTypes.includes(file.type)) {
        const allowedExtensions = allowedFileTypes
          .map((type) => {
            switch (type) {
              case "application/pdf":
                return "PDF";
              case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return "DOCX";
              case "application/msword":
                return "DOC";
              default:
                return type;
            }
          })
          .join(", ");
        alert(`Allowed file types: ${allowedExtensions}`);
        return;
      }

      const fileData: FileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };

      setUploadedFile(fileData);
      setFileObject(file);

      if (typeof window !== "undefined") {
        try {
          const storageKey = `medical_result_${worker.name.replace(/\s+/g, "_")}`;
          localStorage.setItem(storageKey, JSON.stringify(fileData));
        } catch (error) {
          console.warn("Failed to save file data:", error);
        }
      }

      onFileUpload(fileData);
      onStatusChange("pending");
    },
    [maxFileSizeMB, allowedFileTypes, worker.name, onFileUpload, onStatusChange]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files && files[0]) handleFileUpload(files[0]);
    },
    [handleFileUpload]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleFileInputClick = useCallback(() => {
    const fileInput = document.getElementById(
      `file-input-${worker.name.replace(/\s+/g, "_")}`
    );
    fileInput?.click();
  }, [worker.name]);

  const handleRequirementDownload = useCallback(() => {
    if (requirements?.downloadUrl) {
      window.open(requirements.downloadUrl, "_blank", "noopener,noreferrer");
    }
  }, [requirements?.downloadUrl]);

  /** File preview */
  const handleFilePreview = useCallback(() => {
    if (!uploadedFile) return;

    if (fileObject) {
      if (fileObject.type === "application/pdf") {
        const pdfUrl = URL.createObjectURL(fileObject);
        window.open(pdfUrl, "_blank");
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result;
          if (base64) {
            const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
              base64.toString()
            )}&embedded=true`;
            window.open(googleViewerUrl, "_blank");
          }
        };
        reader.readAsDataURL(fileObject);
      }
      return;
    }

    // After reload, only PDFs can be previewed
    if (uploadedFile.type === "application/pdf") {
      alert(
        "Cannot preview DOC/DOCX after reload. PDF preview only works before reload."
      );
    } else {
      alert(
        "Preview not available for DOC/DOCX after reload due to browser limitations."
      );
    }
  }, [uploadedFile, fileObject]);

  const statusConfig = statusMap[status];
  const previewColor =
    status === "accepted"
      ? { border: "#16a34a", infoBg: "#16a34a", infoText: "#ffffff" }
      : status === "pending"
        ? { border: "#9E9100", infoBg: "#FEF9C2", infoText: "#938700" }
        : { border: "#ef4444", infoBg: "#ef4444", infoText: "#ffffff" };

  const fileInputId = `file-input-${worker.name.replace(/\s+/g, "_")}`;

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
            className={`px-4 py-2 inline-flex items-center gap-1 rounded-md border text-base font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
            <span>{statusConfig.label}</span>
            {status === "replace" && <CustomReplaceIcon size={16} />}
          </div>
        </div>

        {/* Worker Info */}
        <div
          className="grid gap-6 mb-4"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}>
          <div className="text-left">
            <p className="text-xs text-blue-950 font-bold mb-1">
              Current location
            </p>
            <p className="text-xs text-gray-400 font-semibold">
              {worker.location}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="text-left">
              <p className="text-xs text-blue-950 font-bold mb-1">Job Offer</p>
              <p className="text-xs text-gray-400 font-semibold">
                {worker.jobOffer}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="text-left">
              <p className="text-xs text-blue-950 font-bold mb-1">Age</p>
              <p className="text-xs text-gray-400 font-semibold">
                {worker.age}
              </p>
            </div>
          </div>
        </div>

        <div className="my-4">
          <div className="h-px bg-gray-300 w-full"></div>
        </div>

        {/* File Sections */}
        <div className="grid grid-cols-2 gap-6">
          {/* Medical Result */}
          <div>
            <h4 className="text-[18px] font-bold text-[#1e3a8a] mb-4 leading-tight">
              {uploadLabel}
            </h4>
            {uploadedFile ? (
              <div className="relative">
                <div
                  className="bg-white rounded-lg border h-[200px] flex flex-col shadow-sm overflow-hidden cursor-pointer"
                  style={{ borderColor: previewColor.border }}
                  onClick={handleFilePreview}>
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
                  <div
                    className="p-3 border-t flex items-center justify-between"
                    style={{
                      background: previewColor.infoBg,
                      borderTopColor: previewColor.infoBg,
                    }}>
                    <div
                      className="text-sm font-medium truncate max-w-[120px]"
                      style={{ color: previewColor.infoText }}
                      title={uploadedFile.name}>
                      {uploadedFile.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Check
                    size={12}
                    className="text-green-500 mr-1.5 flex-shrink-0"
                  />
                  <span>PDF, DOCX — up to {maxFileSizeMB}MB</span>
                </div>
              </div>
            ) : (
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
                onClick={handleFileInputClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleFileInputClick();
                  }
                }}>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                  <ArrowUp size={20} className="text-white" />
                </div>
                <button
                  type="button"
                  className="bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 rounded px-4 py-2 text-xs font-medium mb-2 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileInputClick();
                  }}>
                  Add Files
                </button>
                <p className="text-xs text-gray-500 leading-tight">
                  Or drag files to upload
                </p>
                <input
                  id={fileInputId}
                  type="file"
                  className="hidden"
                  accept={allowedFileTypes.join(",")}
                  onChange={handleFileInputChange}
                  aria-label="Upload medical result file"
                />
              </div>
            )}
          </div>

          {/* Medical Requirements */}
          {requirements && (
            <div className="relative">
              <h4 className="text-[18px] font-bold text-[#1e3a8a] mb-4 leading-tight">
                {requirementLabel}
              </h4>
              <div
                className="bg-white rounded-lg shadow-sm border h-[200px] flex flex-col overflow-hidden"
                style={{ borderColor: "#3592E6" }}>
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
                <div
                  className="p-3 border-t flex items-center justify-between"
                  style={{ background: "#3592E6", borderTopColor: "#3592E6" }}>
                  <div
                    className="text-white text-[11px] font-medium truncate max-w-[120px]"
                    title={requirements.title}>
                    {requirements.title}
                  </div>
                  <Button
                    className="flex items-center gap-1 bg-white rounded-md px-3 py-1 text-[12px] font-medium shadow-sm hover:bg-sky-50 transition-colors"
                    style={{ color: "#3592E6" }}
                    onClick={handleRequirementDownload}
                    type="button">
                    <CircleArrowDown size={16} style={{ color: "#3592E6" }} />
                    <span style={{ color: "#3592E6" }}>Download</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rejection Note */}
        {rejectionNote && status === "replace" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 font-medium">Rejection Note:</p>
            <p className="text-sm text-red-500 mt-1">{rejectionNote}</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

const CustomReplaceIcon: React.FC<{
  size?: number;
  strokeSize?: number;
  className?: string;
}> = ({ size = 24, strokeSize = 4, className = "" }) => {
  const userSize = size * 0.5;
  const arrowSize = size * 0.5;
  const userStroke = strokeSize;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Replace worker icon">
      <UserRound
        size={userSize}
        strokeWidth={userStroke}
        className="absolute top-0 left-0 text-red-500"
      />
      <UserRound
        size={userSize}
        strokeWidth={userStroke}
        className="absolute bottom-0 right-0 text-red-500"
      />
      <CornerUpLeft
        size={arrowSize}
        strokeWidth={userStroke}
        className="absolute top-0 right-0 text-red-500"
      />
      <CornerDownRight
        size={arrowSize}
        strokeWidth={userStroke}
        className="absolute bottom-0 left-0 text-red-500"
      />
    </div>
  );
};

export default MedicalCard;
