import { Monitor, ImagePlus, ChevronLeft, ChevronRight, Scaling } from 'lucide-react';
import './componentsPage.css';

export default function ComponentsPage() {
  return (
    <div className="components-layout">
      <header className="components-header">
        <h1>Components</h1>
      </header>
      
      <main className="components-main">
        <div className="components-grid">
          {/* Card 1: TICK-TOCK DOT */}
          <div className="grid-cell">
            <div className="component-card">
              <div className="centered-content">
                <div className="small-caps">USELOOP HOOK</div>
                <div className="vertical-line"></div>
                <div className="fw-500">Tick-Tock dot</div>
              </div>
            </div>
          </div>

          {/* Card 2: DEVICE DETECTION */}
          <div className="grid-cell">
            <div className="component-card">
              <div className="demo-box">
                <h3>Device Detection Demo</h3>
                <div className="demo-icon-text">
                  <Monitor size={20} />
                  <span>Desktop View</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: CURRENT MODE */}
          <div className="grid-cell">
            <div className="component-card">
              <div className="demo-box-left">
                <div className="mode-header">
                  <span className="fw-600">Current mode:</span>
                  <span className="badge-dark">Desktop</span>
                </div>
                <div className="resize-msg">
                  Resize your browser window to see the changes!
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: CHAT INFO (DARK) */}
          <div className="grid-cell">
            <div className="component-card card-dark dotted-bg">
              <div className="chat-info-box">
                A versatile chat input component that comes pre-styled with a modern look. It features automatic height adjustment based on content, a submit button, and smart keyboard handling.
                <div className="resize-icon-wrapper">
                  <Scaling size={12} fill="#333" strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: LIST BUTTONS (DARK) */}
          <div className="grid-cell">
            <div className="component-card card-dark">
              <div className="list-wrapper">
                <div className="action-row">
                  <button className="dark-btn">Add Item</button>
                  <button className="dark-btn">Remove Item</button>
                  <button className="dark-btn">Limit to 3</button>
                </div>
                <div className="items-row">
                  {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'].map(item => (
                    <div key={item} className="dark-tag">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: IMAGE UPLOAD */}
          <div className="grid-cell">
            <div className="component-card">
              <div className="upload-wrapper">
                <div className="upload-title">Image Upload</div>
                <div className="upload-subtitle">Supported formats: JPG, PNG, GIF</div>
                <div className="upload-dropzone">
                  <ImagePlus size={24} color="#a0a0a0" strokeWidth={1.5} />
                  <div className="upload-dropzone-text">
                    Click to select<br/>or drag and drop file here
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 7: INPUT CHARACTER LIMIT */}
          <div className="grid-cell">
            <div className="component-card">
              <div className="input-wrapper">
                <div className="input-title">Input with character limit</div>
                <div className="input-container">
                  <input type="text" className="char-input" />
                  <span className="char-count">0/50</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 8: PAGINATION */}
          <div className="grid-cell">
            <div className="component-card">
              <div className="pagination">
                <button className="page-btn"><ChevronLeft size={16} color="#a0a0a0" /></button>
                <button className="page-btn active">1</button>
                <button className="page-btn text">2</button>
                <button className="page-btn text">3</button>
                <button className="page-btn text">4</button>
                <button className="page-btn text">5</button>
                <button className="page-btn text">6</button>
                <span className="page-dots">...</span>
                <button className="page-btn text">20</button>
                <button className="page-btn"><ChevronRight size={16} color="#a0a0a0" /></button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
