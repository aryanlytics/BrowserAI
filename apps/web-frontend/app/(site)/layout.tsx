import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

// Layout for all public-facing pages: home, pricing, resources, etc.
// Auth pages /(auth)/ and password pages /(password)/ have their own
// centered layouts and don't need this navbar/footer.

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
