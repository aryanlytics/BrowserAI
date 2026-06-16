import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BrowserAI - Password Reset',
  description: 'Reset your BrowserAI password',
  
}


export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      {children}
    </div>
  );
}