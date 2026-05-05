import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FrontendApp from './FrontendApp';
import AdminApp from './AdminApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<FrontendApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}
