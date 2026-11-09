// Fachliche Fehler mit HTTP-Status
class HttpFehler extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Express 4 leitet Fehler aus async-Handlern nicht selbst weiter
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { HttpFehler, asyncHandler };
