import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserContext } from '../UserProvider';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Button, NavbarText } from 'reactstrap';

const Navigation = () => {
    const { user, logout } = useUserContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login'); // Redireciona para o login após sair
        } catch (err) {
            alert('Erro ao efetuar logout.');
        }
    };

    return (
        <Navbar color="dark" dark expand="md" className="mb-4 px-3">
            <NavbarBrand tag={Link} to="/">Fórum Natureza</NavbarBrand>
            
            <Nav className="me-auto" navbar>
                <NavItem>
                    <NavLink tag={Link} to="/posts">Mural</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/trails">Trilhos</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/news">Notícias</NavLink>
                </NavItem>
            </Nav>

            <Nav navbar>
                {user ? (
                    <>
                        <NavbarText className="me-3 text-light">
                            Olá, <strong>{user.username}</strong> <span className="badge bg-secondary">{user.role}</span>
                        </NavbarText>
                        
                        {user.role === 'ADMINISTRADOR' && (
                            <NavItem>
                                <NavLink tag={Link} to="/admin" className="text-warning me-2">Painel Admin</NavLink>
                            </NavItem>
                        )}
                        
                        <NavItem>
                            <Button color="danger" size="sm" onClick={handleLogout}>
                                Sair
                            </Button>
                        </NavItem>
                    </>
                ) : (
                    <>
                        {/* Se for um utilizador anónimo, mostra opções para autenticação */}
                        <NavItem>
                            <NavLink tag={Link} to="/login">Iniciar Sessão</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink tag={Link} to="/signup">
                                <Button color="success" size="sm">Criar Conta</Button>
                            </NavLink>
                        </NavItem>
                    </>
                )}
            </Nav>
        </Navbar>
    );
};

export default Navigation;