import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserContext } from '../UserProvider';
import { Form, FormGroup, Label, Input, Button, Alert, Card, CardBody, CardTitle } from 'reactstrap';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useUserContext();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/posts'); // Redireciona para o fórum após o sucesso
        } catch (err) {
            if (err.response && err.response.data && err.response.data.msg) {
                setError(err.response.data.msg);
            } else {
                setError('Ocorreu um erro ao efetuar o login.');
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <Card style={{ width: '400px' }}>
                <CardBody>
                    <CardTitle tag="h3" className="text-center mb-4">Iniciar Sessão</CardTitle>
                    
                    {error && <Alert color="danger">{error}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="username">Nome de Utilizador</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Insira o seu username"
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
                                placeholder="Insira a sua password"
                                required
                            />
                        </FormGroup>
                        
                        <Button color="primary" block type="submit">
                            Entrar
                        </Button>
                    </Form>
                    
                    <div className="text-center mt-3">
                        <span className="text-muted">Ainda não tem conta? </span>
                        <Link to="/signup">Registe-se aqui</Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Login;