export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-purple-900 font-sans text-gray-50">
      {children}
    </div>
  )
}
