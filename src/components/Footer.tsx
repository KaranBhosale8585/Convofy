import Link from "next/link";
import { Github, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 bg-background border-t">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <MessageCircle size={18} />
          Convofy
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>

          <Link href="/messages" className="hover:text-primary transition">
            Chat
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/KaranBhosale8585"
            className="hover:text-primary transition"
          >
            <Github size={18} />
          </a>

          <a
            href="mailto:karanbhosale8586@email.com"
            className="hover:text-primary transition"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>

      <div className="text-center text-xs pb-3">
        © {new Date().getFullYear()} Convofy | Built by Karan Bhosale
      </div>
    </footer>
  );
}
