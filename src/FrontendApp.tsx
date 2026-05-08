import { useState, useRef, useEffect } from 'react';
import { Copy, Wand2, X, Download, Code as CodeIcon, FileText, Layout, ImageIcon, LayoutGrid, Upload, GripVertical, Plus } from 'lucide-react';
import { Reorder } from 'framer-motion';



interface AnalysisResult {
  prompts: Record<string, string>;
}



interface GalleryItem {
  id: string;
  title: string;
  category: string;
  prompt?: string;
  code?: string;
  image?: string;
  figmaUrl?: string;
}

interface ComponentData {
  id: string;
  name: string;
  count: number;
}





// ── Sidebar Component ─────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabSelect, components }: { activeTab: string; onTabSelect: (tab: string) => void; components: ComponentData[] }) {
  return (
    <nav className="sidebar">
      <div className="nav-list">
        <div
          className={`nav-item ${activeTab === 'Image to prompt' ? 'active' : ''}`}
          onClick={() => onTabSelect('Image to prompt')}
        >
          <ImageIcon size={14} style={{ flexShrink: 0 }} />
          <span className="nav-item-label">Image to prompt</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'Design Manifest' ? 'active' : ''}`}
          onClick={() => onTabSelect('Design Manifest')}
        >
          <Wand2 size={14} style={{ flexShrink: 0 }} />
          <span className="nav-item-label">Design Manifest</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'Clients Resources' ? 'active' : ''}`}
          onClick={() => onTabSelect('Clients Resources')}
        >
          <Wand2 size={14} style={{ flexShrink: 0 }} />
          <span className="nav-item-label">Clients Resources</span>
        </div>

        <div style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutGrid size={12} style={{ flexShrink: 0 }} />
          Browse Components
        </div>
        {components.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
            onClick={() => onTabSelect(item.name)}
          >
            <span className="nav-item-label">{item.name}</span>
            {item.count > 0 && <span className="nav-item-count">{item.count}</span>}
          </div>
        ))}
      </div>
    </nav>
  );
}

// ── Gallery Components ────────────────────────────────────────────────────────
const BorderPreview = ({ type }: { type: string }) => {
  if (type === 'Shine Border') {
    return (
      <div style={{ width: '100%', height: '100%', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100%', left: '-100%', width: '300%', height: '300%', background: 'conic-gradient(from 0deg, transparent 0 320deg, var(--text-primary) 360deg)', animation: 'spin 4s linear infinite', opacity: 0.3 }} />
        <div style={{ position: 'absolute', inset: '2px', background: 'var(--bg)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-secondary)' }}>Shine</div>
      </div>
    );
  }
  if (type === 'Border Beam') {
    return (
      <div style={{ width: '100%', height: '100%', borderRadius: '8px', padding: '2px', background: 'linear-gradient(90deg, var(--border), var(--text-secondary), var(--border))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', background: 'var(--bg)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-secondary)' }}>Beam</div>
      </div>
    );
  }
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '10px' }}>{type}</div>
  );
};

function GalleryCard({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <div className="gallery-card" onClick={onClick}>
      <div className="gallery-card-preview">{children}</div>
      <div className="gallery-card-info">
        <h3 className="gallery-card-title">{title}</h3>
      </div>
    </div>
  );
}

function ComponentModal({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const jsonContent = JSON.stringify({
    id: item.id,
    title: item.title,
    category: item.category,
    prompt: item.prompt || '',
    code: item.code || '',
    image: item.image || '',
    timestamp: new Date().toISOString()
  }, null, 2);

  const handleDownload = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2 className="modal-title">{item.title}</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </header>
        <div className="modal-body">
          <div className="modal-preview-area">
            <div style={{ width: '280px', height: '180px' }}>
              {item.image ? (
                <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border)' }} />
              ) : item.category === 'Borders' ? (
                <BorderPreview type={item.title} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #111, #1a1a1c)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {item.category} Preview
                </div>
              )}
            </div>
          </div>
          <div className="modal-details-area">
            <div className="modal-meta-section">
              <span className="badge" style={{ marginBottom: '12px' }}>{item.category} / Component</span>
            </div>

            {item.prompt && (
              <div className="modal-meta-section" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                  <Wand2 size={12} /> AI Prompt
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    readOnly
                    value={item.prompt}
                    style={{ width: '100%', height: '80px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', fontSize: '12px', resize: 'none', fontFamily: 'var(--font-mono)' }}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(item.prompt || '')}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}

            {item.code && (
              <div className="modal-meta-section" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                  <CodeIcon size={12} /> Source Code
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    readOnly
                    value={item.code}
                    style={{ width: '100%', height: '80px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', fontSize: '12px', resize: 'none', fontFamily: 'var(--font-mono)' }}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(item.code || '')}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="modal-action-btn primary" onClick={handleDownload}><Download size={16} /> Download JSON</button>
              {item.figmaUrl && (
                <button
                  className="modal-action-btn primary"
                  onClick={() => window.open(item.figmaUrl, '_blank')}
                  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                >
                  <Layout size={16} /> Figma Preview
                </button>
              )}
              <button className="modal-action-btn outline" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DesignManifestPreview = ({
  generatedPrompt,
  contentSource,
  contentFileName,
  screenshotUrl,
  structuredPrompt,
  devSpecResult,
  onTransform,
  isTransforming,
  figmaUrl,
  onPreviewFigma,
  onExportMD,
  isGenerating
}: {
  generatedPrompt: string;
  contentSource: string;
  contentFileName: string;
  screenshotUrl?: string;
  structuredPrompt?: any;
  devSpecResult?: any;
  onTransform?: () => void;
  isTransforming?: boolean;
  figmaUrl?: string;
  onPreviewFigma?: () => void;
  onExportMD?: () => void;
  isGenerating?: boolean;
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'source' | 'screenshot' | 'json' | 'devspec'>('prompt');

  useEffect(() => {
    if (screenshotUrl && activeTab === 'prompt') {
      setActiveTab('screenshot');
    }
  }, [screenshotUrl]);

  if (isGenerating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
        <div className="step-header">
          <span className="animate-pulse">Generating Design Concept...</span>
        </div>
        <div style={{
          minHeight: '520px',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          flex: 1,
          background: 'rgba(255,255,255,0.01)'
        }}>
          <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <Wand2 size={48} style={{ color: '#3368F7', opacity: 0.8 }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#E5E7EB', marginBottom: '8px' }}>Generating your prompt...</p>
              <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '240px', lineHeight: 1.5 }}>
                Our AI is analyzing your reference sites and sections to craft a specialized design specification.
              </p>
            </div>
            <div style={{ 
              marginTop: '12px', 
              padding: '6px 12px', 
              background: 'rgba(51, 104, 247, 0.1)', 
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#3368F7',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Pipeline Active
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!generatedPrompt && !screenshotUrl && !structuredPrompt) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
        <div className="step-header">
          <span>Generated Design Concept</span>
        </div>
        <div style={{
          minHeight: '520px',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          flex: 1
        }}>
          <Layout size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#E5E7EB' }}>No Design Concept Yet</p>
          <p style={{ fontSize: '13px', marginTop: '8px', textAlign: 'center', maxWidth: '240px', color: '#94A3B8', lineHeight: 1.5 }}>
            Fill out the parameters on the left and generate a UI prompt to see your concept overview here.
          </p>
        </div>
      </div>
    );
  }

  const hasContent = !!contentSource || !!contentFileName;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="step-header" style={{ marginBottom: 0 }}>
          <span>Generated Design Concept</span>
        </div>

        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          padding: '2px',
          borderRadius: '10px',
          border: '1px solid var(--border)'
        }}>
          <button
            onClick={() => setActiveTab('prompt')}
            style={{
              padding: '6px 16px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'prompt' ? 'rgba(51, 104, 247, 0.1)' : 'transparent',
              color: activeTab === 'prompt' ? '#3368F7' : '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Prompt
          </button>
          {hasContent && (
            <button
              onClick={() => setActiveTab('source')}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'source' ? 'rgba(51, 104, 247, 0.1)' : 'transparent',
                color: activeTab === 'source' ? '#3368F7' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Source
            </button>
          )}
          {screenshotUrl && (
            <button
              onClick={() => setActiveTab('screenshot')}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'screenshot' ? 'rgba(51, 104, 247, 0.1)' : 'transparent',
                color: activeTab === 'screenshot' ? '#3368F7' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Screenshot
            </button>
          )}
          {structuredPrompt && (
            <button
              onClick={() => setActiveTab('json')}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'json' ? 'rgba(51, 104, 247, 0.1)' : 'transparent',
                color: activeTab === 'json' ? '#3368F7' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              JSON Schema
            </button>
          )}
          {devSpecResult && (
            <button
              onClick={() => setActiveTab('devspec')}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'devspec' ? 'rgba(51, 104, 247, 0.1)' : 'transparent',
                color: activeTab === 'devspec' ? '#3368F7' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Dev Spec
            </button>
          )}
        </div>
      </div>

      <div style={{
        flex: 1,
        border: '1px solid var(--border)',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.01)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          {activeTab === 'prompt' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {contentFileName && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '24px 32px 16px',
                  background: 'rgba(51, 104, 247, 0.05)',
                  borderBottom: '1px solid rgba(51, 104, 247, 0.1)',
                }}>
                  <FileText size={16} style={{ color: '#3368F7' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#3368F7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source Reference</span>
                    <span style={{ fontSize: '12px', color: '#E5E7EB', fontWeight: 500 }}>{contentFileName}</span>
                  </div>
                </div>
              )}
              <textarea
                style={{
                  fontSize: '13px',
                  color: '#94A3B8',
                  lineHeight: 1.7,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  flex: 1,
                  padding: '16px 32px 32px',
                  resize: 'none',
                  overflowY: 'auto'
                }}
                key={generatedPrompt}
                defaultValue={generatedPrompt || "No text prompt generated for this website. See Screenshot or JSON Schema."}
              />
            </div>
          )}

          {activeTab === 'source' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: '10px'
              }}>
                <FileText size={16} style={{ color: '#64748B' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source Material</span>
                  <span style={{ fontSize: '12px', color: '#E5E7EB', fontWeight: 500 }}>{contentFileName}</span>
                </div>
              </div>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                lineHeight: 1.7,
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                textAlign: 'left',
                background: 'rgba(0,0,0,0.2)',
                padding: '32px',
                borderRadius: '12px',
                flex: 1,
                overflowY: 'auto'
              }}>
                {contentSource || 'Binary content detected (PDF/Word). The text will be extracted and integrated during the generation process.'}
              </p>
            </div>
          )}

          {activeTab === 'screenshot' && screenshotUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              <img src={screenshotUrl} style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} alt="Reference Website Screenshot" />
            </div>
          )}

          {activeTab === 'json' && structuredPrompt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <textarea
                style={{
                  fontSize: '13px',
                  color: '#94A3B8',
                  lineHeight: 1.7,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  textAlign: 'left',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  padding: '32px',
                  borderRadius: '12px',
                  width: '100%',
                  flex: 1,
                  overflowY: 'auto',
                  resize: 'none'
                }}
                key={structuredPrompt ? JSON.stringify(structuredPrompt).length : 'json'}
                defaultValue={JSON.stringify(structuredPrompt, null, 2)}
              />
              {!devSpecResult && onTransform && (
                <button
                  className="action-btn"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={onTransform}
                  disabled={isTransforming}
                >
                  <CodeIcon size={14} style={{ marginRight: '8px' }} />
                  {isTransforming ? 'Transforming to Dev Spec...' : 'Transform to Developer Spec'}
                </button>
              )}
            </div>
          )}

          {activeTab === 'devspec' && devSpecResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <textarea
                style={{
                  fontSize: '13px',
                  color: '#94A3B8',
                  lineHeight: 1.7,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  background: 'rgba(51, 104, 247, 0.05)',
                  border: '1px solid rgba(51, 104, 247, 0.2)',
                  outline: 'none',
                  padding: '20px',
                  borderRadius: '12px',
                  width: '100%',
                  minHeight: '300px',
                  resize: 'vertical'
                }}
                key={devSpecResult ? JSON.stringify(devSpecResult).length : 'devspec'}
                defaultValue={JSON.stringify(devSpecResult, null, 2)}
              />
            </div>
          )}
        </div>

        <div style={{ 
          padding: '20px 32px', 
          borderTop: '1px solid var(--border)', 
          background: 'rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}>
          <button
            className="action-btn"
            style={{ width: 'fit-content', marginTop: 0, height: '44px', padding: '0 20px', fontSize: '13px' }}
            onClick={() => {
              if (activeTab === 'prompt') navigator.clipboard.writeText(generatedPrompt);
              else if (activeTab === 'source') navigator.clipboard.writeText(contentSource);
              else if (activeTab === 'json') navigator.clipboard.writeText(JSON.stringify(structuredPrompt, null, 2));
              else if (activeTab === 'devspec') navigator.clipboard.writeText(JSON.stringify(devSpecResult, null, 2));
            }}
            disabled={isGenerating || (!generatedPrompt && activeTab === 'prompt')}
          >
            <Copy size={14} style={{ marginRight: '8px' }} />
            {activeTab === 'prompt' ? 'Copy Master Prompt' : activeTab === 'json' ? 'Copy JSON Schema' : activeTab === 'devspec' ? 'Copy Dev Spec' : 'Copy Source Text'}
          </button>

          {(onPreviewFigma || figmaUrl) && (
            <button
              className="action-btn secondary"
              style={{ width: 'fit-content', marginTop: 0, height: '44px', padding: '0 20px', fontSize: '13px' }}
              onClick={() => {
                if (onPreviewFigma) onPreviewFigma();
                else if (figmaUrl) window.open(figmaUrl, '_blank');
              }}
              disabled={isGenerating || (!generatedPrompt && !figmaUrl)}
            >
              <Layout size={14} style={{ marginRight: '8px' }} />
              Preview In Figma
            </button>
          )}
          
          {onExportMD && (
            <button
              className="action-btn secondary"
              style={{ width: 'fit-content', marginTop: 0, height: '44px', padding: '0 20px', fontSize: '13px' }}
              onClick={onExportMD}
              disabled={isGenerating || !generatedPrompt}
            >
              <FileText size={14} style={{ marginRight: '8px' }} />
              Download design.md
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const GOOGLE_FONTS = [
  'Inter', 'Space Grotesk', 'Poppins', 'Montserrat', 'Roboto',
  'Open Sans', 'Playfair Display', 'Merriweather', 'Nunito', 'Outfit',
  'Syne', 'Lexend', 'Sora', 'Work Sans', 'Kanit', 'Ubuntu',
  'Lato', 'Oswald', 'Raleway', 'Quicksand'
];

const SECTION_TYPES = [
  'Hero Section', 'Header', 'About', 'Services', 'Features',
  'Gallery', 'Pricing', 'Product List', 'Testimonials', 'Teams',
  'CTA', "FAQ's", 'Video', 'Blogs', 'Contact', 'Footer'
];

const WEBSITE_LAYOUTS = [
  'Landing Page', 'E-commerce Store', 'Homepage',
  'Portfolio Website', 'Web Application (SaaS)'
];

// ── Main App ──────────────────────────────────────────────────────────────────
export default function FrontendApp() {
  const [activeTab, setActiveTab] = useState('Image to prompt');
  const [components, setComponents] = useState<ComponentData[]>([]);

  // Design Manifest States
  const [manifest, setManifest] = useState({
    businessName: '',
    primaryColor: '#3368F7',
    secondaryColor: '#FF6B6B',
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
    websiteLayout: 'Landing Page',
    sectionType: ['Hero Section'],
    themeMode: 'Dark',
    referenceUrls: [] as string[],
    clientResourcesWebsites: [] as { url: string; description: string }[],
    clientResourcesSections: [] as any[],
    contentSource: '',
    contentFile: null as File | null,
    contentFileName: '',
    sectionOrder: ['Hero Section'],
    manifestId: null as string | null,
    figmaUrl: '',
    platformKey: 'Anthropic'
  });

  const [urlInput, setUrlInput] = useState('');
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);

  const scopeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(event.target as Node)) {
        setIsScopeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset Client Resources form on tab open
  useEffect(() => {
    if (activeTab === 'Clients Resources') {
      setManifest(prev => ({
        ...prev,
        businessName: '',
        primaryColor: '#000000',
        secondaryColor: '#000000',
        headingFont: '',
        bodyFont: '',
        websiteLayout: '',
        clientResourcesWebsites: [],
        clientResourcesSections: [],
        contentSource: '',
        contentFile: null,
        contentFileName: '',
        platformKey: 'Anthropic'
      }));
    }
  }, [activeTab]);

  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const [referenceScreenshot, setReferenceScreenshot] = useState<string | null>(null);
  const [structuredPromptResult, setStructuredPromptResult] = useState<any>(null);
  const [devSpecResult, setDevSpecResult] = useState<any>(null);
  const [isGeneratingFromReference, setIsGeneratingFromReference] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isExportingToFigma, setIsExportingToFigma] = useState(false);

  const handleTransform = async () => {
    if (!structuredPromptResult) return;
    setIsTransforming(true);
    try {
      const res = await fetch('http://localhost:3000/api/design-manifest/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredPrompt: structuredPromptResult })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transform');
      setDevSpecResult(data.devSpec);
    } catch (err: any) {
      alert(`⚠️ Transform Error: ${err.message}`);
    } finally {
      setIsTransforming(false);
    }
  };





  const handleGenerateFromReference = async () => {
    const primaryUrl = manifest.referenceUrls[0] || urlInput.trim();

    setIsGeneratingFromReference(true);
    setGeneratedPrompt("🚀 Initializing unified pipeline... Capturing and analyzing reference website (Step 1/2)...");
    setReferenceScreenshot(null);
    setStructuredPromptResult(null);
    setDevSpecResult(null);

    try {
      const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            // Extract just the base64 part, stripping the data URL prefix
            resolve(result.split(',')[1] || result);
          };
          reader.onerror = error => reject(error);
        });
      };

      const processedSections = await Promise.all(
        manifest.clientResourcesSections.map(async (sec) => {
          if (sec.imageFile) {
            const base64 = await convertFileToBase64(sec.imageFile);
            return { ...sec, imageBase64: base64, imageFile: undefined };
          }
          return sec;
        })
      );

      const formData = new FormData();
      formData.append('referenceUrl', primaryUrl || '');
      formData.append('referenceWebsites', JSON.stringify(manifest.clientResourcesWebsites || []));
      formData.append('clientResourcesSections', JSON.stringify(processedSections || []));
      formData.append('contentSource', manifest.contentSource || '');
      formData.append('activeTab', activeTab);
      if (manifest.manifestId) formData.append('manifestId', manifest.manifestId);
      
      formData.append('sections', JSON.stringify(activeTab === 'Clients Resources' 
        ? (manifest.clientResourcesSections || []).map(s => s.type).filter(Boolean)
        : manifest.sectionType));
      
      formData.append('sectionOrder', JSON.stringify(activeTab === 'Clients Resources'
        ? (manifest.clientResourcesSections || []).map(s => s.type).filter(Boolean)
        : manifest.sectionOrder));
        
      formData.append('businessName', manifest.businessName || '');
      formData.append('primaryColor', manifest.primaryColor || '');
      formData.append('secondaryColor', manifest.secondaryColor || '');
      formData.append('headingFont', manifest.headingFont || '');
      formData.append('bodyFont', manifest.bodyFont || '');
      formData.append('websiteLayout', manifest.websiteLayout || '');
      formData.append('themeMode', manifest.themeMode || 'Dark');
      formData.append('platformKey', manifest.platformKey || 'Anthropic');

      if (manifest.contentFile) {
        formData.append('contentFile', manifest.contentFile);
      }

      const res = await fetch('http://localhost:3000/api/design-manifest/generate-from-reference', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate from reference');

      setGeneratedPrompt(data.prompt);
      setReferenceScreenshot(data.screenshotUrl);
      setStructuredPromptResult(data.structuredPrompt);
      setManifest(prev => ({ ...prev, manifestId: data.manifestId, referenceUrls: [primaryUrl] }));

      if (urlInput.trim()) {
        setUrlInput('');
      }
    } catch (err: any) {
      setGeneratedPrompt(`⚠️ Pipeline Error: ${err.message}`);
    } finally {
      setIsGeneratingFromReference(false);
    }
  };

  const handlePreviewFigma = async () => {
    if (!generatedPrompt) return;
    
    setIsExportingToFigma(true);
    try {
      const res = await fetch('http://localhost:3000/api/figma-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifest,
          structuredPrompt: structuredPromptResult,
          generatedPrompt,
          activeTab
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Export failed');
      
      const designId = data.designId;
      
      console.log('✅ Design processed for Figma. Design ID:', designId);
      
      // Open Figma - Plugin will automatically fetch the latest design
      window.open('https://www.figma.com/files/recent', '_blank');
      
    } catch (err: any) {
      alert(`⚠️ Figma Export Error: ${err.message}`);
    } finally {
      setIsExportingToFigma(false);
    }
  };

  const handleExportMD = () => {
    if (!generatedPrompt) return;

    const sections = manifest.clientResourcesSections || [];
    const references = manifest.clientResourcesWebsites || [];
    
    const mdContent = `# Homepage Design Specification

## Project Overview
- Page: Homepage
- Source: Client Resources
- Theme: ${manifest.themeMode}
- Layout: ${manifest.websiteLayout}
- Style: Follow reference website look and feel

## Brand Identity
- Colors:
  - Primary: ${manifest.primaryColor}
  - Secondary: ${manifest.secondaryColor}
- Fonts:
  - Heading: ${manifest.headingFont}
  - Body: ${manifest.bodyFont}

## Reference Websites
${references.length > 0 ? references.map((r: any) => `
- URL: ${r.url || "N/A"}
- Notes:
  - ${r.description || "No specific notes provided."}
  - Follow layout structure, spacing, and visual hierarchy
  - Use similar typography scale and component styling
`).join("\n") : "- No reference websites provided."}

## Sections
${sections.length > 0 ? sections.map((s: any, i: number) => `
### ${i + 1}. ${s.type || "Untitled Section"}
- Layout: ${s.type === 'Hero Section' ? 'Full-width layout' : 'Standard section layout'}
- Notes: ${s.description || "N/A"}
- Image: ${s.imageFile ? s.imageFile.name : (s.imageUrl || "N/A")}
- Content: ${s.content || manifest.contentSource || "Realistic dummy content based on " + (manifest.businessName || "the brand")}
- Strategy: Follow reference style and spacing
`).join("\n") : "- No sections defined."}

## Behavior Rules
- Follow reference website look and feel
- Combine section notes and reference notes
- Use uploaded content where available
- Use dummy content if not available
- Do not introduce new components
- Do not change existing functionality
- Maintain current UI structure

## Generated Prompt

${generatedPrompt}
`;

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "design.md";
    a.click();

    URL.revokeObjectURL(url);
  };

  // handleGeneratePrompt removed in favor of unified handleGenerateFromReference

  const handleReferenceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = urlInput.trim();
      if (trimmed && !manifest.referenceUrls.includes(trimmed)) {
        setManifest({
          ...manifest,
          referenceUrls: [...manifest.referenceUrls, trimmed]
        });
        setUrlInput('');
      }
    } else if (e.key === 'Backspace' && !urlInput && manifest.referenceUrls.length > 0) {
      const newUrls = [...manifest.referenceUrls];
      newUrls.pop();
      setManifest({ ...manifest, referenceUrls: newUrls });
    }
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    setManifest({
      ...manifest,
      referenceUrls: manifest.referenceUrls.filter(u => u !== urlToRemove)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const textExtensions = ['txt', 'md', 'json', 'csv'];

    if (textExtensions.includes(extension || '')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setManifest({
          ...manifest,
          contentSource: content,
          contentFile: file,
          contentFileName: file.name
        });
      };
      reader.readAsText(file);
    } else {
      // For binary files like PDF, DOC, DOCX
      setManifest({
        ...manifest,
        contentSource: '', // Will be extracted on backend
        contentFile: file,
        contentFileName: file.name
      });
    }
  };

  const syncSectionOrder = (newSections: string[]) => {
    // Keep existing order for items that are still there, add new ones at the end
    const currentOrder = manifest.sectionOrder;
    const filteredOrder = currentOrder.filter(s => newSections.includes(s));
    const addedSections = newSections.filter(s => !currentOrder.includes(s));

    setManifest({
      ...manifest,
      sectionType: newSections,
      sectionOrder: [...filteredOrder, ...addedSections]
    });
  };

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const prompt = result?.prompts?.['DALL-E 3'] || '';
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchComponents = () => {
    fetch('http://localhost:3000/api/components')
      .then(res => res.json())
      .then(data => {
        setComponents(data);
        // Robust Sync: If current tab is not 'Home' and not in the new component list, go Home
        if (activeTab !== 'Image to prompt' && !data.find((c: any) => c.name === activeTab)) {
          setActiveTab('Image to prompt');
        }
      });
  };

  const fetchItems = () => {
    if (activeTab === 'Image to prompt') return;
    const comp = components.find(c => c.name === activeTab);
    if (comp) {
      fetch(`http://localhost:3000/api/components/${comp.id}/subsections`)
        .then(res => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then(data => setGalleryItems(data))
        .catch(() => setGalleryItems([]));
    } else {
      setGalleryItems([]);
    }
  };

  useEffect(() => {
    fetchComponents();
    // Immediate fetch on focus
    window.addEventListener('focus', fetchComponents);
    const interval = setInterval(fetchComponents, 5000); // Poll components every 5s
    return () => {
      window.removeEventListener('focus', fetchComponents);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    fetchItems();
    // Re-fetch items on focus if in a category
    const onFocus = () => { if (activeTab !== 'Image to prompt') fetchItems(); };
    window.addEventListener('focus', onFocus);
    const interval = setInterval(onFocus, 5000); // Poll items every 5s
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [activeTab, components]);

  const handleGenerate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('http://localhost:3000/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate prompt');
      }
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar activeTab={activeTab} onTabSelect={setActiveTab} components={components} />
      <div className="main-content-wrapper">
        <div style={{ width: '90%', maxWidth: '100%', margin: '0 auto', padding: '64px 24px' }}>
          {activeTab === 'Image to prompt' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="badge">• NO EMAIL REQUIRED. FREE DAILY 3 IMAGE TO PROMPT</div>
              <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '20px' }}>Image to Prompt - AI Image<br />Analyzer & Generator</h1>
              <div className="workspace-card" style={{ width: '100%', display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                  <div className="step-header"><span className="step-number">01</span> Upload Photo</div>
                  <div className="zone-container dashed" style={{ cursor: 'pointer' }} onClick={() => document.getElementById('fileInput')?.click()}>
                    {previewUrl ? <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : 'Drop image or click to select'}
                    <input id="fileInput" type="file" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])); } }} />
                  </div>
                  <button className="action-btn" onClick={handleGenerate} disabled={!file || isProcessing}>{isProcessing ? 'Analyzing...' : 'Generate Prompt'}</button>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="step-header"><span className="step-number">02</span> AI Prompt</div>
                  <div className="zone-container">
                    {errorMsg ? (
                      <div style={{ padding: '16px', color: '#ff4a4a', fontSize: '13px', fontFamily: 'var(--font-mono)', lineHeight: '1.5' }}>
                        ⚠️ {errorMsg}
                      </div>
                    ) : (
                      <textarea value={result?.prompts?.['DALL-E 3'] || ''} readOnly style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', padding: '16px', color: 'var(--text-primary)', font: 'inherit', resize: 'none' }} placeholder="Result will appear here..." />
                    )}
                  </div>
                  <button
                    className="action-btn"
                    onClick={handleCopy}
                    disabled={!result?.prompts?.['DALL-E 3'] || copied}
                  >
                    <Copy size={15} style={{ marginRight: '8px' }} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'Design Manifest' || activeTab === 'Clients Resources' ? (
            <div className="gallery-container">
              <div className="gallery-header">
                <span className="badge">Configurator / {activeTab === 'Clients Resources' ? 'Clients Resources' : 'Design Manifest'}</span>
                <h1 style={{ fontSize: '32px' }}>{activeTab === 'Clients Resources' ? 'Clients Resources' : 'Design Manifest'}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Define your brand parameters to generate a specialized UI design prompt.
                </p>
              </div>

              <div className="workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '2px', background: 'var(--border)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {/* Left Panel - Form */}
                <div style={{ background: 'var(--surface)', padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', borderTopLeftRadius: '11px', borderBottomLeftRadius: '11px' }}>

                  <div className="manifest-section">
                    <div className="step-header">
                      <div className="step-number">01</div>
                      <span>Business Name</span>
                    </div>
                    <textarea
                      className="manifest-input"
                      placeholder="e.g. Antigravity AI"
                      value={manifest.businessName}
                      onChange={e => {
                        setManifest({ ...manifest, businessName: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = (e.target.scrollHeight) + 'px';
                      }}
                      rows={1}
                      style={{ resize: 'none', overflow: 'hidden', minHeight: '44px', display: 'block', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div className="manifest-section">
                    <div className="step-header">
                      <div className="step-number">02</div>
                      <span>Brand Identity</span>
                    </div>

                    <div className="brand-identity-row">
                      {/* Primary Color */}
                      <div className="color-input">
                        <div style={{ position: 'relative' }}>
                          <div className="color-box" style={{ background: manifest.primaryColor }}></div>
                          <input
                            type="color"
                            value={manifest.primaryColor}
                            onChange={e => setManifest({ ...manifest, primaryColor: e.target.value })}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                          />
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type="text"
                            className="manifest-input"
                            value={manifest.primaryColor}
                            onChange={e => setManifest({ ...manifest, primaryColor: e.target.value })}
                            style={{ paddingRight: '64px' }}
                          />
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', opacity: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase', pointerEvents: 'none' }}>Primary</span>
                        </div>
                      </div>

                      {/* Secondary Color */}
                      <div className="color-input">
                        <div style={{ position: 'relative' }}>
                          <div className="color-box" style={{ background: manifest.secondaryColor }}></div>
                          <input
                            type="color"
                            value={manifest.secondaryColor}
                            onChange={e => setManifest({ ...manifest, secondaryColor: e.target.value })}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                          />
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type="text"
                            className="manifest-input"
                            value={manifest.secondaryColor}
                            onChange={e => setManifest({ ...manifest, secondaryColor: e.target.value })}
                            style={{ paddingRight: '74px' }}
                          />
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', opacity: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase', pointerEvents: 'none' }}>Secondary</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="manifest-section">
                      <div className="step-header">
                        <div className="step-number">03</div>
                        <span>Heading Font</span>
                      </div>
                      <select
                        className="manifest-input"
                        value={manifest.headingFont}
                        onChange={e => setManifest({ ...manifest, headingFont: e.target.value })}
                      >
                        <option value="" disabled>Select Font</option>
                        {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div className="manifest-section">
                      <div className="step-header">
                        <div className="step-number">04</div>
                        <span>Body Font</span>
                      </div>
                      <select
                        className="manifest-input"
                        value={manifest.bodyFont}
                        onChange={e => setManifest({ ...manifest, bodyFont: e.target.value })}
                      >
                        <option value="" disabled>Select Font</option>
                        {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="manifest-section" style={activeTab === 'Clients Resources' ? { gridColumn: '1 / -1' } : undefined}>
                      <div className="step-header">
                        <div className="step-number">05</div>
                        <span>Website Layout</span>
                      </div>
                      <select
                        className="manifest-input"
                        value={manifest.websiteLayout}
                        onChange={e => setManifest({ ...manifest, websiteLayout: e.target.value })}
                      >
                        <option value="" disabled>Select Layout</option>
                        {WEBSITE_LAYOUTS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>

                    {activeTab === 'Clients Resources' ? (
                      <div className="manifest-section" style={{ gridColumn: '1 / -1', width: '100%' }}>
                        <div className="step-header" style={{ justifyContent: 'space-between', marginBottom: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="step-number">06</div>
                            <span>Add Sections</span>
                          </div>
                          <button
                            type="button"
                            className="action-btn secondary"
                            style={{ width: 'auto', padding: '10px 20px', fontSize: '13px', marginTop: 0 }}
                            onClick={(e) => {
                              setManifest({
                                ...manifest,
                                clientResourcesSections: [
                                  { id: crypto.randomUUID(), type: '', imageFile: null, imageUrl: null, description: '' },
                                  ...(manifest.clientResourcesSections || [])
                                ]
                              });
                              const currentTarget = e.currentTarget;
                              setTimeout(() => {
                                const list = currentTarget?.parentElement?.nextElementSibling;
                                if (list) {
                                  list.firstElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                }
                              }, 50);
                            }}
                          >
                            <Plus size={14} /> Add Section
                          </button>
                        </div>

                        <Reorder.Group
                          axis="y"
                          values={manifest.clientResourcesSections || []}
                          onReorder={(newOrder) => setManifest({ ...manifest, clientResourcesSections: newOrder })}
                          className="sections-list"
                          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                        >
                          {(!manifest.clientResourcesSections || manifest.clientResourcesSections.length === 0) && (
                            <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                              No sections added yet. Click "+ Add Section" to build your structure.
                            </div>
                          )}
                          {(manifest.clientResourcesSections || []).map((sec: any, idx: number) => (
                            <Reorder.Item
                              key={sec.id || idx}
                              value={sec}
                              style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}
                            >
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                                <div className="grip-handle" style={{ cursor: 'grab', padding: '4px' }}>
                                  <GripVertical size={16} />
                                </div>
                                <select
                                  className="manifest-input"
                                  value={sec.type}
                                  onChange={e => {
                                    const newSec = [...manifest.clientResourcesSections];
                                    newSec[idx].type = e.target.value;
                                    setManifest({ ...manifest, clientResourcesSections: newSec });
                                  }}
                                  style={{ flex: 1, height: '40px', backgroundPosition: 'right 12px center' }}
                                >
                                  <option value="" disabled>Select Section</option>
                                  {SECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>

                                <label
                                  style={{
                                    background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0 16px', height: '40px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', transition: 'background 0.2s'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <Upload size={14} /> {sec.imageFile ? 'Change Image' : 'Upload Image'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const url = URL.createObjectURL(file);
                                        const newSec = [...manifest.clientResourcesSections];
                                        newSec[idx].imageFile = file;
                                        newSec[idx].imageUrl = url;
                                        setManifest({ ...manifest, clientResourcesSections: newSec });
                                      }
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSec = [...manifest.clientResourcesSections];
                                    newSec.splice(idx, 1);
                                    setManifest({ ...manifest, clientResourcesSections: newSec });
                                  }}
                                  style={{ width: '40px', height: '40px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: '#ff4a4a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,74,74,0.1)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              {sec.imageUrl && (
                                <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', padding: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <img src={sec.imageUrl} alt="preview" style={{ height: '48px', width: 'auto', borderRadius: '4px', objectFit: 'cover' }} />
                                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{sec.imageFile?.name}</span>
                                </div>
                              )}

                              <textarea
                                className="manifest-input"
                                placeholder="Describe layout, content, tone, CTA, style... (e.g. bold headline, product focus)"
                                value={sec.description}
                                onInput={(e) => {
                                  const target = e.target as HTMLTextAreaElement;
                                  target.style.height = 'auto';
                                  target.style.height = target.scrollHeight + 'px';
                                }}
                                onChange={e => {
                                  const newSec = [...manifest.clientResourcesSections];
                                  newSec[idx].description = e.target.value;
                                  setManifest({ ...manifest, clientResourcesSections: newSec });
                                }}
                                style={{ resize: 'none', overflow: 'hidden', minHeight: '60px' }}
                              />
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      </div>
                    ) : (
                      <div className="manifest-section" style={{ position: 'relative' }} ref={scopeDropdownRef}>
                        <div className="step-header">
                          <div className="step-number">06</div>
                          <span>Add Sections</span>
                        </div>

                        <div
                          className={`manifest-input chip-trigger ${isScopeDropdownOpen ? 'open' : ''}`}
                          onClick={() => setIsScopeDropdownOpen(!isScopeDropdownOpen)}
                          tabIndex={0}
                        >
                          <div className="chip-values">
                            {manifest.sectionType.length === 0 ? (
                              <span className="chip placeholder">Select Section</span>
                            ) : (
                              manifest.sectionType.map(value => (
                                <span key={value} className="chip">
                                  <span>{value}</span>
                                  <button
                                    className="chip-remove"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setManifest({ ...manifest, sectionType: manifest.sectionType.filter(item => item !== value) });
                                    }}
                                  >×</button>
                                </span>
                              ))
                            )}
                          </div>
                          <span className="chip-arrow">⌄</span>
                        </div>

                        <div className={`chip-menu ${isScopeDropdownOpen ? 'open' : ''}`}>
                          {SECTION_TYPES.map(t => (
                            <button
                              key={t}
                              type="button"
                              className={`chip-option ${manifest.sectionType.includes(t) ? 'active' : ''}`}
                              data-value={t === "FAQ's" ? "FAQ" : t}
                              onClick={(e) => {
                                e.preventDefault();
                                const newSelection = manifest.sectionType.includes(t)
                                  ? manifest.sectionType.filter(item => item !== t)
                                  : [...manifest.sectionType, t];
                                syncSectionOrder(newSelection);
                              }}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="manifest-section" style={{ width: '100%' }}>
                    <div className="step-header" style={{ justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="step-number">07</div>
                        <span>Reference Websites</span>
                      </div>
                      {activeTab === 'Clients Resources' && (
                        <button
                          type="button"
                          className="action-btn secondary"
                          style={{ width: 'auto', padding: '10px 20px', fontSize: '13px', marginTop: 0 }}
                          onClick={() => {
                            setManifest({
                              ...manifest,
                              clientResourcesWebsites: [
                                ...manifest.clientResourcesWebsites,
                                { url: '', description: '' }
                              ]
                            });
                          }}
                        >
                          <Plus size={14} /> Add URL
                        </button>
                      )}
                    </div>
                    {activeTab === 'Clients Resources' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(!manifest.clientResourcesWebsites || manifest.clientResourcesWebsites.length === 0) && (
                          <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            No reference URL added yet. Click "+ Add URL" to build your structure.
                          </div>
                        )}
                        {manifest.clientResourcesWebsites.map((ref: any, idx: number) => (
                          <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>URL Entry {idx + 1}</span>
                              <button type="button" onClick={() => setManifest({ ...manifest, clientResourcesWebsites: manifest.clientResourcesWebsites.filter((_, i) => i !== idx) })} style={{ background: 'transparent', border: 'none', color: '#ff4a4a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                            </div>
                            <input
                              type="text"
                              className="manifest-input"
                              placeholder="Website URL"
                              value={ref.url}
                              onChange={e => {
                                const newWebsites = [...manifest.clientResourcesWebsites];
                                newWebsites[idx].url = e.target.value;
                                setManifest({ ...manifest, clientResourcesWebsites: newWebsites });
                              }}
                            />
                            <textarea
                              className="manifest-input"
                              placeholder="Description (e.g., Use this for homepage layout)"
                              value={ref.description}
                              onChange={e => {
                                const newWebsites = [...manifest.clientResourcesWebsites];
                                newWebsites[idx].description = e.target.value;
                                setManifest({ ...manifest, clientResourcesWebsites: newWebsites });
                              }}
                              style={{ resize: 'vertical', minHeight: '60px' }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="chip-input-container" onClick={() => document.getElementById('url-input')?.focus()}>
                        {manifest.referenceUrls.map((url: string) => (
                          <span key={url} className="chip">
                            <span>{url}</span>
                            <button
                              type="button"
                              className="chip-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveUrl(url);
                              }}
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                        <input
                          id="url-input"
                          type="text"
                          className="chip-inline-input"
                          placeholder={manifest.referenceUrls.length === 0 ? "Type URL and press Enter..." : ""}
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={handleReferenceKeyDown}
                        />
                      </div>
                    )}
                    {/* Small button removed to unify action flow */}
                  </div>

                  {activeTab === 'Clients Resources' ? (
                    <>
                      <div className="manifest-section" style={{ width: '100%', display: 'none' }}>
                        <div className="step-header">
                          <div className="step-number">08</div>
                          <span>Content Source</span>
                        </div>
                        <label className={`content-drop-zone ${manifest.contentSource ? 'active' : ''}`}>
                          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept=".txt,.md,.json,.csv,.doc,.docx,.pdf" />
                          {manifest.contentFile ? (
                            <div className="content-info">
                              <FileText size={24} style={{ color: '#3368F7', marginBottom: '8px' }} />
                              <span className="content-info-name">{manifest.contentFileName}</span>
                              <span className="content-info-meta">
                                {manifest.contentSource 
                                  ? `${manifest.contentSource.length.toLocaleString()} characters detected` 
                                  : 'Document ready for AI analysis'}
                              </span>
                            </div>
                          ) : (
                            <>
                              <Upload size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                              <span style={{ fontSize: '13px', color: '#94A3B8' }}>Drop content file or click to upload</span>
                              <span style={{ fontSize: '11px', color: '#444', marginTop: '4px' }}>Supports .txt, .md, .json, .doc, .docx, .pdf</span>
                            </>
                          )}
                        </label>
                      </div>

                      <div className="manifest-section">
                        <div className="step-header">
                          <div className="step-number">09</div>
                          <span>Theme Mode</span>
                        </div>
                        <div className="theme-pill-group">
                          <button
                            type="button"
                            className={`theme-pill ${manifest.themeMode === 'Dark' ? 'active' : ''}`}
                            onClick={() => setManifest({ ...manifest, themeMode: 'Dark' })}
                          >
                            <span className="theme-pill-icon">🌙</span>
                            <span>Dark</span>
                          </button>

                          <button
                            type="button"
                            className={`theme-pill ${manifest.themeMode === 'Light' ? 'active' : ''}`}
                            onClick={() => setManifest({ ...manifest, themeMode: 'Light' })}
                          >
                            <span className="theme-pill-icon">☀️</span>
                            <span>Light</span>
                          </button>
                        </div>
                      </div>

                      <div className="manifest-section">
                        <div className="step-header">
                          <div className="step-number">10</div>
                          <span>Select Platform Key</span>
                        </div>
                        <select
                          className="manifest-input"
                          value={manifest.platformKey}
                          onChange={e => setManifest({ ...manifest, platformKey: e.target.value })}
                        >
                          <option value="Anthropic">Anthropic</option>
                          <option value="Open AI">Open AI</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="manifest-section">
                        <div className="step-header">
                          <div className="step-number">08</div>
                          <span>Theme Mode</span>
                        </div>
                        <div className="theme-pill-group">
                          <button
                            type="button"
                            className={`theme-pill ${manifest.themeMode === 'Dark' ? 'active' : ''}`}
                            onClick={() => setManifest({ ...manifest, themeMode: 'Dark' })}
                          >
                            <span className="theme-pill-icon">🌙</span>
                            <span>Dark</span>
                          </button>

                          <button
                            type="button"
                            className={`theme-pill ${manifest.themeMode === 'Light' ? 'active' : ''}`}
                            onClick={() => setManifest({ ...manifest, themeMode: 'Light' })}
                          >
                            <span className="theme-pill-icon">☀️</span>
                            <span>Light</span>
                          </button>
                        </div>
                      </div>

                      <div className="manifest-section">
                        <div className="step-header">
                          <div className="step-number">09</div>
                          <span>Select Platform Key</span>
                        </div>
                        <select
                          className="manifest-input"
                          value={manifest.platformKey}
                          onChange={e => setManifest({ ...manifest, platformKey: e.target.value })}
                        >
                          <option value="Anthropic">Anthropic</option>
                          <option value="Open AI">Open AI</option>
                        </select>
                      </div>

                      <div className="manifest-section" style={{ width: '100%', display: 'none' }}>
                        <div className="step-header">
                          <div className="step-number">11</div>
                          <span>Content Source</span>
                        </div>
                        <label className={`content-drop-zone ${manifest.contentFile ? 'active' : ''}`}>
                          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept=".txt,.md,.json,.csv,.doc,.docx,.pdf" />
                          {manifest.contentFile ? (
                            <div className="content-info">
                              <FileText size={24} style={{ color: '#3368F7', marginBottom: '8px' }} />
                              <span className="content-info-name">{manifest.contentFileName}</span>
                              <span className="content-info-meta">
                                {manifest.contentSource 
                                  ? `${manifest.contentSource.length.toLocaleString()} characters detected` 
                                  : 'Document ready for AI analysis'}
                              </span>
                            </div>
                          ) : (
                            <>
                              <Upload size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                              <span style={{ fontSize: '13px', color: '#94A3B8' }}>Drop content file or click to upload</span>
                              <span style={{ fontSize: '11px', color: '#444', marginTop: '4px' }}>Supports .txt, .md, .json, .doc, .docx, .pdf</span>
                            </>
                          )}
                        </label>
                      </div>
                    </>
                  )}

                  {activeTab !== 'Clients Resources' && manifest.sectionType.length > 0 && (
                    <div className="manifest-section" style={{ width: '100%' }}>
                      <div className="step-header">
                        <div className="step-number">10</div>
                        <span>Section Ordering</span>
                      </div>
                      <Reorder.Group
                        axis="y"
                        values={manifest.sectionOrder}
                        onReorder={(newOrder) => setManifest({ ...manifest, sectionOrder: newOrder })}
                        className="reorder-list"
                        style={{ listStyle: 'none', padding: 0 }}
                      >
                        {manifest.sectionOrder.map((section, idx) => (
                          <Reorder.Item key={section} value={section} className="reorder-item" style={{ listStyle: 'none' }}>
                            <div className="grip-handle">
                              <GripVertical size={14} />
                            </div>
                            <span className="reorder-item-number">{String(idx + 1).padStart(2, '0')}</span>
                            <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>{section}</span>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em' }}>DRAGGABLE</div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </div>
                  )}

                  <button
                    className="action-btn"
                    onClick={handleGenerateFromReference}
                    disabled={isGeneratingFromReference}
                  >
                    <Wand2 size={16} style={{ marginRight: '10px' }} />
                    {isExportingToFigma ? 'Preparing Figma Design...' : (isGeneratingFromReference ? 'Processing Pipeline...' : 'Generate UI Prompt')}
                  </button>
                </div>

                {/* Right Panel — Design Preview */}
                <div style={{
                  background: '#0B0B0D',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  borderTopRightRadius: '11px', borderBottomRightRadius: '11px'
                }}>
                  <DesignManifestPreview
                    generatedPrompt={generatedPrompt}
                    contentSource={manifest.contentSource}
                    contentFileName={manifest.contentFileName}
                    screenshotUrl={referenceScreenshot ?? undefined}
                    structuredPrompt={structuredPromptResult}
                    devSpecResult={devSpecResult}
                    onTransform={handleTransform}
                    isTransforming={isTransforming}
                    figmaUrl={manifest.figmaUrl}
                    onPreviewFigma={activeTab === 'Clients Resources' ? handlePreviewFigma : undefined}
                    onExportMD={activeTab === 'Clients Resources' ? handleExportMD : undefined}
                    isGenerating={isGeneratingFromReference}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="gallery-container">
              <header className="gallery-header">
                <span className="badge">Library / {activeTab}</span>
                <h1 style={{ fontSize: '32px' }}>{activeTab}</h1>
              </header>
              <div className="gallery-grid">
                {galleryItems.map(item => (
                  <GalleryCard key={item.id} title={item.title} onClick={async () => {
                    // Fetch fresh data for the modal to ensure sync
                    try {
                      const res = await fetch(`http://localhost:3000/api/subsections/${item.id}`);
                      const freshItem = await res.json();
                      setSelectedItem(freshItem);
                    } catch {
                      setSelectedItem(item);
                    }
                  }}>
                    {item.image ? (
                      <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : activeTab === 'Borders' ? (
                      <BorderPreview type={item.title} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    )}
                  </GalleryCard>
                ))}
              </div>
            </div>
          )}
          {selectedItem && <ComponentModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
        </div>
      </div>
    </div>
  );
}
