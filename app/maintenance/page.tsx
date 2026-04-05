export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Wartungsarbeiten</h1>
        <p className="text-lg text-gray-600 mb-4">
          Die Website ist derzeit in Wartungsarbeiten. Bitte haben Sie Geduld.
        </p>
        <p className="text-sm text-gray-500">
          Folgendes ist noch erreichbar: /admin
        </p>
      </div>
    </div>
  )
}
