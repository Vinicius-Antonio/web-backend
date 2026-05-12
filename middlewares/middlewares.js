function configurarLocals(req, res, next) {
  res.locals.logado = req.session.logado || false;
  res.locals.admin = req.session.tipo === 2;
  res.locals.alunoComum = req.session.tipo === 1;
  res.locals.loginUsuario = req.session.login || null;
  res.locals.usuarioId = req.session.usuarioId || null;
  next();
}

function verificarAutenticacao(req, res, next) {
  if (req.session.logado) {
    return next();
  }
  return res.redirect("/");
}

function verificarAdmin(req, res, next) {
  if (req.session.logado && req.session.tipo === 2) {
    return next();
  }
  return res.redirect("/");
}

module.exports = {
  configurarLocals,
  verificarAutenticacao,
  verificarAdmin,
};
