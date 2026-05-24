import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserContext } from './UserProvider';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Signup from './components/Signup';
import PostsList from './components/PostsList';
import TrailsList from './components/TrailsList';
import NewsList from './components/NewsList';
import AdminPanel from './components/AdminPanel';

// Placeholders temporários para as rotas
const Home = () => (
  <div className="text-center mt-5">
    <h2>Bem-vindo ao Fórum Natureza!</h2>
    <p>Escolha uma opção na barra superior para explorar os trilhos ou participar na comunidade.</p>
  </div>
);

const App = () => {
  const { user, loading } = useUserContext();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <h3>A carregar a mochila...</h3>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navigation />
      
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Rotas de autenticação */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/posts" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/posts" />} />
          
          {/* Rotas gerais do fórum */}
          <Route path="/posts" element={<PostsList />} />
          <Route path="/trails" element={<TrailsList />} />
          <Route path="/news" element={<NewsList />} />
          
          {/* Proteção explícita baseada no papel de utilizador (Exclusivo Admin) */}
          <Route path="/admin" element={
            user && user.role === 'ADMINISTRADOR' ? <AdminPanel /> : <Navigate to="/" />
          } />
          
          {/* Fallback para rotas inexistentes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;