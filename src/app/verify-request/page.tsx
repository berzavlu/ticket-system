'use client';

import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle } from 'lucide-react';

export default function VerifyRequestPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Revisa tu correo
          </h1>

          {/* Message */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-green-900 mb-1">
                  Link de acceso enviado
                </p>
                <p className="text-sm text-green-700">
                  Hemos enviado un enlace mágico a:
                </p>
                {email && (
                  <p className="text-sm font-semibold text-green-900 mt-1">
                    {email}
                  </p>
                )}
              </div>
            </div>

            <div className="text-left bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Instrucciones:</strong>
              </p>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Abre tu bandeja de entrada</li>
                <li>Busca el correo de Fluyez</li>
                <li>Haz clic en el enlace de acceso</li>
                <li>Serás redirigido automáticamente</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800">
                💡 <strong>Consejo:</strong> Si no ves el correo, revisa tu carpeta de spam o correo no deseado.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-6">
            <p className="text-xs text-gray-500">
              El enlace de acceso expira en 24 horas por seguridad.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}

