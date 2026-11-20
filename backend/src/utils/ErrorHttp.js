// Error con código HTTP para que el manejador central responda con el estado correcto
class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

module.exports = ErrorHttp;
