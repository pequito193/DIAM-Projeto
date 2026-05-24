import React, { useState, useEffect } from 'react';
import { useUserContext } from '../UserProvider';
import api from '../api';
import { 
    Form, FormGroup, Label, Input, Button, Alert, 
    Card, CardBody, CardTitle, CardText, Row, Col 
} from 'reactstrap';

const NewsList = () => {
    const { user } = useUserContext();
    const [news, setNews] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [relevanceDate, setRelevanceDate] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Função para carregar os anúncios e notícias do Django
    const fetchNews = async () => {
        try {
            const response = await api.get('news/');
            setNews(response.data);
        } catch (err) {
            setError('Não foi possível obter as notícias e alertas.');
        }
    };

    // Consulta automática ao carregar o ecrã
    useEffect(() => {
        fetchNews();
    }, []);

    const handleCreateNews = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('news/', {
                title,
                description,
                relevance_date: relevanceDate
            });
            setTitle('');
            setDescription('');
            setRelevanceDate('');
            setSuccess('Notícia publicada com sucesso no portal!');
            fetchNews(); // Atualiza a listagem
        } catch (err) {
            setError('Erro ao publicar a notícia. Confirme as suas permissões.');
        }
    };

    // Remoção de uma notícia (exclusivo administrador)
    const handleDeleteNews = async (newsId) => {
        if (window.confirm('Pretende apagar permanentemente esta notícia?')) {
            try {
                await api.delete(`news/${newsId}/`);
                fetchNews(); // Recarrega a listagem
            } catch (err) {
                alert('Erro ao tentar apagar a notícia.');
            }
        }
    };

    // Validação de papel de acesso
    const isAdmin = user && user.role === 'ADMINISTRADOR';

    return (
        <Row>
            {error && <Col xs="12"><Alert color="danger">{error}</Alert></Col>}
            {success && <Col xs="12"><Alert color="success">{success}</Alert></Col>}

            {/* FORMULÁRIO DE CRIAÇÃO: Apenas aparece para o administrador */}
            {isAdmin && (
                <Col md="4" className="mb-4">
                    <Card className="p-3 shadow-sm border-warning">
                        <CardBody>
                            <CardTitle tag="h5" className="mb-3 text-warning">Nova Notícia / Alerta</CardTitle>
                            <Form onSubmit={handleCreateNews}>
                                <FormGroup>
                                    <Label for="newsTitle">Título do Anúncio</Label>
                                    <Input 
                                        id="newsTitle" 
                                        type="text" 
                                        placeholder="Ex: Alerta de Mau Tempo ou Promoção Skis"
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        required 
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="newsDate">Data de Relevância</Label>
                                    <Input 
                                        id="newsDate" 
                                        type="date" 
                                        value={relevanceDate} 
                                        onChange={(e) => setRelevanceDate(e.target.value)} 
                                        required 
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="newsDescription">Detalhes da Notícia</Label>
                                    <Input 
                                        id="newsDescription" 
                                        type="textarea" 
                                        rows="5"
                                        placeholder="Introduza as atualizações meteorológicas, detalhes de encontros ou artigos em promoção..."
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        required 
                                    />
                                </FormGroup>
                                <Button color="warning" className="text-dark fw-bold" block type="submit">
                                    Publicar Notícia
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            )}

            {/* MURAL DE NOTÍCIAS */}
            <Col md={isAdmin ? "8" : "12"}>
                <h3 className="mb-4">Notícias Diárias e Alertas Gerais</h3>
                {news.length === 0 ? (
                    <Alert color="info">De momento, não existem avisos ou notícias registadas pelos administradores.</Alert>
                ) : (
                    <Row>
                        {news.map(item => (
                            <Col xs="12" key={item.id} className="mb-3">
                                <Card className="shadow-sm border-start border-3 border-info">
                                    <CardBody>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <CardTitle tag="h5" className="mb-0 text-info">{item.title}</CardTitle>
                                            <small className="text-muted">
                                                Válido até: {new Date(item.relevance_date).toLocaleDateString()}
                                            </small>
                                        </div>
                                        {isAdmin && (
                                            <Button color="danger" size="sm" onClick={() => handleDeleteNews(item.id)}>
                                                Apagar
                                            </Button>
                                        )}
                                        <CardText style={{ whiteSpace: 'pre-line' }} className="text-secondary bg-light p-2 rounded">
                                            {item.description}
                                        </CardText>
                                        <div className="text-end">
                                            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                Publicado por Admin: {item.author_details?.username}
                                            </small>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Col>
        </Row>
    );
};

export default NewsList;