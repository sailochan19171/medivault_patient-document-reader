import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trash2, Download, FileText, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get(`${API_BASE}/documents`);
            setDocuments(res.data);
        } catch (err) {
            console.error('Error fetching documents:', err);
            setMessage({ type: 'error', text: 'Failed to load documents.' });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setMessage({ type: 'error', text: 'Please select a PDF file.' });
            setFile(null);
            return;
        }
        setFile(selectedFile);
        setMessage(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            await axios.post(`${API_BASE}/documents/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage({ type: 'success', text: 'File uploaded successfully!' });
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchDocuments();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Upload failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await axios.delete(`${API_BASE}/documents/${id}`);
            setMessage({ type: 'success', text: 'Document deleted.' });
            fetchDocuments();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to delete document.' });
        }
    };

    const handleDownload = (id, filename) => {
        // We can use window.open or create a link element
        // Direct link matches the requirement "Download a specific file"
        window.location.href = `${API_BASE}/documents/${id}`;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo-area">
                    <div className="logo-icon">
                        <FileText size={28} color="white" />
                    </div>
                    <h1>MediVault</h1>
                </div>
                <p className="subtitle">Secure Patient Document Portal</p>
            </header>

            <main className="main-content">
                {/* Upload Section */}
                <section className="upload-section">
                    <h2>Upload New Document</h2>
                    <form onSubmit={handleUpload} className="upload-form">
                        <div
                            className={`drop-zone ${file ? 'has-file' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                            />
                            <div className="upload-icon-wrapper">
                                <Upload size={40} />
                            </div>
                            <div className="upload-text">
                                {file ? (
                                    <span className="filename">{file.name}</span>
                                ) : (
                                    <span>Click to select PDF</span>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="upload-btn"
                            disabled={!file || loading}
                        >
                            {loading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </form>

                    {message && (
                        <div className={`message-banner ${message.type}`}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span>{message.text}</span>
                        </div>
                    )}
                </section>

                {/* List Section */}
                <section className="documents-section">
                    <h2>Your Documents</h2>
                    {documents.length === 0 ? (
                        <div className="empty-state">
                            <p>No documents found. Upload one to get started.</p>
                        </div>
                    ) : (
                        <div className="document-grid">
                            {documents.map((doc) => (
                                <div key={doc.id} className="document-card">
                                    <div className="card-icon">
                                        <FileText size={32} />
                                    </div>
                                    <div className="card-info">
                                        <h3>{doc.filename}</h3>
                                        <p className="meta">{formatFileSize(doc.filesize)} • {new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="card-actions">
                                        <button
                                            onClick={() => handleDownload(doc.id, doc.filename)}
                                            className="action-btn download"
                                            title="Download"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="action-btn delete"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;
