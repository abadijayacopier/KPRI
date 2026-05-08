import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, Printer, Trash2, Users, FileSpreadsheet, Plus, Save, RotateCcw, Search, Edit2, Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

// Dynamic script loader for PDF libraries
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

const App = () => {
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [logoLeft, setLogoLeft] = useState(localStorage.getItem('idcard_logoLeft') || null);
    const [logoRight, setLogoRight] = useState(localStorage.getItem('idcard_logoRight') || null);
    const [bgFront, setBgFront] = useState(localStorage.getItem('idcard_bgFront') || null);
    const [bgBack, setBgBack] = useState(localStorage.getItem('idcard_bgBack') || null);
    const [printBackOnce, setPrintBackOnce] = useState(false);
    const [backText, setBackText] = useState(() => {
        try {
            const saved = localStorage.getItem('idcard_backText');
            return saved ? JSON.parse(saved) : {
                header: 'KOPERASI KONSUMEN "KPRI KARYA GUNA"',
                title: 'Peraturan dan Ketentuan Koperasi',
                rules: [
                    'Kartu ini adalah bukti keanggotaan sah Koperasi Konsumen "KPRI KARYA GUNA".',
                    'Wajib dibawa saat melakukan Transaksi Simpan Pinjam.',
                    'Dilarang memindahtangankan kartu ini kepada orang lain.',
                    'Apabila kartu Hilang/Rusak segera lapor / hubungi bagian Administrasi Koperasi.'
                ],
                footer: 'Kartu ini berlaku selama menjadi anggota KK "KPRI KARYA GUNA"'
            };
        } catch (e) {
            return {
                header: 'KOPERASI KONSUMEN "KPRI KARYA GUNA"',
                title: 'Peraturan dan Ketentuan Koperasi',
                rules: [
                    'Kartu ini adalah bukti keanggotaan sah Koperasi Konsumen "KPRI KARYA GUNA".',
                    'Wajib dibawa saat melakukan Transaksi Simpan Pinjam.',
                    'Dilarang memindahtangankan kartu ini kepada orang lain.',
                    'Apabila kartu Hilang/Rusak segera lapor / hubungi bagian Administrasi Koperasi.'
                ],
                footer: 'Kartu ini berlaku selama menjadi anggota KK "KPRI KARYA GUNA"'
            };
        }
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnit, setFilterUnit] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [headerText, setHeaderText] = useState(() => {
        try {
            const saved = localStorage.getItem('idcard_headerText');
            return saved ? JSON.parse(saved) : {
                line1: 'KOPERASI KONSUMEN',
                line2: '"KPRI KARYA GUNA"',
                line3: 'AHU -0003503.AH.01.38. TAHUN 2025',
                line4: 'KECAMATAN LEMBEYAN - KAB. MAGETAN',
                cardTitle: 'KARTU ANGGOTA KOPERASI'
            };
        } catch (e) {
            return {
                line1: 'KOPERASI KONSUMEN',
                line2: '"KPRI KARYA GUNA"',
                line3: 'AHU -0003503.AH.01.38. TAHUN 2025',
                line4: 'KECAMATAN LEMBEYAN - KAB. MAGETAN',
                cardTitle: 'KARTU ANGGOTA KOPERASI'
            };
        }
    });
    const [primaryColor, setPrimaryColor] = useState(localStorage.getItem('idcard_primaryColor') || '#1e40af');
    const [validityText, setValidityText] = useState(() => {
        return localStorage.getItem('idcard_validityText') || 'Selama Menjadi Anggota';
    });
    const [previewIndex, setPreviewIndex] = useState(0);
    const [layout, setLayout] = useState(() => {
        try {
            const saved = localStorage.getItem('idcard_layout');
            return saved ? JSON.parse(saved) : {
                headerHeight: 23,
                bodyTop: 21.5,
                bodyLeft: 6,
                footerTop: 52.5,
                qrTop: 38,
                qrRight: 8,
                qrSize: 44,
                logoLeftSize: 17,
                logoRightSize: 24,
                bodyRight: 6,
                lineSpacing: 0.4,
                headerLogoTopLeft: 3,
                headerLogoTopRight: 3,
                headerLogoLeft: 6,
                headerLogoRight: 6,
                headerFontSize: 9.5,
                titleFontSize: 10,
                bodyFontSize: 10,
                footerFontSize: 10,
                footerLeft: 6,
                headerTextTop: 1,
                labelWidth: 32,
                backHeaderHeight: 10,
                backTitleTop: 15,
                backFooterBottom: 5,
                backRulesLeft: 8,
                backRuleSpacing: 1.5,
                backHeaderFontSize: 8,
                backTitleFontSize: 10,
                backRulesFontSize: 6.5,
                backFooterFontSize: 6.5,
                backHeaderTextTop: 0
            };
        } catch (e) {
            return {
                headerHeight: 23,
                bodyTop: 21.5,
                bodyLeft: 6,
                footerTop: 52.5,
                qrTop: 38,
                qrRight: 8,
                qrSize: 44,
                logoLeftSize: 17,
                logoRightSize: 24,
                bodyRight: 6,
                lineSpacing: 0.4,
                headerLogoTopLeft: 3,
                headerLogoTopRight: 3,
                headerLogoLeft: 6,
                headerLogoRight: 6,
                headerFontSize: 9.5,
                titleFontSize: 10,
                bodyFontSize: 10,
                footerFontSize: 10,
                footerLeft: 6,
                headerTextTop: 1,
                labelWidth: 32,
                backHeaderHeight: 10,
                backTitleTop: 15,
                backRulesTop: 24,
                backFooterBottom: 5,
                backRulesLeft: 8,
                backRuleSpacing: 1.5,
                backHeaderFontSize: 8,
                backTitleFontSize: 10,
                backRulesFontSize: 6.5,
                backFooterFontSize: 6.5,
                backHeaderTextTop: 0
            };
        }
    });
    const itemsPerPage = 25;
    const componentRef = useRef();

    useEffect(() => {
        setPreviewIndex(0);
    }, [selectedMembers]);

    const previewData = selectedMembers.length > 0 ? selectedMembers : members;

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await axios.get('/api/members');
            setMembers(res.data);
        } catch (err) {
            console.error('Error fetching members:', err);
        }
    };

    // Filter Logic
    const filteredMembers = members.filter(m => {
        const matchesSearch = m.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             m.no_anggota.toString().includes(searchTerm);
        const matchesUnit = filterUnit === '' || m.unit === filterUnit;
        return matchesSearch && matchesUnit;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const uniqueUnits = [...new Set(members.map(m => m.unit))].filter(Boolean).sort();

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await axios.post('/api/upload', formData);
            alert('Data imported successfully!');
            fetchMembers();
        } catch (err) {
            alert('Failed to upload file.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleLogoUpload = async (e, side) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const res = await axios.post('/api/upload-logo', formData);
            const url = `http://localhost:5000${res.data.url}`;
            if (side === 'left') setLogoLeft(url);
            else if (side === 'right') setLogoRight(url);
            else if (side === 'bgFront') setBgFront(url);
            else if (side === 'bgBack') setBgBack(url);
        } catch (err) {
            alert('Failed to upload image: ' + (err.response?.data || err.message));
            console.error(err);
        }
    };

    const toggleSelect = (member) => {
        if (selectedMembers.find(m => m.id === member.id)) {
            setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
        } else {
            setSelectedMembers([...selectedMembers, member]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedMembers.length === filteredMembers.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers([...filteredMembers]);
        }
    };

    const clearAll = async () => {
        if (window.confirm('Clear all data?')) {
            try {
                await axios.delete('/api/members');
                setMembers([]);
                setSelectedMembers([]);
                setCurrentPage(1);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const saveSettings = () => {
        localStorage.setItem('idcard_headerText', JSON.stringify(headerText));
        localStorage.setItem('idcard_validityText', validityText);
        localStorage.setItem('idcard_layout', JSON.stringify(layout));
        localStorage.setItem('idcard_primaryColor', primaryColor);
        localStorage.setItem('idcard_backText', JSON.stringify(backText));
        if (logoLeft) localStorage.setItem('idcard_logoLeft', logoLeft);
        if (logoRight) localStorage.setItem('idcard_logoRight', logoRight);
        if (bgFront) localStorage.setItem('idcard_bgFront', bgFront);
        if (bgBack) localStorage.setItem('idcard_bgBack', bgBack);
        alert('Pengaturan berhasil disimpan!');
    };

    const clearBg = (type) => {
        if (type === 'front') {
            setBgFront(null);
            localStorage.removeItem('idcard_bgFront');
        } else {
            setBgBack(null);
            localStorage.removeItem('idcard_bgBack');
        }
    };

    const handleResetAll = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua pengaturan dan kembali ke standar?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const exportConfig = () => {
        const config = {
            layout,
            headerText,
            validityText,
            primaryColor,
            backText
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `idcard_config_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const importConfig = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target.result);
                if (config.layout) setLayout(config.layout);
                if (config.headerText) setHeaderText(config.headerText);
                if (config.validityText) setValidityText(config.validityText);
                if (config.primaryColor) setPrimaryColor(config.primaryColor);
                if (config.backText) setBackText(config.backText);
                alert('Konfigurasi berhasil dimuat!');
            } catch (err) {
                alert('Gagal memuat file konfigurasi: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    const handleDirectExportPDF = async () => {
        if (selectedMembers.length === 0) return alert('Pilih data anggota terlebih dahulu!');
        
        const btn = document.getElementById('btn-export-pdf');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Memproses PDF... Mohon Tunggu...';
        btn.disabled = true;

        try {
            // Load libraries if not already loaded
            if (!window.jspdf) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            }

            const { jsPDF } = window.jspdf;
            // Create PDF with custom size 470mm x 310mm
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [470, 310]
            });

            const printArea = componentRef.current;
            const pages = printArea.querySelectorAll('.print-media-a3plus');
            
            // Temporarily show print area for capture
            const originalDisplay = printArea.parentElement.style.display;
            printArea.parentElement.style.display = 'block';
            printArea.parentElement.style.position = 'absolute';
            printArea.parentElement.style.left = '-9999px';
            printArea.parentElement.style.top = '0';

            for (let i = 0; i < pages.length; i++) {
                if (i > 0) doc.addPage([470, 310], 'landscape');
                
                const canvas = await window.html2canvas(pages[i], {
                    scale: 2, // High resolution
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });
                
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                doc.addImage(imgData, 'JPEG', 0, 0, 470, 310);
            }

            // Restore print area
            printArea.parentElement.style.display = originalDisplay;
            printArea.parentElement.style.position = '';
            printArea.parentElement.style.left = '';

            doc.save(`ID_CARDS_${new Date().getTime()}.pdf`);
            alert('PDF Berhasil didownload!');
        } catch (err) {
            console.error(err);
            alert('Gagal mengekspor PDF: ' + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    return (
        <div className="app-container">
            <header className="no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>ID Card Studio</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <label className="btn btn-primary" style={{ background: '#6366f1' }}>
                                <Plus size={18} />
                                Logo Kiri
                                <input type="file" hidden onChange={(e) => handleLogoUpload(e, 'left')} accept="image/*" />
                            </label>
                            <label className="btn btn-primary" style={{ background: '#6366f1' }}>
                                <Plus size={18} />
                                Logo Kanan
                                <input type="file" hidden onChange={(e) => handleLogoUpload(e, 'right')} accept="image/*" />
                            </label>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <label className="btn btn-primary" style={{ background: '#0ea5e9' }}>
                                    <Upload size={18} />
                                    BG Depan
                                    <input type="file" hidden onChange={(e) => handleLogoUpload(e, 'bgFront')} accept="image/*" />
                                </label>
                                {bgFront && <button onClick={() => clearBg('front')} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>×</button>}
                            </div>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <label className="btn btn-primary" style={{ background: '#0ea5e9' }}>
                                    <Upload size={18} />
                                    BG Belakang
                                    <input type="file" hidden onChange={(e) => handleLogoUpload(e, 'bgBack')} accept="image/*" />
                                </label>
                                {bgBack && <button onClick={() => clearBg('back')} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>×</button>}
                            </div>
                        </div>
                        <label className="btn btn-primary">
                            <Upload size={18} />
                            {uploading ? 'Uploading...' : 'Import Excel'}
                            <input type="file" hidden onChange={handleFileUpload} accept=".xls,.xlsx" />
                        </label>
                        <button className="btn btn-danger" onClick={clearAll}>
                            <Trash2 size={18} />
                            Clear Data
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '-1rem', marginBottom: '1rem' }}>
                    <button className="btn" onClick={exportConfig} style={{ background: '#4b5563', color: 'white', fontSize: '0.8rem' }}>
                        <Download size={14} /> Export Config (JSON)
                    </button>
                    <label className="btn" style={{ background: '#4b5563', color: 'white', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <Upload size={14} /> Import Config
                        <input type="file" hidden onChange={importConfig} accept=".json" />
                    </label>
                </div>
            </header>

            <main className="no-print">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2><Users size={20} /> Data Anggota ({filteredMembers.length})</h2>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input 
                                type="text" 
                                placeholder="Cari nama / nomor..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', width: '200px' }}
                            />
                            <select 
                                value={filterUnit}
                                onChange={(e) => { setFilterUnit(e.target.value); setCurrentPage(1); }}
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            >
                                <option value="">Semua Unit</option>
                                {uniqueUnits.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <table className="member-list">
                        <thead>
                            <tr>
                                <th>
                                    <input 
                                        type="checkbox" 
                                        checked={filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length}
                                        onChange={toggleSelectAll}
                                    />
                                    <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>All Filtered</span>
                                </th>
                                <th>No Anggota</th>
                                <th>Nama</th>
                                <th>Unit</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMembers.map(member => (
                                <tr key={member.id}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={!!selectedMembers.find(m => m.id === member.id)}
                                            onChange={() => toggleSelect(member)}
                                        />
                                    </td>
                                    <td>{member.no_anggota}</td>
                                    <td>{member.nama}</td>
                                    <td>{member.unit}</td>
                                    <td>
                                        <button onClick={async () => {
                                            await axios.delete(`/api/members/${member.id}`);
                                            fetchMembers();
                                        }} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                        <button 
                            className="btn" 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            style={{ background: '#f1f5f9' }}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages || 1}</span>
                        <button 
                            className="btn" 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            style={{ background: '#f1f5f9' }}
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <button id="btn-export-pdf" className="btn btn-primary" onClick={handleDirectExportPDF} disabled={selectedMembers.length === 0} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', background: '#0891b2' }}>
                        <FileText size={20} />
                        Download PDF (Otomatis)
                    </button>
                    <button className="btn btn-primary" onClick={handlePrint} disabled={selectedMembers.length === 0} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', background: '#6366f1' }}>
                        <Printer size={20} />
                        Cetak Manual (Browser)
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '1rem' }}>
                        <input 
                            type="checkbox" 
                            id="backOnce" 
                            checked={printBackOnce} 
                            onChange={(e) => setPrintBackOnce(e.target.checked)} 
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label htmlFor="backOnce" style={{ fontWeight: 'bold', cursor: 'pointer', color: '#475569' }}>Hanya Cetak 1 Halaman Belakang (Efisien)</label>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 'auto' }}>*Gunakan kertas A3+ (329 x 483 mm)</span>
                </div>

                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2><Plus size={20} /> Kustomisasi Teks</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button className="btn btn-primary" onClick={saveSettings} style={{ background: '#059669' }}>
                                <Save size={18} />
                                Simpan Pengaturan
                            </button>
                            <button className="btn btn-primary" onClick={handleResetAll} style={{ background: '#dc2626' }}>
                                <RotateCcw size={18} />
                                Reset Semua
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3>Kop Kartu (Header)</h3>
                            <input type="text" placeholder="Baris 1" value={headerText.line1} onChange={(e) => setHeaderText({...headerText, line1: e.target.value})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                            <input type="text" placeholder="Baris 2 (Nama Koperasi)" value={headerText.line2} onChange={(e) => setHeaderText({...headerText, line2: e.target.value})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontWeight: 'bold' }} />
                            <input type="text" placeholder="Baris 3" value={headerText.line3} onChange={(e) => setHeaderText({...headerText, line3: e.target.value})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                            <input type="text" placeholder="Baris 4" value={headerText.line4} onChange={(e) => setHeaderText({...headerText, line4: e.target.value})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3>Masa Berlaku & Warna</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ whiteSpace: 'nowrap' }}>Judul Kartu : </span>
                                <input type="text" value={headerText.cardTitle} onChange={(e) => setHeaderText({...headerText, cardTitle: e.target.value})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', width: '100%' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ whiteSpace: 'nowrap' }}>Masa Berlaku : </span>
                                <input type="text" value={validityText} onChange={(e) => setValidityText(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', width: '100%' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ whiteSpace: 'nowrap' }}>Warna Utama : </span>
                                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ height: '40px', width: '60px', border: 'none', cursor: 'pointer' }} />
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{primaryColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2><Plus size={20} /> Pengaturan Tata Letak</h2>
                        <button className="btn" onClick={() => setLayout({
                            headerHeight: 23,
                            bodyTop: 21.5,
                            bodyLeft: 6,
                            footerTop: 52.5,
                            qrTop: 38,
                            qrRight: 8,
                            qrSize: 44,
                            logoLeftSize: 17,
                            logoRightSize: 24,
                            bodyRight: 6,
                            lineSpacing: 0.4,
                            headerLogoTopLeft: 3,
                            headerLogoTopRight: 3,
                            headerLogoLeft: 6,
                            headerLogoRight: 6,
                            headerFontSize: 9.5,
                            titleFontSize: 10,
                            bodyFontSize: 10,
                            footerFontSize: 10,
                            footerLeft: 6,
                            headerTextTop: 1,
                            labelWidth: 32,
                            backHeaderHeight: 10,
                            backTitleTop: 15,
                            backRulesTop: 24,
                            backFooterBottom: 5,
                            backRulesLeft: 8,
                            backRuleSpacing: 1.5,
                            backHeaderFontSize: 8,
                            backTitleFontSize: 10,
                            backRulesFontSize: 6.5,
                            backFooterFontSize: 6.5,
                            backHeaderTextTop: 0
                        })} style={{ fontSize: '0.8rem', background: '#f1f5f9' }}>Reset Layout</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div className="control-group">
                            <label>Tinggi Header (mm)</label>
                            <input type="range" min="15" max="40" step="0.5" value={layout.headerHeight} onChange={(e) => setLayout({...layout, headerHeight: parseFloat(e.target.value)})} />
                            <span>{layout.headerHeight} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Posisi Atas Konten (mm)</label>
                            <input type="range" min="15" max="40" step="0.5" value={layout.bodyTop} onChange={(e) => setLayout({...layout, bodyTop: parseFloat(e.target.value)})} />
                            <span>{layout.bodyTop} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Margin Kiri (mm)</label>
                            <input type="range" min="0" max="15" step="0.5" value={layout.bodyLeft} onChange={(e) => setLayout({...layout, bodyLeft: parseFloat(e.target.value)})} />
                            <span>{layout.bodyLeft} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Posisi Masa Berlaku (mm)</label>
                            <input type="range" min="40" max="58" step="0.5" value={layout.footerTop} onChange={(e) => setLayout({...layout, footerTop: parseFloat(e.target.value)})} />
                            <span>{layout.footerTop} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Posisi QR (Atas - mm)</label>
                            <input type="range" min="20" max="55" step="0.5" value={layout.qrTop} onChange={(e) => setLayout({...layout, qrTop: parseFloat(e.target.value)})} />
                            <span>{layout.qrTop} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Posisi QR (Kanan - mm)</label>
                            <input type="range" min="0" max="20" step="0.5" value={layout.qrRight} onChange={(e) => setLayout({...layout, qrRight: parseFloat(e.target.value)})} />
                            <span>{layout.qrRight} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Ukuran QR (px)</label>
                            <input type="range" min="30" max="80" step="1" value={layout.qrSize} onChange={(e) => setLayout({...layout, qrSize: parseInt(e.target.value)})} />
                            <span>{layout.qrSize} px</span>
                        </div>
                        <div className="control-group">
                            <label>Ukuran Logo Kiri (mm)</label>
                            <input type="range" min="5" max="30" step="0.5" value={layout.logoLeftSize} onChange={(e) => setLayout({...layout, logoLeftSize: parseFloat(e.target.value)})} />
                            <span>{layout.logoLeftSize} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Ukuran Logo Kanan (mm)</label>
                            <input type="range" min="5" max="40" step="0.5" value={layout.logoRightSize} onChange={(e) => setLayout({...layout, logoRightSize: parseFloat(e.target.value)})} />
                            <span>{layout.logoRightSize} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Margin Kanan Isi (mm)</label>
                            <input type="range" min="0" max="15" step="0.5" value={layout.bodyRight} onChange={(e) => setLayout({...layout, bodyRight: parseFloat(e.target.value)})} />
                            <span>{layout.bodyRight} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Jarak Baris (mm)</label>
                            <input type="range" min="0" max="5" step="0.1" value={layout.lineSpacing} onChange={(e) => setLayout({...layout, lineSpacing: parseFloat(e.target.value)})} />
                            <span>{layout.lineSpacing} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Margin Atas Logo Kiri (mm)</label>
                            <input type="range" min="0" max="10" step="0.5" value={layout.headerLogoTopLeft} onChange={(e) => setLayout({...layout, headerLogoTopLeft: parseFloat(e.target.value)})} />
                            <span>{layout.headerLogoTopLeft} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Margin Atas Logo Kanan (mm)</label>
                            <input type="range" min="0" max="10" step="0.5" value={layout.headerLogoTopRight} onChange={(e) => setLayout({...layout, headerLogoTopRight: parseFloat(e.target.value)})} />
                            <span>{layout.headerLogoTopRight} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Margin Kiri Logo Kiri (mm)</label>
                            <input type="range" min="0" max="20" step="0.5" value={layout.headerLogoLeft} onChange={(e) => setLayout({...layout, headerLogoLeft: parseFloat(e.target.value)})} />
                            <span>{layout.headerLogoLeft} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Margin Kanan Logo Kanan (mm)</label>
                            <input type="range" min="0" max="20" step="0.5" value={layout.headerLogoRight} onChange={(e) => setLayout({...layout, headerLogoRight: parseFloat(e.target.value)})} />
                            <span>{layout.headerLogoRight} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Font Header (pt)</label>
                            <input type="range" min="5" max="15" step="0.1" value={layout.headerFontSize} onChange={(e) => setLayout({...layout, headerFontSize: parseFloat(e.target.value)})} />
                            <span>{layout.headerFontSize} pt</span>
                        </div>
                        <div className="control-group">
                            <label>Font Judul Kartu (pt)</label>
                            <input type="range" min="5" max="15" step="0.1" value={layout.titleFontSize} onChange={(e) => setLayout({...layout, titleFontSize: parseFloat(e.target.value)})} />
                            <span>{layout.titleFontSize} pt</span>
                        </div>
                        <div className="control-group">
                            <label>Font Data Anggota (pt)</label>
                            <input type="range" min="5" max="15" step="0.1" value={layout.bodyFontSize} onChange={(e) => setLayout({...layout, bodyFontSize: parseFloat(e.target.value)})} />
                            <span>{layout.bodyFontSize} pt</span>
                        </div>
                        <div className="control-group">
                            <label>Font Masa Berlaku (pt)</label>
                            <input type="range" min="5" max="15" step="0.1" value={layout.footerFontSize} onChange={(e) => setLayout({...layout, footerFontSize: parseFloat(e.target.value)})} />
                            <span>{layout.footerFontSize} pt</span>
                        </div>
                        <div className="control-group">
                            <label>Posisi Masa Berlaku (Kiri - mm)</label>
                            <input type="range" min="0" max="60" step="0.5" value={layout.footerLeft} onChange={(e) => setLayout({...layout, footerLeft: parseFloat(e.target.value)})} />
                            <span>{layout.footerLeft} mm</span>
                        </div>
                        <div className="control-group">
                            <label>Margin Atas Teks Kop (mm)</label>
                            <input type="range" min="-5" max="15" step="0.5" value={layout.headerTextTop} onChange={(e) => setLayout({...layout, headerTextTop: parseFloat(e.target.value)})} />
                            <span>{layout.headerTextTop} mm</span>
                        </div>
                        <div className="control-group" style={{ background: '#f0f9ff', padding: '10px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                            <label style={{ fontWeight: 'bold', color: '#0369a1' }}>Lebar Label Data (mm) - [Geser untuk luruskan Titik Dua]</label>
                            <input type="range" min="15" max="50" step="0.5" value={layout.labelWidth} onChange={(e) => setLayout({...layout, labelWidth: parseFloat(e.target.value)})} />
                            <span style={{ fontWeight: 'bold' }}>{layout.labelWidth} mm</span>
                        </div>
                        <div className="control-group" style={{ background: '#fff7ed', padding: '10px', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                            <label style={{ fontWeight: 'bold', color: '#9a3412' }}>[BELAKANG] Tinggi Header (mm)</label>
                            <input type="range" min="5" max="30" step="0.5" value={layout.backHeaderHeight} onChange={(e) => setLayout({...layout, backHeaderHeight: parseFloat(e.target.value)})} />
                            <span>{layout.backHeaderHeight} mm</span>
                        </div>
                        <div className="control-group" style={{ background: '#fff7ed', padding: '10px', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                            <label style={{ fontWeight: 'bold', color: '#9a3412' }}>[BELAKANG] Posisi Judul (mm)</label>
                            <input type="range" min="5" max="30" step="0.5" value={layout.backTitleTop} onChange={(e) => setLayout({...layout, backTitleTop: parseFloat(e.target.value)})} />
                            <span>{layout.backTitleTop} mm</span>
                        </div>
                        <div className="control-group" style={{ background: '#fff7ed', padding: '10px', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                            <label style={{ fontWeight: 'bold', color: '#9a3412' }}>[BELAKANG] Posisi Aturan (mm)</label>
                            <input type="range" min="15" max="45" step="0.5" value={layout.backRulesTop} onChange={(e) => setLayout({...layout, backRulesTop: parseFloat(e.target.value)})} />
                            <span>{layout.backRulesTop} mm</span>
                        </div>
                        <div className="control-group" style={{ background: '#fff7ed', padding: '10px', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                            <label style={{ fontWeight: 'bold', color: '#9a3412' }}>[BELAKANG] Jarak Footer (mm)</label>
                            <input type="range" min="2" max="15" step="0.5" value={layout.backFooterBottom} onChange={(e) => setLayout({...layout, backFooterBottom: parseFloat(e.target.value)})} />
                            <span>{layout.backFooterBottom} mm</span>
                        </div>
                        <div className="control-group" style={{ background: '#fff7ed', padding: '10px', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                            <label style={{ fontWeight: 'bold', color: '#9a3412' }}>[BELAKANG] Jarak Antar Aturan (mm)</label>
                            <input type="range" min="0.5" max="5" step="0.1" value={layout.backRuleSpacing} onChange={(e) => setLayout({...layout, backRuleSpacing: parseFloat(e.target.value)})} />
                            <span>{layout.backRuleSpacing} mm</span>
                        </div>
                        <div className="control-group" style={{ background: '#fff7ed', padding: '10px', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                            <label style={{ fontWeight: 'bold', color: '#9a3412' }}>[BELAKANG] Margin Kiri Aturan (mm)</label>
                            <input type="range" min="2" max="20" step="0.5" value={layout.backRulesLeft} onChange={(e) => setLayout({...layout, backRulesLeft: parseFloat(e.target.value)})} />
                            <span>{layout.backRulesLeft} mm</span>
                        </div>
                        <div className="control-group" style={{ background: '#ecfdf5', padding: '10px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                            <label style={{ fontWeight: 'bold', color: '#059669' }}>[BELAKANG] Font Header (pt)</label>
                            <input type="range" min="5" max="15" step="0.1" value={layout.backHeaderFontSize} onChange={(e) => setLayout({...layout, backHeaderFontSize: parseFloat(e.target.value)})} />
                            <span>{layout.backHeaderFontSize} pt</span>
                        </div>
                        <div className="control-group" style={{ background: '#ecfdf5', padding: '10px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                            <label style={{ fontWeight: 'bold', color: '#059669' }}>[BELAKANG] Font Judul (pt)</label>
                            <input type="range" min="5" max="15" step="0.1" value={layout.backTitleFontSize} onChange={(e) => setLayout({...layout, backTitleFontSize: parseFloat(e.target.value)})} />
                            <span>{layout.backTitleFontSize} pt</span>
                        </div>
                        <div className="control-group" style={{ background: '#ecfdf5', padding: '10px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                            <label style={{ fontWeight: 'bold', color: '#059669' }}>[BELAKANG] Font Aturan (pt)</label>
                            <input type="range" min="4" max="12" step="0.1" value={layout.backRulesFontSize} onChange={(e) => setLayout({...layout, backRulesFontSize: parseFloat(e.target.value)})} />
                            <span>{layout.backRulesFontSize} pt</span>
                        </div>
                        <div className="control-group" style={{ background: '#ecfdf5', padding: '10px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                            <label style={{ fontWeight: 'bold', color: '#059669' }}>[BELAKANG] Font Footer (pt)</label>
                            <input type="range" min="4" max="12" step="0.1" value={layout.backFooterFontSize} onChange={(e) => setLayout({...layout, backFooterFontSize: parseFloat(e.target.value)})} />
                            <span>{layout.backFooterFontSize} pt</span>
                        </div>
                        <div className="control-group" style={{ background: '#f0fdf4', padding: '10px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                            <label style={{ fontWeight: 'bold', color: '#166534' }}>[BELAKANG] Margin Atas Teks Kop (mm)</label>
                            <input type="range" min="-5" max="5" step="0.5" value={layout.backHeaderTextTop} onChange={(e) => setLayout({...layout, backHeaderTextTop: parseFloat(e.target.value)})} />
                            <span>{layout.backHeaderTextTop} mm</span>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2><RotateCcw size={20} /> Kustomisasi Sisi Belakang</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3>Teks Utama Belakang</h3>
                            <div className="control-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>Header Belakang</label>
                                <input type="text" className="form-control" value={backText.header} onChange={(e) => setBackText({...backText, header: e.target.value})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                            </div>
                            <div className="control-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>Judul Belakang</label>
                                <input type="text" className="form-control" value={backText.title} onChange={(e) => setBackText({...backText, title: e.target.value})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                            </div>
                            <div className="control-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>Footer Belakang</label>
                                <input type="text" className="form-control" value={backText.footer} onChange={(e) => setBackText({...backText, footer: e.target.value})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3>Peraturan Koperasi</h3>
                            {backText.rules.map((rule, idx) => (
                                <div key={idx} className="control-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label>Peraturan {idx + 1}</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="2" 
                                        value={rule} 
                                        onChange={(e) => {
                                            const newRules = [...backText.rules];
                                            newRules[idx] = e.target.value;
                                            setBackText({...backText, rules: newRules});
                                        }}
                                        style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>Live Preview</h2>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button 
                                className="btn" 
                                disabled={previewIndex === 0} 
                                onClick={() => setPreviewIndex(previewIndex - 1)}
                                style={{ padding: '0.3rem 0.8rem', background: '#f1f5f9' }}
                            >
                                &lt; Prev
                            </button>
                            <span style={{ fontSize: '0.9rem' }}>{previewIndex + 1} / {previewData.length || 1}</span>
                            <button 
                                className="btn" 
                                disabled={previewIndex >= (previewData.length - 1)} 
                                onClick={() => setPreviewIndex(previewIndex + 1)}
                                style={{ padding: '0.3rem 0.8rem', background: '#f1f5f9' }}
                            >
                                Next &gt;
                            </button>
                        </div>
                    </div>
                    <div style={{ background: '#eee', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', borderRadius: '8px', overflow: 'auto' }}>
                        {previewData.length > 0 ? (
                            <>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>SISI DEPAN</p>
                                    <IDCard member={previewData[previewIndex]} logoLeft={logoLeft} logoRight={logoRight} headerText={headerText} validityText={validityText} layout={layout} primaryColor={primaryColor} bgImage={bgFront} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>SISI BELAKANG</p>
                                    <IDCard isBack={true} bgImage={bgBack} primaryColor={primaryColor} backText={backText} layout={layout} />
                                </div>
                            </>
                        ) : (
                            <p>Import data to see preview</p>
                        )}
                    </div>
                </div>
            </main>

            {/* Hidden Print Area */}
            <div style={{ display: 'none' }}>
                <div ref={componentRef} className="print-area">
                    {Array.from({ length: Math.ceil(selectedMembers.length / 25) }).map((_, pageIndex) => (
                        <React.Fragment key={pageIndex}>
                            {/* Front Sheet */}
                            <div className="print-media-a3plus" style={{ pageBreakAfter: 'always' }}>
                                {selectedMembers.slice(pageIndex * 25, (pageIndex + 1) * 25).map(member => (
                                    <IDCard key={`front-${member.id}`} member={member} logoLeft={logoLeft} logoRight={logoRight} headerText={headerText} validityText={validityText} layout={layout} primaryColor={primaryColor} bgImage={bgFront} />
                                ))}
                            </div>
                            {/* Back Sheet - Only show if not printBackOnce OR if it's the very first page */}
                            {(!printBackOnce || pageIndex === 0) && (
                                <div className="print-media-a3plus" style={{ pageBreakAfter: 'always' }}>
                                    {/* Fill the whole A3+ sheet with 25 identical back cards */}
                                    {Array.from({ length: 25 }).map((_, idx) => (
                                        <IDCard key={`back-${pageIndex}-${idx}`} isBack={true} bgImage={bgBack} primaryColor={primaryColor} backText={backText} layout={layout} />
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

const IDCard = ({ member, logoLeft, logoRight, headerText, validityText, layout, primaryColor, bgImage, isBack, backText }) => {
    if (isBack) {
        return (
            <div className="id-card-render" style={{ 
                width: '92mm', 
                height: '60mm', 
                position: 'relative', 
                overflow: 'hidden', 
                background: 'white',
                border: 'none',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}>
                {bgImage && (
                    <img src={bgImage} alt="Background Back" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
                )}

                {/* Garis Pola Default - Hanya muncul jika tidak ada background foto */}
                {!bgImage && (
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none', zIndex: 1 }}>
                        <svg width="100%" height="100%" viewBox="0 0 92 60">
                            <g fill="none" stroke={primaryColor} strokeWidth="0.15">
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <path key={`bw-${i}`} d={`M${i*6},0 C${20+i*2},30 ${50-i*3},50 100,${60-i*2}`} />
                                ))}
                            </g>
                        </svg>
                    </div>
                )}

                {/* Header Biru/Hijau - Selalu muncul agar teks terbaca */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${layout.backHeaderHeight}mm`, background: primaryColor, zIndex: 2 }}></div>
                
                {/* Konten Teks - Selalu muncul di lapisan paling atas */}
                <div style={{ 
                    position: 'absolute', 
                    top: `${layout.backHeaderTextTop}mm`, 
                    left: 0, 
                    right: 0, 
                    height: `${layout.backHeaderHeight}mm`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'white', 
                    fontSize: `${layout.backHeaderFontSize}pt`, 
                    fontWeight: 'bold', 
                    zIndex: 3, 
                    textAlign: 'center', 
                    padding: '0 2mm' 
                }}>
                    {backText.header}
                </div>
                <div style={{ position: 'absolute', top: `${layout.backTitleTop}mm`, left: 0, right: 0, textAlign: 'center', zIndex: 3 }}>
                    <p style={{ color: primaryColor, fontWeight: '900', fontSize: `${layout.backTitleFontSize}pt`, margin: 0, textTransform: 'uppercase' }}>{backText.title}</p>
                </div>
                <div style={{ position: 'absolute', top: `${layout.backRulesTop}mm`, left: `${layout.backRulesLeft}mm`, right: `${layout.backRulesLeft}mm`, zIndex: 3, color: '#333', fontSize: `${layout.backRulesFontSize}pt`, lineHeight: 1.3, textAlign: 'left' }}>
                    {backText.rules.map((text, i) => (
                        <div key={i} style={{ display: 'flex', gap: '2mm', marginBottom: `${layout.backRuleSpacing}mm`, alignItems: 'start' }}>
                            <span style={{ flexShrink: 0, width: '4mm', fontWeight: 'bold' }}>{i + 1}.</span>
                            <span>{text}</span>
                        </div>
                    ))}
                </div>
                <div style={{ position: 'absolute', bottom: `${layout.backFooterBottom}mm`, left: 0, right: 0, textAlign: 'center', zIndex: 3, color: primaryColor, fontWeight: 'bold', fontSize: `${layout.backFooterFontSize}pt`, fontStyle: 'italic' }}>
                    {backText.footer}
                </div>
                <div className="no-print" style={{ position: 'absolute', top: '3mm', left: '3mm', width: '86mm', height: '54mm', border: '1px dashed white', borderRadius: '2mm', zIndex: 20, pointerEvents: 'none', opacity: 0.6 }}></div>
            </div>
        );
    }

    return (
        <div className="id-card-render" style={{ 
            width: '92mm', 
            height: '60mm', 
            position: 'relative', 
            overflow: 'hidden', 
            background: 'white',
            border: 'none',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
            {bgImage && (
                <img src={bgImage} alt="Background Front" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            )}
            
            {/* Background Pattern */}
            {!bgImage && (
                <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    opacity: 0.1, 
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    zIndex: 1
                }}>
                    <svg width="100%" height="100%" viewBox="0 0 92 60">
                        <g fill="none" stroke={primaryColor} strokeWidth="0.15">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <path key={`w1-${i}`} d={`M${-10 + i*2},60 C${20 + i*5},${55 - i*2} ${50 + i*2},${45 + i*2} ${100},${58 - i}`} />
                            ))}
                            {Array.from({ length: 12 }).map((_, i) => (
                                <path key={`w2-${i}`} d={`M${-10 + i*3},55 C${30 + i*2},${45 + i} ${60 + i*5},${50 - i*2} ${100},${52 + i}`} />
                            ))}
                        </g>
                    </svg>
                </div>
            )}

            {/* Header Area with forced primary color background */}
            <div className="id-card-header" style={{ 
                zIndex: 3, 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: `${layout.headerHeight}mm`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: primaryColor // Force the green color here
            }}>
                <div style={{ position: 'absolute', left: `${layout.headerLogoLeft}mm`, top: `${layout.headerLogoTopLeft}mm`, height: `${layout.logoLeftSize}mm`, width: `${layout.logoLeftSize}mm`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {logoLeft ? (
                        <img src={logoLeft} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ width: '80%', height: '80%', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></div>
                    )}
                </div>
                <div style={{ 
                    position: 'absolute',
                    left: `${layout.headerLogoLeft + layout.logoLeftSize}mm`,
                    right: `${layout.headerLogoRight + layout.logoRightSize}mm`,
                    top: `${layout.headerTextTop}mm`,
                    bottom: '0',
                    textAlign: 'center', 
                    lineHeight: 1.1, 
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}>
                    <p style={{ fontSize: `${layout.headerFontSize * 0.74}pt`, fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap' }}>{headerText.line1}</p>
                    <p style={{ fontSize: `${layout.headerFontSize}pt`, fontWeight: '900', margin: '0.2mm 0', whiteSpace: 'nowrap' }}>{headerText.line2}</p>
                    <p style={{ fontSize: `${layout.headerFontSize * 0.52}pt`, margin: 0, opacity: 0.9, whiteSpace: 'nowrap' }}>{headerText.line3}</p>
                    <p style={{ fontSize: `${layout.headerFontSize * 0.58}pt`, margin: 0, opacity: 0.9, whiteSpace: 'nowrap' }}>{headerText.line4}</p>
                </div>
                <div style={{ position: 'absolute', right: `${layout.headerLogoRight}mm`, top: `${layout.headerLogoTopRight}mm`, height: `${layout.logoRightSize * 0.7}mm`, width: `${layout.logoRightSize}mm`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {logoRight ? (
                        <img src={logoRight} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ width: '90%', height: '70%', background: '#fbbf24', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontSize: '6pt', fontWeight: 'bold' }}>K-MART</div>
                    )}
                </div>
            </div>

            <div className="id-card-body" style={{ 
                zIndex: 2, 
                position: 'absolute', 
                top: `${layout.bodyTop}mm`, 
                left: `${layout.bodyLeft}mm`, 
                right: `${layout.bodyRight}mm`, 
                display: 'flex', 
                flexDirection: 'column', 
                maxHeight: '35mm',
                pointerEvents: 'none'
            }}>
                <p style={{ textAlign: 'center', color: primaryColor, fontWeight: '900', fontSize: `${layout.titleFontSize}pt`, marginBottom: '1.5mm', textTransform: 'uppercase' }}>{headerText.cardTitle}</p>
                <div style={{ padding: '0 1mm' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed', pointerEvents: 'none' }}>
                        <tbody>
                            {[
                                { label: 'Nomor Anggota', value: member.no_anggota, bold: true },
                                { label: 'Nama Anggota', value: member.nama, bold: true, upper: true },
                                { label: 'Alamat', value: member.alamat, isAddress: true },
                                { label: 'Unit / Instansi', value: member.unit, isAddress: true }
                            ].map((row, i) => (
                                <tr key={i} style={{ verticalAlign: 'top', color: '#000', lineHeight: 1.2 }}>
                                    <td style={{ 
                                        width: `${layout.labelWidth}mm`, 
                                        fontSize: `${layout.bodyFontSize}pt`, 
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden',
                                        textAlign: 'left',
                                        padding: `${layout.lineSpacing/2}mm 0`
                                    }}>
                                        {row.label}
                                    </td>
                                    <td style={{ 
                                        width: '4mm', 
                                        fontSize: `${layout.bodyFontSize}pt`, 
                                        textAlign: 'center',
                                        padding: `${layout.lineSpacing/2}mm 0`
                                    }}>
                                        :
                                    </td>
                                    <td style={{ 
                                        fontSize: `${layout.bodyFontSize}pt`,
                                        textAlign: 'left',
                                        fontWeight: row.bold ? (row.upper ? '900' : 'bold') : 'normal',
                                        textTransform: row.upper ? 'uppercase' : 'none',
                                        padding: `${layout.lineSpacing/2}mm 0`,
                                        paddingRight: row.isAddress ? `${(layout.qrSize / 3.78) + layout.qrRight - layout.bodyRight + 1}mm` : '0',
                                        wordBreak: 'break-word',
                                        lineHeight: 1.1
                                    }}>
                                        {row.value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ 
                zIndex: 4, 
                position: 'absolute', 
                top: `${layout.footerTop}mm`, 
                left: `${layout.footerLeft}mm`, 
                fontWeight: 'bold', 
                color: primaryColor, 
                fontStyle: 'italic', 
                fontSize: `${layout.footerFontSize}pt`,
                whiteSpace: 'nowrap'
            }}>
                Masa Berlaku : <span>{validityText}</span>
            </div>

            <div style={{ 
                zIndex: 3, 
                position: 'absolute', 
                top: `${layout.qrTop}mm`, 
                right: `${layout.qrRight}mm`, 
                background: 'white', 
                padding: '1mm', 
                borderRadius: '3px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <QRCodeSVG value={String(member.no_anggota)} size={layout.qrSize} />
            </div>
            <div className="no-print" style={{ position: 'absolute', top: '3mm', left: '3mm', width: '86mm', height: '54mm', border: '1px dashed white', borderRadius: '2mm', zIndex: 20, pointerEvents: 'none', opacity: 0.6 }}></div>
        </div>
    );
};

export default App;
