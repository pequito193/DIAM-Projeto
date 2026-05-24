import React, { useState, useEffect } from 'react';
import { useUserContext } from '../UserProvider';
import api from '../api';
import { 
    Form, FormGroup, Label, Input, Button, Alert, 
    Card, CardBody, CardTitle, Row, Col, Table 
} from 'reactstrap';

const TrailsList = () => {
    const { user } = useUserContext();
    const [trails, setTrails] = useState([]);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [weatherStatus, setWeatherStatus] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Função para carregar os trilhos do backend Django
    const fetchTrails = async () => {
        try {
            const response = await api.get('trails/');
            setTrails(response.data);
        } catch (err) {
            setError('Não foi possível carregar o catálogo de trilhos.');
        }
    };

    // Procura os dados assim que o componente é montado
    useEffect(() => {
        fetchTrails();
    }, []);

    // Submissão do formulário (Exclusivo de Administrador)
    const handleCreateTrail = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Os campos mapeiam diretamente os atributos definidos no modelo Django
            await api.post('trails/', { 
                name, 
                location, 
                weather_status: weatherStatus 
            });
            setName('');
            setLocation('');
            setWeatherStatus('');
            setSuccess('Novo trilho adicionado com sucesso ao catálogo!');
            fetchTrails(); // Recarrega a tabela
        } catch (err) {
            setError('Erro ao registar o trilho. Verifique se possui permissões de Administrador.');
        }
    };

    // Remoção de um trilho (Exclusivo Administrador)
    const handleDeleteTrail = async (trailId) => {
        if (window.confirm('Tem a certeza de que pretende apagar este trilho do catálogo?')) {
            try {
                await api.delete(`trails/${trailId}/`);
                fetchTrails(); // Recarrega a tabela após apagar
            } catch (err) {
                alert('Erro ao apagar o trilho.');
            }
        }
    };

    // Verifica se o utilizador atual tem o papel de Administrador
    const isAdmin = user && user.role === 'ADMINISTRADOR';

    return (
        <Row>
            {error && <Col xs="12"><Alert color="danger">{error}</Alert></Col>}
            {success && <Col xs="12"><Alert color="success">{success}</Alert></Col>}

            {/* FORMULÁRIO DE CRIAÇÃO: Só para administradores */}
            {isAdmin && (
                <Col md="4" className="mb-4">
                    <Card className="p-3 shadow-sm">
                        <CardBody>
                            <CardTitle tag="h5" className="mb-3">Adicionar Novo Percurso</CardTitle>
                            <Form onSubmit={handleCreateTrail}>
                                <FormGroup>
                                    <Label for="trailName">Nome do Trilho</Label>
                                    <Input 
                                        id="trailName" 
                                        type="text" 
                                        placeholder="Ex: Trilho dos Pescadores"
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="trailLocation">Localização / Região</Label>
                                    <Input 
                                        id="trailLocation" 
                                        type="text" 
                                        placeholder="Ex: Costa Vicentina"
                                        value={location} 
                                        onChange={(e) => setLocation(e.target.value)} 
                                        required 
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="trailWeather">Estado Meteorológico Atual</Label>
                                    <Input 
                                        id="trailWeather" 
                                        type="text" 
                                        placeholder="Ex: Ensolarado - 22°C"
                                        value={weatherStatus} 
                                        onChange={(e) => setWeatherStatus(e.target.value)} 
                                    />
                                </FormGroup>
                                <Button color="success" block type="submit">Registar Trilho</Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            )}

            {/* TABELA DOS TRILHOS */}
            <Col md={isAdmin ? "8" : "12"}>
                <h3 className="mb-4">Catálogo de Percursos e Trilhos</h3>
                {trails.length === 0 ? (
                    <Alert color="info">Não existem trilhos registados de momento.</Alert>
                ) : (
                    <Table striped responsive className="shadow-sm bg-white rounded">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nome do Percurso</th>
                                <th>Localização</th>
                                <th>Meteorologia Associada</th>
                                {isAdmin && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {trails.map((trail, index) => (
                                <tr key={trail.id}>
                                    <th scope="row">{index + 1}</th>
                                    <td><strong>{trail.name}</strong></td>
                                    <td>{trail.location}</td>
                                    <td>
                                        {trail.weather_status ? (
                                            <span className="text-secondary">{trail.weather_status}</span>
                                        ) : (
                                            <small className="text-muted">Sem dados disponíveis</small>
                                        )}
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <Button color="danger" size="sm" onClick={() => handleDeleteTrail(trail.id)}>
                                                Apagar
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Col>
        </Row>
    );
};

export default TrailsList;