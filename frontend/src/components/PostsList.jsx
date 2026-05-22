import React, { useState, useEffect } from 'react';
import { useUserContext } from '../UserProvider';
import api from '../api';
import { 
    Form, FormGroup, Label, Input, Button, Alert, 
    Card, CardBody, CardTitle, CardSubtitle, CardText, 
    Badge, Row, Col, ListGroup, ListGroupItem 
} from 'reactstrap';

const PostsList = () => {
    const { user } = useUserContext();
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('TRILHO');
    const [error, setError] = useState('');
    
    // Estado dinâmico para gerir o texto dos comentários de cada post individualmente
    const [commentTexts, setCommentTexts] = useState({}); 

    // Função para carregar as publicações vindas da API Django
    const fetchPosts = async () => {
        try {
            const response = await api.get('posts/');
            setPosts(response.data);
        } catch (err) {
            setError('Não foi possível carregar as publicações do fórum.');
        }
    };

    // Executa automaticamente ao montar o componente
    useEffect(() => {
        fetchPosts();
    }, []);

    // Submissão de um novo post
    const handleCreatePost = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('posts/', { title, content, category });
            setTitle('');
            setContent('');
            setCategory('TRILHO');
            fetchPosts(); // Atualiza o mural
        } catch (err) {
            setError('Erro ao publicar o tópico. Garanta que preencheu todos os campos.');
        }
    };

    // Remoção de um post
    const handleDeletePost = async (postId) => {
        if (window.confirm('Tem a certeza de que pretende eliminar este post?')) {
            try {
                await api.delete(`posts/${postId}/`);
                fetchPosts();
            } catch (err) {
                alert('Erro ao tentar eliminar a publicação.');
            }
        }
    };

    // Submissão de um comentário associado a um post
    const handleCreateComment = async (e, postId) => {
        e.preventDefault();
        const text = commentTexts[postId];
        if (!text || !text.trim()) return;

        try {
            await api.post('comments/', { post: postId, content: text });
            setCommentTexts({ ...commentTexts, [postId]: '' }); // Limpa o campo desse post
            fetchPosts(); // Recarrega os posts com os novos comentários incluídos
        } catch (err) {
            alert('Erro ao submeter o comentário.');
        }
    };

    // Remoção de um comentário
    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Pretende remover este comentário do fórum?')) {
            try {
                await api.delete(`comments/${commentId}/`);
                fetchPosts();
            } catch (err) {
                alert('Erro ao remover o comentário.');
            }
        }
    };

    const handleCommentChange = (postId, value) => {
        setCommentTexts({ ...commentTexts, [postId]: value });
    };

    return (
        <Row>
            {error && <Col xs="12"><Alert color="danger">{error}</Alert></Col>}

            {/* FORMULÁRIO DE CRIAÇÃO (Apenas visível se o utilizador estiver logado) */}
            {user && (
                <Col md="4" className="mb-4">
                    <Card className="p-3 shadow-sm">
                        <CardBody>
                            <CardTitle tag="h5" className="mb-3">Criar Nova Publicação</CardTitle>
                            <Form onSubmit={handleCreatePost}>
                                <FormGroup>
                                    <Label for="postTitle">Título</Label>
                                    <Input 
                                        id="postTitle" 
                                        type="text" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        required 
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="postCategory">Categoria</Label>
                                    <Input 
                                        id="postCategory" 
                                        type="select" 
                                        value={category} 
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="TRILHO">Trilho</option>
                                        <option value="EQUIPAMENTO">Equipamento</option>
                                        <option value="ENCONTRO">Encontro</option>
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="postContent">Mensagem</Label>
                                    <Input 
                                        id="postContent" 
                                        type="textarea" 
                                        rows="4" 
                                        value={content} 
                                        onChange={(e) => setContent(e.target.value)} 
                                        required 
                                    />
                                </FormGroup>
                                <Button color="primary" block type="submit">Publicar no Fórum</Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            )}

            {/* LISTAGEM DOS POSTS EXISTENTES */}
            <Col md={user ? "8" : "12"}>
                <h3 className="mb-4">Discussões da Comunidade</h3>
                {posts.length === 0 ? (
                    <Alert color="info">Ainda não existem publicações no mural. Seja o primeiro a partilhar!</Alert>
                ) : (
                    posts.map(post => {
                        // Validação de permissão: Autor do post ou Moderador/Admin
                        const canManagePost = user && (user.username === post.author_details?.username || user.role === 'MODERADOR' || user.role === 'ADMINISTRADOR');

                        return (
                            <Card key={post.id} className="mb-4 shadow-sm">
                                <CardBody>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <CardTitle tag="h4" className="mb-1">{post.title}</CardTitle>
                                            <CardSubtitle tag="h6" className="text-muted">
                                                Por {post.author_details?.username} ({post.author_details?.role}) em {new Date(post.created_at).toLocaleDateString()}
                                            </CardSubtitle>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Badge color="info">{post.category}</Badge>
                                            {canManagePost && (
                                                <Button color="danger" size="sm" onClick={() => handleDeletePost(post.id)}>
                                                    Apagar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <CardText className="mt-3 bg-light p-3 rounded" style={{ whiteSpace: 'pre-line' }}>
                                        {post.content}
                                    </CardText>

                                    {/* SECÇÃO DE COMENTÁRIOS */}
                                    <hr />
                                    <h6 className="text-secondary mb-2">Comentários ({post.comments?.length || 0})</h6>
                                    
                                    {post.comments && post.comments.length > 0 && (
                                        <ListGroup className="mb-3 flush">
                                            {post.comments.map(comment => {
                                                const canManageComment = user && (user.username === comment.author_details?.username || user.role === 'MODERADOR' || user.role === 'ADMINISTRADOR');
                                                
                                                return (
                                                    <ListGroupItem key={comment.id} className="border-0 px-0 py-2 d-flex justify-content-between align-items-start">
                                                        <div style={{ fontSize: '0.9rem' }}>
                                                            <strong>{comment.author_details?.username}:</strong> {comment.content}
                                                        </div>
                                                        {canManageComment && (
                                                            <Button color="link" className="text-danger p-0 m-0" style={{ fontSize: '0.8rem', textDecoration: 'none' }} onClick={() => handleDeleteComment(comment.id)}>
                                                                Remover
                                                            </Button>
                                                        )}
                                                    </ListGroupItem>
                                                );
                                            })}
                                        </ListGroup>
                                    )}

                                    {/* ADICIONAR COMENTÁRIO (Apenas para utilizadores logados) */}
                                    {user ? (
                                        <Form onSubmit={(e) => handleCreateComment(e, post.id)} className="d-flex gap-2 mt-2">
                                            <Input 
                                                type="text" 
                                                size="sm"
                                                placeholder="Escreva um comentário..." 
                                                value={commentTexts[post.id] || ''} 
                                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                                required
                                            />
                                            <Button color="secondary" size="sm" type="submit">Comentar</Button>
                                        </Form>
                                    ) : (
                                        <small className="text-muted">Inicie sessão para poder comentar esta publicação.</small>
                                    )}
                                </CardBody>
                            </Card>
                        );
                    })
                )}
            </Col>
        </Row>
    );
};

export default PostsList;