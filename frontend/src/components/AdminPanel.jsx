import React, { useState, useEffect } from 'react';
import api from '../api';
import { Table, Button, Input, Alert, Card, CardBody, CardTitle } from 'reactstrap';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Carrega a lista completa de utilizadores
    const fetchUsers = async () => {
        try {
            const response = await api.get('users/');
            setUsers(response.data);
        } catch (err) {
            setError('Erro ao obter a lista de utilizadores da base de dados.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Atualiza o papel (role) de um utilizador
    const handleRoleChange = async (userId, newRole) => {
        setError('');
        setSuccess('');
        try {
            await api.put(`users/${userId}/`, { role: newRole });
            setSuccess('Permissões do utilizador atualizadas com sucesso!');
            fetchUsers(); // Atualiza a tabela
        } catch (err) {
            setError('Não foi possível alterar o papel do utilizador.');
        }
    };

    // Elimina a conta de um utilizador
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Tem a certeza de que pretende eliminar permanentemente este utilizador?')) {
            setError('');
            setSuccess('');
            try {
                const response = await api.delete(`users/${userId}/`);
                setSuccess('Utilizador removido do sistema.');
                fetchUsers();
            } catch (err) {
                if (err.response && err.response.data && err.response.data.msg) {
                    setError(err.response.data.msg);
                } else {
                    setError('Erro ao tentar eliminar o utilizador.');
                }
            }
        }
    };

    return (
        <Card className="shadow-sm border-0 mt-3">
            <CardBody>
                <CardTitle tag="h3" className="mb-4 text-dark border-bottom pb-2">
                    Controlo Administrativo: Gestão de Contas
                </CardTitle>
                
                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success">{success}</Alert>}
                
                <Table striped responsive className="align-middle">
                    <thead>
                        <tr>
                            <th>Nome de Utilizador</th>
                            <th>Email</th>
                            <th>Papel Atual</th>
                            <th>Modificar Nível</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td><strong>{u.username}</strong></td>
                                <td>{u.email || <span className="text-muted">Não registado</span>}</td>
                                <td>
                                    <span className={`badge ${u.role === 'ADMINISTRADOR' ? 'bg-danger' : u.role === 'MODERADOR' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>
                                    <Input 
                                        type="select" 
                                        size="sm" 
                                        style={{ width: '160px' }}
                                        value={u.role} 
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                    >
                                        <option value="UTILIZADOR">Utilizador</option>
                                        <option value="MODERADOR">Moderador</option>
                                        <option value="ADMINISTRADOR">Administrador</option>
                                    </Input>
                                </td>
                                <td>
                                    <Button color="danger" size="sm" onClick={() => handleDeleteUser(u.id)}>
                                        Eliminar Conta
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    );
};

export default AdminPanel;