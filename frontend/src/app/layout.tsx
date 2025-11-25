import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import CallDialog from "@/components/CallDialog";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "WhatsApp Clone",
    description: "A real-time chat application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>){
    return (
        <html lang="en" data-theme="dark">
            <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
                <ClientLayout>
                    {children}
                    <CallDialog />
                </ClientLayout>
            </body>
        </html>
    );
}
