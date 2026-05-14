/**
 * Seed completo do banco de dados
 * Limpa tudo (exceto admin), cria alunos, categorias, habilidades,
 * receitas com relacionamentos e comentários no MongoDB.
 *
 * Padrão de senhas: login + "123" (ex: login "joao" → senha "joao123")
 * Admin permanece: login "admin" → senha "admin123"
 *
 * Executar: node seed.js
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("./config/db_mongoose");
const {
  sequelize,
  Aluno,
  Receita,
  Categoria,
  Habilidade,
  AlunoHabilidade,
} = require("./config/db_sequelize");
const Comentario = require("./models/noSql/comentario");
const fs = require("fs");
const path = require("path");

async function seed() {
  try {
    console.log("🌱 Iniciando seed completo...\n");

    // Aguarda conexão com MongoDB
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // ──────────────────────────────────
    // 1. LIMPAR DADOS EXISTENTES
    // ──────────────────────────────────
    console.log("🗑️  Limpando dados existentes...");

    // Limpa comentários do MongoDB
    await Comentario.deleteMany({});
    console.log("   ✓ Comentários do MongoDB limpos");

    // Limpa tabelas intermediárias do Postgres
    await sequelize.query('DELETE FROM "ReceitaCategoria"');
    await sequelize.query('DELETE FROM "ReceitaAluno"');
    await sequelize.query('DELETE FROM "AlunoHabilidade"');
    console.log("   ✓ Tabelas intermediárias limpas");

    // Limpa receitas
    await Receita.destroy({ where: {} });
    console.log("   ✓ Receitas removidas");

    // Limpa categorias
    await Categoria.destroy({ where: {} });
    console.log("   ✓ Categorias removidas");

    // Limpa habilidades
    await Habilidade.destroy({ where: {} });
    console.log("   ✓ Habilidades removidas");

    // Limpa alunos (EXCETO admin)
    await Aluno.destroy({ where: { tipo: 1 } });
    console.log("   ✓ Alunos removidos (admin mantido)");

    // Limpa imagens de uploads
    const uploadsDir = path.join(__dirname, "public", "uploads");
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file !== ".gitkeep") {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      }
      console.log(`   ✓ ${files.length} imagens de uploads removidas`);
    }

    // ──────────────────────────────────
    // 2. CRIAR ALUNOS
    // ──────────────────────────────────
    console.log("\n👤 Criando alunos...");

    // Garante que o admin existe
    let admin = await Aluno.findOne({ where: { login: "admin" } });
    if (!admin) {
      admin = await Aluno.create({
        login: "admin",
        senha: await bcrypt.hash("admin123", 10),
        tipo: 2,
      });
      console.log('   ✓ Admin criado (login: "admin", senha: "admin123")');
    } else {
      console.log("   ✓ Admin já existe");
    }

    const alunosData = [
      { login: "joao", tipo: 1 },
      { login: "maria", tipo: 1 },
      { login: "carlos", tipo: 1 },
      { login: "ana", tipo: 1 },
      { login: "pedro", tipo: 1 },
      { login: "julia", tipo: 1 },
    ];

    const alunos = [];
    for (const data of alunosData) {
      const senha = await bcrypt.hash(data.login + "123", 10);
      const aluno = await Aluno.create({ ...data, senha });
      alunos.push(aluno);
      console.log(
        `   ✓ ${data.login} (senha: "${data.login}123")`
      );
    }

    // ──────────────────────────────────
    // 3. CRIAR CATEGORIAS
    // ──────────────────────────────────
    console.log("\n🏷️  Criando categorias...");

    const categoriasNomes = [
      "Brasileira",
      "Italiana",
      "Sobremesa",
      "Saudável",
      "Rápida",
      "Vegetariana",
      "Massas",
      "Carnes",
      "Bebidas",
      "Lanches",
    ];

    const categorias = [];
    for (const nome of categoriasNomes) {
      const cat = await Categoria.create({ nome });
      categorias.push(cat);
      console.log(`   ✓ ${nome}`);
    }

    // Helper para buscar categoria por nome
    const catPorNome = (nome) => categorias.find((c) => c.nome === nome);

    // ──────────────────────────────────
    // 4. CRIAR HABILIDADES
    // ──────────────────────────────────
    console.log("\n⚡ Criando habilidades...");

    const habilidadesNomes = [
      "Cortes de faca",
      "Preparo de massas",
      "Confeitaria",
      "Grelhados e churrascos",
      "Temperos e especiarias",
      "Cozinha saudável",
      "Panificação",
      "Molhos",
    ];

    const habilidades = [];
    for (const nome of habilidadesNomes) {
      const hab = await Habilidade.create({ nome });
      habilidades.push(hab);
      console.log(`   ✓ ${nome}`);
    }

    // ──────────────────────────────────
    // 5. VINCULAR HABILIDADES AOS ALUNOS
    // ──────────────────────────────────
    console.log("\n🔗 Vinculando habilidades aos alunos...");

    // joao: foco em carnes e temperos
    await alunos[0].addHabilidade(habilidades[0].id, { through: { nivel: 7 } });
    await alunos[0].addHabilidade(habilidades[3].id, { through: { nivel: 9 } });
    await alunos[0].addHabilidade(habilidades[4].id, { through: { nivel: 8 } });
    await alunos[0].addHabilidade(habilidades[7].id, { through: { nivel: 6 } });
    console.log("   ✓ João: Cortes(7), Grelhados(9), Temperos(8), Molhos(6)");

    // maria: foco em confeitaria e massas
    await alunos[1].addHabilidade(habilidades[1].id, { through: { nivel: 8 } });
    await alunos[1].addHabilidade(habilidades[2].id, { through: { nivel: 10 } });
    await alunos[1].addHabilidade(habilidades[6].id, { through: { nivel: 7 } });
    console.log("   ✓ Maria: Massas(8), Confeitaria(10), Panificação(7)");

    // carlos: generalista
    await alunos[2].addHabilidade(habilidades[0].id, { through: { nivel: 5 } });
    await alunos[2].addHabilidade(habilidades[4].id, { through: { nivel: 6 } });
    await alunos[2].addHabilidade(habilidades[5].id, { through: { nivel: 8 } });
    await alunos[2].addHabilidade(habilidades[7].id, { through: { nivel: 4 } });
    console.log("   ✓ Carlos: Cortes(5), Temperos(6), Saudável(8), Molhos(4)");

    // ana: foco em cozinha saudável
    await alunos[3].addHabilidade(habilidades[5].id, { through: { nivel: 9 } });
    await alunos[3].addHabilidade(habilidades[4].id, { through: { nivel: 7 } });
    await alunos[3].addHabilidade(habilidades[0].id, { through: { nivel: 6 } });
    console.log("   ✓ Ana: Saudável(9), Temperos(7), Cortes(6)");

    // pedro: foco em massas e molhos
    await alunos[4].addHabilidade(habilidades[1].id, { through: { nivel: 9 } });
    await alunos[4].addHabilidade(habilidades[7].id, { through: { nivel: 8 } });
    await alunos[4].addHabilidade(habilidades[3].id, { through: { nivel: 5 } });
    console.log("   ✓ Pedro: Massas(9), Molhos(8), Grelhados(5)");

    // julia: foco em confeitaria e bebidas
    await alunos[5].addHabilidade(habilidades[2].id, { through: { nivel: 8 } });
    await alunos[5].addHabilidade(habilidades[6].id, { through: { nivel: 6 } });
    await alunos[5].addHabilidade(habilidades[4].id, { through: { nivel: 5 } });
    console.log("   ✓ Julia: Confeitaria(8), Panificação(6), Temperos(5)");

    // ──────────────────────────────────
    // 6. CRIAR RECEITAS
    // ──────────────────────────────────
    console.log("\n📖 Criando receitas...");

    const receitasData = [
      {
        nome: "Feijoada Completa",
        descricao:
          "A tradicional feijoada brasileira com feijão preto, carnes variadas, acompanhada de arroz branco, couve refogada, farofa e laranja. Um prato que reúne sabores intensos e é perfeito para o almoço de sábado.",
        link_externo: "https://www.tudogostoso.com.br/receita/feijoada",
        categorias: ["Brasileira", "Carnes"],
        responsaveis: [alunos[0], alunos[2]], // joao, carlos
      },
      {
        nome: "Brigadeiro Gourmet",
        descricao:
          "O clássico doce brasileiro em versão gourmet. Feito com chocolate belga, leite condensado e manteiga, enrolado em granulado fino. Perfeito para festas e sobremesas especiais.",
        categorias: ["Brasileira", "Sobremesa"],
        responsaveis: [alunos[1], alunos[5]], // maria, julia
      },
      {
        nome: "Lasanha à Bolonhesa",
        descricao:
          "Camadas de massa fresca intercaladas com molho bolonhesa caseiro, bechamel cremoso e queijo muçarela gratinado. Receita da culinária italiana adaptada ao paladar brasileiro.",
        categorias: ["Italiana", "Massas"],
        responsaveis: [alunos[4], alunos[1]], // pedro, maria
      },
      {
        nome: "Açaí na Tigela",
        descricao:
          "Polpa de açaí batida com banana congelada, servida com granola crocante, frutas frescas fatiadas e um fio de mel. Energético, nutritivo e refrescante.",
        categorias: ["Saudável", "Brasileira"],
        responsaveis: [alunos[3]], // ana
      },
      {
        nome: "Pão de Queijo Mineiro",
        descricao:
          "O legítimo pão de queijo feito com polvilho azedo, queijo minas curado e ovos caipiras. Crocante por fora e macio por dentro, perfeito para o café da manhã.",
        categorias: ["Brasileira", "Lanches"],
        responsaveis: [alunos[1]], // maria
      },
      {
        nome: "Carbonara Autêntica",
        descricao:
          "Espaguete preparado com guanciale crocante, gema de ovo, pecorino romano e pimenta do reino. A verdadeira receita italiana sem creme de leite.",
        link_externo: "https://www.giallozafferano.it/ricetta/Spaghetti-alla-Carbonara.html",
        categorias: ["Italiana", "Massas", "Rápida"],
        responsaveis: [alunos[4]], // pedro
      },
      {
        nome: "Salada Caesar com Frango Grelhado",
        descricao:
          "Alface romana crocante com peito de frango grelhado, croutons artesanais, lascas de parmesão e molho caesar caseiro. Uma refeição leve e completa.",
        categorias: ["Saudável", "Rápida"],
        responsaveis: [alunos[3], alunos[2]], // ana, carlos
      },
      {
        nome: "Bolo de Cenoura com Cobertura de Chocolate",
        descricao:
          "Bolo fofinho de cenoura com cobertura generosa de chocolate. O bolo mais querido do Brasil, feito com a receita da vovó que nunca falha.",
        categorias: ["Sobremesa", "Brasileira"],
        responsaveis: [alunos[1], alunos[5]], // maria, julia
      },
      {
        nome: "Coxinha Cremosa",
        descricao:
          "Coxinha com massa crocante e recheio cremoso de frango desfiado com catupiry. O salgado brasileiro mais famoso do mundo, perfeito para festas.",
        categorias: ["Brasileira", "Lanches"],
        responsaveis: [alunos[0], alunos[2]], // joao, carlos
      },
      {
        nome: "Smoothie Verde Detox",
        descricao:
          "Bebida nutritiva com espinafre, banana, maçã verde, gengibre e água de coco. Ideal para começar o dia com energia e saúde.",
        categorias: ["Saudável", "Bebidas", "Rápida"],
        responsaveis: [alunos[3]], // ana
      },
      {
        nome: "Risoto de Cogumelos",
        descricao:
          "Arroz arbóreo cozido lentamente com mix de cogumelos frescos, vinho branco, caldo de legumes e finalizado com parmesão e manteiga. Cremoso e reconfortante.",
        categorias: ["Italiana", "Vegetariana"],
        responsaveis: [alunos[4], alunos[3]], // pedro, ana
      },
      {
        nome: "Picanha na Brasa",
        descricao:
          "Picanha grelhada no ponto perfeito com sal grosso, acompanhada de farofa especial, vinagrete e pão de alho. O churrasco brasileiro em sua melhor forma.",
        categorias: ["Brasileira", "Carnes"],
        responsaveis: [alunos[0]], // joao
      },
      {
        nome: "Pudim de Leite Condensado",
        descricao:
          "O clássico pudim brasileiro com calda de caramelo dourada. Textura cremosa e sabor inconfundível, feito com apenas 3 ingredientes.",
        categorias: ["Sobremesa", "Brasileira"],
        responsaveis: [alunos[5], alunos[1]], // julia, maria
      },
      {
        nome: "Wrap Integral de Atum",
        descricao:
          "Tortilha integral recheada com atum, cream cheese light, rúcula, tomate cereja e cenoura ralada. Prático, saudável e delicioso para o dia a dia.",
        categorias: ["Saudável", "Rápida", "Lanches"],
        responsaveis: [alunos[3], alunos[2]], // ana, carlos
      },
      {
        nome: "Cappuccino Caseiro",
        descricao:
          "Café espresso com leite vaporizado e espuma cremosa, finalizado com canela e chocolate em pó. A bebida perfeita para tardes frias.",
        categorias: ["Bebidas", "Rápida"],
        responsaveis: [alunos[5]], // julia
      },
    ];

    const receitas = [];
    for (const data of receitasData) {
      const receita = await Receita.create({
        nome: data.nome,
        descricao: data.descricao,
        link_externo: data.link_externo || null,
        imagem: null,
      });

      // Vincula categorias
      const catIds = data.categorias.map((nome) => catPorNome(nome).id);
      await receita.setCategorias(catIds);

      // Vincula responsáveis
      const respIds = data.responsaveis.map((a) => a.id);
      await receita.setResponsaveis(respIds);

      receitas.push(receita);
      console.log(`   ✓ ${data.nome}`);
    }

    // ──────────────────────────────────
    // 7. CRIAR COMENTÁRIOS (MongoDB)
    // ──────────────────────────────────
    console.log("\n💬 Criando comentários...");

    const comentariosData = [
      // Feijoada
      { texto: "Melhor feijoada que já experimentei! O segredo está no tempo de cozimento.", autor: "maria", receitaId: receitas[0].id },
      { texto: "Fiz no final de semana e toda a família adorou. Muito obrigado pela receita!", autor: "carlos", receitaId: receitas[0].id },
      { texto: "Dica: deixem o feijão de molho na noite anterior, fica muito melhor.", autor: "joao", receitaId: receitas[0].id },

      // Brigadeiro
      { texto: "Perfeito! Usei chocolate 70% e ficou incrivelmente bom.", autor: "ana", receitaId: receitas[1].id },
      { texto: "Fiz para a festa de aniversário e todo mundo pediu a receita.", autor: "pedro", receitaId: receitas[1].id },

      // Lasanha
      { texto: "A massa fresca faz toda a diferença! Nunca mais uso a industrializada.", autor: "joao", receitaId: receitas[2].id },
      { texto: "O molho bechamel ficou divino. Segui a receita à risca.", autor: "julia", receitaId: receitas[2].id },
      { texto: "Que lasanha incrível! Virou tradição de domingo aqui em casa.", autor: "ana", receitaId: receitas[2].id },

      // Açaí
      { texto: "Refrescante e nutritivo! Coloquei morango e granola, ficou top.", autor: "pedro", receitaId: receitas[3].id },
      { texto: "Ótima receita para pré-treino, me dá muita energia!", autor: "joao", receitaId: receitas[3].id },

      // Pão de Queijo
      { texto: "Crocante por fora e macio por dentro, exatamente como deve ser!", autor: "carlos", receitaId: receitas[4].id },
      { texto: "Fiz com polvilho azedo e ficou perfeito. Obrigada pela receita!", autor: "ana", receitaId: receitas[4].id },
      { texto: "Congelei uma fornada inteira e fica ótimo depois de assar.", autor: "julia", receitaId: receitas[4].id },

      // Carbonara
      { texto: "Finalmente uma carbonara autêntica sem creme de leite! Aprovado.", autor: "maria", receitaId: receitas[5].id },
      { texto: "A gema crua no final é o segredo. Receita excepcional.", autor: "carlos", receitaId: receitas[5].id },

      // Salada Caesar
      { texto: "Leve e muito saborosa. O molho caesar caseiro é incomparável.", autor: "julia", receitaId: receitas[6].id },
      { texto: "Perfeita para o verão! Prática e nutritiva.", autor: "maria", receitaId: receitas[6].id },

      // Bolo de Cenoura
      { texto: "A cobertura de chocolate ficou brilhante e lisa, igualzinha da padaria!", autor: "pedro", receitaId: receitas[7].id },
      { texto: "Receita infalível! Já fiz 3 vezes e sempre fica perfeito.", autor: "joao", receitaId: receitas[7].id },
      { texto: "Meus filhos adoram, virou o bolo favorito da família.", autor: "carlos", receitaId: receitas[7].id },

      // Coxinha
      { texto: "A massa ficou super crocante! Segredo é fritar no óleo bem quente.", autor: "maria", receitaId: receitas[8].id },
      { texto: "Melhor coxinha que já fiz em casa. O catupiry derrete na boca.", autor: "ana", receitaId: receitas[8].id },

      // Smoothie
      { texto: "Tomo todos os dias de manhã. Dá uma energia incrível!", autor: "julia", receitaId: receitas[9].id },
      { texto: "Não gostava de espinafre, mas nesse smoothie nem sente o sabor!", autor: "carlos", receitaId: receitas[9].id },

      // Risoto
      { texto: "Cremoso na medida certa! O vinho branco faz toda a diferença.", autor: "maria", receitaId: receitas[10].id },
      { texto: "Usei shiitake e shimeji, ficou maravilhoso.", autor: "joao", receitaId: receitas[10].id },

      // Picanha
      { texto: "Ponto perfeito! Mal passada com sal grosso, simples e genial.", autor: "pedro", receitaId: receitas[11].id },
      { texto: "A farofa especial que acompanha é sensacional também!", autor: "carlos", receitaId: receitas[11].id },
      { texto: "Melhor picanha que já comi. Parabéns pela receita!", autor: "maria", receitaId: receitas[11].id },

      // Pudim
      { texto: "A calda de caramelo ficou no ponto certo, dourada e brilhante!", autor: "joao", receitaId: receitas[12].id },
      { texto: "Desenformou perfeitamente! Dica: banho-maria no forno é essencial.", autor: "ana", receitaId: receitas[12].id },

      // Wrap
      { texto: "Super prático para levar pro trabalho. Fica bom gelado também!", autor: "julia", receitaId: receitas[13].id },
      { texto: "Saudável e gostoso, difícil combinar os dois. Essa receita consegue!", autor: "pedro", receitaId: receitas[13].id },

      // Cappuccino
      { texto: "Ficou igual ao de cafeteria! A espuma do leite é o segredo.", autor: "maria", receitaId: receitas[14].id },
      { texto: "Perfeito para dias frios. Coloquei canela extra, recomendo!", autor: "ana", receitaId: receitas[14].id },
      { texto: "Não preciso mais ir na cafeteria, esse cappuccino é incrível.", autor: "carlos", receitaId: receitas[14].id },
    ];

    for (const data of comentariosData) {
      await Comentario.create(data);
    }
    console.log(`   ✓ ${comentariosData.length} comentários criados`);

    // ──────────────────────────────────
    // RESUMO FINAL
    // ──────────────────────────────────
    console.log("\n" + "═".repeat(50));
    console.log("✅ SEED CONCLUÍDO COM SUCESSO!");
    console.log("═".repeat(50));
    console.log(`\n📊 Resumo:`);
    console.log(`   👤 Alunos:       ${alunosData.length + 1} (incluindo admin)`);
    console.log(`   🏷️  Categorias:   ${categorias.length}`);
    console.log(`   ⚡ Habilidades:  ${habilidades.length}`);
    console.log(`   📖 Receitas:     ${receitas.length}`);
    console.log(`   💬 Comentários:  ${comentariosData.length}`);
    console.log(`\n🔑 Credenciais:`);
    console.log(`   admin  → senha: admin123  (administrador)`);
    for (const a of alunosData) {
      console.log(`   ${a.login.padEnd(7)}→ senha: ${a.login}123`);
    }
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERRO NO SEED:", error);
    process.exit(1);
  }
}

// Sincroniza o banco e executa o seed
sequelize
  .sync({ alter: true })
  .then(() => seed())
  .catch((err) => {
    console.error("Erro ao sincronizar banco:", err);
    process.exit(1);
  });
