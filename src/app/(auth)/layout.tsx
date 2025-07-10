// This layout is for the authentication pages (login, signup)
// It does not include the main AppLayout with navbars, etc.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
