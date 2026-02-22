"use client";

import { useState } from "react";
import { mattersService } from "@/services/matters.service";
import { BriefUploadResponse } from "@/types";

interface BriefUploadProps {
    matterId: string;
    onUploadSuccess: (data: BriefUploadResponse) => void;
}

export default function BriefUpload({ matterId, onUploadSuccess }: BriefUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const data = await mattersService.uploadBrief(matterId, file);
            onUploadSuccess(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors">
            <h3 className="text-lg font-semibold mb-2">Upload Invention Disclosure</h3>
            <p className="text-gray-500 mb-4">Upload a PDF, DOCX, or Text file to generate a Structured Brief.</p>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
                disabled={isUploading}
                className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
            />

            {isUploading && <p className="mt-2 text-blue-600">Analyzing brief... this may take a moment.</p>}
        </div>
    );
}
