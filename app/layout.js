import { Manrope } from "next/font/google";
import "./globals.css";

// Manrope é a única fonte do projeto (design.md).
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Meu CRM",
  description: "Sistema para organizar contatos e oportunidades de negócio.",
};

export default function RootLayout({ children }) {
  // Aplica o fundo salvo no navegador antes de pintar, para não "piscar"
  // o fundo padrão e trocar depois. Só aceita um código de cor válido.
  const aplicarFundoSalvo = `
    try {
      var c = localStorage.getItem('crm-fundo');
      if (c && /^#[0-9a-fA-F]{6}$/.test(c)) {
        document.documentElement.style.setProperty('--fundo', c);
      }
    } catch (e) {}
  `;

  return (
    // O script abaixo ajusta o fundo antes da hidratação; avisamos o React
    // para ele não reclamar dessa diferença esperada no <html>.
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={manrope.className}>
        <script dangerouslySetInnerHTML={{ __html: aplicarFundoSalvo }} />
        {children}
      </body>
    </html>
  );
}
