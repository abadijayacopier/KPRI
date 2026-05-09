import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, Printer, Trash2, Users, FileSpreadsheet, Plus, Save, RotateCcw, Search, Edit2, Download, ChevronLeft, ChevronRight, FileText, Eye } from 'lucide-react';

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
    const [previewMember, setPreviewMember] = useState(null);
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
        loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11');
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
            
            if (side === 'left') {
                setLogoLeft(url);
                localStorage.setItem('idcard_logoLeft', url);
            } else if (side === 'right') {
                setLogoRight(url);
                localStorage.setItem('idcard_logoRight', url);
            } else if (side === 'bgFront') {
                setBgFront(url);
                localStorage.setItem('idcard_bgFront', url);
            } else if (side === 'bgBack') {
                setBgBack(url);
                localStorage.setItem('idcard_bgBack', url);
            }
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

    const handlePrintAction = useReactToPrint({
        content: () => componentRef.current,
    });

    const handlePrint = () => {
        if (selectedMembers.length === 0) {
            if (window.Swal) {
                window.Swal.fire({
                    title: 'Data Belum Dipilih',
                    text: 'Mohon centang minimal satu anggota di tabel sebelum mencetak.',
                    icon: 'warning',
                    confirmButtonColor: '#6366f1'
                });
            } else {
                alert('Pilih data anggota terlebih dahulu!');
            }
            return;
        }
        handlePrintAction();
    };

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
        if (selectedMembers.length === 0) {
            if (window.Swal) {
                window.Swal.fire({
                    title: 'Data Belum Dipilih',
                    text: 'Mohon centang minimal satu anggota di tabel untuk diekspor ke PDF.',
                    icon: 'warning',
                    confirmButtonColor: '#0891b2'
                });
            } else {
                alert('Pilih data anggota terlebih dahulu!');
            }
            return;
        }
        
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
                btn.innerHTML = `<span class="spinner"></span> Memproses Halaman ${i + 1}/${pages.length}...`;
                
                if (i > 0) doc.addPage([470, 310], 'landscape');
                
                const canvas = await window.html2canvas(pages[i], {
                    scale: 3.125, // Exactly 300 DPI
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });
                
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                doc.addImage(imgData, 'JPEG', 0, 0, 470, 310);
                
                // Small delay to let UI breath
                await new Promise(r => setTimeout(r, 100));
            }

            // Restore print area
            printArea.parentElement.style.display = originalDisplay;
            printArea.parentElement.style.position = '';
            printArea.parentElement.style.left = '';

            doc.save(`ID_CARDS_PRODUKSI_${new Date().getTime()}.pdf`);
            if (window.Swal) {
                window.Swal.fire('Berhasil!', 'PDF Produksi 300 DPI telah siap.', 'success');
            } else {
                alert('PDF Berhasil didownload!');
            }
        } catch (err) {
            console.error(err);
            alert('Gagal mengekspor PDF: ' + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    const handleExportImage = async (side, memberId) => {
        try {
            // Load html2canvas if not already loaded
            if (!window.html2canvas) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            }

            // Try different ID patterns for preview list or modal
            let element = document.getElementById(`preview-${side}-${memberId}`);
            if (!element) element = document.getElementById(`modal-${side}-${memberId}`);

            const targetMember = members.find(m => String(m.id) === String(memberId)) || { nama: 'ANGGOTA' };
            const safeName = targetMember.nama.replace(/[^a-z0-9]/gi, '_').toUpperCase();

            // Capture BOTH sides for the premium mockup
            const frontEl = document.getElementById(`preview-front-${memberId}`) || document.getElementById(`modal-front-${memberId}`);
            const backEl = document.getElementById(`preview-back-${memberId}`) || document.getElementById(`modal-back-${memberId}`);

            if (!frontEl || !backEl) return alert('Elemen kartu tidak lengkap! Mohon pastikan preview depan & belakang terlihat.');

            const frontCanvas = await window.html2canvas(frontEl, { scale: 5, useCORS: true });
            const backCanvas = await window.html2canvas(backEl, { scale: 5, useCORS: true });

            // 1. Setup Mockup Canvas (Super High Res 2400x2400)
            const mockupCanvas = document.createElement('canvas');
            const ctx = mockupCanvas.getContext('2d');
            mockupCanvas.width = 2400;
            mockupCanvas.height = 2400;

            // 2. Draw Realistic Background (Desk Texture)
            const grad = ctx.createLinearGradient(0, 0, 0, 2400);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.2, '#f8fafc');
            grad.addColorStop(1, '#e2e8f0');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 2400, 2400);
            
            // Subtle texture/lines
            ctx.strokeStyle = 'rgba(0,0,0,0.03)';
            for(let i=0; i<2400; i+=30) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(2400, i); ctx.stroke();
            }

            // 3. Draw BRANDED HEADER
            ctx.textAlign = 'center';
            ctx.fillStyle = '#64748b'; ctx.font = 'bold 50px Inter, sans-serif'; ctx.fillText('MOCKUP KARTU', 1200, 150);
            ctx.fillStyle = '#1e293b'; ctx.font = '900 120px Inter, sans-serif'; ctx.fillText('ABADI JAYA', 1200, 300);
            ctx.fillStyle = '#334155'; ctx.font = 'bold 55px Inter, sans-serif'; ctx.fillText('Fotocopy, ATK, Digital Print, & Percetakan', 1200, 400);
            ctx.fillStyle = '#475569'; ctx.font = '45px Inter, sans-serif'; ctx.fillText('Desa Kediren kec. Lembeyan - Magetan | WA / 085655620979', 1200, 480);
            
            ctx.beginPath(); ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 3; ctx.moveTo(300, 560); ctx.lineTo(2100, 560); ctx.stroke();

            // 4. FUNCTION TO DRAW ROUNDED CARD WITH SHADOW
            const drawRoundedCard = (srcCanvas, x, y, rotation, scale = 1) => {
                const w = (86 / 92) * srcCanvas.width * scale;
                const h = (54 / 60) * srcCanvas.height * scale;
                const off = (3 / 92) * srcCanvas.width;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.shadowBlur = 60;
                ctx.shadowOffsetX = 20;
                ctx.shadowOffsetY = 30;

                const radius = 60 * scale; // Larger radius for high res
                ctx.beginPath();
                ctx.moveTo(-w/2 + radius, -h/2);
                ctx.lineTo(w/2 - radius, -h/2);
                ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + radius);
                ctx.lineTo(w/2, h/2 - radius);
                ctx.quadraticCurveTo(w/2, h/2, w/2 - radius, h/2);
                ctx.lineTo(-w/2 + radius, h/2);
                ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - radius);
                ctx.lineTo(-w/2, -h/2 + radius);
                ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + radius, -h/2);
                ctx.closePath();
                ctx.clip();

                ctx.drawImage(srcCanvas, off, off, srcCanvas.width - off*2, srcCanvas.height - off*2, -w/2, -h/2, w, h);
                ctx.restore();
            };

            // 5. DRAW THE STACK BASED ON SELECTED SIDE
            if (side === 'back') {
                // Back side on TOP and STRAIGHT
                drawRoundedCard(frontCanvas, 1350, 1500, Math.PI / 12, 1.0); 
                drawRoundedCard(backCanvas, 1100, 1400, 0, 1.15);
            } else {
                // Front side on TOP and STRAIGHT (Default)
                drawRoundedCard(backCanvas, 1350, 1500, Math.PI / 12, 1.0); 
                drawRoundedCard(frontCanvas, 1100, 1400, 0, 1.15);
            }

            // 6. WATERMARK (Top Layer)
            ctx.save();
            ctx.translate(1200, 1400);
            ctx.rotate(-Math.PI / 6);
            ctx.font = 'bold 180px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.textAlign = 'center';
            ctx.fillText('ABADI JAYA COPIER', 0, 0);
            ctx.restore();

            const link = document.createElement('a');
            link.download = `PREMIUM_MOCKUP_${side.toUpperCase()}_${safeName}.jpg`;
            link.href = mockupCanvas.toDataURL('image/jpeg', 1.0);
            link.click();
        } catch (err) {
            console.error(err);
            alert('Gagal membuat mockup. Pastikan preview terlihat.');
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
                                <th>No. Anggota</th>
                                <th>Nama</th>
                                <th>Alamat</th>
                                <th>Unit</th>
                                <th style={{ width: '100px' }}>Aksi</th>
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
                                    <td>{member.alamat}</td>
                                    <td>{member.unit}</td>
                                    <td style={{ display: 'flex', gap: '5px' }}>
                                        <button 
                                            onClick={() => setPreviewMember(member)} 
                                            className="btn btn-sm" 
                                            style={{ background: '#6366f1', color: 'white', padding: '5px', display: 'flex', alignItems: 'center' }}
                                            title="Preview"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if (!window.Swal) return;
                                                const { value: formValues } = await window.Swal.fire({
                                                    title: 'Edit Data Anggota',
                                                    html:
                                                        `<div style="text-align: left; padding: 0 10px;">` +
                                                        `<label style="display:block; margin-bottom:5px; font-weight:bold; font-size:0.9rem;">Nomor Anggota</label>` +
                                                        `<input id="swal-no" class="swal2-input" style="margin-top:0; width:100%; box-sizing:border-box;" placeholder="No. Anggota" value="${member.no_anggota}">` +
                                                        `<label style="display:block; margin:15px 0 5px 0; font-weight:bold; font-size:0.9rem;">Nama Lengkap</label>` +
                                                        `<input id="swal-nama" class="swal2-input" style="margin-top:0; width:100%; box-sizing:border-box;" placeholder="Nama" value="${member.nama}">` +
                                                        `<label style="display:block; margin:15px 0 5px 0; font-weight:bold; font-size:0.9rem;">Alamat</label>` +
                                                        `<input id="swal-alamat" class="swal2-input" style="margin-top:0; width:100%; box-sizing:border-box;" placeholder="Alamat" value="${member.alamat}">` +
                                                        `<label style="display:block; margin:15px 0 5px 0; font-weight:bold; font-size:0.9rem;">Unit / Instansi</label>` +
                                                        `<input id="swal-unit" class="swal2-input" style="margin-top:0; width:100%; box-sizing:border-box;" placeholder="Unit" value="${member.unit}">` +
                                                        `</div>`,
                                                    width: '500px',
                                                    focusConfirm: false,
                                                    preConfirm: () => {
                                                        return {
                                                            no_anggota: document.getElementById('swal-no').value,
                                                            nama: document.getElementById('swal-nama').value,
                                                            alamat: document.getElementById('swal-alamat').value,
                                                            unit: document.getElementById('swal-unit').value
                                                        }
                                                    }
                                                });
                                                if (formValues) {
                                                    try {
                                                        await axios.put(`/api/members/${member.id}`, formValues);
                                                        window.Swal.fire({
                                                            toast: true,
                                                            position: 'top-end',
                                                            icon: 'success',
                                                            title: 'Data berhasil diperbarui',
                                                            showConfirmButton: false,
                                                            timer: 2000
                                                        });
                                                        fetchMembers();
                                                    } catch (err) {
                                                        window.Swal.fire('Error', 'Gagal memperbarui data', 'error');
                                                    }
                                                }
                                            }} 
                                            className="btn btn-sm" 
                                            style={{ background: '#f59e0b', color: 'white', padding: '5px', display: 'flex', alignItems: 'center' }}
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if (!window.Swal) return;
                                                const result = await window.Swal.fire({
                                                    title: 'Hapus data?',
                                                    text: "Data tidak bisa dikembalikan!",
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#ef4444',
                                                    confirmButtonText: 'Ya, Hapus!'
                                                });
                                                if (result.isConfirmed) {
                                                    await axios.delete(`/api/members/${member.id}`);
                                                    window.Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
                                                    fetchMembers();
                                                }
                                            }} 
                                            className="btn btn-danger btn-sm" 
                                            style={{ padding: '5px', display: 'flex', alignItems: 'center' }}
                                            title="Hapus"
                                        >
                                            <Trash2 size={14} />
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
                    <button id="btn-export-pdf" className="btn btn-primary" onClick={handleDirectExportPDF} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', background: '#0891b2' }}>
                        <FileText size={20} />
                        Download PDF (Otomatis)
                    </button>
                    <button className="btn btn-primary" onClick={handlePrint} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', background: '#6366f1' }}>
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

                <div id="live-preview-section" className="card">
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

            <footer className="no-print" style={{ 
                textAlign: 'center', 
                padding: '2rem 1rem', 
                marginTop: '2rem', 
                color: '#64748b', 
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.9rem'
            }}>
                <p style={{ margin: 0 }}>
                    &copy; {new Date().getFullYear()} ID Card Studio - Premium Edition
                </p>
                <p style={{ margin: '5px 0', fontWeight: '500' }}>
                    Developed by <span style={{ color: '#1e293b', fontWeight: 'bold' }}>Supriyanto</span> - 085655620979
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                    Developer Software @Magetan - Jawa Timur
                </p>
            </footer>

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
            {/* Preview Modal Overlay */}
            {previewMember && (
                <div style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    background: 'rgba(0,0,0,0.85)', 
                    zIndex: 9999, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backdropFilter: 'blur(5px)',
                    padding: '20px'
                }} onClick={() => setPreviewMember(null)}>
                    <div style={{ 
                        background: '#f8fafc', 
                        padding: '2rem', 
                        borderRadius: '16px', 
                        maxWidth: '900px', 
                        width: '100%', 
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflowY: 'auto',
                        maxHeight: '90vh'
                    }} onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setPreviewMember(null)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            &times;
                        </button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, color: '#1e293b' }}>Preview Kartu Anggota</h2>
                            <p style={{ margin: '5px 0', color: '#64748b' }}>{previewMember.nama} ({previewMember.no_anggota})</p>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>SISI DEPAN</p>
                                <div id={`modal-front-${previewMember.id}`}>
                                    <IDCard member={previewMember} logoLeft={logoLeft} logoRight={logoRight} headerText={headerText} validityText={validityText} layout={layout} primaryColor={primaryColor} bgImage={bgFront} />
                                </div>
                                <button onClick={() => handleExportImage('front', previewMember.id)} className="btn" style={{ marginTop: '15px', background: '#0891b2', color: 'white' }}>
                                    <Download size={16} /> Download JPG
                                </button>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>SISI BELAKANG</p>
                                <div id={`modal-back-${previewMember.id}`}>
                                    <IDCard isBack={true} bgImage={bgBack} primaryColor={primaryColor} backText={backText} layout={layout} />
                                </div>
                                <button onClick={() => handleExportImage('back', previewMember.id)} className="btn" style={{ marginTop: '15px', background: '#0891b2', color: 'white' }}>
                                    <Download size={16} /> Download JPG
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button className="btn" onClick={() => setPreviewMember(null)} style={{ background: '#64748b', color: 'white', padding: '0.8rem 2.5rem' }}>
                                Tutup Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
