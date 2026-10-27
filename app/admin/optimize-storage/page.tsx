'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/admin/Sidebar';
import { compressImage } from '@/lib/compressImage';
import { HardDrive, Play, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BUCKETS = ['media', 'project-images', 'events', 'news', 'gallery', 'team-photos'];

interface FileItem {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
  path: string; 
}

export default function StorageOptimizer() {
  const supabase = createClient();
  const [selectedBucket, setSelectedBucket] = useState('media');
  const [scanning, setScanning] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [filesToProcess, setFilesToProcess] = useState<FileItem[]>([]);
  const [totalScanned, setTotalScanned] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString().toLowerCase()}] ${msg}`, ...prev].slice(0, 100));
  };

  async function listAllFiles(bucket: string, path: string = ''): Promise<FileItem[]> {
    const { data, error } = await supabase.storage.from(bucket).list(path);
    if (error) {
      addLog(`Error listing ${path || 'root'}: ${error.message}`);
      return [];
    }
    let files: FileItem[] = [];
    for (const item of data) {
      const fullPath = path ? `${path}/${item.name}` : item.name;
      if (!item.metadata) {
        const subFiles = await listAllFiles(bucket, fullPath);
        files = [...files, ...subFiles];
      } else {
        files.push({ ...item, path: fullPath } as FileItem);
      }
    }
    return files;
  }

  const scanBucket = async () => {
    setScanning(true);
    setFilesToProcess([]);
    setTotalScanned(0);
    setLogs([]);
    addLog(`Deep scanning bucket: ${selectedBucket}...`);
    try {
      const allFiles = await listAllFiles(selectedBucket);
      setTotalScanned(allFiles.length);
      const largeFiles = allFiles.filter(f => 
        f.metadata.size > 400 * 1024 && 
        (f.metadata.mimetype?.startsWith('image/') || f.name.match(/\.(png|jpe?g|webp)$/i))
      );
      setFilesToProcess(largeFiles);
      addLog(`Scan complete! Found ${allFiles.length} total files.`);
      addLog(`${largeFiles.length} files need compression.`);
    } catch (err) {
      addLog(`Scan failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setScanning(false);
    }
  };

  const startOptimization = async () => {
    if (optimizing || filesToProcess.length === 0) return;
    const confirm = window.confirm(`Compress ${filesToProcess.length} images in "${selectedBucket}"? Links will NOT break.`);
    if (!confirm) return;

    setOptimizing(true);
    addLog(`Starting optimization of ${filesToProcess.length} files...`);

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      addLog(`[${i + 1}/${filesToProcess.length}] Processing: ${file.path}`);

      try {
        // 1. Download
        const { data: blob, error: dlError } = await supabase.storage
          .from(selectedBucket)
          .download(file.path);

        if (dlError || !blob) throw new Error(`Download failed: ${dlError?.message}`);

        // 2. Compress (using your lib helper)
        const result = await compressImage(blob);
        
        // 3. Upload back to the SAME path (overwriting)
        const { error: upError } = await supabase.storage
          .from(selectedBucket)
          .upload(file.path, result.file, {
            upsert: true,
            contentType: result.file.type
          });

        if (upError) throw new Error(`Upload failed: ${upError.message}`);

        addLog(`Success! ${file.name}: ${result.summary}`);

      } catch (err) {
        addLog(`Failed ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error(err);
      }
    }

    setOptimizing(false);
    addLog('--- ALL TASKS COMPLETE ---');
    toast.success('Optimization finished!');
    scanBucket();
  };

  const totalSizeToDownload = filesToProcess.reduce((acc, f) => acc + f.metadata.size, 0) / (1024 * 1024);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HardDrive className="text-amber-500" /> Storage Optimizer
            </h1>
            <p className="text-gray-400 mt-2">Scans your Supabase storage buckets and compresses images &gt; 400KB.</p>
          </header>

          <div className="bg-[#111] border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Target Bucket</label>
                <select 
                  value={selectedBucket}
                  onChange={(e) => setSelectedBucket(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {BUCKETS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <button
                onClick={scanBucket}
                disabled={scanning || optimizing}
                className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Scan Bucket
              </button>
              {filesToProcess.length > 0 && (
                <button
                  onClick={startOptimization}
                  disabled={optimizing}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Start Optimization
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111] border border-white/10 p-5 rounded-xl">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Files</p>
              <p className="text-3xl font-mono font-bold">{totalScanned}</p>
            </div>
            <div className="bg-[#111] border border-white/10 p-5 rounded-xl text-amber-500">
              <p className="text-xs font-bold uppercase mb-1">Needs Compression</p>
              <p className="text-3xl font-mono font-bold">{filesToProcess.length}</p>
            </div>
            <div className="bg-[#111] border border-white/10 p-5 rounded-xl">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Data Size to Process</p>
              <p className="text-3xl font-mono font-bold">{totalSizeToDownload.toFixed(2)} <span className="text-sm text-gray-400">MB</span></p>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
              Live Optimization Log
            </div>
            <div className="h-[300px] overflow-y-auto p-4 font-mono text-sm flex flex-col-reverse gap-1">
              {logs.length === 0 && <p className="text-gray-600 italic">Ready to scan...</p>}
              {logs.map((log, i) => (
                <div key={i} className={`py-1 border-b border-white/5 ${log.includes('Success') ? 'text-green-400' : log.includes('Failed') ? 'text-red-400' : 'text-gray-300'}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}