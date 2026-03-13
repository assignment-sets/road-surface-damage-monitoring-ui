// src/pages/UploadPage.tsx
import React, { useState, useRef } from "react";
import { UploadCloud, MapPin, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api";
import axios from "axios";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILES = 10;

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) =>
      ALLOWED_TYPES.includes(file.type),
    );

    if (validFiles.length !== newFiles.length) {
      toast.error(
        "Invalid file type. Only JPEG, PNG, Avif and WEBP are allowed.",
      );
    }

    setFiles((prev) => {
      const combined = [...prev, ...validFiles];
      if (combined.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} images allowed per batch.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    toast.info("Fetching coordinates...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        toast.success("Location acquired.");
      },
      (error) => {
        toast.error("Failed to get location. Please enter manually.");
        console.error(error);
      },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0)
      return toast.error("Please add at least one image.");
    if (!lat || !lng)
      return toast.error("Please provide latitude and longitude.");

    setLoading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("latitude", lat);
    formData.append("longitude", lng);

    try {
      const response = await apiClient.post("/detection/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(response.data.message || "Images queued for processing!");
      setFiles([]); // Reset after success
    } catch (error: unknown) {
      let errMsg = "Upload failed. Check server logs.";

      if (axios.isAxiosError(error)) {
        errMsg = error.response?.data?.detail ?? errMsg;
      }

      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Road Imagery</CardTitle>
          <CardDescription>
            Upload up to 10 images for YOLOv8 road damage detection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <Label className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Coordinates
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchLocation}
                >
                  Auto-Locate
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    placeholder="e.g. 22.63"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    placeholder="e.g. 88.43"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Click or drag images here</p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, WEBP up to 10 files
              </p>
              <input
                type="file"
                multiple
                accept={ALLOWED_TYPES.join(",")}
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            {/* File Previews */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label>
                  Selected Files ({files.length}/{MAX_FILES})
                </Label>
                <div className="grid grid-cols-5 gap-4">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-md overflow-hidden border"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-20 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || files.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing
                  Batch...
                </>
              ) : (
                "Upload & Analyze"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
