"""Servidor estático dos testes de navegador.

Igual a `python -m http.server`, mas com fila de conexões maior: as páginas carregam vários
módulos ES de uma vez e, com a fila padrão (5), o Windows recusa conexões em paralelo
(net::ERR_CONNECTION_REFUSED intermitente).
"""

import http.server
import sys


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 128


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5500
    http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, ServerClass=Server, port=port)
