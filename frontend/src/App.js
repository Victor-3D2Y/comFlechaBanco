import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Função do Header
function Header() {
    const instagram = "./instagram.webp"
    const twitter = "./twitter.png"
    return (
        <div className='header'>
            <h1>FaculHub – O Curso Certo Para Você</h1>
            <div>
                <img src={instagram} className="imagens" alt="insta" />
                <img src={twitter} className="imagens" alt="twitter" />
            </div>
        </div>
    );
}

// Função do Perfil
function Perfil({ foto, nome, openLoginModal, onLogout, usuarioLogado }) {
    return (
        <div className="perfil">
            {usuarioLogado ? (
                <>
                    <button onClick={onLogout}>Sair</button>
                    <img src={foto} id="faculHub" alt="Foto de perfil" />
                    <h1>{nome}</h1>
                    <p>Inscrições: 7</p>
                </>
            ) : (
                <>
                    <button onClick={openLoginModal}>Entrar</button>
                    <img src={foto} id="faculHub" alt="Foto de perfil" />
                    <h1>{nome}</h1>
                    <p>Inscrições: 7</p>
                </>
            )}
        </div>
    );
}

// Função do Postagem
function Postagem({ fotoMain, nomeCurso, instituicao, numInscritos, numComentarios, usuarioLogado, openModal, cursoId, onInscricao }) {
    const [inscrito, setInscrito] = useState(false);
    const [inscritos, setInscritos] = useState(numInscritos); // Para manter o número de inscritos atualizado
    const flechaCheia = "./flecha_cima_cheia.svg";
    const flechaVazia = "./flecha_cima_vazia.svg";
    const [flecha, setFlecha] = useState(flechaVazia); // Flecha inicial como vazia

    // Verificar se o usuário já está inscrito ao carregar o componente
    useEffect(() => {
        const checkInscricao = async () => {
            if (usuarioLogado) {
                try {
                    const response = await axios.get(`http://localhost:3001/api/inscricoes/${usuarioLogado.id}/${cursoId}`);
                    if (response.data) {
                        setInscrito(true);
                        setFlecha(flechaCheia); // Se o usuário estiver inscrito, mostre a flecha cheia
                    }
                } catch (error) {
                    console.error('Erro ao verificar inscrição:', error);
                }
            }
        };
        checkInscricao();
    }, [usuarioLogado, cursoId]);

    const handleInscricao = async () => {
        if (!usuarioLogado) {
            openModal();
        } else if (!inscrito) {
            // Inscrição
            try {
                const response = await axios.post('http://localhost:3001/api/inscricao', {
                    usuario_id: usuarioLogado.id,
                    curso_id: cursoId
                });
                if (response.data.success) {
                    setInscrito(true);
                    setFlecha(flechaCheia); // Muda a flecha para cheia
                    setInscritos(inscritos + 1); // Atualiza o número de inscritos
                    onInscricao(); // Notifica o componente pai para atualizar a lista
                }
            } catch (error) {
                console.error('Erro ao fazer inscrição:', error);
            }
        } else {
            // Desinscrição
            try {
                const response = await axios.delete(`http://localhost:3001/api/inscricao/${usuarioLogado.id}/${cursoId}`);
                if (response.data.success) {
                    setInscrito(false);
                    setFlecha(flechaVazia); // Muda a flecha para vazia
                    setInscritos(inscritos - 1); // Atualiza o número de inscritos
                    onInscricao(); // Notifica o componente pai para atualizar a lista
                }
            } catch (error) {
                console.error('Erro ao desinscrever:', error);
            }
        }
    };

    return (
        <>
            <div className="titlePubli">
                <p>{nomeCurso}</p>
                <p>{instituicao}</p>
            </div>
            <img src={fotoMain} id="eletromecanica" alt="eletromecanica" />
            <div className="flechaChat">
                <div className="leftMain">
                    <img src={flecha} alt="flecha" onClick={handleInscricao} />
                    <p>{inscritos} inscritos</p>
                </div>
                <div className="leftMain">
                    <img src="chat.svg" alt="chat" />
                    <p>{numComentarios} comentários</p>
                </div>
            </div>
        </>
    );
}



// Função do LoginModal
function LoginModal({ showModal, closeModal, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [isInvalid, setIsInvalid] = useState({ email: false, senha: false });

    const handleLogin = async () => {
        setError('');
        setIsInvalid({ email: false, senha: false });

        try {
            const response = await axios.post('http://localhost:3001/api/login', { email, senha });
            if (response.data.success) {
                onLoginSuccess(response.data.user);
                closeModal();
            } else {
                setError('Usuário ou senha incorretos');
                if (!email) setIsInvalid((prev) => ({ ...prev, email: true }));
                if (!senha) setIsInvalid((prev) => ({ ...prev, senha: true }));
            }
        } catch (err) {
            console.error('Erro ao fazer login:', err);
            setError('Erro ao fazer login. Tente novamente.');
        }
    };

    if (!showModal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <div>
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={isInvalid.email ? 'input-error' : ''}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className={isInvalid.senha ? 'input-error' : ''}
                    />
                </div>
                <div className="modal-buttons">
                    <button className="cancel-btn" onClick={closeModal}>Cancelar</button>
                    <button className="enter-btn" onClick={handleLogin}>Entrar</button>
                </div>
            </div>
        </div>
    );
}

// Função Main
function Main({ usuarioLogado, openModal }) {
    
    const [cursos, setCursos] = useState([]);

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/cursos');
                setCursos(response.data);
            } catch (error) {
                console.error('Erro ao buscar cursos:', error);
            }
        };
        fetchCursos();
    }, []);

    const handleInscricao = () => {
        // Aqui, pode-se atualizar a lista de cursos caso necessário
        // Ou realizar outras ações necessárias após a inscrição
        console.log("Curso inscrito!");
    };

    return (
        <div id="tudo">
            <h2>Cursos</h2>
            {cursos.map((curso) => (
                <Postagem
                    key={curso.id_curso}
                    cursoId={curso.id_curso}
                    nomeCurso={curso.nome_curso}
                    fotoMain={curso.foto}
                    instituicao={curso.instituicao}
                    numInscritos={curso.numInscritos}
                    numComentarios={curso.numComentarios}
                    usuarioLogado={usuarioLogado}
                    openModal={openModal}
                    onInscricao={handleInscricao}
                />
            ))}
        </div>
    );
}


// Função principal App.js
function App() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [empresa, setEmpresa] = useState(null);

    const openModal = () => setIsModalVisible(true);
    const closeModal = () => setIsModalVisible(false);

    const handleLoginSuccess = (user) => {
        setUsuarioLogado(user);
    };

    const handleLogout = () => {
        setUsuarioLogado(null);
        window.location.reload();
    };

    useEffect(() => {
        const fetchEmpresa = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/empresa');
                setEmpresa(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados da empresa:', error);
            }
        };
        fetchEmpresa();
    }, []);

    useEffect(() => {
        if (usuarioLogado) {
            const fetchFotoUsuario = async () => {
                try {
                    const response = await axios.get(`http://localhost:3001/api/usuarios/${usuarioLogado.id}`);
                    setUsuarioLogado((prev) => ({ ...prev, foto: response.data.foto }));
                } catch (error) {
                    console.error('Erro ao buscar foto do usuário:', error);
                }
            };
            fetchFotoUsuario();
        }
    }, [usuarioLogado]);

    return (
        <div className="App">
            <Header />
            <div id="principal">
                <Perfil
                    foto={usuarioLogado && usuarioLogado.foto ? usuarioLogado.foto : empresa ? empresa.logo : "default_logo.png"}
                    nome={usuarioLogado ? usuarioLogado.nome : empresa ? empresa.nome : "FaculHub"}
                    openLoginModal={openModal}
                    onLogout={handleLogout}
                    usuarioLogado={usuarioLogado}
                />
                <Main usuarioLogado={usuarioLogado} openModal={openModal} />
                <LoginModal
                    showModal={isModalVisible}
                    closeModal={closeModal}
                    onLoginSuccess={handleLoginSuccess}
                />
            </div>
        </div>
    );
}

export default App;
