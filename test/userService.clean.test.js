const { UserService } = require('../src/userService');

const dadosUsuarioPadrao = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  const criarUsuarioPadrao = (isAdmin = false) =>
    userService.createUser(
      dadosUsuarioPadrao.nome,
      dadosUsuarioPadrao.email,
      dadosUsuarioPadrao.idade,
      isAdmin
    );

  describe('createUser', () => {
    test('deve gerar um id ao criar um usuário válido', () => {
      const usuarioCriado = criarUsuarioPadrao();

      expect(usuarioCriado.id).toBeDefined();
    });

    test('deve criar o usuário com status ativo por padrão', () => {
      const usuarioCriado = criarUsuarioPadrao();

      expect(usuarioCriado.status).toBe('ativo');
    });

    test('deve lançar erro ao criar usuário menor de idade', () => {
      const criarMenorDeIdade = () =>
        userService.createUser('Menor', 'menor@email.com', 17);

      expect(criarMenorDeIdade).toThrow('O usuário deve ser maior de idade.');
    });

    test.each([
      ['nome', ['', 'a@teste.com', 30]],
      ['email', ['Fulano', '', 30]],
      ['idade', ['Fulano', 'a@teste.com', 0]],
    ])('deve lançar erro quando %s não é informado', (_campo, argumentos) => {
      const criarSemCampo = () => userService.createUser(...argumentos);

      expect(criarSemCampo).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário criado quando o id existe', () => {
      const usuarioCriado = criarUsuarioPadrao();

      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      expect(usuarioBuscado.nome).toBe(dadosUsuarioPadrao.nome);
    });

    test('deve retornar null quando o id não existe', () => {
      const usuarioBuscado = userService.getUserById('id-inexistente');

      expect(usuarioBuscado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve retornar true ao desativar um usuário comum', () => {
      const usuarioComum = criarUsuarioPadrao();

      const resultado = userService.deactivateUser(usuarioComum.id);

      expect(resultado).toBe(true);
    });

    test('deve marcar como inativo o status de um usuário comum desativado', () => {
      const usuarioComum = criarUsuarioPadrao();

      userService.deactivateUser(usuarioComum.id);

      const usuarioAtualizado = userService.getUserById(usuarioComum.id);
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('deve retornar false ao tentar desativar um administrador', () => {
      const usuarioAdmin = criarUsuarioPadrao(true);

      const resultado = userService.deactivateUser(usuarioAdmin.id);

      expect(resultado).toBe(false);
    });

    test('deve manter ativo o status de um administrador', () => {
      const usuarioAdmin = criarUsuarioPadrao(true);

      userService.deactivateUser(usuarioAdmin.id);

      const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);
      expect(usuarioAtualizado.status).toBe('ativo');
    });

    test('deve retornar false quando o usuário não existe', () => {
      const resultado = userService.deactivateUser('id-inexistente');

      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve informar que não há usuários quando o banco está vazio', () => {
      const relatorio = userService.generateUserReport();

      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });

    test('deve incluir id, nome e status de cada usuário cadastrado', () => {
      const alice = userService.createUser('Alice', 'alice@email.com', 28);
      const bob = userService.createUser('Bob', 'bob@email.com', 32);

      const relatorio = userService.generateUserReport();

      expect(relatorio).toEqual(expect.stringContaining(alice.id));
      expect(relatorio).toEqual(expect.stringContaining('Alice'));
      expect(relatorio).toEqual(expect.stringContaining(bob.id));
      expect(relatorio).toEqual(expect.stringContaining('Bob'));
    });

    test('deve refletir o status inativo de um usuário desativado', () => {
      const usuario = criarUsuarioPadrao();
      userService.deactivateUser(usuario.id);

      const relatorio = userService.generateUserReport();

      expect(relatorio).toContain('inativo');
    });
  });
});
