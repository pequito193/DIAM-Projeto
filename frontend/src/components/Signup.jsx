import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Form, FormGroup, Label, Input, Button, Alert, Card, CardBody, CardTitle } from 'reactstrap';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('As palavras-passe não coincidem.');
            return;
        }

        try {
            const response = await api.post('signup/', { username, password });
            setSuccess(response.data.msg || 'Conta criada com sucesso!');
            // Aguarda 2 segundos e redireciona para o login
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.msg) {
                setError(err.response.data.msg);
            } else {
                setError('Erro ao efetuar o registo.');
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <Card style={{ width: '400px' }}>
                <CardBody>
                    <CardTitle tag="h3" className="text-center mb-4">Criar Conta</CardTitle>
                    
                    {error && <Alert color="danger">{error}</Alert>}
                    {success && <Alert color="success">{success}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="username">Nome de Utilizador</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Escolha um username"
                                required
                            />
                        </FormGroup>
                        
                        <FormGroup>
                            <Label for="password">Palavra-passe</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Escolha uma password"
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label for="confirmPassword">Confirmar Palavra-passe</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita a password"
                                required
                            />
                        </FormGroup>
                        
                        <Button color="success" block type="submit">
                            Registar
                        </Button>
                    </Form>
                    
                    <div className="text-center mt-3">
                        <span className="text-muted">Já tem uma conta? </span>
                        <Link to="/login">Inicie sessão</Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Signup;