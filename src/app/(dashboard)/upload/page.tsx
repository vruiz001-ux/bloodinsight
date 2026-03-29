"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Image,
  X,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
];
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.heic";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.endsWith(".heic")) {
      setError("Unsupported file type. Please upload a PDF, JPG, PNG, or HEIC file.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("File is too large. Maximum size is 20 MB.");
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  function simulateUpload() {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push("/review/demo-report-001");
          }, 400);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);
  }

  function handleDemoReport() {
    setFile(
      new File(["demo"], "demo-blood-panel-2024.pdf", {
        type: "application/pdf",
      })
    );
    setPreview(null);
    setError(null);
    // Auto-start upload for demo
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push("/review/demo-report-001");
          }, 400);
          return 100;
        }
        return prev + Math.random() * 20 + 10;
      });
    }, 250);
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress(0);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Lab Results</h1>
        <p className="mt-1 text-muted-foreground">
          Upload your blood test report and we will extract every biomarker
          automatically.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main upload area */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {!file ? (
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                    dragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Upload className="size-7 text-primary" />
                  </div>
                  <p className="text-base font-medium text-foreground">
                    Drag and drop your lab report here
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    or click to browse your files
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {["PDF", "JPG", "PNG", "HEIC"].map((ext) => (
                      <span
                        key={ext}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {ext}
                      </span>
                    ))}
                    <span className="text-xs text-muted-foreground">
                      up to 20 MB
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File preview */}
                  <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      {file.type.startsWith("image/") ? (
                        <Image className="size-5 text-primary" />
                      ) : (
                        <FileText className="size-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB
                        {file.type ? ` \u00B7 ${file.type}` : ""}
                      </p>
                    </div>
                    {!uploading && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={removeFile}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>

                  {/* Image preview */}
                  {preview && (
                    <div className="overflow-hidden rounded-lg border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="Lab report preview"
                        className="max-h-64 w-full object-contain bg-muted/20"
                      />
                    </div>
                  )}

                  {/* Upload progress */}
                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={Math.min(progress, 100)}>
                        <ProgressLabel>
                          {progress >= 100 ? (
                            <span className="flex items-center gap-1.5 text-health-normal">
                              <CheckCircle2 className="size-4" />
                              Processing complete
                            </span>
                          ) : (
                            "Uploading and scanning..."
                          )}
                        </ProgressLabel>
                        <ProgressValue />
                      </Progress>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!uploading && (
                    <div className="flex gap-3">
                      <Button onClick={simulateUpload} size="lg">
                        <Upload className="size-4" />
                        Upload & Analyze
                      </Button>
                      <Button variant="outline" size="lg" onClick={removeFile}>
                        Choose Different File
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="mt-3 text-sm text-destructive">{error}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="size-4 text-primary" />
                Try a Demo Report
              </CardTitle>
              <CardDescription>
                Don&apos;t have a report handy? Load our sample comprehensive
                blood panel to see how BloodInsight works.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDemoReport}
                disabled={uploading}
              >
                Load Demo Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-0.5 text-primary">1.</span>
                  Upload the original PDF from your lab portal for highest
                  accuracy.
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-primary">2.</span>
                  If using a photo, ensure good lighting and the full page is
                  visible.
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-primary">3.</span>
                  You can always correct any values on the review screen.
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-primary">4.</span>
                  Multiple pages are supported for multi-page reports.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
